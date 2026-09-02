import { describe, expect, it, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

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

afterEach(() => {
  localStorage.clear();
  // Restore the light-OS stub vitest.setup.ts installs globally, so an
  // override made by one test can't leak into the next file.
  mockPrefersColorScheme(false);
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
    localStorage.setItem("theme", "light");
    mockPrefersColorScheme(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });
});
