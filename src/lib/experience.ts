import type { TimelineRange } from "@/data/types";

const months = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

/**
 * Whole years of professional experience, as the union of the role spans in the
 * log. Union, not sum: two roles that overlap in time are one stretch of
 * experience, not two. Floored, so the number is never larger than the log
 * supports. A range with no `end` is treated as still running.
 */
export function yearsOfExperience(ranges: TimelineRange[], now = new Date()): number {
  const nowM = now.getFullYear() * 12 + now.getMonth();
  const spans = ranges
    // `start` is optional on TimelineRange. Without this guard `months(undefined)`
    // is NaN, every comparison against it is false, and the total silently
    // becomes NaN rather than throwing.
    .filter((r): r is TimelineRange & { start: string } => typeof r.start === "string")
    .map((r) => [months(r.start), r.end ? months(r.end) : nowM] as const)
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let cursor = -Infinity;
  for (const [start, end] of spans) {
    const from = Math.max(start, cursor);
    if (end > from) total += end - from;
    cursor = Math.max(cursor, end);
  }
  return Math.floor(total / 12);
}
