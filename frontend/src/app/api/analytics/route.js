import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = request.cookies.get('access_token')?.value;
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'summary';
  const year = searchParams.get('year') || '';
  
  const queryString = year ? `?year=${year}` : '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/${endpoint}${queryString}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
