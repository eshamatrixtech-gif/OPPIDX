import { NextRequest, NextResponse } from "next/server";
import { connectDiscord } from "@/lib/discord";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  try {
    await connectDiscord(token);
    return NextResponse.json({ status: "connected" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Login failed" }, { status: 500 });
  }
}
