export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1;

    const sql = `
      SELECT DISTINCT ON (u.id)
        u.id,
        u.email,
        u.uniqueid,
        s.status, 
        u.zbstatus, 
        s.created_at
      FROM users u
      JOIN emails_open eo ON u.id = eo.user_id
      JOIN campaigns c ON eo.campaign_id = c.id
      JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')
        AND eo.opened_at >= NOW() - INTERVAL '7 days'
      ORDER BY u.id, eo.opened_at DESC;
    `;

    const results = await query(sql, [websiteId]);

    return new Response(
      JSON.stringify({
        total_count: results.rows.length,
        users: results.rows,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching opened email users:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
