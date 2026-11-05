/**
 * The citation check from the Discharge Summary Agent (guardrails.py), ported
 * so a visitor can run it on the home page. The messages are the agent's own.
 */
export type GuardrailResult = { ok: boolean; reason: string };

const norm = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();

export function quoteSupported(pages: Record<number, string>, page: number, quote: string): GuardrailResult {
  const text = pages[page];
  if (text === undefined) return { ok: false, reason: `page ${page} is not in the record` };
  const q = norm(quote);
  if (q.length < 4) return { ok: false, reason: "quote is too short to verify; cite the exact words from the page" };
  if (!norm(text).includes(q)) return { ok: false, reason: `quote not found verbatim on page ${page}` };
  return { ok: true, reason: "ok" };
}
