import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sample posts — replace with real API data later
const SAMPLE_FEED = [
  { id: "1", author: "Naval Ravikant",    platform: "Twitter",  color: "#1d9bf0", avatar: "N", time: "2m ago",   content: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep." },
  { id: "2", author: "PewDiePie",         platform: "YouTube",  color: "#ff0000", avatar: "P", time: "1h ago",   content: "I spent 100 days in Minecraft and here's what happened... (you won't believe this)" },
  { id: "3", author: "Sam Altman",        platform: "Twitter",  color: "#1d9bf0", avatar: "S", time: "3h ago",   content: "The thing that most surprised me about building OpenAI: how much the culture matters." },
  { id: "4", author: "Drama Alert",       platform: "YouTube",  color: "#ff0000", avatar: "D", time: "4h ago",   content: "KEEMSTAR EXPOSED!! You won't believe what he did this time 😱🔥 (MUST WATCH)" },
  { id: "5", author: "LinkedIn News",     platform: "LinkedIn", color: "#0077b5", avatar: "L", time: "5h ago",   content: "Top skills employers are looking for in 2025: AI literacy, adaptability, and communication." },
  { id: "6", author: "Rage Bait Account", platform: "Twitter",  color: "#1d9bf0", avatar: "R", time: "6h ago",   content: "This is why your generation is failing. Nobody wants to work anymore. Unpopular opinion 🧵" },
];

export async function GET() {
  try {
    // Score all posts with AI
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Score social media posts for brain health. Return JSON only:
{ "scores": [{ "id": "string", "score": number, "reason": "one sentence" }] }
Score 0-100: 0-30 brain rot, 31-70 neutral, 71-100 valuable.`,
        },
        {
          role: "user",
          content: JSON.stringify(SAMPLE_FEED.map(p => ({ id: p.id, content: p.content, platform: p.platform }))),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(res.choices[0].message.content || "{}");
    const scoreMap = new Map(result.scores?.map((s: any) => [s.id, s]) ?? []);

    const posts = SAMPLE_FEED.map(post => {
      const scored = scoreMap.get(post.id) as any;
      return { ...post, score: scored?.score ?? 50, reason: scored?.reason ?? "" };
    });

    // Sort by score descending — best content first
    posts.sort((a, b) => b.score - a.score);

    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}