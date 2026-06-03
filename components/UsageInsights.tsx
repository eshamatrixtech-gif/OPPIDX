"use client";

import { useState } from "react";
import { UsageInsight, formatTime, getUsageLevel } from "@/lib/ai/usageInsights";

interface UsageInsightsProps {
  totalMinutesToday: number;
  weeklyData: Array<{ day: string; minutes: number }>;
  insights: UsageInsight[];
  onGenerateInsights: () => void;
  isLoading: boolean;
}

export default function UsageInsights({
  totalMinutesToday,
  weeklyData,
  insights,
  onGenerateInsights,
  isLoading,
}: UsageInsightsProps) {
  const [expanded, setExpanded] = useState(false);
  const usageLevel = getUsageLevel(totalMinutesToday);
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <h3 className="font-semibold">Today's Screen Time</h3>
            <p className="text-sm" style={{ color: usageLevel.color }}>
              {formatTime(totalMinutesToday)} • {usageLevel.message}
            </p>
          </div>
        </div>
        <span className={`transform transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Weekly Bar Chart */}
          <div>
            <h4 className="text-sm text-gray-400 mb-2">This Week</h4>
            <div className="flex items-end gap-2 h-24">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gray-700 rounded-t relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${(day.minutes / maxMinutes) * 100}%`,
                        backgroundColor: getUsageLevel(day.minutes).color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-400">AI Insights</h4>
              <button
                onClick={onGenerateInsights}
                disabled={isLoading}
                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 disabled:opacity-50"
              >
                {isLoading ? "Analyzing..." : "🤖 Generate"}
              </button>
            </div>

            {insights.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Click generate to get AI-powered insights about your usage patterns.
              </p>
            ) : (
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${
                      insight.impact === "negative"
                        ? "bg-red-500/10 border border-red-500/20"
                        : insight.impact === "positive"
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-gray-500/10 border border-gray-500/20"
                    }`}
                  >
                    <p className="font-medium mb-1">
                      {insight.impact === "negative" ? "⚠️" : insight.impact === "positive" ? "✅" : "💡"}{" "}
                      {insight.pattern}
                    </p>
                    <p className="text-gray-400 text-xs mb-2">
                      Trigger: {insight.trigger}
                    </p>
                    <p className="text-blue-400 text-xs">
                      💡 {insight.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}