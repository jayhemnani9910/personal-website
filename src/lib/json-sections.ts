// Incremental extraction of completed top-level values from a JSON object that
// is still arriving.
//
// /api/fde-sim asks Gemini for one object with five sections and, measured on
// production, takes about 25 seconds to finish it. The sections complete in
// order, so there is no reason for a visitor to wait for `risks` before reading
// `scope`. This turns the arriving text into an event per finished section.
//
// It is a character scanner rather than a JSON parser: it tracks string and
// escape state so that braces and quotes inside string values cannot be mistaken
// for structure, notes where each top-level value starts, and hands the slice to
// JSON.parse once that value's nesting closes. Nothing is parsed twice and no
// partial value is ever emitted.

export interface Section {
  key: string;
  /** Parsed value of that key. */
  value: unknown;
}

type State =
  | "before-object"   // waiting for the opening {
  | "expect-key"      // at depth 1, waiting for a key string or the closing }
  | "in-key"          // reading the key string
  | "expect-colon"
  | "expect-value"
  | "in-value";       // consuming a value, tracking its own nesting

export class JsonSectionExtractor {
  private buf = "";
  private state: State = "before-object";
  private key = "";
  private valueStart = 0;
  private depth = 0;      // nesting inside the current value
  private inString = false;
  private escaped = false;
  private done = false;

  /**
   * Feed the next chunk. Returns every section that completed within it, in
   * order. Safe to call with partial UTF-8-decoded text, an empty string, or
   * text arriving one character at a time.
   */
  push(chunk: string): Section[] {
    const out: Section[] = [];
    if (this.done || !chunk) return out;

    for (const ch of chunk) {
      const i = this.buf.length;
      this.buf += ch;

      // `done` can be set part-way through a chunk. Keep buffering, because the
      // final whole-object parse reads `text`, but stop scanning: a second
      // object in the same chunk would otherwise start emitting its keys as
      // though they belonged to the first.
      if (this.done) continue;

      // Inside a string, only the closing quote and escapes matter. Doing this
      // first is what stops a brace inside a value's text from moving `depth`.
      if (this.inString) {
        if (this.escaped) this.escaped = false;
        else if (ch === "\\") this.escaped = true;
        else if (ch === '"') {
          this.inString = false;
          if (this.state === "in-key") {
            // Capture the key here, at its closing quote, rather than when the
            // colon arrives: `"a" : 1` puts whitespace between the two, and
            // measuring back from the colon swallowed the quote.
            // JSON.parse rather than a raw slice so an escape inside a key works.
            try {
              this.key = JSON.parse(this.buf.slice(this.keyStart - 1, i + 1)) as string;
            } catch {
              this.key = this.buf.slice(this.keyStart, i);
            }
            this.state = "expect-colon";
          }
          else if (this.state === "in-value" && this.depth === 0) {
            out.push(this.finishValue(i + 1));
          }
        }
        continue;
      }

      switch (this.state) {
        case "before-object":
          if (ch === "{") this.state = "expect-key";
          break;

        case "expect-key":
          if (ch === '"') {
            this.inString = true;
            this.state = "in-key";
            this.key = "";
            this.keyStart = i + 1;
          } else if (ch === "}") {
            this.done = true;
          }
          break;

        case "in-key":
          break; // handled by the inString branch above

        case "expect-colon":
          if (ch === ":") this.state = "expect-value";
          break;

        case "expect-value":
          if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") break;
          this.valueStart = i;
          this.state = "in-value";
          this.depth = 0;
          if (ch === '"') this.inString = true;
          else if (ch === "{" || ch === "[") this.depth = 1;
          // A bare scalar (number, true, false, null) ends at a delimiter, which
          // the in-value branch below picks up.
          break;

        case "in-value":
          if (ch === '"') this.inString = true;
          else if (ch === "{" || ch === "[") this.depth++;
          else if (ch === "}" || ch === "]") {
            if (this.depth === 0) {
              // The object's own closing brace, reached while a bare scalar is
              // still open: `{"a": 1}`. Flush it before stopping. Decrementing
              // to -1 and calling it done, which is what this did, dropped the
              // final field without a trace.
              out.push(this.finishValue(i));
              this.done = true;
            } else if (--this.depth === 0) {
              out.push(this.finishValue(i + 1));
            }
          } else if (this.depth === 0 && (ch === "," || ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) {
            // End of a bare scalar. All four whitespace characters JSON allows,
            // matching what expect-value already skips.
            out.push(this.finishValue(i));
          }
          break;
      }
    }

    return out;
  }

  private keyStart = 0;

  private finishValue(end: number): Section {
    const raw = this.buf.slice(this.valueStart, end).trim().replace(/,$/, "");
    let value: unknown = null;
    try {
      value = JSON.parse(raw);
    } catch {
      // A value that will not parse is a bug in this scanner rather than
      // something a caller can act on, so it is reported as null and the stream
      // carries on. The buffered text is still available for the final parse.
      value = null;
    }
    const section = { key: this.key, value };
    this.state = "expect-key";
    this.key = "";
    this.depth = 0;
    return section;
  }

  /** Everything fed so far, for a final whole-object parse. */
  get text(): string {
    return this.buf;
  }
}
