"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventListItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string;
  event_time: string;
  host_name: string;
  rsvpCount: number;
  capacity: number | null;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/mayatara/events/list")
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setEvents(data.events); })
      .catch(() => setError("Couldn't load events."));
  }, []);

  return (
    <div className="mayatara-scope min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="border-b-2 z-10 relative" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-y-2">
          <Link href="/mayatara" className="font-typewriter text-xl tracking-wider" style={{ color: "var(--saffron)" }}>MAYATARA · EVENTS</Link>
          <Link href="/mayatara/events/new" className="btn-primary text-sm">◆ Host an Event</Link>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 relative z-10">
        <div className="text-center mb-10">
          <div className="text-3xl mb-3" style={{ color: "var(--saffron)" }}>❋</div>
          <h1 className="font-typewriter text-3xl mb-2" style={{ color: "var(--ink)" }}>SHOW UP SOMEWHERE.</h1>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            Real gatherings, hosted by real people. RSVP, get your QR, walk in.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm font-typewriter mb-6" style={{ background: "#FFF0F0", border: "2px solid var(--maroon)", color: "var(--maroon)" }}>
            ◆ {error}
          </div>
        )}

        {events === null && !error && (
          <div className="font-typewriter text-center animate-pulse" style={{ color: "var(--saffron)" }}>◆ Loading...</div>
        )}

        {events && events.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm mb-5" style={{ color: "var(--ink-muted)" }}>Nothing on the calendar yet. Be the first to host.</p>
            <Link href="/mayatara/events/new" className="btn-primary">◆ &nbsp; Host an Event</Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {events?.map(e => (
            <Link key={e.slug} href={`/mayatara/events/${e.slug}`} style={{ textDecoration: "none" }}>
              <div className="card p-5 hover:opacity-90 transition-opacity" style={{ borderColor: "var(--border)", boxShadow: "4px 4px 0 var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-typewriter px-2 py-0.5" style={{ background: "var(--bg-dark)", color: "var(--saffron)" }}>
                    {e.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-typewriter" style={{ color: "var(--ink-muted)" }}>
                    {e.rsvpCount}{e.capacity ? ` / ${e.capacity}` : ""} going
                  </span>
                </div>
                <h3 className="font-typewriter text-lg mb-1" style={{ color: "var(--ink)" }}>{e.title}</h3>
                <p className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
                  {formatWhen(e.event_time)} · {e.location} · hosted by {e.host_name}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {e.description.length > 140 ? e.description.slice(0, 140) + "…" : e.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
