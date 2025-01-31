import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { uniqueid } = await request.json();

    if (!uniqueid) {
      return new Response("Unique ID is required", { status: 400 });
    }

    // Begin transaction
    await query("BEGIN");

    // Step 1: Check if the user exists
    const findUserQuery = `SELECT email FROM users WHERE uniqueid = $1`;
    const userResult = await query(findUserQuery, [uniqueid]);

    if (userResult.rows.length === 0) {
      await query("ROLLBACK");
      return new Response("User not found", { status: 404 });
    }

    const email = userResult.rows[0].email;

    // Step 2: Update the user to set verified_by_user to TRUE
    const updateUserQuery = `
      UPDATE users
      SET verified_by_user = TRUE, updated_at = NOW()
      WHERE uniqueid = $1;
    `;
    await query(updateUserQuery, [uniqueid]);

    // Commit transaction
    await query("COMMIT");

    return new Response(
      JSON.stringify({
        success: true,
        message: "User verified successfully",
        email,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating user verification status:", error);

    // Rollback transaction in case of error
    await query("ROLLBACK");

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
