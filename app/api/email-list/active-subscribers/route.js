import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter

    // SQL Query with Numeric Priorities for Correct Sorting & Uniqueness
    const sql = `
      WITH combined_users AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 1 AS priority, s.created_at
        FROM users u
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')

        UNION ALL

        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 2 AS priority, s.created_at
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at >= NOW() - INTERVAL '7 days'
          AND u.zbstatus IN ('valid', 'catch-all')

        UNION ALL

        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 3 AS priority, s.created_at
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at >= NOW() - INTERVAL '30 days'
          AND s.created_at < NOW() - INTERVAL '7 days'
          AND u.zbstatus IN ('valid', 'catch-all')
      )
      SELECT id, email, uniqueid, status, zbstatus, priority, created_at
      FROM (
        SELECT *, ROW_NUMBER() OVER (
          PARTITION BY email ORDER BY priority ASC, created_at DESC
        ) AS row_num
        FROM combined_users
      ) t
      WHERE row_num = 1
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
