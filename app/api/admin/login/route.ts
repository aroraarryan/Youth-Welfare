import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok || !data.success) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Extract the token the backend set in its Set-Cookie header
  const setCookie = backendRes.headers.get("set-cookie");
  let token: string | null = null;
  if (setCookie) {
    const match = setCookie.match(/admin_token=([^;]+)/);
    if (match) token = match[1];
  }

  const response = NextResponse.json(data, { status: 200 });

  if (token) {
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: "/",
    });
  }

  return response;
}
