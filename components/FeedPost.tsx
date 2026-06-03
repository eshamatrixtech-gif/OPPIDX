"use client";

import { ContentAnalysis } from "@/lib/ai/feedAnalyzer";

interface FeedPostProps {
  id: string;
  username: string;
  platform: string;
  content: string;
  timestamp: string;
  analysis?: ContentAnalysis;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
}

export default function FeedPost({
  username,
  platform,
  content,
  timestamp,
  analysis,
  onAnalyze,
  isAnalyzing,
}: FeedPostProps) {
  const getBadgeStyle = (category?: string) => {
    switch (category) {
      case "brainrot":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "valuable":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return "📸";
      case "twitter": return "🐦";
      case "youtube": return "▶️";
      case "tiktok": return "🎵";
      default: return "📱";
    }
  };

  return (
    <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10 relative">
      {/* AI Analysis Badge */}
      {analysis && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg border text-xs font-medium ${getBadgeStyle(analysis.category)}`}>
          {analysis.category === "brainrot" && "🧠💀 Brain Rot"}
          {analysis.category === "neutral" && "😐 Neutral"}
          {analysis.category === "valuable" && "✨ Valuable"}
          <span className="ml-1 opacity-70">{analysis.score}/100</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
          {getPlatformIcon(platform)}
        </div>
        <div>
          <p className="font-semibold">{username}</p>
          <p className="text-gray-500 text-xs">{platform} • {timestamp}</p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 flex items-center justify-center">
        <span className="text-gray-600 text-sm">Content Preview</span>
      </div>
      <p className="text-gray-300 mb-3">{content}</p>

      {/* AI Analysis Details */}
      {analysis && (
        <div className="mt-3 p-3 bg-black/30 rounded-xl text-sm">
          <p className="text-gray-400">
            <span className="text-white font-medium">AI Analysis:</span> {analysis.reason}
          </p>
          {analysis.suggestion && (
            <p className="text-blue-400 mt-1">💡 {analysis.suggestion}</p>
          )}
        </div>
      )}

      {/* Analyze Button */}
      {!analysis && onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="mt-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? "🔍 Analyzing..." : "🤖 Analyze with AI"}
        </button>
      )}
    </div>
  );
}