export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1;

    const sql = `
      WITH opened_users AS (
        SELECT 
          u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at,
          1 AS priority
        FROM users u
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      recent_subscribers AS (
        SELECT 
          u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at,
          2 AS priority
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at >= NOW() - INTERVAL '10 days'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      combined AS (
        SELECT * FROM opened_users
        UNION ALL
        SELECT * FROM recent_subscribers
      ),
      deduplicated AS (
        SELECT DISTINCT ON (email) *
        FROM combined
        ORDER BY email, priority
      ),
      split_priority AS (
        SELECT * FROM deduplicated WHERE priority = 1
        UNION ALL
        SELECT * FROM (
          SELECT * FROM deduplicated
          WHERE priority = 2
          ORDER BY created_at DESC
          LIMIT 25000
        ) limited_priority_2
      )
      SELECT id, email, uniqueid, status, zbstatus, created_at, priority
      FROM split_priority
      ORDER BY priority, created_at DESC;
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
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
