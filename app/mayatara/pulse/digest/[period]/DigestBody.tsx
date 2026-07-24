"use client";

import { useState } from "react";
import { PULSE_CATEGORIES } from "@/lib/mayatara/pulseStats";
import type { DigestItem } from "@/lib/policyDigest/generate";

export function DigestBody({ items }: { items: DigestItem[] }) {
  const [active, setActive] = useState<string[]>([]);

  function toggle(category: string) {
    setActive((list) => (list.includes(category) ? list.filter((c) => c !== category) : [...list, category]));
  }

  const filtered = active.length ? items.filter((i) => active.includes(i.category)) : items;
  const grouped = PULSE_CATEGORIES
    .map((c) => ({ ...c, items: filtered.filter((i) => i.category === c.category) }))
    .filter((c) => c.items.length > 0);

  const presentCategories = new Set(items.map((i) => i.category));

  return (
    <div>
      {presentCategories.size > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PULSE_CATEGORIES.filter((c) => presentCategories.has(c.category)).map((c) => {
            const isActive = active.includes(c.category);
            return (
              <button
                key={c.category}
                onClick={() => toggle(c.category)}
                className="font-typewriter text-xs tracking-wide px-3 py-1.5"
                style={{
                  border: `1px solid ${isActive ? "var(--saffron)" : "var(--border)"}`,
                  background: isActive ? "var(--saffron)" : "var(--card)",
                  color: isActive ? "var(--bg)" : "var(--ink-muted)",
                  cursor: "pointer",
                }}
              >
                {c.sym} {c.category}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Nothing in the selected categories.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((g) => (
            <div key={g.category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg" style={{ color: "var(--saffron)" }}>{g.sym}</span>
                <h3 className="font-typewriter text-sm tracking-widest" style={{ color: "var(--ink)" }}>{g.category.toUpperCase()}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {g.items.map((item) => (
                  <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div className="card p-4 hover:opacity-90 transition-opacity flex items-start justify-between gap-3">
                      <span className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{item.title}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--ink-muted)" }}>{item.source}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
