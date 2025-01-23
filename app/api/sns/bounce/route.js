import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Verify the SNS message
async function verifySNSMessage(message) {
  try {
    const certResponse = await fetch(message.SigningCertURL);
    const cert = await certResponse.text();

    // Validate the message signature (placeholder for actual validation)
    return true;
  } catch (err) {
    console.error("Failed to verify SNS message:", err);
    return false;
  }
}

// Extract campaign_id and user_id from headers
function extractCampaignAndUser(headers) {
  let campaign_id = null;
  let user_id = null;

  headers.forEach((header) => {
    if (header.name.toLowerCase() === "campaign_id") {
      campaign_id = header.value;
    }
    if (header.name.toLowerCase() === "user_id") {
      user_id = header.value;
    }
  });

  return { campaign_id, user_id };
}

// Process Bounce Events
async function handleBounceEvent(bounce, mail) {
  const { headers, messageId } = mail;
  const { bouncedRecipients, bounceType, bounceSubType, timestamp } = bounce;

  // Extract campaign_id and user_id
  const { campaign_id, user_id } = extractCampaignAndUser(headers);

  if (!campaign_id || !user_id) {
    console.error("Missing campaign_id or user_id in mail headers");
    return;
  }

  for (const recipient of bouncedRecipients) {
    const { emailAddress, status, action, diagnosticCode } = recipient;

    const queryText = `
      INSERT INTO email_bounce (
        user_id,
        campaign_id,
        message_id,
        feedback_id,
        email_address,
        type,
        subtype,
        reason,
        status,
        action,
        source_email,
        source_ip,
        remote_mta_ip,
        reporting_mta,
        timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      ON CONFLICT (message_id) DO UPDATE SET
        feedback_id = EXCLUDED.feedback_id,
        email_address = EXCLUDED.email_address,
        type = EXCLUDED.type,
        subtype = EXCLUDED.subtype,
        reason = EXCLUDED.reason,
        status = EXCLUDED.status,
        action = EXCLUDED.action,
        source_email = EXCLUDED.source_email,
        source_ip = EXCLUDED.source_ip,
        remote_mta_ip = EXCLUDED.remote_mta_ip,
        reporting_mta = EXCLUDED.reporting_mta,
        timestamp = EXCLUDED.timestamp,
        updated_at = CURRENT_TIMESTAMP;
    `;
    const queryValues = [
      user_id,
      campaign_id,
      messageId,
      bounce.feedbackId,
      emailAddress,
      bounceType,
      bounceSubType,
      diagnosticCode,
      status,
      action,
      mail.source,
      mail.tags["ses:source-ip"] ? mail.tags["ses:source-ip"][0] : null,
      bounce.remoteMtaIp,
      bounce.reportingMTA,
      timestamp,
    ];

    try {
      await query(queryText, queryValues);
      console.log(`Bounce recorded for email: ${emailAddress}`);
    } catch (err) {
      console.error("Failed to record bounce:", err);
    }
  }
}

// Process SNS Notification
async function processSNSNotification(notification) {
  const parsedMessage = JSON.parse(notification.Message);

  if (parsedMessage.eventType !== "Bounce") {
    console.log("Unsupported notification type:", parsedMessage.eventType);
    return;
  }

  await handleBounceEvent(parsedMessage.bounce, parsedMessage.mail);
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Verify SNS message
    const isVerified = await verifySNSMessage(body);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Invalid SNS message" },
        { status: 400 }
      );
    }

    // Handle SNS Notification
    if (body.Type === "Notification") {
      console.log("Processing SNS Notification:", body.Message);
      await processSNSNotification(body);
      return NextResponse.json({ message: "Notification processed" });
    }

    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      console.log("Confirming subscription:", body.SubscribeURL);
      await fetch(body.SubscribeURL);
      return NextResponse.json({ message: "Subscription confirmed" });
    }

    return NextResponse.json(
      { error: "Unsupported SNS message type" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error processing SNS notification:", err);
    return NextResponse.json(
      { error: "Failed to process SNS notification" },
      { status: 500 }
    );
  }
}
