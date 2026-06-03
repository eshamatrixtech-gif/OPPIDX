"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscordConnect() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const connect = async () => {
    setStatus("loading");
    setError("");
    try {
      const res  = await fetch("/api/discord/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setStatus("error"); return; }
      setStatus("done");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("Connection failed");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 24 }}>🎮</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f5f5f7", marginBottom: 8, letterSpacing: "-0.02em" }}>Connect Discord</h1>
        <p style={{ fontSize: 14, color: "rgba(245,245,247,0.45)", marginBottom: 32, lineHeight: 1.5 }}>Paste your Discord user token below.</p>

        <input
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Discord user token"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f7", fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
        />

        {error && <p style={{ fontSize: 13, color: "#ff453a", marginBottom: 16 }}>{error}</p>}

        <button
          onClick={connect}
          disabled={!token || status === "loading"}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: status === "done" ? "#30d158" : "#5865f2", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", opacity: !token ? 0.5 : 1 }}>
          {status === "loading" ? "Connecting…" : status === "done" ? "Connected ✓" : "Connect Discord"}
        </button>

        <p style={{ fontSize: 12, color: "rgba(245,245,247,0.25)", marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
          To get your token: Discord → DevTools → Network → find a request → copy the Authorization header value.
        </p>
      </div>
    </div>
  );
}