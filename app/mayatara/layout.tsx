import type { Metadata } from "next";
import "./mayatara.css";

// openGraph/twitter set explicitly (not left to auto-derive from
// title/description) because the root layout (app/layout.tsx) already
// defines its own static openGraph/twitter objects — once an ancestor does
// that, Next stops inferring them for descendants, so every /mayatara/*
// page without its own generateMetadata() would otherwise silently share
// OppIDX's "the opportunity board" branding instead of Mayatara's own.
export const metadata: Metadata = {
  title: "The Mayatara — Find Your Person",
  description: "Find your person. One AI match, every Friday.",
  openGraph: {
    title: "The Mayatara — Find Your Person",
    description: "Find your person. One AI match, every Friday.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mayatara — Find Your Person",
    description: "Find your person. One AI match, every Friday.",
  },
  icons: {
    icon: [{ url: "/mayatara-logo.png", type: "image/png" }],
    apple: "/mayatara-logo.png",
    shortcut: "/mayatara-logo.png",
  },
};

export default function MayataraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
