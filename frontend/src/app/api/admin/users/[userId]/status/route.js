import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  const token = request.cookies.get('access_token')?.value;
  const body = await request.json();
  const { userId } = await params;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
