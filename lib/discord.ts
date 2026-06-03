import { Client, GatewayIntentBits } from "discord.js";

let client: Client | null = null;
let loggedIn = false;

export async function connectDiscord(token: string) {
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(token);
  loggedIn = true;
  return client;
}

export function getClient() { return { client, loggedIn }; }