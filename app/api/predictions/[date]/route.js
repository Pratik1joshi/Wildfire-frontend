export const runtime = 'nodejs'

export async function GET(request, context) {
  const params = await context.params; // THIS is what fixes it
  const date = params.date;

  if (!date) {
    return new Response(JSON.stringify({ error: "Missing date param" }), {
      status: 400,
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }), {
      status: 400,
    });
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/predictions/${date}`);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("API call failed:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
