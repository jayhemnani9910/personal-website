import { describe, expect, it } from "vitest";
import Cube from "@/vendor/cubejs";
import { FACELETS, SOLVED, applyMove, applyMoves, parseMove, randomScramble, simplify, undo } from "./cube";

const MOVES = [..."URFDLB"].flatMap((f) => [f, `${f}'`, `${f}2`]);

describe("cube", () => {
  it("places every facelet on a distinct outer sticker", () => {
    const keys = new Set(FACELETS.map((f) => `${f.pos}|${f.normal}`));
    expect(keys.size).toBe(54);
    for (const { pos, normal } of FACELETS) {
      // The sticker is on the cube's surface, on the side it faces.
      const axis = normal.findIndex((v) => v !== 0);
      expect(pos[axis]).toBe(normal[axis]);
    }
  });

  // cubejs is the solver, so the card's moves must mean what its moves mean,
  // or the solution it hands back would not solve what the card shows.
  it.each(MOVES)("%s turns the stickers the way cubejs does", (move) => {
    expect(applyMove(SOLVED, move)).toBe(new Cube().move(move).asString());
  });

  it("agrees with cubejs over a long scramble", () => {
    const moves = randomScramble(40);
    expect(applyMoves(SOLVED, moves)).toBe(new Cube().move(moves.join(" ")).asString());
  });

  it("turns each layer the right way for the animation", () => {
    // R takes the top of the front up and back: -90° about +x.
    expect(parseMove("R")).toEqual({ axis: 0, layer: 1, angle: -90 });
    expect(parseMove("L")).toEqual({ axis: 0, layer: -1, angle: 90 });
    expect(parseMove("U'")).toEqual({ axis: 1, layer: 1, angle: 90 });
    expect(parseMove("B2")).toEqual({ axis: 2, layer: -1, angle: 180 });
  });

  it("scrambles without a move that cancels", () => {
    const moves = randomScramble(500);
    expect(moves).toHaveLength(500);
    expect(undo(moves)).toHaveLength(500);
  });

  it("undoes a scramble, merging what cancels", () => {
    expect(undo(["R", "U", "F2"])).toEqual(["F2", "U'", "R'"]);
    expect(undo(["R", "L", "L'", "R"])).toEqual(["R2"]);
    expect(undo(["R", "L", "R'"])).toEqual(["L'"]);
    expect(undo(["U", "U'"])).toEqual([]);
    const moves = randomScramble(30);
    expect(applyMoves(applyMoves(SOLVED, moves), undo(moves))).toBe(SOLVED);
  });

  it("writes a scramble out with what cancels merged", () => {
    expect(simplify(["R", "U", "U", "F", "F'", "L"])).toEqual(["R", "U2", "L"]);
  });

  it("gets a solve from the vendored solver that solves the card's cube", () => {
    Cube.initSolver();
    const state = applyMoves(SOLVED, randomScramble(25));
    const solution = Cube.fromString(state).solve().split(" ");
    expect(solution.length).toBeLessThanOrEqual(22);
    expect(applyMoves(state, solution)).toBe(SOLVED);
  }, 30_000);
});
