import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const client = createClient({ url: REDIS_URL });

client.on("error", (err) => console.error("Redis Client Error", err));

let connected = false;
export async function connectRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

// helpers
export async function pushMessage(sessionId, message) {
  await connectRedis();
  const key = `session:${sessionId}:history`;
  await client.rPush(key, JSON.stringify(message));
  // set TTL 24 hours
  await client.expire(key, 60 * 60 * 24);
}
export async function getHistory(sessionId) {
  await connectRedis();
  const key = `session:${sessionId}:history`;
  const arr = await client.lRange(key, 0, -1);
  return arr.map((s) => JSON.parse(s));
}
export async function resetSession(sessionId) {
  await connectRedis();
  const key = `session:${sessionId}:history`;
  await client.del(key);
}
