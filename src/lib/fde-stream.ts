// Server-sent events, both directions.
//
// Gemini's streamGenerateContent?alt=sse sends SSE, and /api/fde-sim sends SSE
// on to the browser. Both sides live here so neither needs a network to test.
//
// Systems Design for the LLM Era names time to first token as the metric for a
// route like this, and calls a spinner held for the whole wait a pattern to
// avoid. The measured p50 for this route is about 25 seconds.

/** One event on the wire to the browser. */
export type SimStreamEvent =
  | { type: "section"; key: string; value: unknown }
  | { type: "done" }
  | { type: "error"; error: string };

/**
 * Encode one event. Newlines inside the payload would end the event early, so
 * the data is JSON, which cannot contain a raw newline. JSON.stringify does
 * leave U+2028 and U+2029 raw, and the client's frame regex treats those as
 * line ends too, so they are escaped as well.
 */
export function encodeSse(event: SimStreamEvent): string {
  const { type, ...rest } = event;
  const data = JSON.stringify(rest).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return `event: ${type}\ndata: ${data}\n\n`;
}

/** Parse events out of an SSE byte stream, tolerating chunk boundaries anywhere. */
export class SseDecoder {
  private buf = "";

  /** Returns the `data:` payloads completed by this chunk, in order. */
  push(chunk: string): string[] {
    this.buf += chunk;
    const out: string[] = [];

    // Events are separated by a blank line. Anything after the last separator is
    // an incomplete event and stays buffered.
    let sep: number;
    while ((sep = this.findSeparator(this.buf)) !== -1) {
      const raw = this.buf.slice(0, sep);
      this.buf = this.buf.slice(sep).replace(/^(\r?\n){2}/, "");
      const data = raw
        .split(/\r?\n/)
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n");
      if (data && data !== "[DONE]") out.push(data);
    }
    return out;
  }

  private findSeparator(s: string): number {
    const a = s.indexOf("\n\n");
    const b = s.indexOf("\r\n\r\n");
    if (a === -1) return b;
    if (b === -1) return a;
    return Math.min(a, b);
  }
}

/**
 * Pull the text fragment out of one Gemini stream event.
 *
 * Every chunk carries the same envelope as a non-streaming response, with the
 * next slice of text in it. Returns "" for the keepalive and metadata-only
 * events, which do occur.
 */
export function geminiChunkText(payload: string): string {
  try {
    const data = JSON.parse(payload);
    return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
  } catch {
    return "";
  }
}

/** Token usage, which Gemini reports on the final chunk rather than each one. */
export function geminiChunkUsage(payload: string): { prompt: number; output: number } | null {
  try {
    const u = JSON.parse(payload)?.usageMetadata;
    if (!u) return null;
    return {
      prompt: Number(u.promptTokenCount ?? 0),
      output: Number(u.candidatesTokenCount ?? 0),
    };
  } catch {
    return null;
  }
}

/** Why Gemini stopped (STOP, MAX_TOKENS, SAFETY...), when this chunk says. */
export function geminiChunkFinishReason(payload: string): string | null {
  try {
    const reason = JSON.parse(payload)?.candidates?.[0]?.finishReason;
    return typeof reason === "string" ? reason : null;
  } catch {
    return null;
  }
}
