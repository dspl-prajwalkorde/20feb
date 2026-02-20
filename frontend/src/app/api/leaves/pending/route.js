import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookieStore = await cookies();   // ✅ MUST await
    const token = cookieStore.get('access_token')?.value;
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

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const res = await fetch(`${backendUrl}/leaves/pending${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Invalid response from server' }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    
    console.error('Pending leaves error:', {
      error: error.message,
      stack: error.stack,
      endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/leaves/pending`,
      method: 'GET'
    });

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
