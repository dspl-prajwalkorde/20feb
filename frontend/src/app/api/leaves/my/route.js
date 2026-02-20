import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const token = req.cookies.get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Validate backend URL to prevent SSRF
    try {
      new URL(backendUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid backend configuration' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/leaves/my`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Invalid response from server' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('My leaves error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
