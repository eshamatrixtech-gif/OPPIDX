import { BrainState, BrainHealth } from "@/types";

const DECAY_RATE = 1;
const HEAL_AMOUNT = 30;

export function getBrainState(score: number): BrainState {
  if (score >= 75) return "fresh";
  if (score >= 50) return "tired";
  if (score >= 25) return "fried";
  return "cooked";
}

export function getBrainEmoji(state: BrainState): string {
  switch (state) {
    case "fresh":  return "🧠";
    case "tired":  return "🧠💫";
    case "fried":  return "🧠🔥";
    case "cooked": return "💀";
    default:       return "🧠";
  }
}

export function getBrainMessage(state: BrainState): string {
  switch (state) {
    case "fresh":  return "Your brain is thriving!";
    case "tired":  return "Take a break soon...";
    case "fried":  return "Your brain needs real life!";
    case "cooked": return "Touch grass NOW! Share a real moment.";
    default:       return "";
  }
}

export function getBrainColor(state: BrainState): string {
  switch (state) {
    case "fresh":  return "#22c55e";
    case "tired":  return "#eab308";
    case "fried":  return "#f97316";
    case "cooked": return "#ef4444";
    default:       return "#22c55e";
  }
}

export function createInitialBrainHealth(): BrainHealth {
  return {
    state: "fresh",
    score: 100,
    lastDecay: Date.now(),
    lastHeal: Date.now(),
    scrollTime: 0,
  };
}

export function decayBrain(health: BrainHealth, scrollSeconds: number): BrainHealth {
  const decayPoints = Math.floor(scrollSeconds / 30) * DECAY_RATE;
  const newScore = Math.max(0, health.score - decayPoints);
  return {
    ...health,
    score: newScore,
    state: getBrainState(newScore),
    lastDecay: Date.now(),
    scrollTime: health.scrollTime + scrollSeconds,
  };
}

export function healBrain(health: BrainHealth): BrainHealth {
  const newScore = Math.min(100, health.score + HEAL_AMOUNT);
  return {
    ...health,
    score: newScore,
    state: getBrainState(newScore),
    lastHeal: Date.now(),
  };
}