import { query } from "@/lib/db";

export async function POST(request) {
  // Handle CORS preflight request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content
      headers: {
        "Access-Control-Allow-Origin": "*", // Replace "*" with your frontend origin for stricter security
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Parse the request body
    const body = await request.json();
    const { email, website_id } = body;

    // Validate input
    if (!email || !website_id) {
      return new Response(
        JSON.stringify({ error: "email and website_id are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
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
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
