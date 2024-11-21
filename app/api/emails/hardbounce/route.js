import { query } from "@/lib/db";

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, website_id } = body;

    if (!email || !website_id) {
      return new Response(
        JSON.stringify({ error: "email and website_id are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500", // Use your exact frontend origin
          },
        }
      );
    }

    const sql = `
      UPDATE subscribers
      SET status = 'unsubscribed'
      WHERE user_id = (SELECT id FROM users WHERE email = ?)
        AND website_id = ?
    `;

    const result = await query(sql, [email, website_id]);

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "No matching subscriber found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500", // Use your exact frontend origin
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Subscription status updated to unsubscribed",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500", // Use your exact frontend origin
        },
      }
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://127.0.0.1:5500", // Use your exact frontend origin
      },
    });
  }
}
