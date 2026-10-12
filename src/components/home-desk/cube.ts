/**
 * A 3x3 cube as 54 facelets in Kociemba order (U R F D L B, nine each, read
 * row by row), the same string cubejs reads and writes. Every facelet also has
 * a place in space, so a move is a quarter turn of the stickers in one layer,
 * and the 3D card can draw each sticker where it sits.
 *
 * Space: x to the right (R), y up (U), z toward the viewer (F). Cubie
 * coordinates are -1, 0 or 1 on each axis.
 */

export type Vec = [number, number, number];

export const FACES = "URFDLB";
export const SOLVED = [...FACES].map((f) => f.repeat(9)).join("");

const NORMAL: Record<string, Vec> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

// Where facelet (row, col) of each face sits, with each face read the way
// Kociemba lays it out on the unfolded net.
const PLACE: Record<string, (r: number, c: number) => Vec> = {
  U: (r, c) => [c - 1, 1, r - 1],
  R: (r, c) => [1, 1 - r, 1 - c],
  F: (r, c) => [c - 1, 1 - r, 1],
  D: (r, c) => [c - 1, -1, 1 - r],
  L: (r, c) => [-1, 1 - r, c - 1],
  B: (r, c) => [1 - c, 1 - r, -1],
};

export type Facelet = { pos: Vec; normal: Vec };

export const FACELETS: Facelet[] = [...FACES].flatMap((f) =>
  Array.from({ length: 9 }, (_, i) => ({ pos: PLACE[f](Math.floor(i / 3), i % 3), normal: NORMAL[f] })),
);

const key = (pos: Vec, normal: Vec) => `${pos}|${normal}`;
const INDEX = new Map(FACELETS.map((f, i) => [key(f.pos, f.normal), i]));

/** The facelet showing on `pos` toward `normal`, or -1 for an inner face. */
export const faceletAt = (pos: Vec, normal: Vec) => INDEX.get(key(pos, normal)) ?? -1;

/** A right-handed quarter turn (+90°) about axis 0 (x), 1 (y) or 2 (z). */
const quarter = ([x, y, z]: Vec, axis: number): Vec =>
  axis === 0 ? [x, -z, y] : axis === 1 ? [z, y, -x] : [-y, x, z];

export type Turn = {
  /** The axis the layer turns about, 0 (x), 1 (y) or 2 (z). */
  axis: number;
  /** The layer: -1 or 1 along that axis. */
  layer: number;
  /** Right-handed degrees about the positive axis: ±90 or 180. */
  angle: number;
};

/** "R", "U'" or "F2" as a layer turn. Clockwise is as seen facing that face. */
export function parseMove(move: string): Turn {
  const n = NORMAL[move[0]];
  if (!n) throw new Error(`not a face move: ${move}`);
  const axis = n.findIndex((v) => v !== 0);
  const layer = n[axis];
  const turns = move[1] === "2" ? 2 : move[1] === "'" ? -1 : 1;
  return { axis, layer, angle: turns === 2 ? 180 : -90 * layer * turns };
}

const PERMS = new Map<string, number[]>();

/** perm[i] is where the sticker on facelet i ends up after the move. */
function permutation(move: string): number[] {
  let perm = PERMS.get(move);
  if (perm) return perm;
  const { axis, layer, angle } = parseMove(move);
  const quarters = (((angle / 90) % 4) + 4) % 4;
  perm = FACELETS.map(({ pos, normal }, i) => {
    if (pos[axis] !== layer) return i;
    let p = pos;
    let n = normal;
    for (let q = 0; q < quarters; q++) {
      p = quarter(p, axis);
      n = quarter(n, axis);
    }
    return faceletAt(p, n);
  });
  PERMS.set(move, perm);
  return perm;
}

export function applyMove(state: string, move: string): string {
  const perm = permutation(move);
  const next = [...state];
  perm.forEach((to, from) => (next[to] = state[from]));
  return next.join("");
}

export const applyMoves = (state: string, moves: string[]) => moves.reduce(applyMove, state);

const AXIS_OF = (m: string) => "URFDLB".indexOf(m[0]) % 3;

/**
 * A random scramble: no face twice in a row, and no three turns on one axis
 * (R L R is just R2 L), so none of it cancels.
 */
export function randomScramble(length: number, random = Math.random): string[] {
  const moves: string[] = [];
  while (moves.length < length) {
    const face = FACES[Math.floor(random() * 6)];
    const [a, b] = moves.slice(-2).reverse();
    if (a && a[0] === face) continue;
    if (a && b && AXIS_OF(a) === AXIS_OF(face) && AXIS_OF(b) === AXIS_OF(face)) continue;
    moves.push(face + ["", "'", "2"][Math.floor(random() * 3)]);
  }
  return moves;
}

const QUARTERS: Record<string, number> = { "": 1, "2": 2, "'": 3 };
const SUFFIX = ["", "", "2", "'"];

/**
 * The moves that undo `moves`, with neighbouring turns of one face merged
 * (R R becomes R2, R R' disappears). Opposite faces commute, so a turn merges
 * past them too: R L R' is just L.
 */
export function undo(moves: string[]): string[] {
  const out: string[] = [];
  for (const m of [...moves].reverse()) {
    const inv = m[0] + SUFFIX[(4 - QUARTERS[m.slice(1)]) % 4];
    let j = out.length - 1;
    // Step back over turns on the same axis but the other face.
    if (j >= 0 && out[j][0] !== inv[0] && AXIS_OF(out[j]) === AXIS_OF(inv)) j--;
    if (j >= 0 && out[j][0] === inv[0]) {
      const q = (QUARTERS[out[j].slice(1)] + QUARTERS[inv.slice(1)]) % 4;
      if (q === 0) out.splice(j, 1);
      else out[j] = inv[0] + SUFFIX[q];
    } else {
      out.push(inv);
    }
  }
  return out;
}

/** `moves` with whatever cancels merged away: R R becomes R2. */
export const simplify = (moves: string[]) => undo(undo(moves));
