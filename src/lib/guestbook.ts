// The home page's sticky-note wall. Notes go live at once; the filter below and
// a per-IP rate limit are the only gates. A note that gets through and should
// not have can be hidden by hand: LSET its index in `guestbook:notes` with
// `"hidden": true`, and GET stops returning it.
//
// The guestbook component imports the limits from here, so this module ships
// in the home page's first-load bundle: no zod, nothing server-only.

export const GUESTBOOK_KEY = "guestbook:notes";
export const NAME_MAX = 24;
export const MSG_MAX = 90;
/** How many notes the wall shows, and how many the list keeps. */
export const SHOWN = 60;
export const KEPT = 500;

export type Note = { name: string; msg: string; at: number; hidden?: boolean };

// Words that would make the wall unshowable. Kept short on purpose: this stops
// the obvious, the rate limit stops the persistent, and LSET handles the rest.
const BLOCKED = /\b(fuck\w*|shit(s|ty|head|hole|show)?|cunts?|bitch(es|y)?|nigg(a|as|az|er|ers)|fag(s|got|gots)?|retard(s|ed)?|whores?|slut(s|ty)?|rap(e|ed|es|ist|ists))\b/i;

/** Tags out, control characters out, whitespace collapsed. */
export function clean(text: string): string {
  return text
    // Only tag-shaped runs ("<b>", "</i>"), so "love it <3 -> more" survives.
    // `[^<>]`, not `[^>]`: on a run of "<" with no ">" the wider class rescans
    // to the end from every "<", which is quadratic in the input.
    .replace(/<\/?[a-z][^<>]*>/gi, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ParseResult = { ok: true; name: string; msg: string } | { ok: false; error: "empty" | "too_long" | "blocked" | "invalid" };

export function parseNote(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "invalid" };
  const { name: rawName, msg: rawMsg } = body as Record<string, unknown>;
  if (typeof rawMsg !== "string" || (rawName !== undefined && typeof rawName !== "string")) {
    return { ok: false, error: "invalid" };
  }
  // Tags and spaces can shrink a note, but not by this much. Rejecting here
  // keeps a huge body from being cleaned at all.
  if ((rawName?.length ?? 0) > NAME_MAX * 4 || rawMsg.length > MSG_MAX * 4) return { ok: false, error: "too_long" };
  const name = clean(rawName ?? "");
  const msg = clean(rawMsg);
  if (!msg) return { ok: false, error: "empty" };
  if (name.length > NAME_MAX || msg.length > MSG_MAX) return { ok: false, error: "too_long" };
  if (BLOCKED.test(name) || BLOCKED.test(msg)) return { ok: false, error: "blocked" };
  return { ok: true, name: name || "anonymous", msg };
}

/** What the wall shows: visible notes only, without the moderation flag. */
export function visible(notes: Note[]): Omit<Note, "hidden">[] {
  return notes.filter((n) => !n.hidden).map(({ name, msg, at }) => ({ name, msg, at }));
}
