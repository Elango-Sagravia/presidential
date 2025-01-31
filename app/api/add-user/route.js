import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const {
      email,
      browser,
      device,
      platform,
      referrer = "none",
      zbStatus = "none",
      zbSubStatus = "none",
      city = "unknown",
      country = "unknown",
      domain = "unknown",
      firstname = "",
      lastname = "",
      gender = "unknown",
      zipcode = "",
      region = "unknown",
      smtp_provider = "unknown",
    } = await request.json();

    const website_id = 1;

    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    // Begin transaction
    await query("BEGIN");

    // Step 4: Check if the user already exists in the database
    const findUserQuery = `SELECT * FROM users WHERE email = $1`;
    const userResult = await query(findUserQuery, [email.toLowerCase().trim()]);

    let userId;
    let uniqueId = "";

    if (userResult.rows.length > 0) {
      // User exists, get the user_id
      userId = userResult.rows[0].id;
      uniqueId = userResult.rows[0].uniqueid;

      const updateUserQuery = `
        UPDATE users
        SET browser = $1, device = $2, platform = $3, country = $4, updated_at = NOW(), referrer = $6, source_id = $7, zbStatus = $8, zbSubStatus = $9, city = $10, domain = $11, firstname = $12, lastname = $13, gender = $14, zipcode = $15, region = $16, smtp_provider = $17
        WHERE id = $5;
      `;
      await query(updateUserQuery, [
        browser,
        device,
        platform,
        country,
        userId,
        referrer,
        1,
        zbStatus,
        zbSubStatus,
        city,
        domain,
        firstname,
        lastname,
        gender,
        zipcode,
        region,
        smtp_provider,
      ]);
    } else {
      // User doesn't exist, insert a new user
      const insertUserQuery = `
        INSERT INTO users (email, source_id, browser, device, platform, country, created_at, updated_at, referrer, zbStatus, zbSubStatus, city, domain, firstname, lastname, gender, zipcode, region, smtp_provider)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id, uniqueid;
      `;
      const insertResult = await query(insertUserQuery, [
        email.toLowerCase().trim(),
        1,
        browser,
        device,
        platform,
        country,
        referrer,
        zbStatus,
        zbSubStatus,
        city,
        domain,
        firstname,
        lastname,
        gender,
        zipcode,
        region,
        smtp_provider,
      ]);
      userId = insertResult.rows[0].id;
      uniqueId = insertResult.rows[0].uniqueid;
    }

    // Step 5: Check if the user is already subscribed to website_id 1
    const checkSubscriberQuery = `
      SELECT * FROM subscribers WHERE user_id = $1 AND website_id = ${website_id};
    `;
    const subscriberResult = await query(checkSubscriberQuery, [userId]);

    if (subscriberResult.rows.length > 0) {
      // Update subscriber status to 'subscribed'
      const updateSubscriberQuery = `
        UPDATE subscribers
        SET status = 'subscribed'
        WHERE user_id = $1 AND website_id = ${website_id};
      `;
      await query(updateSubscriberQuery, [userId]);
    } else {
      // Insert a new subscription record
      const insertSubscriberQuery = `
        INSERT INTO subscribers (user_id, website_id, status, created_at)
        VALUES ($1, ${website_id}, 'subscribed', NOW());
      `;
      await query(insertSubscriberQuery, [userId]);
    }

    // Commit transaction
    await query("COMMIT");

    return new Response(JSON.stringify({ success: true, uniqueId }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error inserting/updating user or subscriber:", error);

    // Rollback transaction in case of error
    await query("ROLLBACK");

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
