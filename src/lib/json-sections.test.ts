import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { JsonSectionExtractor, type Section } from "./json-sections";

/** Feed a document in fixed-size chunks and collect everything emitted. */
function run(json: string, chunkSize = json.length): Section[] {
  const x = new JsonSectionExtractor();
  const out: Section[] = [];
  for (let i = 0; i < json.length; i += chunkSize) {
    out.push(...x.push(json.slice(i, i + chunkSize)));
  }
  return out;
}

/** The invariant that matters: chunk boundaries must not change the result. */
function sameUnderEveryChunking(json: string) {
  const whole = run(json);
  for (let size = 1; size <= json.length; size++) {
    expect(run(json, size), `chunk size ${size}`).toEqual(whole);
  }
  return whole;
}

describe("JsonSectionExtractor", () => {
  it("emits each top-level value as it closes, in order", () => {
    const out = run('{"a":[1,2],"b":{"x":1},"c":"hi"}');
    expect(out.map((s) => s.key)).toEqual(["a", "b", "c"]);
    expect(out[0].value).toEqual([1, 2]);
    expect(out[1].value).toEqual({ x: 1 });
    expect(out[2].value).toBe("hi");
  });

  it("gives the same answer no matter where the chunks fall", () => {
    const out = sameUnderEveryChunking('{"a":[1,2],"b":{"x":{"y":[3]}},"c":"hi"}');
    expect(out.map((s) => s.key)).toEqual(["a", "b", "c"]);
  });

  // The reason this is a scanner and not a brace counter.
  it("ignores braces and brackets inside string values", () => {
    const out = sameUnderEveryChunking('{"a":"a } b ] c { d [","b":[1]}');
    expect(out[0].value).toBe("a } b ] c { d [");
    expect(out.map((s) => s.key)).toEqual(["a", "b"]);
  });

  it("handles escaped quotes and trailing backslashes", () => {
    const out = sameUnderEveryChunking('{"a":"she said \\"no\\"","b":"back\\\\slash","c":[1]}');
    expect(out[0].value).toBe('she said "no"');
    expect(out[1].value).toBe("back\\slash");
    expect(out.map((s) => s.key)).toEqual(["a", "b", "c"]);
  });

  it("reads keys containing punctuation", () => {
    const out = sameUnderEveryChunking('{"a:b":[1],"c,d":[2]}');
    expect(out.map((s) => s.key)).toEqual(["a:b", "c,d"]);
  });

  it("handles bare scalars", () => {
    const out = sameUnderEveryChunking('{"n":42,"t":true,"z":null,"f":1.5,"e":[1]}');
    expect(out.map((s) => [s.key, s.value])).toEqual([
      ["n", 42], ["t", true], ["z", null], ["f", 1.5], ["e", [1]],
    ]);
  });

  it("copes with whitespace and newlines between tokens", () => {
    const out = sameUnderEveryChunking('{\n  "a" : [ 1 ,\n 2 ] ,\n  "b" : { }\n}');
    expect(out.map((s) => s.key)).toEqual(["a", "b"]);
    expect(out[0].value).toEqual([1, 2]);
  });

  it("emits nothing for an empty object and does not hang", () => {
    expect(run("{}")).toEqual([]);
    expect(run("")).toEqual([]);
  });

  it("emits nothing until a value actually closes", () => {
    const x = new JsonSectionExtractor();
    expect(x.push('{"a":[1,2')).toEqual([]);
    expect(x.push(",3")).toEqual([]);
    expect(x.push("]").map((s) => s.value)).toEqual([[1, 2, 3]]);
  });

  it("keeps the raw text for a final whole-object parse", () => {
    const json = '{"a":[1],"b":[2]}';
    const x = new JsonSectionExtractor();
    x.push(json);
    expect(JSON.parse(x.text)).toEqual({ a: [1], b: [2] });
  });

  it("stops at the closing brace and ignores trailing noise", () => {
    const out = run('{"a":[1]} trailing junk');
    expect(out.map((s) => s.key)).toEqual(["a"]);
  });

  it("handles unicode and multi-byte characters inside values", () => {
    const out = sameUnderEveryChunking('{"a":"caf\\u00e9 → 🚀","b":[1]}');
    expect(out[0].value).toBe("café → 🚀");
  });
});

// Real data beats invented data: this is an actual recorded model response, the
// exact shape and size the route will be streaming.
describe("against a recorded model response", () => {
  const fixture = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../tests/eval/responses/support-tickets.json",
  );
  const json = readFileSync(fixture, "utf8");
  const expected = JSON.parse(json);

  it("recovers every section, in the order the schema declares", () => {
    const out = run(json);
    expect(out.map((s) => s.key)).toEqual([
      "scope", "decomposition", "architecture", "sprint", "risks",
    ]);
  });

  it("each section equals what a whole-document parse would give", () => {
    for (const s of run(json)) {
      expect(s.value, s.key).toEqual(expected[s.key]);
    }
  });

  // The realistic delivery pattern: many small chunks at arbitrary boundaries.
  it.each([1, 3, 7, 64, 512, 4096])("survives delivery in %i-byte chunks", (size) => {
    const out = run(json, size);
    expect(out.map((s) => s.key)).toEqual([
      "scope", "decomposition", "architecture", "sprint", "risks",
    ]);
    for (const s of out) expect(s.value, s.key).toEqual(expected[s.key]);
  });

  // The whole point: `scope` is readable long before the document finishes.
  it("emits the first section well before the last byte arrives", () => {
    const x = new JsonSectionExtractor();
    let firstAt = -1;
    for (let i = 0; i < json.length; i++) {
      if (x.push(json[i]).length && firstAt < 0) firstAt = i;
    }
    expect(firstAt).toBeGreaterThan(0);
    expect(firstAt / json.length).toBeLessThan(0.5);
  });
});

// A bare scalar closed by the object's own brace used to be dropped: the scanner
// took `depth` to -1 and called itself done without flushing the open value. The
// current SIM_RESPONSE_SCHEMA has no top-level scalar, so nothing was visibly
// broken; adding one would have silently lost that field.
describe("bare scalars at the end of the object", () => {
  it("emits a scalar closed by the object brace", () => {
    expect(run('{"a": 1}')).toEqual([{ key: "a", value: 1 }]);
  });

  it("emits every field when the last one is a scalar", () => {
    expect(run('{"a": [1], "b": true}').map((s) => s.key)).toEqual(["a", "b"]);
  });

  it("handles tab and carriage return as scalar terminators", () => {
    expect(run('{"a": 1\t, "b": 2\r\n, "c": [3]}').map((s) => s.key)).toEqual(["a", "b", "c"]);
    expect(run('{"a": 1\t, "b": 2\r\n, "c": [3]}').map((s) => s.value)).toEqual([1, 2, [3]]);
  });

  it("survives scalar-tailed objects at every chunk boundary", () => {
    for (const size of [1, 2, 3, 5, 64]) {
      expect(run('{"a": [1], "b": null}', size).map((s) => s.key)).toEqual(["a", "b"]);
    }
  });

  // Trailing content after the closing brace must not start a new section.
  it("ignores a second object in the same chunk", () => {
    expect(run('{"a": [1]}{"b": [2]}').map((s) => s.key)).toEqual(["a"]);
  });
});
