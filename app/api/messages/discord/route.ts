import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("discord_access_token")?.value;
  if (!token) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  try {
    // Get user's guilds
    const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const guilds = await guildsRes.json();

    if (!Array.isArray(guilds)) {
      return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 });
    }

    const threads = guilds.slice(0, 10).map((g: any) => ({
      id:       g.id,
      name:     g.name,
      platform: "Discord",
      avatar:   (g.name[0] ?? "D").toUpperCase(),
      preview:  "Click to view messages",
      time:     "",
      unread:   0,
      color:    "#5865f2",
      messages: [],
    }));

    return NextResponse.json({ threads });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}