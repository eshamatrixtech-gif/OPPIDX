export type BrainState = 'fresh' | 'tired' | 'fried' | 'cooked';

export interface BrainHealth {
  state: BrainState;
  score: number;
  lastDecay: number;
  lastHeal: number;
  scrollTime: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  brainHealth: BrainHealth;
  friends: string[];
}

export interface RealPost {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: number;
  healPoints: number;
}

export interface FeedItem {
  id: string;
  platform: 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'real';
  content: any;
  timestamp: number;
}
