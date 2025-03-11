import { query } from "@/lib/db"; // Import fetch if using Node.js < 18

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

    // Start a transaction to ensure both updates happen together
    await query("BEGIN");

    // Update emails_list table only if verified is false and verified_at is NULL
    const result = await query(
      `UPDATE emails_list
       SET verified = TRUE, verified_at = NOW()
       WHERE user_uniqueid = $1
       AND email_uniqueid = $2
       AND (verified = FALSE OR verified_at IS NULL)
       RETURNING email`,
      [user_uniqueid, email_uniqueid]
    );

    if (result.rowCount === 0) {
      // If no rows were updated, return a message
      return new Response(
        JSON.stringify({ message: "Email already verified or does not exist" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the email from the query result
    const { email } = result.rows[0];

    // Commit transaction
    await query("COMMIT");

    // Return JSON response with the email ID
    return new Response(
      JSON.stringify({ message: "Email verified successfully", email }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    await query("ROLLBACK"); // Rollback transaction if any error occurs
    return new Response(
      JSON.stringify({ message: "Error updating verified status" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
