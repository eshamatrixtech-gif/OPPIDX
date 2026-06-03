import { NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_USER_TOKEN);

export async function GET() {
  // Get all DMs and channels
  const { channels } = await slack.conversations.list({
    types: "im,mpim,private_channel,public_channel",
    limit: 20,
    exclude_archived: true,
  });

  const threads = await Promise.all(
    (channels ?? []).map(async (ch) => {
  const [history, info] = await Promise.all([
    slack.conversations.history({ channel: ch.id!, limit: 5 }),
    slack.conversations.info({ channel: ch.id! }),
  ]);

  const msgs   = history.messages ?? [];
  const latest = msgs[0];
  const unread = (info.channel as any)?.unread_count ?? 0;

  let name = ch.name ?? "Unknown";
  if (ch.is_im && ch.user) {
    const user = await slack.users.info({ user: ch.user });
    name = user.user?.real_name ?? user.user?.name ?? "DM";
  }

  return {
    id:       ch.id!,
    name,
    platform: "Slack",
    avatar:   name[0]?.toUpperCase() ?? "S",
    preview:  latest?.text ?? "",
    time:     latest?.ts
      ? new Date(parseFloat(latest.ts) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
    unread,
    color:    "#e01e5a",
    messages: msgs.reverse().map(m => ({
      id:   m.ts!,
      from: m.bot_id ? "them" : "me",
      text: m.text ?? "",
      time: new Date(parseFloat(m.ts!) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
  };
})
  );

  return NextResponse.json({ threads });
}