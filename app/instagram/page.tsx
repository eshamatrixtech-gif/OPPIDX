"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InstagramConnect() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError]       = useState("");
  const router = useRouter();

  const connect = async () => {
    setStatus("loading");
    setError("");
    try {
      const res  = await fetch("/api/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setStatus("error"); return; }
      setStatus("done");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("Connection failed"); setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 24 }}>📸</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f5f5f7", marginBottom: 8, letterSpacing: "-0.02em" }}>Connect Instagram</h1>
        <p style={{ fontSize: 14, color: "rgba(245,245,247,0.45)", marginBottom: 32, lineHeight: 1.5 }}>Your credentials stay on your device and are never stored.</p>

        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          autoCapitalize="none"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f7", fontSize: 15, outline: "none", marginBottom: 10, boxSizing: "border-box" }}
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f5f7", fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
        />

        {error && <p style={{ fontSize: 13, color: "#ff453a", marginBottom: 16 }}>{error}</p>}

        <button
          onClick={connect}
          disabled={!username || !password || status === "loading"}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: status === "done" ? "#30d158" : "linear-gradient(135deg, #f09433, #dc2743, #bc1888)", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", opacity: (!username || !password) ? 0.5 : 1 }}>
          {status === "loading" ? "Connecting…" : status === "done" ? "Connected ✓" : "Connect Instagram"}
        </button>

        <p style={{ fontSize: 12, color: "rgba(245,245,247,0.25)", marginTop: 20, textAlign: "center", lineHeight: 1.6 }}>
          This uses Instagram's private API. Use at your own risk — Meta may flag automated logins.
        </p>
      </div>
    </div>
  );
}