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

    // Update emails_list table only if isOpened is false and opened_at is NULL
    const result = await query(
      `UPDATE emails_list
       SET isOpened = TRUE, opened_at = NOW()
       WHERE user_uniqueid = $1
       AND email_uniqueid = $2
       AND (isOpened = FALSE OR opened_at IS NULL)
       RETURNING *`,
      [user_uniqueid, email_uniqueid]
    );

    // If no rows were updated, return a message
    if (result.rowCount === 0) {
      return new Response(
        JSON.stringify({ message: "Email already opened or does not exist" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

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
    return new Response(
      JSON.stringify({ message: "Error updating emails_list" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
