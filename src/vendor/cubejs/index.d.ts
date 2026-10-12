// Only what the cube card's solver worker and tests use.
export default class Cube {
  static initSolver(): void;
  static fromString(facelets: string): Cube;
  move(moves: string): this;
  asString(): string;
  /** Space-separated moves, aiming for at most maxDepth turns (default 22). */
  solve(maxDepth?: number): string;
}
