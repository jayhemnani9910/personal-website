// The handful of things a visitor can do that say whether the site is doing its
// job: take a résumé (and which one), copy or click the email, and leave for
// GitHub, LinkedIn or a pull request. Counted per day in Redis by /api/events,
// read back with `npm run ops`. Nothing about the visitor is stored, only the
// tally.

export const RESUME_VARIANTS = ["fde", "de", "ml", "swe", "analyst"] as const;

export const EVENT_NAMES = [
  ...RESUME_VARIANTS.map((v) => `resume:${v}` as const),
  "email:copy",
  "email:mailto",
  "out:github",
  "out:linkedin",
  "out:youtube",
  "out:pr",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const NAMES = new Set<string>(EVENT_NAMES);

export function isEventName(name: unknown): name is EventName {
  return typeof name === "string" && NAMES.has(name);
}

/** Which event a click on this link counts as, or null for links nobody needs counted. */
export function eventForHref(href: string): EventName | null {
  if (href.startsWith("mailto:")) return "email:mailto";
  let url: URL;
  try {
    url = new URL(href, "https://jayhemnani.in");
  } catch {
    return null;
  }
  const resume = url.pathname.match(/^\/resume\/jay-hemnani-([a-z]+)\.pdf$/)?.[1];
  if (resume) return isEventName(`resume:${resume}`) ? (`resume:${resume}` as EventName) : null;

  const host = url.hostname.replace(/^www\./, "");
  if (host === "github.com") return /\/pull\/\d+/.test(url.pathname) ? "out:pr" : "out:github";
  if (host === "linkedin.com") return "out:linkedin";
  if (host === "youtube.com" || host === "youtu.be") return "out:youtube";
  return null;
}

/** Fire and forget. A beacon survives the page unloading, which a click on a
 * PDF or an outbound link usually does. */
export function track(name: EventName) {
  try {
    navigator.sendBeacon?.("/api/events", new Blob([JSON.stringify({ name })], { type: "application/json" }));
  } catch {
    // Counting is never worth an error in front of a visitor.
  }
}

/** The Redis hash for one UTC day: field per event, value the count. */
export const eventsKey = (now: Date = new Date()) => `events:${now.toISOString().slice(0, 10)}`;
