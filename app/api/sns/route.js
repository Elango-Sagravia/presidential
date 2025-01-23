export async function POST(req) {
  try {
    // Parse the incoming request body
    const data = await req.json();

    // Log the incoming data
    console.log("Received Data:", data);

    // Respond with a 200 status
    return new Response(
      JSON.stringify({ message: "Data received successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);

    // Respond with a 500 status in case of an error
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
