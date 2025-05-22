export const runtime = "nodejs"; // ✅ Fix for Next.js build error
export const dynamic = "force-dynamic";

import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter

    // SQL Query to fetch all unique users (Opened emails OR Last 2 subscribers) with priorities
    const sql = `
      WITH opened_email_users AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at
        FROM users u
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        JOIN subscribers s ON u.id = s.user_id
        WHERE c.website_id = $1
          AND s.website_id = $1
          AND s.status = 'subscribed'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      last_10_days_subscribers AS (
        SELECT u.id, u.email, u.uniqueid, s.status, u.zbstatus, s.created_at
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE s.website_id = $1
          AND s.status = 'subscribed'
          AND s.created_at > NOW() - INTERVAL '10 days'
          AND u.zbstatus IN ('valid', 'catch-all')
      ),
      combined_users AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS row_num
        FROM (
          SELECT * FROM opened_email_users
          UNION ALL
          SELECT * FROM last_10_days_subscribers
        ) all_users
      ),
      filtered_users AS (
        SELECT id, email, uniqueid, status, zbstatus, created_at
        FROM combined_users
        WHERE row_num = 1
      ),
      priority_1_users AS (
        SELECT id, email, uniqueid, status, zbstatus, created_at, 1 AS priority
        FROM filtered_users
        WHERE created_at >= NOW() - INTERVAL '1 day'
          OR id IN (SELECT id FROM opened_email_users)
      ),
      sorted_remaining_users AS (
        SELECT id, email, uniqueid, status, zbstatus, created_at,
               ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_num
        FROM filtered_users
        WHERE id NOT IN (SELECT id FROM priority_1_users)
      ),
      priority_2_users AS (
        SELECT id, email, uniqueid, status, zbstatus, created_at, 2 AS priority
        FROM sorted_remaining_users
        WHERE row_num <= 7000
      ),
      priority_3_users AS (
        SELECT id, email, uniqueid, status, zbstatus, created_at, 3 AS priority
        FROM sorted_remaining_users
        WHERE row_num > 7000
      ),
      final_users AS (
        SELECT * FROM priority_1_users
        UNION ALL
        SELECT * FROM priority_2_users
        UNION ALL
        SELECT * FROM priority_3_users
      )
      SELECT id, email, uniqueid, status, zbstatus, created_at, priority
      FROM final_users
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
