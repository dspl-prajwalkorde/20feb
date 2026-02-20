export async function GET(req) {
  try {
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

    const response = await fetch(
      `${backendUrl}/leaves/mybalance`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
}catch (error) {
    console.error('My balance error:', {
      error: error.message,
      stack: error.stack,
      endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/leaves/mybalance`,
      method: 'GET'
    });
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}

 

