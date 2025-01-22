export async function POST(request) {
  try {
    // Parse the JSON body
    const body = await request.text(); // Read the raw text of the body

    if (body) {
      const jsonData = JSON.parse(body); // Parse the body as JSON
      console.log("Request Body (parsed as JSON):", jsonData);
    } else {
      console.log("Request Body is empty");
    }

    return new Response(JSON.stringify({ message: "Handled POST request" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing request body:", error.message);

    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
