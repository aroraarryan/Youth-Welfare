import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await fetch(`${API}/officer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok || !data.success) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const setCookie = backendRes.headers.get("set-cookie");
  let token: string | null = null;
  if (setCookie) {
    const match = setCookie.match(/officer_token=([^;]+)/);
    if (match) token = match[1];
  }

  const response = NextResponse.json(data, { status: 200 });

  if (token) {
    response.cookies.set("officer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60,
      path: "/",
    });
  }

  return response;
}
