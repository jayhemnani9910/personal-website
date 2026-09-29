"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { THEME_KEY, readStorage, writeStorage } from "@/lib/storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Default context value for SSR
const defaultContext: ThemeContextType = {
  theme: "dark",
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = readStorage(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // Dark is the only default (ADR 0015): an unset theme does not fall back to
  // the OS preference, it is dark for everyone until the toggle is used.
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Keep the DOM attribute in sync. Storage is written by toggleTheme only, so
  // the default never gets saved as if it were a choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // React to external theme changes: the WebMCP toggle_theme tool dispatches a
  // synthetic storage event, and genuine cross-tab changes fire a real one.
  // Without this listener the context desyncs and the next manual toggle is a no-op.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeStorage(THEME_KEY, next);
    setThemeState(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
