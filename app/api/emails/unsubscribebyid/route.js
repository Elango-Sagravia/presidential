import { query } from "@/lib/db"; // Import your database query function

export async function POST(request) {
  try {
    // Get the query parameters from the URL
    const { searchParams } = new URL(request.url);
    const unique_id = searchParams.get("unique_id");
    const campaign_id = searchParams.get("campaign_id");
    const website_id = 1; // Assuming website_id is a constant

    // Validate input
    if (!unique_id || !campaign_id) {
      return new Response(
        JSON.stringify({ message: "Missing unique_id or campaign_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Retrieve user_id from the users table using unique_id
    const userResult = await query(
      `SELECT id AS user_id FROM users WHERE uniqueid = $1`,
      [unique_id]
    );

    // Check if user was found
    if (userResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No user found for the provided unique_id" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const user_id = userResult.rows[0].user_id;

    // Insert data into emails_unsubscribe table
    const unsubscribeResult = await query(
      `INSERT INTO emails_unsubscribe (user_id, campaign_id, unsubscribed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, campaign_id) DO NOTHING  -- Ensure uniqueness
       RETURNING *`,
      [user_id, campaign_id]
    );

    // Check if a row was inserted
    if (unsubscribeResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Unsubscribe record already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the status of the user in the subscribers table
    const updateResult = await query(
      `UPDATE subscribers 
       SET status = 'unsubscribed'
       WHERE user_id = $1 AND website_id = $2
       RETURNING *`,
      [user_id, website_id]
    );

    // Check if the user was found and updated
    if (updateResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching subscriber found for update" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the inserted unsubscribe row and updated user row as a response
    return new Response(
      JSON.stringify({
        unsubscribe: unsubscribeResult.rows[0], // The unsubscribed row
        updatedSubscriber: updateResult.rows[0], // The updated subscriber row
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Error processing request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
