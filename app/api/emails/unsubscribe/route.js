export const runtime = "nodejs"; // ✅ Fix for Next.js build error
export const dynamic = "force-dynamic";
import { query } from "@/lib/db"; // Import your database query function

export async function GET(request) {
  try {
    // Get the query parameters from the URL
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const email = searchParams.get("email"); // Assuming email is passed as a query parameter
    const campaign_id = searchParams.get("campaign_id");
    const website_id = 1; // Assuming website_id is a constant

    // Validate input
    if (!user_id || !campaign_id || !email) {
      return new Response(
        JSON.stringify({ message: "Missing user_id, email, or campaign_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert data into emails_unsubscribe table
    const result = await query(
      `INSERT INTO emails_unsubscribe (user_id, campaign_id, unsubscribed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, campaign_id) DO NOTHING  -- Ensure uniqueness
       RETURNING *`,
      [user_id, campaign_id]
    );

    // Check if a row was inserted
    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Unsubscribe record already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the status of the user in the users table if user_id and email match
    const updateResult = await query(
      `UPDATE subscribers 
       SET status = 'unsubscribed'
       WHERE user_id = $1 AND  website_id = $2
       RETURNING *`,
      [user_id, website_id]
    );

    // Check if the user was found and updated
    if (updateResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matching user found for update" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the inserted unsubscribe row and updated user row as a response
    return new Response(
      JSON.stringify({
        unsubscribe: result.rows[0], // The unsubscribed row
        updatedUser: updateResult.rows[0], // The updated user row
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
