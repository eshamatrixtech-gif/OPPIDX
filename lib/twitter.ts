import { TwitterApi } from "twitter-api-v2";

let client: TwitterApi | null = null;

export function getTwitterClient() {
  if (client) return client;
  client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  return client;
}
