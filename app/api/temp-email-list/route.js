import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || 100; // Default limit to 100

    const websiteId = 1; // Website ID to filter
    const sourceId1 = 1; // Source ID for the first condition
    const sourceId2 = 2; // Source ID for the third condition

    // List of domains to exclude
    const domains = [
      "yahoo.com",
      "ymail.com",
      "aol.com",
      "rocketmail.com",
      "yahoo",
      "att.net",
      "sbcglobal.net",
      "bellsouth.net",
      "flash.net",
      "pacbell.net",
      "nvbell.net",
      "swbell.net",
    ];

    // const domains = []

    // Helper function to check if an email contains any of the domains
    function containsDomain(email, domains) {
      return domains.some((domain) => email.includes(domain));
    }

    // Corrected SQL Query
    const sql = `
      SELECT DISTINCT id, email, uniqueid
      FROM (
        -- First condition: Users with source_id = 1
        SELECT u.id, u.email, u.uniqueid
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        LEFT JOIN emails_open eo ON u.id = eo.user_id
        WHERE u.source_id = $1
          AND s.website_id = $2
          AND s.status = 'subscribed'
          AND (s.created_at >= NOW() - INTERVAL '30 days' OR eo.user_id IS NOT NULL) -- Include only if they opened an email or are subscribed within 30 days

        UNION

        -- Second condition: Users who opened emails for campaigns with website_id = 3
        SELECT u.id, u.email, u.uniqueid
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        JOIN emails_open eo ON u.id = eo.user_id
        JOIN campaigns c ON eo.campaign_id = c.id
        WHERE c.website_id = $2
          AND s.website_id = $2
          AND s.status = 'subscribed'

        UNION

        -- Third condition: Limited subscribers with source_id = 2
        SELECT id, email, uniqueid
        FROM (
          SELECT u.id, u.email, u.uniqueid
          FROM users u
          JOIN subscribers s ON u.id = s.user_id
          LEFT JOIN emails_open eo ON u.id = eo.user_id
          WHERE u.source_id = $3
            AND s.website_id = $2
            AND s.status = 'subscribed'
            AND (s.created_at >= NOW() - INTERVAL '30 days' OR eo.user_id IS NOT NULL) -- Include only if they opened an email or are subscribed within 30 days
          LIMIT $4 -- Apply limit here
        ) AS limited_subscribers
      ) AS combined_results;
    `;

    // Execute the query with parameters
    const results = await query(sql, [
      sourceId1,
      websiteId,
      sourceId2,
      parseInt(limit, 10),
    ]);

    // Filter out results whose email domains match the blacklist
    const filteredResults = results.rows.filter(
      (row) => !containsDomain(row.email, domains)
    );

    // Return the filtered results as JSON
    return new Response(JSON.stringify(filteredResults), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
