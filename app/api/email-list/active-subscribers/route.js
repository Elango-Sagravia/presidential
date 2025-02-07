import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter

    // SQL Query to fetch required subscribers
    const sql = `
      WITH opened_email_users AS (
        SELECT DISTINCT ON (u.email) u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at, 1 AS priority
        FROM users u
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')
        ORDER BY u.email, s.created_at DESC
      ),
      recent_subscribers AS (
        SELECT DISTINCT ON (u.email) u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at, 2 AS priority
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at >= NOW() - INTERVAL '10 days'
          AND u.zbstatus IN ('valid', 'catch-all')
        ORDER BY u.email, s.created_at DESC
      )
      SELECT id, email, uniqueid, status, zbstatus, created_at, priority
      FROM (
        SELECT * FROM opened_email_users
        UNION ALL
        SELECT * FROM recent_subscribers
      ) unique_users
      ORDER BY priority ASC, created_at DESC;
    `;

    // Execute query
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
