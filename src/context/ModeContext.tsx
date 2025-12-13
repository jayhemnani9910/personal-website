"use client";

import React, { createContext, useContext, useState } from "react";

/**
 * Site Modes
 * 
 * - portfolio: Recruiter-focused, resume-heavy
 * - brand: Personal brand, motion-heavy
 * - product: Landing page, conversion-focused
 * - blog: Writing hub, content-focused
 */
export type SiteMode = "portfolio" | "brand" | "product" | "blog";

interface ModeContextType {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
  isTransitioning: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const STORAGE_KEY = "site-mode";
const DEFAULT_MODE: SiteMode = "portfolio";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>(() => {
    if (typeof window === "undefined") return DEFAULT_MODE;
    const stored = localStorage.getItem(STORAGE_KEY) as SiteMode | null;
    if (stored && isValidMode(stored)) {
      return stored;
    }
    return DEFAULT_MODE;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setMode = (newMode: SiteMode) => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    
    // Small delay for transition effect
    setTimeout(() => {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY, newMode);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isTransitioning }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}

function isValidMode(mode: string): mode is SiteMode {
  return ["portfolio", "brand", "product", "blog"].includes(mode);
}

// Mode metadata for UI
export const MODE_CONFIG: Record<SiteMode, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  portfolio: {
    label: "Portfolio",
    description: "Recruiter-focused view",
    icon: "👔",
    color: "var(--neon-cyan)",
  },
  brand: {
    label: "Brand",
    description: "Personal brand showcase",
    icon: "✨",
    color: "var(--neon-purple)",
  },
  product: {
    label: "Product",
    description: "Landing page view",
    icon: "🚀",
    color: "var(--neon-blue)",
  },
  blog: {
    label: "Blog",
    description: "Writing & articles",
    icon: "📝",
    color: "#10b981",
  },
};
