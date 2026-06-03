export interface CognitiveScoreInput {
  // Feed quality
  feedPosts: Array<{ score: number; platform: string }>;
  
  // Time & behavior
  scrollMinutes: number;
  sessionCount: number;        // how many times app opened today
  nighttimeUsage: boolean;     // using after 11pm
  
  // Content mix
  shortFormCount: number;      // reels, shorts, tiktoks
  longFormCount: number;       // articles, long videos
  
  // Social health
  dmsSent: number;             // active conversations
  passiveScrollTime: number;   // time spent just scrolling vs messaging
}

export interface CognitiveScoreBreakdown {
  total: number;
  label: string;
  color: string;
  trend: "improving" | "declining" | "stable";
  
  categories: {
    attention:       { score: number; label: string };
    dopamineLoad:    { score: number; label: string };
    contentQuality:  { score: number; label: string };
    socialHealth:    { score: number; label: string };
    recovery:        { score: number; label: string };
  };

  insight: string; // human-readable explanation
}

export function calculateCognitiveScore(input: CognitiveScoreInput): CognitiveScoreBreakdown {
  // 1. Attention Stability (25%)
  // Penalize frequent session opens, reward long uninterrupted sessions
  const avgSessionLength = input.scrollMinutes / Math.max(input.sessionCount, 1);
  const attentionScore = Math.min(100, Math.max(0,
    100
    - (input.sessionCount * 3)        // each re-open costs 3 points
    + (avgSessionLength > 10 ? 10 : 0) // bonus for long sessions
  ));

  // 2. Dopamine Load (20%)
  // Short-form content is high dopamine, penalize ratio
  const totalContent = input.shortFormCount + input.longFormCount;
  const shortFormRatio = totalContent > 0 ? input.shortFormCount / totalContent : 0;
  const dopamineScore = Math.max(0, Math.round(100 - (shortFormRatio * 80)));

  // 3. Content Quality (20%)
  // Average AI score of feed posts
  const contentScore = input.feedPosts.length > 0
    ? Math.round(input.feedPosts.reduce((s, p) => s + p.score, 0) / input.feedPosts.length)
    : 80;

  // 4. Social Health (15%)
  // Active conversations vs passive scrolling
  const totalTime = input.scrollMinutes || 1;
  const activeRatio = input.dmsSent / Math.max(totalTime, 1);
  const socialScore = Math.min(100, Math.round(
    50
    + (input.dmsSent * 5)               // reward real conversations
    - (input.passiveScrollTime / totalTime * 30) // penalize passive scrolling
  ));

  // 5. Recovery (20%)
  // Penalize nighttime usage and long total sessions
  const recoveryScore = Math.max(0, Math.round(
    100
    - (input.nighttimeUsage ? 30 : 0)
    - (input.scrollMinutes > 120 ? 20 : 0)
    - (input.scrollMinutes > 60  ? 10 : 0)
  ));

  // Weighted total
  const total = Math.round(
    attentionScore  * 0.25 +
    dopamineScore   * 0.20 +
    contentScore    * 0.20 +
    socialScore     * 0.15 +
    recoveryScore   * 0.20
  );

  // Label & color
  let label: string;
  let color: string;
  if (total >= 80)      { label = "Thriving";   color = "#2A7A4A"; }
  else if (total >= 65) { label = "Balanced";   color = "#5B8A3C"; }
  else if (total >= 50) { label = "Fatigued";   color = "#C8960A"; }
  else if (total >= 35) { label = "Strained";   color = "#D4502A"; }
  else                  { label = "Depleted";   color = "#C0392B"; }

  // Smart insight
  const weakest = [
    { name: "attention",      score: attentionScore,  msg: "frequent app switching is fragmenting your focus" },
    { name: "dopamine",       score: dopamineScore,   msg: "high short-form content is overstimulating your brain" },
    { name: "content",        score: contentScore,    msg: "your feed is heavy on low-quality content" },
    { name: "social",         score: socialScore,     msg: "you're mostly consuming passively instead of connecting" },
    { name: "recovery",       score: recoveryScore,   msg: "late-night or excessive usage is affecting your recovery" },
  ].sort((a, b) => a.score - b.score)[0];

  const insight = total >= 75
    ? "Your cognitive health looks strong. Keep it up."
    : `Your score dropped mainly because ${weakest.msg}.`;

  return {
    total,
    label,
    color,
    trend: "stable",
    categories: {
      attention:      { score: attentionScore,  label: "Attention Stability" },
      dopamineLoad:   { score: dopamineScore,   label: "Dopamine Load" },
      contentQuality: { score: contentScore,    label: "Content Quality" },
      socialHealth:   { score: socialScore,     label: "Social Health" },
      recovery:       { score: recoveryScore,   label: "Recovery" },
    },
    insight,
  };
}