// import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || 0;
  try {
    const result = await query(
      `(
  SELECT u.id, u.email, u.status, u.source_id
  FROM users u
  INNER JOIN subscribers s ON u.id = s.user_id
  WHERE s.website_id = 1
    AND u.source_id = 1
  LIMIT ${limit}
)
UNION ALL
(
  SELECT u.id, u.email, u.status, u.source_id
  FROM users u
  INNER JOIN subscribers s ON u.id = s.user_id
  WHERE s.website_id = 1
    AND u.source_id = 2
  LIMIT ${limit}
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
