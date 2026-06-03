 "use client";

import { useState, useEffect, useCallback } from "react";
import { BrainHealth } from "@/types";
import { createInitialBrainHealth, decayBrain, healBrain } from "@/lib/brain";

const STORAGE_KEY = "brain_health";

export function useBrainHealth() {
  const [health, setHealth] = useState<BrainHealth>(createInitialBrainHealth);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastDate = new Date(parsed.lastDecay).toDateString();
        const today = new Date().toDateString();
        if (lastDate !== today) {
          parsed.scrollTime = 0;
        }
        setHealth(parsed);
      } catch (e) {
        console.error("Failed to parse brain health", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(health));
  }, [health]);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 2000);
    };

    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchmove", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    return () => {
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const heal = useCallback(() => {
    setHealth(prev => healBrain(prev));
  }, []);

  const reset = useCallback(() => {
    setHealth(createInitialBrainHealth());
  }, []);

  const simulateScroll = useCallback((seconds: number) => {
    setHealth(prev => decayBrain(prev, seconds));
  }, []);

  return { health, heal, reset, simulateScroll, isScrolling };
}