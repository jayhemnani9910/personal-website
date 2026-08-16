import { Redis } from "@upstash/redis";

// Vercel KV was retired and its stores were migrated to Upstash Redis. The
// Vercel integration may expose either UPSTASH_REDIS_REST_* or the legacy
// KV_REST_API_* env vars, so accept both. Returns null when no store is
// configured (local dev), letting callers fall back gracefully.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!url || !token) return null;
  if (!client) client = new Redis({ url, token });
  return client;
}
