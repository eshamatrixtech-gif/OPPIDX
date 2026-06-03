import { NextRequest, NextResponse } from "next/server";
import { analyzeContent, getFeedHealthScore } from "@/lib/ai/feedAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const { posts } = await req.json();

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json({ error: "posts array required" }, { status: 400 });
    }

    // Analyze all posts in parallel (your feedAnalyzer already batches by 5)
    const analyses = await Promise.all(
      posts.map((post: { text?: string; platform: string; type: "post" | "video" | "story" | "reel" }) =>
        analyzeContent({
          text: post.text,
          platform: post.platform,
          type: post.type,
        })
      )
    );

    const feedHealth = getFeedHealthScore(analyses);

    return NextResponse.json({ analyses, feedHealth });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}