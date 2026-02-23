import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const token = request.cookies.get('access_token')?.value;
  const { id } = await params;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaves/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
