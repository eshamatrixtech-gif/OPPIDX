import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { totalMinutes, weeklyData } = await req.json();

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a digital wellness coach. Return JSON only — an array called "insights".`,
      },
      {
        role: "user",
        content: `Screen time today: ${totalMinutes} minutes.
Weekly: ${weeklyData.map((d: { day: string; minutes: number }) => `${d.day}: ${d.minutes}m`).join(", ")}

Return this exact shape:
{
  "insights": [
    {
      "pattern": "one sentence describing what you notice",
      "trigger": "what likely caused this",
      "suggestion": "one concrete action to take",
      "impact": "negative" | "positive" | "neutral"
    }
  ]
}
Give 3 insights max.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(res.choices[0].message.content || "{}");
  return NextResponse.json(result);
}
