"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "OppIDX", href: "/", match: (p: string) => p === "/" || (!p.startsWith("/mayatara") && p !== "/") },
  { label: "Mayatara", href: "/mayatara", match: (p: string) => p === "/mayatara" },
  { label: "Events", href: "/mayatara/events", match: (p: string) => p.startsWith("/mayatara/events") },
  { label: "Pulse", href: "/mayatara/pulse", match: (p: string) => p.startsWith("/mayatara/pulse") },
];

/**
 * Persistent, site-wide cross-promo bar — the one place both products (the
 * opportunity board and Mayatara/Events/Pulse) are always reachable from,
 * regardless of which one a visitor landed on. Lives in the root layout so
 * it renders above every page without needing to touch each one.
 *
 * Deliberately subordinate to each page's own primary nav/CTAs (small,
 * slim, muted until active) — the goal is discoverability, not competing
 * for attention with oppidx's own subscription CTA or Mayatara's own hero.
 */
export function CrossPromoNav() {
  const pathname = usePathname() || "/";

  // /embed/* is rendered inside third-party iframes (see app/embed/opportunity-of-the-day) —
  // it must never show site nav, that's someone else's page framing it.
  if (pathname.startsWith("/embed/")) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        padding: "8px 12px",
        background: "#F4EEDD",
        borderBottom: "1px solid #D9CBA8",
        flexWrap: "wrap",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              fontFamily: "monospace",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "5px 14px",
              borderRadius: 999,
              border: active ? "1.5px solid #8B4513" : "1px solid #D9CBA8",
              background: active ? "#8B4513" : "transparent",
              color: active ? "#FAF0D7" : "#6B5B3E",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
