import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = request.cookies.get('access_token')?.value;
  const { searchParams } = new URL(request.url);
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
