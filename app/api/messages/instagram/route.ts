import { NextResponse } from "next/server";
import { getClient } from "@/lib/instagram";

export async function GET() {
  const { ig, loggedIn } = getClient();
  if (!loggedIn) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  try {
    const inbox = ig.feed.directInbox();
    const page  = await inbox.items();

    const threads = page.slice(0, 20).map(thread => {
      const user    = thread.users?.[0];
      const lastMsg = thread.items?.[0];
      const text    = lastMsg?.text ?? (lastMsg?.link ? "Sent a link" : "Media message");

      return {
        id:       thread.thread_id,
        name:     user?.username ?? "Unknown",
        platform: "Instagram",
        avatar:   (user?.username?.[0] ?? "I").toUpperCase(),
        preview:  text,
        time:     lastMsg?.timestamp
          ? new Date(parseInt(lastMsg.timestamp) / 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        unread: (thread as any).unread_count ?? 0,
        color:    "#e1306c",
        messages: (thread.items ?? []).reverse().map(m => ({
          id:   m.item_id,
          from: m.user_id === thread.viewer_id ? "me" : "them",
          text: m.text ?? (m.link ? "Sent a link" : "Media"),
          time: new Date(parseInt(m.timestamp) / 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),
      };
    });

    return NextResponse.json({ threads });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}