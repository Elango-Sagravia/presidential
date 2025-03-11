import { query } from "@/lib/db"; // Import fetch if using Node.js < 18

const website_id = 1; // Set website_id as a constant or get from request if dynamic

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { user_uniqueid, email_uniqueid } = body;

    if (!user_uniqueid || !email_uniqueid) {
      return new Response(
        JSON.stringify({ message: "Missing user_uniqueid or email_uniqueid" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Start a transaction to ensure all updates happen together
    await query("BEGIN");

    // Update emails_list table only if unsubscribed is false and unsubscribed_at is NULL
    const emailResult = await query(
      `UPDATE emails_list
       SET unsubscribed = TRUE, unsubscribed_at = NOW()
       WHERE user_uniqueid = $1
       AND email_uniqueid = $2
       AND (unsubscribed = FALSE OR unsubscribed_at IS NULL)
       RETURNING email`,
      [user_uniqueid, email_uniqueid]
    );

    // Update the subscribers table to mark the user as unsubscribed
    const subscriberResult = await query(
      `UPDATE subscribers
       SET status = 'unsubscribed', updated_at = NOW()
       WHERE user_id = (SELECT id FROM users WHERE uniqueid = $1)
       AND website_id = $2
       AND status != 'unsubscribed'
       RETURNING user_id`,
      [user_uniqueid, website_id]
    );

    if (emailResult.rowCount === 0 && subscriberResult.rowCount === 0) {
      // If no rows were updated in both tables, return a message
      await query("ROLLBACK");
      return new Response(
        JSON.stringify({
          message: "Email already unsubscribed or does not exist",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the email from the query result
    const email = emailResult.rows[0]?.email || null;

    // Commit transaction
    await query("COMMIT");

    // Return JSON response with the email ID
    return new Response(
      JSON.stringify({ message: "Email unsubscribed successfully", email }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    await query("ROLLBACK"); // Rollback transaction if any error occurs
    return new Response(
      JSON.stringify({ message: "Error updating unsubscribed status" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
