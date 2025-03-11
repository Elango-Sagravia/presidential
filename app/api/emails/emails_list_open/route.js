import { query } from "@/lib/db"; // Import fetch if using Node.js < 18

export async function GET(request) {
  try {
    // Get the query parameters from the URL
    const { searchParams } = new URL(request.url);
    const user_uniqueid = searchParams.get("user_uniqueid");
    const email_uniqueid = searchParams.get("email_uniqueid");

    if (!user_uniqueid || !email_uniqueid) {
      return new Response(
        JSON.stringify({ message: "Missing user_uniqueid or email_uniqueid" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Start a transaction to ensure both updates happen together
    await query("BEGIN");

    // Update emails_list table only if isOpened is false and opened_at is NULL
    const result = await query(
      `UPDATE emails_list
       SET isOpened = TRUE, opened_at = NOW()
       WHERE user_uniqueid = $1
       AND email_uniqueid = $2
       AND (isOpened = FALSE OR opened_at IS NULL)
       RETURNING user_uniqueid`,
      [user_uniqueid, email_uniqueid]
    );

    if (result.rowCount > 0) {
      // Update verified_by_user in users table
      await query(
        `UPDATE users
         SET verified_by_user = TRUE
         WHERE uniqueid = $1`,
        [user_uniqueid]
      );
    }

    // Commit transaction
    await query("COMMIT");

    // Create a 1x1 pixel transparent PNG
    const oneByOnePixel = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Return the 1x1 transparent PNG image
    return new Response(oneByOnePixel, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": oneByOnePixel.length,
      },
    });
  } catch (err) {
    console.error(err);
    await query("ROLLBACK"); // Rollback transaction if any error occurs
    return new Response(
      JSON.stringify({ message: "Error updating emails_list and users" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
