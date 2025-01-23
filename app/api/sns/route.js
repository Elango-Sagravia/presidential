import { NextResponse } from "next/server";
import { query } from "@/lib/db";
// Verify the SNS message
async function verifySNSMessage(message) {
  try {
    // Fetch the SigningCertURL and validate the signature
    const certResponse = await fetch(message.SigningCertURL);
    const cert = await certResponse.text();

    // Validate the message signature using a cryptographic library (e.g., Node's crypto)
    // This part requires parsing and recreating the string-to-sign.
    // Refer to AWS SNS signature validation documentation for exact implementation.

    // For now, returning true as a placeholder
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

  // Only process if campaign_id and user_id exist
  if (!campaign_id || !user_id) {
    console.error("Missing campaign_id or user_id in mail headers");
    return;
  }

  for (const recipient of bouncedRecipients) {
    const { emailAddress, status, action, diagnosticCode } = recipient;

    // SQL query to insert or update bounce data
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
      mail.tags["ses:source-ip"][0],
      bounce.remoteMtaIp,
      bounce.reportingMTA,
      timestamp,
    ];

    try {
      // Execute the query using the imported query function
      await query(queryText, queryValues);
      console.log(`Bounce recorded for email: ${emailAddress}`);
    } catch (err) {
      console.error("Failed to record bounce:", err);
    }
  }
}

// Process SNS Notification
async function processSNSNotification(notification) {
  const { Type, bounce, mail } = JSON.parse(notification);

  // Only handle "Bounce" type events
  if (Type === "Bounce") {
    await handleBounceEvent(bounce, mail);
  } else {
    console.log("Unsupported notification type:", Type);
  }
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

    // Handle different SNS message types
    switch (body.Type) {
      case "SubscriptionConfirmation": {
        if (!body.SubscribeURL) {
          return NextResponse.json(
            { error: "Missing SubscribeURL in SubscriptionConfirmation" },
            { status: 400 }
          );
        }
        // Confirm the subscription
        console.log("Confirming subscription:", body.SubscribeURL);
        await fetch(body.SubscribeURL);
        return NextResponse.json({ message: "Subscription confirmed" });
      }

      case "Notification": {
        console.log("Notification received:", body.Message);
        console.log(body);
        // Process the notification
        await processSNSNotification(body.Message);
        return NextResponse.json({ message: "Notification processed" });
      }

      default: {
        return NextResponse.json(
          { error: "Unknown SNS message type" },
          { status: 400 }
        );
      }
    }
  } catch (err) {
    console.error("Error processing SNS notification:", err);
    return NextResponse.json(
      { error: "Failed to process SNS notification" },
      { status: 500 }
    );
  }
}
