import { cookies } from "next/headers";

export async function POST(req, context) {
  try {
    const params = await context.params;   // THIS is the fix
    const id = params.id;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Leave ID is required' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Validate backend URL to prevent SSRF
    try {
      new URL(backendUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid backend configuration' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    const res = await fetch(
        `${backendUrl}/leaves/${id}/approve`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
        }
    );

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Invalid response from server');
        return new Response(errorText, {
            status: res.status,
            headers: { "Content-Type": "application/json" },
        });
    }

    const text = await res.text();

    return new Response(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
