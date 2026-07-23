import type { Metadata } from "next";
import "./mayatara.css";

export const metadata: Metadata = {
  title: "The Mayatara — Find Your Person",
  description: "Find your person. One AI match, every Friday.",
  icons: {
    icon: [{ url: "/mayatara-logo.png", type: "image/png" }],
    apple: "/mayatara-logo.png",
    shortcut: "/mayatara-logo.png",
  },
};

export default function MayataraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
