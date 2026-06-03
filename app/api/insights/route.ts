import { NextRequest, NextResponse } from "next/server";
import { generateInsights, DailyUsage } from "@/lib/ai/usageInsights";

export async function POST(req: NextRequest) {
  try {
    const { usage } = await req.json();

    if (!usage || !Array.isArray(usage)) {
      return NextResponse.json(
        { error: "Usage data array required" },
        { status: 400 }
      );
    }

    const insights = await generateInsights(usage as DailyUsage[]);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}