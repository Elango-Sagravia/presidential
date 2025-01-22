export async function GET(request) {
  console.log("Request Body:", await request.json()); // Logs the request body
  return new Response(JSON.stringify({ message: "Logged request body" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
