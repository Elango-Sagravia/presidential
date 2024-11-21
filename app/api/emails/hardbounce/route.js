import { query } from "@/lib/db";

export async function POST(request) {
  try {
    // Set CORS headers
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
          "Access-Control-Allow-Methods": "POST, OPTIONS", // Allowed methods
          "Access-Control-Allow-Headers": "Content-Type", // Allowed headers
        },
      });
    }
    // Parse the request body
    const body = await request.json();
    const { email, website_id } = body;

    // Validate input
    if (!email || !website_id) {
      return new Response(
        JSON.stringify({ error: "email and website_id are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Query to update the status to 'unsubscribed'
    const sql = `
      UPDATE subscribers
      SET status = 'unsubscribed'
      WHERE user_id = (SELECT id FROM users WHERE email = ?)
        AND website_id = ?
    `;

    // Execute the query
    const result = await query(sql, [email, website_id]);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "No matching subscriber found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return a success response
    return new Response(
      JSON.stringify({
        message: "Subscription status updated to unsubscribed",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
