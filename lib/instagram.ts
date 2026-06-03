import { IgApiClient } from "instagram-private-api";

const ig = new IgApiClient();
let loggedIn = false;

export async function loginInstagram(username: string, password: string) {
  ig.state.generateDevice(username);
  await ig.simulate.preLoginFlow();
  await ig.account.login(username, password);
  await ig.simulate.postLoginFlow();
  loggedIn = true;
  return ig;
}

export function getClient() { return { ig, loggedIn }; }