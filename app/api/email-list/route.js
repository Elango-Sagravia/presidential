// import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || 0;
  try {
    const result = await query(
      `(
  SELECT *
  FROM users
  WHERE source_id = 1
  LIMIT ${limit}
)
UNION
(
  SELECT *
  FROM users
  WHERE source_id = 2
  LIMIT GREATEST(${limit} - (SELECT COUNT(*) FROM users WHERE source_id = 1), 0)
)
LIMIT ${limit};`,
      []
    );
    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error fetching users" }, { status: 500 });
  }
}
