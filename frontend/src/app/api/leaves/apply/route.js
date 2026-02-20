export async function POST(req) {
  try {
    const body = await req.json();
    const token = req.cookies.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Validate backend URL to prevent SSRF
    try {
      new URL(backendUrl);
    } catch {
      return new Response(
        JSON.stringify({ message: 'Invalid backend configuration' }),
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/leaves/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Invalid response from server' }));
      return new Response(JSON.stringify(errorData), {
        status: response.status,
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
    });

  } catch (error) {
    console.error('Apply leave error:', {
      error: error.message,
      stack: error.stack,
      endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/leaves/apply`,
      method: 'POST'
    });
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}
