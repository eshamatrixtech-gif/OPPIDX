"use client";

import { BrainHealth } from "@/types";
import { getBrainEmoji, getBrainMessage, getBrainColor } from "@/lib/brain";

interface BrainMeterProps {
  health: BrainHealth;
  onHealClick: () => void;
}

export default function BrainMeter({ health, onHealClick }: BrainMeterProps) {
  const emoji = getBrainEmoji(health.state);
  const message = getBrainMessage(health.state);
  const color = getBrainColor(health.state);
  const needsHealing = health.score < 50;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/10" style={{ minWidth: "200px" }}>
        <div className="text-center mb-2">
          <span className={`text-5xl inline-block ${health.state === "cooked" ? "animate-pulse" : ""}`}>
            {emoji}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${health.score}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
        </div>

        <p className="text-white text-sm text-center mb-1 font-medium">{health.score}% Brain Power</p>
        <p className="text-gray-400 text-xs text-center mb-3">{message}</p>
        <p className="text-gray-500 text-xs text-center mb-3">📱 {Math.floor(health.scrollTime / 60)}m scrolled today</p>

        {needsHealing && (
          <button
            onClick={onHealClick}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/30 animate-pulse"
          >
            📸 Heal Your Brain
          </button>
        )}
      </div>
    </div>
  );
}