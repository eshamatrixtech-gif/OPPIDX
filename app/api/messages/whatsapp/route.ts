import { NextResponse } from "next/server";
import { getSocket } from "@/lib/whatsapp";

export async function GET() {
  const sock = getSocket();
  if (!sock) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  try {
    const contacts = sock.contacts;

    const threads = Object.values(contacts)
      .filter((c: any) => c.id?.endsWith("@s.whatsapp.net"))
      .slice(0, 20)
      .map((c: any) => ({
        id:       c.id,
        name:     c.name ?? c.notify ?? c.id.split("@")[0],
        platform: "WhatsApp",
        avatar:   (c.name?.[0] ?? "W").toUpperCase(),
        preview:  "",
        time:     "",
        unread:   0,
        color:    "#25d366",
        messages: [],
      }));

    return NextResponse.json({ threads });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}