export async function POST(req) {
  try {
    const body = await req.json(); // Parse JSON body
    console.log("Request Body:", body);

    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Invalid Request", { status: 400 });
  }
}
