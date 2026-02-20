export async function GET(req) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const response = await fetch(
      `${backendUrl}/leaves/types`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
    });

  } catch (error) {
    console.error('Fetch leave types error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}
