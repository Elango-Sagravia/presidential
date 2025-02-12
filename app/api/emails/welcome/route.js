import nodemailer from "nodemailer";
import { getDocuments } from "outstatic/server";

import { emailContent } from "./content.js"; // Import the email content from content.js
async function getData() {
  const blogs = getDocuments("blogs", ["slug", "latest"]);

  return blogs;
}
// Create a transporter for Gmail
let transporter = nodemailer.createTransport({
  host: "email-smtp.us-west-1.amazonaws.com",
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: process.env.SMTP_USERNAME, // Your email address
    pass: process.env.SMTP_PASSWORD, // Your email password
  },
});

// Function to send an email
async function sendEmail(email, slug, uniqueId) {
  let mailOptions = {
    from: '"Presidential Summary" <no-reply@newsletter.presidentialsummary.com>', // Sender email address
    to: email, // Recipient email
    bcc: "elango@sagravia.com", // Add BCC recipient
    subject: "Welcome to Presidential Summary",
    text: "", // Plain text content
    html: emailContent
      .replaceAll("test@test.com", email)
      .replaceAll("%slug%", slug) // HTML content with dynamic email replacement
      .replaceAll("%unique-id%", uniqueId), // HTML content with dynamic email replacement
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s to %s", info.messageId, email);
  } catch (error) {
    console.error("Error sending to %s: %s", email, error.message);
    throw error;
  }
}

// API handler function for POST request
export async function POST(request) {
  try {
    const response = await fetch(
      "https://www.presidentialsummary.com/api/blogs/latest",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const blog = await response.json();

    const body = await request.json(); // Parse the request body as JSON
    const { email, uniqueId } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await sendEmail(email, blog.slug, uniqueId);

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error handling POST request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
