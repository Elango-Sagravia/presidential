// import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM users LIMIT 10;", []);
    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error fetching users" }, { status: 500 });
  }
}
