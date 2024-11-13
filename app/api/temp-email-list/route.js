import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const websiteId = 1;

    if (!websiteId) {
      return new Response(JSON.stringify({ error: "website_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Define the SQL query
    const sql = `
      SELECT DISTINCT u.id, u.email
      FROM emails_open eo
      JOIN campaigns c ON eo.campaign_id = c.id
      JOIN subscribers s ON eo.user_id = s.user_id AND c.website_id = s.website_id
      JOIN users u ON eo.user_id = u.id
      WHERE c.website_id = $1 AND s.status = 'subscribed'

      UNION

      SELECT DISTINCT u.id, u.email
      FROM users u
      JOIN subscribers s ON u.id = s.user_id
      WHERE u.source_id = 1 AND s.website_id = 1 AND s.status = 'subscribed';
    `;

    // Execute the query
    const results = await query(sql, [websiteId]);

    // Return the results as JSON
    return new Response(JSON.stringify(results.rows), {
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
