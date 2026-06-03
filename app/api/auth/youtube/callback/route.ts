import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI ?? "http://localhost:3000/api/auth/youtube/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokens = await res.json();
  // TODO: store tokens.access_token and tokens.refresh_token in your DB or session

  return NextResponse.redirect("http://localhost:3000?youtube=connected");
}