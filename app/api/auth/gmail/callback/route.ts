import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const { tokens } = await oauth2Client.getToken(code);

  // Store tokens in cookies (simple, works for single user)
  const cookieStore = await cookies();
  cookieStore.set("gmail_access_token",  tokens.access_token  ?? "", { httpOnly: true, path: "/" });
  cookieStore.set("gmail_refresh_token", tokens.refresh_token ?? "", { httpOnly: true, path: "/" });

  return NextResponse.redirect("http://localhost:3000");
}
