import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-stub" });
  return { Bricolage_Grotesque: font, JetBrains_Mono: font, Caveat: font };
});

import { HomeDesk, inWords } from "./HomeDesk";
import { greetingFor } from "./Visits";
import { TodayPick, untilMidnight } from "./TodayPick";
import { dayOfYear } from "./day";
import { DAILY_FACTS, FEATURED, HOUSE_RULES, buildLogEntries } from "@/data/home";
import { getAllProjects } from "@/lib/content";
import { SITE_CONFIG } from "@/../content/site";
import { TerminalProvider, useTerminal } from "@/context/TerminalContext";

// The footer's shell button reads the shell's context, as it does under
// ClientLayout on the real page. The probe shows whether the shell is open.
function ShellProbe() {
  return <p data-testid="shell-state">{useTerminal().isOpen ? "open" : "closed"}</p>;
}

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let wall: { name: string; msg: string; at: number }[];
let postStatus: number;
let postBody: Record<string, unknown>;
let getStatus: number;
// When set, the wall's GET waits for it, so a post can land while it loads.
let getGate: Promise<void> | null;
// When set, the POST waits for it, so the wall can load while a post is out.
let postGate: Promise<void> | null;

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  wall = [];
  postStatus = 201;
  postBody = {};
  getStatus = 200;
  getGate = null;
  postGate = null;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        if (postGate) await postGate;
        const sent = JSON.parse(String(init.body));
        const body = postStatus === 201 ? { note: { name: sent.name || "anonymous", msg: sent.msg, at: 5 } } : postBody;
        return new Response(JSON.stringify(body), { status: postStatus });
      }
      if (getGate) await getGate;
      return getStatus === 200
        ? new Response(JSON.stringify({ notes: wall }), { status: 200 })
        : new Response(JSON.stringify({ error: "store-unavailable" }), { status: getStatus });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderHome() {
  const page = await HomeDesk();
  render(
    <TerminalProvider>
      {page}
      <ShellProbe />
    </TerminalProvider>,
  );
  // The guestbook loads its wall on mount.
  await waitFor(() => expect(screen.queryByText("counting notes…")).toBeNull());
}

const status = () => screen.getByRole("status").textContent;

