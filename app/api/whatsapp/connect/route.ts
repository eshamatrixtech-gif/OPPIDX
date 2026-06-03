import { NextResponse } from "next/server";
import { connectWhatsApp, getQRCode, getStatus } from "@/lib/whatsapp";

let connecting = false;

export async function GET() {
  const status = getStatus();
  
  if (status === 'connected') {
    return NextResponse.json({ status: 'connected' });
  }

  if (!connecting) {
    connecting = true;
    connectWhatsApp().finally(() => { connecting = false; });
  }

  // Wait a moment for QR to generate
  await new Promise(r => setTimeout(r, 2000));
  
  const qr = getQRCode();
  return NextResponse.json({ status: 'connecting', qr });
}