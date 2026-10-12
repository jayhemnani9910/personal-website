import { afterEach, describe, expect, it } from "vitest";
import { dropRetiredKeys } from "./storage";

afterEach(() => window.localStorage.clear());

describe("dropRetiredKeys", () => {
    it("clears what old versions saved and keeps what the site still uses", () => {
        for (const k of ["theme", "theme-choice", "tr-intro-seen", "site-mode", "shell-intent"]) window.localStorage.setItem(k, "x");
        for (const k of ["reader-mode", "jh_visits", "jh_eggs"]) window.localStorage.setItem(k, "1");
        dropRetiredKeys();
        expect(Object.keys(window.localStorage).sort()).toEqual(["jh_eggs", "jh_visits", "reader-mode"]);
    });
});
