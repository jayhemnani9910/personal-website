"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode, MODE_CONFIG, type SiteMode } from "@/context/ModeContext";
import { ChevronDown, Check } from "lucide-react";
import { SPRINGS } from "@/lib/motion";

/**
 * ModeSwitcher Component
 * 
 * Dropdown to switch between site modes.
 * Persists selection to localStorage.
 */
export function ModeSwitcher({ className = "" }: { className?: string }) {
  const { mode, setMode, isTransitioning } = useMode();
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = MODE_CONFIG[mode];
  const modes = Object.entries(MODE_CONFIG) as [SiteMode, typeof currentConfig][];

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={SPRINGS.stiff}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
          hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]
          transition-colors text-sm font-medium
          ${isTransitioning ? "opacity-50" : ""}
        `}
        disabled={isTransitioning}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentConfig.icon}</span>
        <span className="text-[var(--text-primary)]">{currentConfig.label}</span>
        <ChevronDown 
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={SPRINGS.stiff}
              className="absolute top-full left-0 mt-2 z-50 min-w-[200px] py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] shadow-xl backdrop-blur-xl"
              role="listbox"
            >
              {modes.map(([modeKey, config]) => (
                <motion.button
                  key={modeKey}
                  onClick={() => {
                    setMode(modeKey);
                    setIsOpen(false);
                  }}
                  whileHover={{ x: 4 }}
                  transition={SPRINGS.stiff}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-[rgba(255,255,255,0.05)] transition-colors
                    ${mode === modeKey ? "bg-[rgba(255,255,255,0.03)]" : ""}
                  `}
                  role="option"
                  aria-selected={mode === modeKey}
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text-primary)]">
                      {config.label}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {config.description}
                    </div>
                  </div>
                  {mode === modeKey && (
                    <Check 
                      className="w-4 h-4" 
                      style={{ color: config.color }} 
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

