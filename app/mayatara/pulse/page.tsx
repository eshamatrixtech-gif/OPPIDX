"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PULSE_CATEGORIES } from "@/lib/mayatara/pulseStats";

interface Headline {
  title: string;
  url: string;
  category: string;
  source: string;
  source_type: "government" | "newspaper";
  fetched_at: string;
}

interface Datapoint {
  category: string;
  label: string;
  value: string;
  unit: string;
  as_of: string;
  source_name: string;
  source_url: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function HeadlineGroups({ headlines }: { headlines: Headline[] }) {
  const grouped = PULSE_CATEGORIES
    .map((c) => ({ ...c, items: headlines.filter((h) => h.category === c.category) }))
    .filter((c) => c.items.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {grouped.map((g) => (
        <div key={g.category}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg" style={{ color: "var(--saffron)" }}>{g.sym}</span>
            <h3 className="font-typewriter text-sm tracking-widest" style={{ color: "var(--ink)" }}>{g.category.toUpperCase()}</h3>
          </div>
          <div className="flex flex-col gap-2">
            {g.items.map((h) => (
              <a key={h.url} href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="card p-4 hover:opacity-90 transition-opacity flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm leading-relaxed block" style={{ color: "var(--ink)" }}>{h.title}</span>
                    <span className="text-xs" style={{ color: "var(--ink-muted)" }}>{h.source}</span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--ink-muted)" }}>{timeAgo(h.fetched_at)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PulsePage() {
  const [headlines, setHeadlines] = useState<Headline[] | null>(null);
  const [datapoints, setDatapoints] = useState<Datapoint[]>([]);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/mayatara/pulse/data")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoadError(data.error); return; }
        setHeadlines(data.headlines);
        setDatapoints(data.datapoints || []);
        setLastFetched(data.lastFetched);
      })
      .catch(() => setLoadError("Couldn't load today's feed."));
  }, []);

  const government = (headlines || []).filter((h) => h.source_type === "government");
  const newspapers = (headlines || []).filter((h) => h.source_type === "newspaper");

  return (
    <div className="mayatara-scope min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="border-b-2 z-10 relative" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-y-2">
          <Link href="/mayatara" className="font-typewriter text-xl tracking-wider" style={{ color: "var(--saffron)" }}>MAYATARA · THE PULSE</Link>
          <span className="text-xs tracking-widest font-typewriter" style={{ color: "var(--ink-muted)" }}>NO LEFT. NO RIGHT. JUST FORWARD.</span>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-14 relative z-10">

        <div className="text-center mb-12">
          <div className="text-3xl mb-3" style={{ color: "var(--saffron)" }}>◈</div>
          <h1 className="font-typewriter text-3xl md:text-4xl mb-3" style={{ color: "var(--ink)" }}>KNOW THE NUMBERS.</h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "var(--ink-muted)" }}>
            A daily, apolitical read on what the government is doing and what the papers are reporting
            on the economy and development — pulled straight from official and published sources. No opinions, no left vs. right.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--saffron)" }}>
            {lastFetched ? `Refreshed ${timeAgo(lastFetched)}` : "Refreshing..."}
          </p>
        </div>

        {loadError && (
          <div className="card p-8 text-center mb-10">
            <p className="text-sm" style={{ color: "var(--maroon)" }}>◆ {loadError}</p>
          </div>
        )}

        {headlines === null && !loadError && (
          <div className="font-typewriter text-center animate-pulse" style={{ color: "var(--saffron)" }}>◆ Loading...</div>
        )}

        {/* Verified figures — only shown once real sourced data exists */}
        {datapoints.length > 0 && (
          <>
            <div className="gem-divider mb-3 text-sm">◆ VERIFIED FIGURES ◆</div>
            <div className="flex flex-col gap-4 mb-14">
              {datapoints.map((d) => (
                <div key={`${d.category}-${d.label}`} className="card p-6">
                  <span className="text-xs font-typewriter px-2 py-0.5" style={{ background: "var(--bg-dark)", color: "var(--saffron)" }}>
                    {d.category.toUpperCase()}
                  </span>
                  <h3 className="font-typewriter text-base mt-2 mb-1" style={{ color: "var(--ink)" }}>{d.label}</h3>
                  <div className="font-typewriter text-2xl mb-1" style={{ color: "var(--saffron)" }}>{d.value} <span className="text-sm" style={{ color: "var(--ink-muted)" }}>{d.unit}</span></div>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    As of {d.as_of} · <a href={d.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--saffron)", textDecoration: "underline" }}>{d.source_name}</a>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* From the papers — the daily-read hook */}
        {newspapers.length > 0 && (
          <>
            <div className="gem-divider mb-3 text-sm">◆ FROM THE PAPERS ◆</div>
            <p className="text-xs text-center mb-8" style={{ color: "var(--ink-muted)" }}>
              Business & economy coverage from The Hindu, The Indian Express, and LiveMint
            </p>
            <div className="mb-14">
              <HeadlineGroups headlines={newspapers} />
            </div>
          </>
        )}

        {/* Government feed */}
        {government.length > 0 && (
          <>
            <div className="gem-divider mb-3 text-sm">◆ TODAY&apos;S POLICY FEED ◆</div>
            <p className="text-xs text-center mb-8" style={{ color: "var(--ink-muted)" }}>
              Source: Press Information Bureau, Government of India
            </p>
            <HeadlineGroups headlines={government} />
          </>
        )}

        {headlines && headlines.length === 0 && !loadError && (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              First refresh hasn&apos;t run yet. Check back shortly — this updates daily.
            </p>
          </div>
        )}

        <p className="text-xs text-center mt-10 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          Every headline above links to the original source. No summarising, no AI — a plain keyword
          filter sorts these into categories and screens out anything political, nothing more.
          <br />
          <Link href="/mayatara/terms" style={{ color: "var(--saffron)" }}>Terms & Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
