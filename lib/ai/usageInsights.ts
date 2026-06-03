export interface UsageInsight {
  pattern: string;
  trigger: string;
  suggestion: string;
  impact: "positive" | "negative" | "neutral";
}

export interface DailyUsage {        // ADD THIS
  date: string;
  minutes: number;
  platform?: string;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getUsageLevel(minutes: number): { color: string; message: string } {
  if (minutes < 60) return { color: "#22c55e", message: "Healthy usage" };
  if (minutes < 120) return { color: "#eab308", message: "Moderate usage" };
  if (minutes < 180) return { color: "#f97316", message: "High usage" };
  return { color: "#ef4444", message: "Brain rot territory" };
}

// UPDATED: now accepts DailyUsage[] instead of two separate args
export async function generateInsights(usage: DailyUsage[]): Promise<UsageInsight[]> {
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      totalMinutes: usage.reduce((s, d) => s + d.minutes, 0),
      weeklyData:   usage.map(d => ({ day: d.date, minutes: d.minutes })),
    }),
  });
  const data = await res.json();
  return data.insights ?? [];
}