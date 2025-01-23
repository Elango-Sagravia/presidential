import { NextResponse } from "next/server";

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

// Process SNS notification
async function processSNSNotification(notification) {
  console.log("Processing SNS Notification:", notification);
  // Add your logic here (e.g., saving to a database, invoking other services)
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
