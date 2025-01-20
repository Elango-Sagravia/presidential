import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Parse website_id as a comma-separated string and convert to an array of integers
  const websiteIds = searchParams.get("website_id")?.split(",").map(Number) || [
    1,
  ];
  const start_date = searchParams.get("start_date") || "2024-10-01"; // Default or provided start date
  const end_date = searchParams.get("end_date") || "2024-10-08"; // Default or provided end date

  try {
    const subscriberListResult = await query(
      `SELECT 
          users.id AS user_id,
          users.email,
          users.source_id,
          users.browser,
          users.device,
          users.platform,
          users.country,
          users.referrer,
          subscribers.created_at AS subscription_date,
          subscribers.status
         FROM 
          subscribers
         JOIN 
          users ON users.id = subscribers.user_id
         WHERE 
          subscribers.website_id = ANY($1)
          AND users.source_id = $2
          AND DATE(subscribers.created_at) BETWEEN $3 AND $4
         ORDER BY 
          subscribers.created_at DESC;`,
      [websiteIds, 1, start_date, end_date]
    );

    const subscriberList = subscriberListResult.rows;

    const countryResult = await query(
      `SELECT users.country, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       GROUP BY users.country
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const referrerResult = await query(
      `SELECT users.referrer, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       GROUP BY users.referrer
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const emailOpensResult = await query(
      `SELECT COUNT(*) AS email_opens
       FROM emails_open
       JOIN campaigns ON emails_open.campaign_id = campaigns.id
       WHERE campaigns.website_id = ANY($3)
       AND DATE(emails_open.opened_at) BETWEEN $1 AND $2;`,
      [start_date, end_date, websiteIds]
    );

    const emailOpensCount = emailOpensResult.rows[0]?.email_opens || 0;

    const emailUnsubscribesResult = await query(
      `SELECT COUNT(*) AS email_unsubscribes
       FROM emails_unsubscribe
       JOIN campaigns ON emails_unsubscribe.campaign_id = campaigns.id
       WHERE campaigns.website_id = ANY($3)
       AND DATE(emails_unsubscribe.unsubscribed_at) BETWEEN $1 AND $2;`,
      [start_date, end_date, websiteIds]
    );

    const emailUnsubscribesCount =
      emailUnsubscribesResult.rows[0]?.email_unsubscribes || 0;

    const browserDesktopResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Desktop'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const platformDesktopResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Desktop'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const browserMobileResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Mobile'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const platformMobileResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Mobile'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const browserTabletResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Tablet'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const platformTabletResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ANY($3)
       AND users.source_id = $4
       AND DATE(subscribers.created_at) BETWEEN $1 AND $2
       AND users.device = 'Tablet'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [start_date, end_date, websiteIds, 1]
    );

    const emailSentResult = await query(
      `SELECT COUNT(*) AS email_sent
       FROM emails_sent
       JOIN campaigns ON emails_sent.campaign_id = campaigns.id
       WHERE campaigns.website_id = ANY($3)
       AND DATE(emails_sent.created_at) BETWEEN $1 AND $2;`,
      [start_date, end_date, websiteIds]
    );

    const emailSentCount = emailSentResult.rows[0]?.email_sent || 0;

    const sumCounts = (list) => list.reduce((acc, row) => acc + row.count, 0);

    const countriesList = countryResult.rows.map((row) => ({
      country: row.country,
      count: row.total_subscribers,
    }));

    const referrerList = referrerResult.rows.map((row) => ({
      referrer: row.referrer,
      count: row.total_subscribers,
    }));

    const desktopBrowsers = browserDesktopResult.rows.map((row) => ({
      browser: row.browser,
      count: row.total_subscribers,
    }));

    const desktopPlatforms = platformDesktopResult.rows.map((row) => ({
      platform: row.platform,
      count: row.total_subscribers,
    }));

    const mobileBrowsers = browserMobileResult.rows.map((row) => ({
      browser: row.browser,
      count: row.total_subscribers,
    }));

    const mobilePlatforms = platformMobileResult.rows.map((row) => ({
      platform: row.platform,
      count: row.total_subscribers,
    }));

    const tabletBrowsers = browserTabletResult.rows.map((row) => ({
      browser: row.browser,
      count: row.total_subscribers,
    }));

    const tabletPlatforms = platformTabletResult.rows.map((row) => ({
      platform: row.platform,
      count: row.total_subscribers,
    }));

    const result = {
      countries: {
        count: countriesList.length,
        list: countriesList,
        total_subscribers: sumCounts(countriesList),
      },
      referrers: {
        list: referrerList,
        total_subscribers: sumCounts(referrerList),
      },
      desktop: {
        count: sumCounts(desktopBrowsers),
        browsers: desktopBrowsers,
        platforms: desktopPlatforms,
      },
      mobile: {
        count: sumCounts(mobileBrowsers),
        browsers: mobileBrowsers,
        platforms: mobilePlatforms,
      },
      tablet: {
        count: sumCounts(tabletBrowsers),
        browsers: tabletBrowsers,
        platforms: tabletPlatforms,
      },
      email_opens: {
        start_date,
        end_date,
        count: emailOpensCount,
      },
      email_unsubscribes: {
        start_date,
        end_date,
        count: emailUnsubscribesCount,
      },
      email_sent: {
        start_date,
        end_date,
        count: emailSentCount,
      },
      subscribersList: {
        subscribers: subscriberList,
        count: subscriberList.length,
      },
    };

    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error fetching data" }, { status: 500 });
  }
}
