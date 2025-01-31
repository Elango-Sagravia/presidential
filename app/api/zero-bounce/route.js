import { NextResponse } from "next/server";
import zeroBounceServer from "@/lib/zeroBounce-server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.connection?.remoteAddress ||
      "";
    console.log("ip", ip);
    const responseZB = ip
      ? await zeroBounceServer.validateEmail(email.toLowerCase().trim(), ip)
      : await zeroBounceServer.validateEmail(email.toLowerCase().trim());

    return NextResponse.json(responseZB);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
