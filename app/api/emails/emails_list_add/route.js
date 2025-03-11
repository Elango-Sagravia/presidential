import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json(); // Parse the request body
    const { user_uniqueid, email_uniqueid, email, type, website_id } = body;

    // Insert data into emails_list table
    const result = await query(
      `INSERT INTO emails_list (user_uniqueid, email_uniqueid, email, type, website_id, created_at, isOpened, opened_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), FALSE, NULL)
       RETURNING *`,
      [user_uniqueid, email_uniqueid, email, type, website_id]
    );

    // Return the inserted row as a response
    return Response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Error adding row to emails_list" },
      { status: 500 }
    );
  }
}
