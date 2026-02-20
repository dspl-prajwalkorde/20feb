export async function POST(req) {
  try {
    const body = await req.json();
    const token = req.cookies.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const response = await fetch(
      `${backendUrl}/hr/employees`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}
