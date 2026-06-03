import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentAnalysis {
  score: number; // 0-100 (0 = brain rot, 100 = valuable)
  category: "brainrot" | "neutral" | "valuable";
  reason: string;
  suggestion?: string;
}

export async function analyzeContent(content: {
  text?: string;
  platform: string;
  type: "post" | "video" | "story" | "reel";
}): Promise<ContentAnalysis> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a digital wellness AI. Analyze social media content and rate how it affects mental health.

Score 0-100:
- 0-30: Brain rot (addictive, no value, rage bait, mindless)
- 31-70: Neutral (entertainment, but not harmful)
- 71-100: Valuable (educational, inspiring, meaningful connection)

Be honest and protective of the user's attention.`
      },
      {
        role: "user",
        content: `Platform: ${content.platform}
Type: ${content.type}
Content: ${content.text || "[Image/Video content]"}

Analyze this content. Return JSON only:
{
  "score": <number>,
  "category": "<brainrot|neutral|valuable>",
  "reason": "<one sentence>",
  "suggestion": "<optional: what user should do>"
}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(res.choices[0].message.content || "{}");
  return result as ContentAnalysis;
}

export async function analyzeFeed(posts: Array<{
  id: string;
  text?: string;
  platform: string;
  type: "post" | "video" | "story" | "reel";
}>): Promise<Map<string, ContentAnalysis>> {
  const results = new Map<string, ContentAnalysis>();
  
  // Analyze in parallel, max 5 at a time
  const batchSize = 5;
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const analyses = await Promise.all(
      batch.map(post => analyzeContent(post))
    );
    batch.forEach((post, idx) => {
      results.set(post.id, analyses[idx]);
    });
  }
  
  return results;
}

export function getFeedHealthScore(analyses: ContentAnalysis[]): {
  overall: number;
  brainRotCount: number;
  valuableCount: number;
  recommendation: string;
} {
  if (analyses.length === 0) {
    return {
      overall: 100,
      brainRotCount: 0,
      valuableCount: 0,
      recommendation: "Start scrolling to see your feed health!"
    };
  }

  const overall = Math.round(
    analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
  );
  const brainRotCount = analyses.filter(a => a.category === "brainrot").length;
  const valuableCount = analyses.filter(a => a.category === "valuable").length;

  let recommendation: string;
  if (overall < 30) {
    recommendation = "🚨 Your feed is toxic. Time for a real-world break!";
  } else if (overall < 50) {
    recommendation = "⚠️ Mostly junk. Try following better accounts.";
  } else if (overall < 70) {
    recommendation = "😐 Decent mix. Could be better though.";
  } else {
    recommendation = "✨ Great feed! You're protecting your brain.";
  }

  return { overall, brainRotCount, valuableCount, recommendation };
}