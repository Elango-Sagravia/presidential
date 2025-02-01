import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter

    // SQL Query with Numeric Priorities for Correct Sorting
    const sql = `
      WITH combined_users AS (
        (
          -- Users who opened emails related to website_id = 1
          SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 1 AS priority, s.created_at
          FROM users u
          JOIN emails_open eo ON u.id = eo.user_id
          JOIN campaigns c ON eo.campaign_id = c.id
          JOIN subscribers s ON u.id = s.user_id
          WHERE c.website_id = $1
            AND s.website_id = $1
            AND s.status = 'subscribed'
            AND u.zbstatus IN ('valid', 'catch-all')
        )
        UNION
        (
          -- Users who subscribed in the last 7 days
          SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 2 AS priority, s.created_at
          FROM users u
          JOIN subscribers s ON u.id = s.user_id
          WHERE s.website_id = $1
            AND s.status = 'subscribed'
            AND s.created_at >= NOW() - INTERVAL '7 days'
            AND u.zbstatus IN ('valid', 'catch-all')
        )
        UNION
        (
          -- Users who subscribed in the last 30 days but NOT in the last 7 days
          SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus, 3 AS priority, s.created_at
          FROM users u
          JOIN subscribers s ON u.id = s.user_id
          WHERE s.website_id = $1
            AND s.status = 'subscribed'
            AND s.created_at >= NOW() - INTERVAL '30 days'
            AND s.created_at < NOW() - INTERVAL '7 days'
            AND u.zbstatus IN ('valid', 'catch-all')
        )
      )
      SELECT *
      FROM combined_users
      ORDER BY 
        priority ASC,  -- Ensures: opened_email (1) first, then 7-day subs (2), then 30-day subs (3)
        created_at DESC;  -- Newest users within each category come first
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
