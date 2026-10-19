#!/usr/bin/env node
// Prints what the live site has been keeping in Redis: click tallies
// (src/lib/events.ts), CSP violation reports and browser crashes
// (src/lib/ops-log.ts).
// Needs the production store's credentials. Pull them once with
//   npx vercel env pull .env.production.local --environment=production
// then run: npm run ops            (last 30 days)
//           npm run ops -- 90      (last 90 days)

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
if (!url || !token) {
    console.error("No Redis credentials. Run: npx vercel env pull .env.production.local --environment=production");
    process.exit(1);
}
const redis = new Redis({ url, token });
const days = Number(process.argv[2]) || 30;

// Same key shape as eventsKey() in src/lib/events.ts.
const keys = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - i * 86_400_000);
    return `events:${d.toISOString().slice(0, 10)}`;
});
const tallies = await Promise.all(keys.map((k) => redis.hgetall(k)));
const totals = {};
for (const day of tallies) {
    for (const [name, n] of Object.entries(day ?? {})) totals[name] = (totals[name] ?? 0) + Number(n);
}

console.log(`\nClicks, last ${days} days`);
const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
if (!rows.length) console.log("  none yet");
for (const [name, n] of rows) console.log(`  ${String(n).padStart(6)}  ${name}`);

const csp = await redis.lrange("ops:csp", 0, -1);
console.log(`\nCSP reports kept: ${csp.length}`);
const byRule = {};
for (const v of csp) {
    const k = `${v.directive} blocked ${v.blocked || "(inline)"}`;
    byRule[k] = byRule[k] ?? { n: 0, page: v.page, last: v.at };
    byRule[k].n++;
}
for (const [rule, { n, page, last }] of Object.entries(byRule).sort((a, b) => b[1].n - a[1].n)) {
    console.log(`  ${String(n).padStart(6)}  ${rule}  (e.g. ${page}, last ${new Date(last).toISOString().slice(0, 16)})`);
}
if (csp.length) {
    const oldest = new Date(csp.at(-1).at).toISOString().slice(0, 10);
    console.log(`  since ${oldest}`);
}

const errors = await redis.lrange("ops:errors", 0, 19);
console.log(`\nBrowser crashes, newest ${errors.length}`);
if (!errors.length) console.log("  none");
for (const e of errors) {
    console.log(`  ${new Date(e.at).toISOString().slice(0, 16)}  ${e.page}  ${e.message || "(no message)"}${e.digest ? `  digest ${e.digest}` : ""}`);
}
console.log();
