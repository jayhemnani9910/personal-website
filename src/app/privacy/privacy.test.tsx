import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ForgetButton } from "./ForgetButton";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  delete document.documentElement.dataset.reader;
});

describe("ForgetButton", () => {
  it("clears everything the site keeps in this browser", () => {
    window.localStorage.setItem("reader-mode", "on");
    window.localStorage.setItem("jh_visits", "7");
    window.localStorage.setItem("jh_eggs", '["cube"]');
    window.sessionStorage.setItem("jh_visit_counted", "1");
    window.sessionStorage.setItem("viewed:chatbot-intents", "1");
    document.documentElement.dataset.reader = "on";

    render(<ForgetButton />);
    fireEvent.click(screen.getByRole("button", { name: "forget me on this browser" }));

    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    // Reader mode turns off on the page now, not only on the next visit.
    expect(document.documentElement.dataset.reader).toBeUndefined();
    expect(screen.getByText(/This browser holds nothing/)).toBeDefined();
  });
});
