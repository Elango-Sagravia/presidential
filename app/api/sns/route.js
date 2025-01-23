import { query } from "@/lib/db";

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

// Process Bounce Event
async function handleBounceEvent(event) {
  const { bounce, mail } = event;
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
      mail.tags["ses:source-ip"] ? mail.tags["ses:source-ip"][0] : null,
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

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Body: " + body);
    // Verify the event type is a bounce
    if (body.eventType !== "Bounce") {
      return NextResponse.json(
        { error: "Event type not supported" },
        { status: 400 }
      );
    }

    // Process the bounce event
    await handleBounceEvent(body);

    return NextResponse.json({
      message: "Bounce event processed successfully",
    });
  } catch (err) {
    console.error("Error processing bounce event:", err);
    return NextResponse.json(
      { error: "Failed to process bounce event" },
      { status: 500 }
    );
  }
}
