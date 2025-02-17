import { NextResponse } from "next/server";
import zeroBounceServer from "@/lib/zeroBounce-server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Extract IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "";
    // const ip = "103.110.238.29";

    console.log("Client IP:", ip);

    // Validate email with ZeroBounce
    const responseZB = ip
      ? await zeroBounceServer.validateEmail(email.toLowerCase().trim(), ip)
      : await zeroBounceServer.validateEmail(email.toLowerCase().trim());

    // Fetch country based on IP (fallback to "Unknown")
    let country = "Unknown";
    if (ip) {
      try {
        const geoResponse = await fetch(
          `http://ip-api.com/json/${ip}?fields=country`
        );
        const geoData = await geoResponse.json();
        country = geoData.country || "Unknown";
      } catch (geoError) {
        console.error("Geolocation fetch failed:", geoError);
      }
    }

    return NextResponse.json({
      ...responseZB,
      countryFromApi: country,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
