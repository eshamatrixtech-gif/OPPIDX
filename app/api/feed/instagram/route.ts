import { NextResponse } from "next/server";
import { getClient } from "@/lib/instagram";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  const { ig, loggedIn } = getClient();
  if (!loggedIn) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  try {
    const feed  = ig.feed.timeline();
    const items = await feed.items();

    const posts = items.slice(0, 20).map((item: any) => ({
      id:       item.id,
      author:   item.user?.username ?? "Unknown",
      platform: "Instagram",
      avatar:   (item.user?.username?.[0] ?? "I").toUpperCase(),
      color:    "#e1306c",
      time:     item.taken_at
        ? new Date(item.taken_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      content:  item.caption?.text ?? "(photo)",
      score:    50,
      reason:   "",
    }));

    // Score with AI
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Score Instagram posts for brain health 0-100. Return JSON only: { "scores": [{ "id": "string", "score": number, "reason": "one sentence" }] }` },
        { role: "user", content: JSON.stringify(posts.map(p => ({ id: p.id, content: p.content }))) },
      ],
      response_format: { type: "json_object" },
    });

    const result   = JSON.parse(aiRes.choices[0].message.content || "{}");
    const scoreMap = new Map(result.scores?.map((s: any) => [s.id, s]) ?? []);

    const scored = posts.map(p => {
      const s = scoreMap.get(p.id) as any;
      return { ...p, score: s?.score ?? 50, reason: s?.reason ?? "" };
    });

    scored.sort((a, b) => b.score - a.score);
    return NextResponse.json({ posts: scored });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}