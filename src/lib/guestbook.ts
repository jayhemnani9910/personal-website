import { z } from "zod";

// The home page's sticky-note wall. Notes go live at once; the filter below
// and a per-IP rate limit are the only gates. A note that gets through and
// should not have can be hidden by hand: LSET its index in `guestbook:notes`
// with `"hidden": true`, and GET stops returning it.

export const GUESTBOOK_KEY = "guestbook:notes";
export const NAME_MAX = 24;
export const MSG_MAX = 90;
/** How many notes the wall shows, and how many the list keeps. */
export const SHOWN = 60;
export const KEPT = 500;

export type Note = { name: string; msg: string; at: number; hidden?: boolean };

const Input = z.object({
  name: z.string().optional(),
  msg: z.string(),
});

// Words that would make the wall unshowable. Kept short on purpose: this stops
// the obvious, the rate limit stops the persistent, and LSET handles the rest.
const BLOCKED = /\b(fuck\w*|shit\w*|cunt\w*|bitch\w*|nigg\w*|fag\w*|retard\w*|whore\w*|slut\w*|rape\w*)\b/i;

/** Tags out, control characters out, whitespace collapsed. */
export function clean(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ParseResult = { ok: true; name: string; msg: string } | { ok: false; error: "empty" | "too_long" | "blocked" | "invalid" };

export function parseNote(body: unknown): ParseResult {
  const parsed = Input.safeParse(body);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const name = clean(parsed.data.name ?? "");
  const msg = clean(parsed.data.msg);
  if (!msg) return { ok: false, error: "empty" };
  if (name.length > NAME_MAX || msg.length > MSG_MAX) return { ok: false, error: "too_long" };
  if (BLOCKED.test(name) || BLOCKED.test(msg)) return { ok: false, error: "blocked" };
  return { ok: true, name: name || "anonymous", msg };
}

/** What the wall shows: visible notes only, without the moderation flag. */
export function visible(notes: Note[]): Omit<Note, "hidden">[] {
  return notes.filter((n) => !n.hidden).map(({ name, msg, at }) => ({ name, msg, at }));
}
