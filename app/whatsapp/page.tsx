"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppConnect() {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/whatsapp/connect");
      const data = await res.json();
      if (data.status === "connected") {
        setStatus("Connected!");
        setTimeout(() => router.push("/"), 1500);
        return;
      }
      if (data.qr) {
        setQr(data.qr);
        setStatus("Scan with WhatsApp");
      } else {
        setStatus("Generating QR code...");
        setTimeout(check, 2000);
      }
    };
    check();
    const interval = setInterval(async () => {
      const res = await fetch("/api/whatsapp/connect");
      const data = await res.json();
      if (data.status === "connected") {
        setStatus("Connected! ✓");
        clearInterval(interval);
        setTimeout(() => router.push("/"), 1500);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f5f5f7", marginBottom: 8 }}>Connect WhatsApp</h1>
      <p style={{ color: "rgba(245,245,247,0.5)", marginBottom: 40, fontSize: 15 }}>{status}</p>
      {qr ? (
        <div style={{ padding: 20, background: "white", borderRadius: 20, boxShadow: "0 0 60px rgba(37,211,102,0.3)" }}>
          <img src={qr} width={240} height={240} alt="WhatsApp QR Code" />
        </div>
      ) : (
        <div style={{ width: 240, height: 240, borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          Loading...
        </div>
      )}
      <p style={{ color: "rgba(245,245,247,0.3)", marginTop: 32, fontSize: 13, textAlign: "center", maxWidth: 280 }}>
        Open WhatsApp → Settings → Linked Devices → Link a Device
      </p>
    </div>
  );
}
