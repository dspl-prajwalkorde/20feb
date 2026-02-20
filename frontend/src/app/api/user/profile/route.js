export async function PUT(req) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const body = await req.json();

    const response = await fetch(
      `${backendUrl}/user/profile`,
      {
        method: 'PUT',
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
    console.error('Update profile error:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}
