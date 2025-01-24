import { query } from "@/lib/db";

function containsDomain(email, domains) {
  return domains.some((domain) => email.includes(domain));
}

// const domains = [
//   "yahoo.com",
//   "ymail.com",
//   "aol.com",
//   "rocketmail.com",
//   "yahoo",
//   "att.net",
//   "sbcglobal.net",
//   "bellsouth.net",
//   "flash.net",
//   "pacbell.net",
//   "nvbell.net",
//   "swbell.net",
// ];
const domains = [];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || 100; // Default limit to 100

    const websiteId = 1; // Website ID to filter
    const sourceId1 = 1; // Source ID for the first condition
    const sourceId2 = 2; // Source ID for the third condition

    // Corrected SQL Query
    const sql = `
      SELECT DISTINCT id, email, uniqueid
      FROM (
        -- First condition: Users with source_id = 1
        SELECT u.id, u.email, u.uniqueid
        FROM users u
        JOIN subscribers s ON u.id = s.user_id
        WHERE u.source_id = $1
          AND s.website_id = $2
          AND s.status = 'subscribed'

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
          WHERE u.source_id = $3
            AND s.website_id = $2
            AND s.status = 'subscribed'
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

    // Return the results as JSON
    return new Response(
      JSON.stringify(
        results.rows.filter((row) => !containsDomain(row.email, domains))
      ),
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
