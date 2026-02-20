import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const token = request.cookies.get('access_token')?.value;
  const body = await request.json();
  const { userId } = await params;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}/roles`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request, { params }) {
  const token = request.cookies.get('access_token')?.value;
  const { searchParams } = new URL(request.url);
  const roleName = searchParams.get('role_name');
  const { userId } = await params;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}/roles/${roleName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
