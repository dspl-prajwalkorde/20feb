import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
    
    // Validate backend URL to prevent SSRF
    try {
      new URL(backendUrl);
    } catch {
      return NextResponse.json(
        { message: 'Invalid backend configuration' },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Invalid response from server' }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API LOGIN ERROR:', error);
    return NextResponse.json(
      { message: 'Login proxy failed' },
      { status: 500 }
    );
  }
}
