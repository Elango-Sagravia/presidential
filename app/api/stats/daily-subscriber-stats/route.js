import { query } from "@/lib/db";

export async function GET(request) {
  const website_id = 1; // Fixed website ID
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "2024-10-08"; // Replace with default or provided date

  try {
    // First query: country-wise count of subscribers
    const countryResult = await query(
      `SELECT users.country, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       GROUP BY users.country
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    const referrerResult = await query(
      `SELECT users.referrer, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       GROUP BY users.referrer
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    // Email opens query: Count of emails opened on the given date for website_id = 1
    const emailOpensResult = await query(
      `SELECT COUNT(*) AS email_opens
       FROM emails_open
       JOIN campaigns ON emails_open.campaign_id = campaigns.id
       WHERE campaigns.website_id = $1
       AND DATE(emails_open.opened_at) = $2;`,
      [website_id, date]
    );

    const emailOpensCount = emailOpensResult.rows[0]?.email_opens || 0;

    // Emails unsubscribe query: Count of unsubscribes on the given date for website_id = 1
    const emailUnsubscribesResult = await query(
      `SELECT COUNT(*) AS email_unsubscribes
       FROM emails_unsubscribe
       JOIN campaigns ON emails_unsubscribe.campaign_id = campaigns.id
       WHERE campaigns.website_id = $1
       AND DATE(emails_unsubscribe.unsubscribed_at) = $2;`,
      [website_id, date]
    );

    const emailUnsubscribesCount =
      emailUnsubscribesResult.rows[0]?.email_unsubscribes || 0;

    // Desktop: browser and platform counts
    const browserDesktopResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Desktop'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    const platformDesktopResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Desktop'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    // Mobile: browser and platform counts
    const browserMobileResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Mobile'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    const platformMobileResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Mobile'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    // Tablet: browser and platform counts
    const browserTabletResult = await query(
      `SELECT users.browser, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Tablet'
       GROUP BY users.browser
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    const platformTabletResult = await query(
      `SELECT users.platform, CAST(COUNT(*) AS INTEGER) AS total_subscribers
       FROM users
       JOIN subscribers ON users.id = subscribers.user_id
       WHERE subscribers.website_id = ${website_id}
       AND users.source_id = $2
       AND DATE(subscribers.created_at) = $1
       AND users.device = 'Tablet'
       GROUP BY users.platform
       ORDER BY total_subscribers DESC;`,
      [date, 1]
    );

    // Helper function to sum up counts
    const sumCounts = (list) => list.reduce((acc, row) => acc + row.count, 0);

    // Structuring the result in a single response object with summed counts
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
        count: countriesList.length, // Sum of all country counts
        list: countriesList,
        total_subscribers: sumCounts(countriesList),
      },
      referrers: {
        list: referrerList,
        total_subscribers: sumCounts(referrerList),
      },
      desktop: {
        count: sumCounts(desktopBrowsers), // Sum of browsers and platforms counts for desktop
        browsers: desktopBrowsers,
        platforms: desktopPlatforms,
      },
      mobile: {
        count: sumCounts(mobileBrowsers),
        browsers: mobileBrowsers,
        platforms: mobilePlatforms,
      },
      tablet: {
        count: sumCounts(tabletBrowsers), // Sum of browsers and platforms counts for tablet
        browsers: tabletBrowsers,
        platforms: tabletPlatforms,
      },
      email_opens: {
        date,
        count: emailOpensCount,
      },
      email_unsubscribes: {
        date,
        count: emailUnsubscribesCount,
      },
    };

    // Return the combined result
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error fetching data" }, { status: 500 });
  }
}
