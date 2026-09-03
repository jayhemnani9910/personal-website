import { describe, expect, it } from "vitest";
import { yearsOfExperience } from "./experience";

describe("yearsOfExperience", () => {
  it("sums role spans without double-counting overlaps", () => {
    // Jan 2022 to Jan 2024 fully contains Jan to May 2022.
    const ranges = [
      { start: "2022-01", end: "2024-01" },
      { start: "2022-01", end: "2022-05" },
    ];
    expect(yearsOfExperience(ranges, new Date("2026-09-01"))).toBe(2);
  });

  it("treats a range with no end as running to the reference date", () => {
    expect(yearsOfExperience([{ start: "2025-09" }], new Date("2026-09-01"))).toBe(1);
  });

  it("floors, so it never overstates", () => {
    expect(yearsOfExperience([{ start: "2025-01", end: "2026-11" }], new Date("2026-09-01"))).toBe(1);
  });

  it("returns 0 rather than throwing on an empty log", () => {
    expect(yearsOfExperience([], new Date("2026-09-01"))).toBe(0);
  });
});