describe("HomeDesk", () => {
  it("renders every section, the featured projects and the real counts", async () => {
    await renderHome();
    const projects = await getAllProjects();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("I take the vague version and ship the real one.");
    for (const name of ["Today's pick", "Things I've shipped", "House rules", "Where I've been", "Leave a sticky"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeDefined();
    }
    for (const p of FEATURED) {
      expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === `/projects/${p.id}`)).toBe(true);
    }
    expect(screen.getByText(String(projects.length))).toBeDefined();
    expect(screen.getByText(new RegExp(`Six of ${inWords(projects.length)}`))).toBeDefined();
    for (const r of HOUSE_RULES) expect(screen.getByText(r.title)).toBeDefined();
    for (const j of buildLogEntries()) expect(screen.getByText(j.what)).toBeDefined();
  });

  it("links the other pages from the footer and the socials from site config", async () => {
    await renderHome();
    const site = screen.getByRole("navigation", { name: "Site" });
    expect([...site.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["/projects", "/blog", "/resume", "/youtube"]);
    expect(screen.getByRole("link", { name: "x" }).getAttribute("href")).toBe(SITE_CONFIG.social.twitter);
  });

  it("counts the visit once per session and greets by count", async () => {
    window.localStorage.setItem("jh_visits", "3");
    await renderHome();
    expect(window.localStorage.getItem("jh_visits")).toBe("4");
    expect(screen.getByText("visit #4. you're basically a regular.")).toBeDefined();
    expect(screen.getByText(/you've been here 4×/)).toBeDefined();
  });

  it("knocking on the logo five times finds a secret and ticks the chip", async () => {
    await renderHome();
    const logo = screen.getByRole("button", { name: "jay.hemnani" });
    for (let i = 0; i < 4; i++) fireEvent.click(logo);
    expect(screen.getByRole("button", { name: /secrets 0\/5/ })).toBeDefined();
    fireEvent.click(logo);
    expect(status()).toBe("Secret 1/5 · Knock knock. Who's there? Still Jay.");
    expect(screen.getByRole("button", { name: /secrets 1\/5/ })).toBeDefined();
    expect(JSON.parse(window.localStorage.getItem("jh_eggs")!)).toEqual(["logo"]);
  });

  it("typing hello and the Konami code each find their secret, but not inside a field", async () => {
    await renderHome();
    const type = (keys: string[], target: Element = document.body) => keys.forEach((key) => fireEvent.keyDown(target, { key }));
    type([..."hello"], screen.getByLabelText("Your note"));
    expect(status()).toBe("");
    type([..."hello"]);
    expect(status()).toContain("Hello yourself.");
    type(["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]);
    expect(status()).toBe("Secret 2/5 · Cheat code accepted. Tile storm incoming.");
  });

  it("under reader mode the toasts don't promise tiles that stay still", async () => {
    document.documentElement.dataset.reader = "on";
    try {
      await renderHome();
      fireEvent.keyDown(document.body, { key: "h" });
      [..."ello"].forEach((key) => fireEvent.keyDown(document.body, { key }));
      expect(status()).toBe("Secret 1/5 · Hello yourself.");
      ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"].forEach((key) =>
        fireEvent.keyDown(document.body, { key }),
      );
      expect(status()).toBe("Secret 2/5 · Cheat code accepted.");
    } finally {
      delete document.documentElement.dataset.reader;
    }
  });

  it("a found secret only repeats its message the second time", async () => {
    await renderHome();
    const cube = screen.getByRole("button", { name: "Scramble the cube face" });
    fireEvent.click(cube);
    expect(status()).toContain("Secret 1/5");
    fireEvent.click(cube);
    expect(status()).toBe("Scrambled. Now solve it. I'll wait.");
  });

  it("the secrets panel names only what was found", async () => {
    window.localStorage.setItem("jh_eggs", JSON.stringify(["cube"]));
    await renderHome();
    const chip = screen.getByRole("button", { name: /secrets 1\/5/ });
    fireEvent.click(chip);
    expect(chip.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Scrambler")).toBeDefined();
    expect(screen.getAllByText("???")).toHaveLength(4);
  });
});

describe("TodayPick", () => {
  it("never picks a project the cards below already show, on any day of a month", async () => {
    const featured = FEATURED.map((f) => f.id);
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      for (let day = 1; day <= 31; day++) {
        vi.setSystemTime(new Date(2026, 0, day, 12));
        const view = render(<TerminalProvider>{await HomeDesk()}</TerminalProvider>);
        const id = view.getByRole("link", { name: /project of the day/ }).getAttribute("href")?.replace("/projects/", "");
        expect(featured).not.toContain(id);
        view.unmount();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("turns to a different project on a different day", () => {
    const projects = ["a", "b", "c"].map((id) => ({ id, title: `Title ${id}`, brief: "b", changed: "c", tags: [] }));
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date(2026, 0, 5, 12));
      const first = render(<TodayPick projects={projects} facts={["f"]} renderedDay={5} />);
      const day5 = first.getByRole("link").getAttribute("href");
      first.unmount();
      vi.setSystemTime(new Date(2026, 0, 6, 12));
      const second = render(<TodayPick projects={projects} facts={["f"]} renderedDay={6} />);
      expect(second.getByRole("link").getAttribute("href")).not.toBe(day5);
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces a fact only when one more is asked for", async () => {
    await renderHome();
    const live = document.querySelector('#today [aria-live="polite"]');
    expect(live?.textContent).toBe("");
    fireEvent.click(screen.getByRole("button", { name: /one more/ }));
    // The fact it announces is the one now on the card, not the one before.
    const shown = document.querySelector("#today p.font-hand")?.textContent;
    expect(DAILY_FACTS).toContain(shown);
    expect(live?.textContent).toBe(shown);
  });
});

describe("Hash links on the home page", () => {
  afterEach(() => {
    history.replaceState(null, "", "/");
  });

  it("brings a linked section back into view once the wall has loaded", async () => {
    history.replaceState(null, "", "/#hi");
    const scrollTo = vi.spyOn(window, "scrollTo");
    let release = () => {};
    getGate = new Promise<void>((r) => (release = r));
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    expect(scrollTo).not.toHaveBeenCalled();
    await act(async () => release());
    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
  });

  it("leaves the visitor where they scrolled to", async () => {
    history.replaceState(null, "", "/#hi");
    const scrollTo = vi.spyOn(window, "scrollTo");
    let release = () => {};
    getGate = new Promise<void>((r) => (release = r));
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    fireEvent.wheel(window);
    await act(async () => release());
    await waitFor(() => expect(screen.queryByText("counting notes…")).toBeNull());
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("drops the #section from the URL on the first real scroll", async () => {
    history.replaceState(null, "", "/#work");
    await renderHome();
    fireEvent.wheel(window);
    expect(location.hash).toBe("");
  });
});

describe("Footer", () => {
  it("opens the shell from a visible button, for visitors without a backtick key", async () => {
    await renderHome();
    expect(screen.getByTestId("shell-state").textContent).toBe("closed");
    fireEvent.click(screen.getByRole("button", { name: "open the shell" }));
    expect(screen.getByTestId("shell-state").textContent).toBe("open");
  });
});

describe("Guestbook", () => {
  it("shows Jay's empty-fridge note until someone writes one", async () => {
    await renderHome();
    expect(screen.getByText(/the fridge is empty/)).toBeDefined();
    expect(screen.getByText("0 notes on the fridge")).toBeDefined();
  });

  it("says the wall could not load, rather than calling it empty, when the store is down", async () => {
    getStatus = 503;
    await renderHome();
    expect(screen.getByText(/couldn't reach the fridge/)).toBeDefined();
    expect(screen.queryByText(/the fridge is empty/)).toBeNull();

    // A note that does get through is not "1 note on the fridge": the rest
    // of the wall is still missing.
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "still here" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    expect(screen.getByText("your note's up. the rest of the fridge didn't load.")).toBeDefined();
  });

  it("keeps a note posted while the wall loads, even if the load then fails", async () => {
    let release = () => {};
    getGate = new Promise<void>((r) => (release = r));
    getStatus = 503;
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "early bird" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    await act(async () => release());
    await waitFor(() => expect(screen.getByText("your note's up. the rest of the fridge didn't load.")).toBeDefined());
    expect(screen.getByText("early bird")).toBeDefined();
  });

  it("merges a wall that loads after a post, keeping the note once", async () => {
    let release = () => {};
    getGate = new Promise<void>((r) => (release = r));
    wall = [{ name: "ana", msg: "older note", at: 1 }];
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    expect(screen.getByText("counting notes…")).toBeDefined();
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "early bird" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    // The server already has the note (at: 5, as the POST stub answers), so
    // the loaded wall carries it too: it must still show once.
    wall = [{ name: "anonymous", msg: "early bird", at: 5 }, ...wall];
    await act(async () => release());
    await waitFor(() => expect(screen.getByText("2 notes on the fridge")).toBeDefined());
    expect(screen.getAllByText("early bird")).toHaveLength(1);
    expect(screen.getByText("older note")).toBeDefined();
  });

  it("keeps a posted note when the wall loads without it", async () => {
    let release = () => {};
    getGate = new Promise<void>((r) => (release = r));
    wall = [{ name: "ana", msg: "older note", at: 1 }];
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "early bird" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    await act(async () => release());
    await waitFor(() => expect(screen.getByText("2 notes on the fridge")).toBeDefined());
    expect(screen.getByText("early bird")).toBeDefined();
  });

  it("shows a note once when the wall brings it in while the post is still out", async () => {
    let releaseGet = () => {};
    let releasePost = () => {};
    getGate = new Promise<void>((r) => (releaseGet = r));
    postGate = new Promise<void>((r) => (releasePost = r));
    const page = await HomeDesk();
    render(<TerminalProvider>{page}</TerminalProvider>);
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "early bird" } });
    fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    wall = [{ name: "anonymous", msg: "early bird", at: 5 }];
    await act(async () => releaseGet());
    await act(async () => releasePost());
    await waitFor(() => expect(status()).toBe("Stuck to the fridge. Thanks!"));
    expect(screen.getAllByText("early bird")).toHaveLength(1);
  });

  it("puts a note up straight away and thanks the writer", async () => {
    wall = [{ name: "ana", msg: "older note", at: 1 }];
    await renderHome();
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "ben" } });
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "nice tiles" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    expect(screen.getByText("nice tiles")).toBeDefined();
    expect(screen.getByText("2 notes on the fridge")).toBeDefined();
    expect(status()).toBe("Stuck to the fridge. Thanks!");
  });

  it("takes the note back down and says why when the post is refused", async () => {
    postStatus = 429;
    postBody = { error: "rate_limited" };
    await renderHome();
    fireEvent.change(screen.getByLabelText("Your note"), { target: { value: "again" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    });
    expect(screen.queryByText("again", { selector: "li p" })).toBeNull();
    expect((screen.getByLabelText("Your note") as HTMLInputElement).value).toBe("again");
    expect(status()).toBe("That's a lot of stickies for ten minutes. Try again in a bit.");
  });

  it("refuses a blank note without posting", async () => {
    await renderHome();
    fireEvent.click(screen.getByRole("button", { name: "stick it" }));
    expect(status()).toBe("A blank sticky? Bold. Write something.");
    expect(vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(0);
  });
});

describe("Desk helpers", () => {
  it("greets by visit count", () => {
    expect(greetingFor(1)).toBe("oh hi, first time?");
    expect(greetingFor(2)).toBe("welcome back! the tiles missed you.");
    expect(greetingFor(5)).toBe("visit #5. you're basically a regular.");
    expect(greetingFor(6)).toBe("visit #6. at this point just email me.");
  });

  it("counts the day of the year and the time to midnight in local time", () => {
    expect(dayOfYear(new Date(2026, 0, 1, 12))).toBe(1);
    expect(dayOfYear(new Date(2026, 9, 10, 23, 59))).toBe(283);
    expect(untilMidnight(new Date(2026, 9, 10, 18, 56, 51))).toBe("5h 03m 09s");
  });

  it("turns the day over at midnight on a DST date, not an hour later", () => {
    const tz = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      expect(dayOfYear(new Date(2026, 6, 3, 23, 30))).toBe(184);
      expect(dayOfYear(new Date(2026, 6, 4, 0, 30))).toBe(185);
      expect(dayOfYear(new Date(2026, 10, 2, 0, 30))).toBe(306);
    } finally {
      process.env.TZ = tz;
    }
  });

  it("writes counts in words", () => {
    expect(inWords(6)).toBe("six");
    expect(inWords(28)).toBe("twenty-eight");
    expect(inWords(40)).toBe("forty");
    expect(inWords(120)).toBe("120");
  });
});
