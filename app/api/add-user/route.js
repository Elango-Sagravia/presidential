import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email").toLowerCase().trim();
  const browser = searchParams.get("browser");
  const device = searchParams.get("device");
  const platform = searchParams.get("platform");
  const referrer = searchParams.get("referrer") || "none";
  const zbStatus = searchParams.get("zbStatus") || "none";
  const zbSubStatus = searchParams.get("zbSubStatus") || "none";

  const website_id = 1;

  if (!email) {
    return new Response("Email is required", { status: 400 });
  }

  try {
    // Begin transaction
    await query("BEGIN");

    // Step 3: Get the user's IP and determine country using the ip-api.com service
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.connection.remoteAddress;

    console.log("IP address: ", ip);

    // Fetch the geolocation data based on the IP address
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoResponse.json();
    const country = geoData.country || "Unknown";

    // Step 4: Check if the user already exists in the database
    const findUserQuery = `SELECT * FROM users WHERE email = $1`;
    const userResult = await query(findUserQuery, [email]);

    let userId;
    let uniqueId = "";

    if (userResult.rows.length > 0) {
      // User exists, get the user_id
      userId = userResult.rows[0].id;
      uniqueId = userResult.rows[0].uniqueid;

      const updateUserQuery = `
        UPDATE users
        SET browser = $1, device = $2, platform = $3, country = $4, updated_at = NOW(), referrer = $6, source_id = $7, zbStatus = $8, zbSubStatus = $9
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
      ]);
    } else {
      // User doesn't exist, insert a new user
      const insertUserQuery = `
        INSERT INTO users (email, source_id, browser, device, platform, country, created_at, updated_at, referrer, zbStatus, zbSubStatus)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8, $9)
        RETURNING id, uniqueid;
      `;
      const insertResult = await query(insertUserQuery, [
        email,
        1,
        browser,
        device,
        platform,
        country,
        referrer,
        zbStatus,
        zbSubStatus,
      ]);
      userId = insertResult.rows[0].id;
      uniqueId = insertResult.rows[0].uniqueid;
    }

    // Step 5: Check if the user is already subscribed to website_id 4
    const checkSubscriberQuery = `
      SELECT * FROM subscribers WHERE user_id = $1 AND website_id = ${website_id};
    `;
    const subscriberResult = await query(checkSubscriberQuery, [userId]);

    if (subscriberResult.rows.length > 0) {
      // The user is already in the subscribers table for website_id = ${website_id}, update the status to 'subscribed'
      const updateSubscriberQuery = `
        UPDATE subscribers
        SET status = 'subscribed'
        WHERE user_id = $1 AND website_id = ${website_id};
      `;
      await query(updateSubscriberQuery, [userId]);
    } else {
      // The user is not subscribed to website_id ${website_id}, insert a new row with created_at
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
