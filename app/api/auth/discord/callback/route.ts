import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type:    "authorization_code",
      code,
      redirect_uri:  "http://localhost:3000/api/auth/discord/callback",
    }),
  });

  const data = await res.json();
  
  const cookieStore = await cookies();
  cookieStore.set("discord_access_token", data.access_token, { httpOnly: true, path: "/" });

  return NextResponse.redirect("http://localhost:3000");
}