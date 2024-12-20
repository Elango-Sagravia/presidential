import nodemailer from "nodemailer";
import { getDocuments } from "outstatic/server";

import { emailContent } from "./content.js"; // Import the email content from content.js
async function getData() {
  const blogs = getDocuments("blogs", ["slug", "latest"]);

  return blogs;
}
// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use Gmail service
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: "no-reply@sagravia.com", // Your Gmail address
    pass: "okxv ymta sdzb akwm", // Your Gmail App Password
  },
});

// Function to send an email
async function sendEmail(email, slug) {
  let mailOptions = {
    from: '"Presidential Summary" <no-reply@presidentialsummary.com>', // Sender email address
    to: email, // Recipient email
    bcc: "elango@sagravia.com", // Add BCC recipient
    subject: "Welcome to Presidential Summary!",
    text: "", // Plain text content
    html: emailContent
      .replaceAll("test@test.com", email)
      .replaceAll("%slug%", slug), // HTML content with dynamic email replacement
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
    const blogs = await getData();
    const blog = blogs.find((blog) => blog.latest);

    const body = await request.json(); // Parse the request body as JSON
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await sendEmail(email, blog.slug);

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
