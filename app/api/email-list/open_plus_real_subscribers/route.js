import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1; // Website ID to filter
    const sourceId = 1; // Source ID for the second list

    // SQL to fetch List 1: Users who opened emails or recently subscribed (last 3 days)
    const mergedSQL = `
      SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus
      FROM users u
      JOIN emails_open eo ON u.id = eo.user_id
      JOIN campaigns c ON eo.campaign_id = c.id
      JOIN subscribers s ON u.id = s.user_id
      WHERE c.website_id = $1
        AND s.website_id = $1 -- Ensure they are subscribed to the same website
        AND s.status = 'subscribed'
        AND u.zbstatus IN ('valid', 'catch-all')

      UNION

      -- Users who subscribed to the website in the last 3 days and are still subscribed
      SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus
      FROM users u
      JOIN subscribers s ON u.id = s.user_id
      WHERE s.website_id = $1
        AND s.status = 'subscribed'
        AND s.created_at >= NOW() - INTERVAL '3 days'
        AND u.zbstatus IN ('valid', 'catch-all');
    `;

    // SQL to fetch List 2: Subscribers who subscribed to website_id and source_id 1,
    // excluding users from the first list
    const secondListSQL = `
      SELECT DISTINCT u.id, u.email, u.uniqueid, s.status, u.zbstatus
      FROM users u
      JOIN subscribers s ON u.id = s.user_id
      WHERE s.website_id = $1
        AND u.source_id = $2
        AND s.status = 'subscribed'
        AND u.zbstatus IN ('valid', 'catch-all')
        AND u.id NOT IN (
          SELECT DISTINCT u.id
          FROM users u
          JOIN emails_open eo ON u.id = eo.user_id
          JOIN campaigns c ON eo.campaign_id = c.id
          JOIN subscribers s ON u.id = s.user_id
          WHERE c.website_id = $1
            AND s.website_id = $1 -- Ensure they are subscribed to the same website
            AND s.status = 'subscribed'
            AND u.zbstatus IN ('valid', 'catch-all')
          
          UNION

          SELECT DISTINCT u.id
          FROM users u
          JOIN subscribers s ON u.id = s.user_id
          WHERE s.website_id = $1
            AND s.status = 'subscribed'
            AND s.created_at >= NOW() - INTERVAL '3 days'
            AND u.zbstatus IN ('valid', 'catch-all')
        );
    `;

    // Execute both queries
    const mergedResults = await query(mergedSQL, [websiteId]);
    const secondListResults = await query(secondListSQL, [websiteId, sourceId]);

    // Merge results into a single array
    const finalResults = [...mergedResults.rows, ...secondListResults.rows];

    // Return merged results with total count
    return new Response(
      JSON.stringify({
        total_count: finalResults.length,
        users: finalResults,
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
