import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `${BACKEND}/officer/${path.join("/")}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get("officer_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Cookie"] = `officer_token=${token}`;
  }

  const init: RequestInit = { method: request.method, headers };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  const backendRes = await fetch(backendUrl, init);
  const data = await backendRes.json();

  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie?.includes("officer_token=;")) {
    response.cookies.delete("officer_token");
  }

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
