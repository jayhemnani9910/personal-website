import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { GOLDEN_BRIEFS, gradeSim, scoreChecks, type Check } from "./fde-eval";

// The live half of the eval. It calls a real endpoint, so it does not run unless
// asked: `npm run eval:fde`. Without FDE_EVAL_LIVE it skips, which is what
// happens in CI, and the skip is visible in the output rather than silent.
//
// It runs against production by default, because GEMINI_API_KEY only exists
// there. A local `next start` returns 503 from this route with no key, so
// pointing at localhost would measure the error path. Override with
// FDE_EVAL_ENDPOINT to run it somewhere else.
//
// Cost and manners: ten calls per run, paced under the route's own limit of 8
// per minute per IP. The route caches on a hash of the normalised brief for 30
// days, so a repeat run inside that window is served from cache and costs
// nothing. Each response records whether it was a cache hit, since a run that is
// entirely cached is not evidence about the current model.

const LIVE = !!process.env.FDE_EVAL_LIVE;
// Read-only by default, the way the visual baselines work. A plain run reports
// and gates; only an explicit update rewrites the committed fixtures, so a
// regression cannot be absorbed into the baseline just by running twice.
const UPDATE = !!process.env.FDE_EVAL_UPDATE;
const ENDPOINT = process.env.FDE_EVAL_ENDPOINT ?? "https://jayhemnani.in/api/fde-sim";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../tests/eval");

/** Under the route's 8/min, with room for the request itself. */
const PACE_MS = 9_000;
const RATE_LIMIT_BACKOFF_MS = 65_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RunResult {
  id: string;
  cached: boolean;
  status: number;
  checks: Check[];
}

async function callOnce(brief: string) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief }),
  });
  return {
    status: res.status,
    cached: res.headers.get("x-sim-cache") === "hit",
    body: res.status === 200 ? await res.json() : null,
  };
}

describe.skipIf(!LIVE)("fde-sim live eval", () => {
  it(
    "every golden brief comes back following the contract the prompt states",
    async () => {
      const results: RunResult[] = [];
      mkdirSync(join(OUT_DIR, "responses"), { recursive: true });

      // Load the accepted failures first. A rule the model already broke when the
      // baseline was recorded is a known issue, not a reason to block every run;
      // what this gates on is a failure that was not there before.
      const baselinePath = join(OUT_DIR, "baseline.json");
      const known = new Set<string>();
      if (existsSync(baselinePath)) {
        const prev = JSON.parse(readFileSync(baselinePath, "utf8"));
        for (const b of prev.briefs ?? []) {
          for (const f of b.failed ?? []) known.add(`${b.id}:${f.id}`);
        }
      }

      for (const [i, golden] of GOLDEN_BRIEFS.entries()) {
        if (i > 0) await sleep(PACE_MS);

        let call = await callOnce(golden.brief);
        if (call.status === 429) {
          console.log(`  ${golden.id}: rate limited, waiting`);
          await sleep(RATE_LIMIT_BACKOFF_MS);
          call = await callOnce(golden.brief);
        }

        const checks =
          call.status === 200
            ? gradeSim(call.body, golden)
            : [{ id: "http.ok", ok: false, detail: `endpoint returned ${call.status}` }];

        results.push({ id: golden.id, cached: call.cached, status: call.status, checks });

        if (call.body && UPDATE) {
          writeFileSync(
            join(OUT_DIR, "responses", `${golden.id}.json`),
            JSON.stringify(call.body, null, 2) + "\n",
          );
        }

        const s = scoreChecks(checks);
        const flag = call.cached ? " (cached)" : "";
        console.log(
          `  ${golden.id.padEnd(22)} ${s.passed}/${s.total}${flag}` +
            (s.failed.length ? `\n      ${s.failed.map((f) => `${f.id}: ${f.detail}`).join("\n      ")}` : ""),
        );
      }

      const totals = results.reduce(
        (acc, r) => {
          const s = scoreChecks(r.checks);
          acc.passed += s.passed;
          acc.total += s.total;
          return acc;
        },
        { passed: 0, total: 0 },
      );

      const current = new Set<string>();
      for (const r of results) {
        for (const c of r.checks) if (!c.ok) current.add(`${r.id}:${c.id}`);
      }
      const regressions = [...current].filter((k) => !known.has(k)).sort();
      const fixed = [...known].filter((k) => !current.has(k)).sort();

      if (UPDATE) writeFileSync(
        join(OUT_DIR, "baseline.json"),
        JSON.stringify(
          {
            endpoint: ENDPOINT,
            // Passed in rather than read from the clock, so a rerun that changes
            // nothing produces no diff.
            recordedAt: process.env.FDE_EVAL_DATE ?? "unset",
            model: "gemini-2.5-flash",
            totals,
            briefs: results.map((r) => ({
              id: r.id,
              cached: r.cached,
              ...scoreChecks(r.checks),
              failed: scoreChecks(r.checks).failed.map((f) => ({ id: f.id, detail: f.detail })),
            })),
          },
          null,
          2,
        ) + "\n",
      );

      console.log(`\n  total ${totals.passed}/${totals.total}`);
      if (known.size) console.log(`  known issues carried in the baseline: ${known.size}`);
      if (fixed.length) console.log(`  no longer failing: ${fixed.join(", ")}`);
      if (UPDATE) console.log("  baseline and responses rewritten");

      expect(
        regressions,
        "rules broken now that were not broken when the baseline was recorded",
      ).toEqual([]);
    },
    // Ten calls paced at 9s, plus room for one rate-limit backoff.
    20 * 60 * 1000,
  );
});
