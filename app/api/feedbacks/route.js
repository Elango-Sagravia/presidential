import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const {
      uniqueid,
      campaign_id,
      reason = null,
      notes = null,
    } = await request.json();

    if (!uniqueid || !campaign_id) {
      return new Response("uniqueid and campaign_id are required", {
        status: 400,
      });
    }

    // Step 1: Get user_id from uniqueid
    const userRes = await query(`SELECT id FROM users WHERE uniqueid = $1`, [
      uniqueid,
    ]);

    if (userRes.rows.length === 0) {
      return new Response("User not found for given uniqueid", { status: 404 });
    }

    const user_id = userRes.rows[0].id;

    // Step 2: Insert into feedbacks table
    const insertQuery = `
      INSERT INTO feedbacks (user_id, campaign_id, reason, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id;
    `;

    const result = await query(insertQuery, [
      user_id,
      campaign_id,
      reason,
      notes,
    ]);

    return new Response(
      JSON.stringify({ success: true, feedback_id: result.rows[0].id }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error inserting feedback:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
}
