import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken  = cookieStore.get("gmail_access_token")?.value;
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Fetch last 10 inbox threads
  const { data } = await gmail.users.threads.list({
    userId: "me", maxResults: 10, labelIds: ["INBOX"],
  });

  const threads = await Promise.all(
    (data.threads ?? []).map(async (t) => {
      const thread = await gmail.users.threads.get({ userId: "me", id: t.id!, format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const msg    = thread.data.messages?.[0];
      const headers = msg?.payload?.headers ?? [];
      const get    = (name: string) => headers.find(h => h.name === name)?.value ?? "";

      return {
        id:       t.id!,
        name:     get("From").replace(/<.*>/, "").trim() || get("From"),
        platform: "Gmail",
        avatar:   (get("From")[0] ?? "G").toUpperCase(),
        preview:  get("Subject") || "(no subject)",
        time:     new Date(parseInt(msg?.internalDate ?? "0")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unread:   thread.data.messages?.some(m => m.labelIds?.includes("UNREAD")) ? 1 : 0,
        color:    "#ea4335",
        messages: thread.data.messages?.map(m => ({
          id:   m.id!,
          from: m.labelIds?.includes("SENT") ? "me" : "them",
          text: get("Subject"),
          time: new Date(parseInt(m.internalDate ?? "0")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })) ?? [],
      };
    })
  );

  return NextResponse.json({ threads });
}
