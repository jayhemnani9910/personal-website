import { describe, expect, it, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { THEME_KEY } from "@/lib/storage";

// ADR 0015: dark is the only default now, the OS preference is not consulted
// for a first-time visitor. This is the kind of thing that regresses silently
// if getInitialTheme() ever goes back to asking matchMedia, so these tests
// mock the media query as "prefers light" and assert dark still comes out.

function mockPrefersColorScheme(matchesDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("dark") ? matchesDark : !matchesDark,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function ThemeProbe() {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
}

// The stub vitest.setup.ts installs (every query false), put back after each
// test so an override here cannot change what later tests in this file see.
const setupMatchMedia = window.matchMedia;

afterEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", { writable: true, configurable: true, value: setupMatchMedia });
});

describe("ThemeProvider default resolution", () => {
  it("resolves to dark when nothing is stored, even though the OS prefers light", () => {
    localStorage.clear();
    mockPrefersColorScheme(false); // OS says light: matchMedia('(prefers-color-scheme: dark)').matches === false
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("still resolves to dark when nothing is stored and the OS prefers dark", () => {
    // Not just "not light": the default no longer reads the OS preference at all.
    localStorage.clear();
    mockPrefersColorScheme(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("still honours an explicitly stored theme", () => {
    localStorage.setItem(THEME_KEY, "light");
    mockPrefersColorScheme(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });
});

describe("ThemeProvider persistence", () => {
  function Toggle() {
    const { theme, toggleTheme } = useTheme();
    return <button onClick={toggleTheme}>{theme}</button>;
  }

  it("does not save the default, so a stored value always means a choice", () => {
    render(
      <ThemeProvider>
        <Toggle />
      </ThemeProvider>,
    );
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("saves the theme when the visitor toggles it", () => {
    render(
      <ThemeProvider>
        <Toggle />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("survives a browser that blocks storage", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    try {
      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );
      expect(screen.getByTestId("theme").textContent).toBe("dark");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
