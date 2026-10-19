import { NextRequest } from "next/server";
import { getRedis } from "@/lib/kv";
import { clientKey } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { eventsKey, isEventName } from "@/lib/events";

// A year and a bit of daily tallies, then they go.
const KEEP_SECONDS = 60 * 60 * 24 * 400;

const done = () => new Response(null, { status: 204 });

export async function POST(request: NextRequest) {
  let name: unknown;
  try {
    name = (await request.json())?.name;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!isEventName(name)) return new Response(null, { status: 400 });

  const redis = getRedis();
  if (!redis) return done();

  // Thirty a minute is more clicking than a person does. Past that it is a
  // script, and a script does not get to move the numbers.
  if ((await rateLimit(redis, "events", clientKey(request.headers), { limit: 30, windowSeconds: 60 })) === "limited") {
    return new Response(null, { status: 429 });
  }

  const key = eventsKey();
  try {
    await redis.hincrby(key, name, 1);
    await redis.expire(key, KEEP_SECONDS);
  } catch (err) {
    console.error("[events] store unavailable:", err instanceof Error ? err.message : err);
  }
  return done();
}
