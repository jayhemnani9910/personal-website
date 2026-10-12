/// <reference lib="webworker" />
import Cube from "@/vendor/cubejs";

// Builds cubejs's tables once (about 1.5 s), then answers each facelet string
// with solutions that keep getting shorter. The first comes back in tens of
// milliseconds at up to 22 moves; each tighter bound can take anywhere from a
// millisecond to a minute, so the page keeps the best one so far and stops
// this worker when its time is up. `null` means nothing shorter exists here.
let ready = false;

self.onmessage = (e: MessageEvent<string>) => {
  if (!ready) {
    Cube.initSolver();
    ready = true;
  }
  const cube = Cube.fromString(e.data);
  let best = cube.solve();
  self.postMessage(best);
  for (;;) {
    const length = best.split(" ").length;
    let next: string | null = null;
    try {
      // cubejs answers null when no solution fits the bound, throws for some
      // small bounds, and sometimes hands back the same solution again.
      next = length > 1 ? cube.solve(length - 1) : null;
    } catch {}
    if (!next || next.split(" ").length >= length) break;
    best = next;
    self.postMessage(best);
  }
  self.postMessage(null);
};
