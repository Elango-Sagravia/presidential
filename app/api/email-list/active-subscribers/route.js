import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter

    // SQL Query to fetch required subscribers without duplicates
    const sql = `
      WITH opened_email_users AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at, 1 AS priority
        FROM users u
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      recent_subscribers_3_days AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at, 2 AS priority
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at >= NOW() - INTERVAL '3 days'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      subscribers_6_to_10_days AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at, 3 AS priority
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at BETWEEN NOW() - INTERVAL '10 days' AND NOW() - INTERVAL '3 days'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      combined_users AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY priority, created_at DESC) AS row_num
        FROM (
          SELECT * FROM opened_email_users
          UNION ALL
          SELECT * FROM recent_subscribers_3_days
          UNION ALL
          SELECT * FROM subscribers_6_to_10_days
        ) all_users
      )
      SELECT id, email, uniqueid, status, zbstatus, created_at, priority
      FROM combined_users
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
