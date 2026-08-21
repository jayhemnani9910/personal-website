import { describe, expect, it } from "vitest";
import { SseDecoder, encodeSse, geminiChunkText, geminiChunkUsage } from "./fde-stream";

describe("encodeSse", () => {
  it("names the event type and carries the rest as JSON", () => {
    expect(encodeSse({ type: "section", key: "scope", value: [1] })).toBe(
      'event: section\ndata: {"key":"scope","value":[1]}\n\n',
    );
    expect(encodeSse({ type: "done" })).toBe("event: done\ndata: {}\n\n");
  });

  // A raw newline in the payload would terminate the event early and the
  // browser would see a truncated frame.
  it("cannot be broken by newlines in the content", () => {
    const frame = encodeSse({ type: "section", key: "a", value: "one\ntwo\n\nthree" });
    expect(frame.split("\n\n")).toHaveLength(2); // body, then the terminator
    expect(JSON.parse(frame.split("data: ")[1]).value).toBe("one\ntwo\n\nthree");
  });
});

describe("SseDecoder", () => {
  const feed = (chunks: string[]) => {
    const d = new SseDecoder();
    return chunks.flatMap((c) => d.push(c));
  };

  it("returns each complete event payload", () => {
    expect(feed(["data: {\"a\":1}\n\ndata: {\"a\":2}\n\n"])).toEqual(['{"a":1}', '{"a":2}']);
  });

  it("holds an incomplete event until it finishes", () => {
    const d = new SseDecoder();
    expect(d.push('data: {"a":')).toEqual([]);
    expect(d.push("1}")).toEqual([]);
    expect(d.push("\n\n")).toEqual(['{"a":1}']);
  });

  it("does not care where the chunks are cut", () => {
    const wire = 'data: {"a":1}\n\ndata: {"b":2}\n\n';
    for (let size = 1; size <= wire.length; size++) {
      const chunks = [];
      for (let i = 0; i < wire.length; i += size) chunks.push(wire.slice(i, i + size));
      expect(feed(chunks), `chunk size ${size}`).toEqual(['{"a":1}', '{"b":2}']);
    }
  });

  it("handles CRLF line endings", () => {
    expect(feed(['data: {"a":1}\r\n\r\n'])).toEqual(['{"a":1}']);
  });

  it("joins a payload split over several data lines", () => {
    expect(feed(['data: {"a":\ndata: 1}\n\n'])).toEqual(['{"a":\n1}']);
  });

  it("skips comments, keepalives and the terminator", () => {
    expect(feed([': keepalive\n\ndata: [DONE]\n\ndata: {"a":1}\n\n'])).toEqual(['{"a":1}']);
  });
});

describe("geminiChunkText", () => {
  const chunk = (text: string) =>
    JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] });

  it("pulls the text fragment out", () => {
    expect(geminiChunkText(chunk('{"scope":['))).toBe('{"scope":[');
  });

  it("returns empty string for metadata-only or unparseable events", () => {
    expect(geminiChunkText('{"usageMetadata":{"promptTokenCount":5}}')).toBe("");
    expect(geminiChunkText("not json")).toBe("");
    expect(geminiChunkText("{}")).toBe("");
  });
});

describe("geminiChunkUsage", () => {
  it("reads usage off the chunk that carries it", () => {
    expect(
      geminiChunkUsage('{"usageMetadata":{"promptTokenCount":700,"candidatesTokenCount":2500}}'),
    ).toEqual({ prompt: 700, output: 2500 });
  });

  it("returns null when the chunk has no usage", () => {
    expect(geminiChunkUsage('{"candidates":[]}')).toBeNull();
    expect(geminiChunkUsage("nope")).toBeNull();
  });
});
