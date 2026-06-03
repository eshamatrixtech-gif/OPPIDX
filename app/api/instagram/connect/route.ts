import { NextRequest, NextResponse } from "next/server";
import { loginInstagram } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 });
  }
  try {
    await loginInstagram(username, password);
    return NextResponse.json({ status: "connected" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Login failed" }, { status: 500 });
  }
}