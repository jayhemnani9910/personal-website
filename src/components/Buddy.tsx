"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

// ---- expression glyph map ----
type Expression = "rest" | "blink" | "left" | "right" | "up" | "down" | "surprised" | "happy";

const GLYPHS: Record<Expression, string> = {
  rest:      "[o o]",
  blink:     "[- -]",
  left:      "[< <]",
  right:     "[> >]",
  up:        "[' ']",
  down:      "[. .]",
  surprised: "[O O]",
  happy:     "[^ ^]",
};

// ---- word pools ----
const IDLE_WORDS = ["idle", "reading", "vol. iv", "still here", "hello", "shipping", "thinking"];
const IDLE_WORDS_FOOTER = [...IDLE_WORDS, "↑ to top"];
const INTERACTION_WORDS_CLICK = ["hi there", "press me", "^_^", "hello"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface BuddyProps {
  variant?: "mini" | "full";
  className?: string;
}

export function Buddy({ variant = "mini", className }: BuddyProps) {
  const { theme } = useTheme();

  // ---- reduced motion check (done once, stable) ----
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  // ---- state ----
  const [expression, setExpression] = useState<Expression>("rest");
  const [word, setWord] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);

  // resting expression: what blink/idle return to (cursor+scroll update this)
  const restingRef = useRef<Expression>("rest");
  // track scroll position
  const lastScrollYRef = useRef(0);
  // scroll settle timer
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // whether scroll is currently driving the expression
  const scrollActiveRef = useRef(false);

  // rAF gate refs
  const rafPendingMouseRef = useRef(false);
  const rafPendingScrollRef = useRef(false);
  const lastMouseEventRef = useRef<{ x: number; y: number } | null>(null);

  // click word cycling
  const clickWordIndexRef = useRef(0);

  // theme reaction: skip first mount
  const prevThemeRef = useRef<string | null>(null);
  const themeInteractionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // buddy element ref for bounding rect
  const buddyRef = useRef<HTMLButtonElement>(null);

  // idle word timer refs
  const idleWordShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWordClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // blink timer ref
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- helpers ----
  const setResting = useCallback((expr: Expression) => {
    restingRef.current = expr;
    if (!scrollActiveRef.current) {
      setExpression(expr);
    }
  }, []);

  const clearThemeTimers = useCallback(() => {
    if (themeInteractionRef.current) {
      clearTimeout(themeInteractionRef.current);
      themeInteractionRef.current = null;
    }
  }, []);

  // ---- theme reaction ----
  useEffect(() => {
    if (reducedMotion.current) return;
    if (prevThemeRef.current === null) {
      prevThemeRef.current = theme;
      return;
    }
    if (prevThemeRef.current === theme) return;
    prevThemeRef.current = theme;

    clearThemeTimers();

    const interactionWord = theme === "dark" ? "ooh, dark" : "bright!";

    // Use setTimeout(0) so state updates happen outside the effect body
    themeInteractionRef.current = setTimeout(() => {
      setExpression("surprised");
      setWord(null);
      themeInteractionRef.current = setTimeout(() => {
        setExpression("happy");
        setWord(interactionWord);
        themeInteractionRef.current = setTimeout(() => {
          setExpression(restingRef.current);
          setWord(null);
        }, 900);
      }, 250);
    }, 0);
  }, [theme, clearThemeTimers]);

  // ---- cursor tracking ----
  useEffect(() => {
    if (reducedMotion.current) return;

    const onMouseMove = (e: MouseEvent) => {
      lastMouseEventRef.current = { x: e.clientX, y: e.clientY };
      if (!rafPendingMouseRef.current) {
        rafPendingMouseRef.current = true;
        requestAnimationFrame(() => {
          rafPendingMouseRef.current = false;
          if (scrollActiveRef.current) return;
          const ev = lastMouseEventRef.current;
          if (!ev || !buddyRef.current) return;
          const rect = buddyRef.current.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = ev.x - cx;
          const dy = ev.y - cy;
          if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
            setResting("rest");
            return;
          }
          if (Math.abs(dx) > Math.abs(dy)) {
            setResting(dx > 0 ? "right" : "left");
          } else {
            setResting(dy > 0 ? "down" : "up");
          }
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [setResting]);

  // ---- scroll reaction ----
  useEffect(() => {
    if (reducedMotion.current) return;

    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;

    const onScroll = () => {
      if (!rafPendingScrollRef.current) {
        rafPendingScrollRef.current = true;
        requestAnimationFrame(() => {
          rafPendingScrollRef.current = false;
          const current = window.scrollY;
          const delta = current - lastScrollYRef.current;
          lastScrollYRef.current = current;

          scrollActiveRef.current = true;
          setExpression(delta > 0 ? "down" : "up");

          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            scrollActiveRef.current = false;
            setExpression(restingRef.current);
          }, 150);
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // ---- blink loop ----
  useEffect(() => {
    if (reducedMotion.current) return;

    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 2000;
      blinkTimerRef.current = setTimeout(() => {
        // only blink when nothing else is overriding
        if (!scrollActiveRef.current) {
          setExpression("blink");
          blinkTimerRef.current = setTimeout(() => {
            setExpression(restingRef.current);
            scheduleBlink();
          }, 140);
        } else {
          scheduleBlink();
        }
      }, delay);
    };

    scheduleBlink();

    return () => {
      const bt = blinkTimerRef.current;
      if (bt) clearTimeout(bt);
    };
  }, []);

  // ---- idle word loop ----
  useEffect(() => {
    if (reducedMotion.current) return;

    const pool = variant === "full" ? IDLE_WORDS_FOOTER : IDLE_WORDS;

    const scheduleWord = () => {
      const delay = 8000 + Math.random() * 6000;
      idleWordShowTimerRef.current = setTimeout(() => {
        setWord(pickRandom(pool));
        idleWordClearTimerRef.current = setTimeout(() => {
          setWord(null);
          scheduleWord();
        }, 3000);
      }, delay);
    };

    scheduleWord();

    return () => {
      if (idleWordShowTimerRef.current) clearTimeout(idleWordShowTimerRef.current);
      if (idleWordClearTimerRef.current) clearTimeout(idleWordClearTimerRef.current);
    };
  }, [variant]);

  // ---- click handler ----
  const handleClick = useCallback(() => {
    clearThemeTimers();

    const w = INTERACTION_WORDS_CLICK[clickWordIndexRef.current % INTERACTION_WORDS_CLICK.length];
    clickWordIndexRef.current += 1;

    setExpression("surprised");
    setWord(null);

    if (!reducedMotion.current) {
      setBouncing(true);
      setTimeout(() => {
        setExpression("happy");
        setWord(w);
        setBouncing(false);
        setTimeout(() => {
          setExpression(restingRef.current);
          setWord(null);
        }, 900);
      }, 120);
    } else {
      setExpression("happy");
      setWord(w);
    }
  }, [clearThemeTimers]);

  // ---- render ----
  const face = GLYPHS[expression];
  const variantClass = variant === "full" ? "buddy buddy--full" : "buddy buddy--mini";
  const cls = [variantClass, bouncing ? "buddy--bounce" : "", className ?? ""].filter(Boolean).join(" ");

  // words with trailing ellipsis for "thinking"/"reading"-type words
  const ellipsisWords = new Set(["thinking", "reading", "shipping", "idle"]);
  const displayWord = word
    ? ellipsisWords.has(word)
      ? `${word}…`
      : word
    : null;

  return (
    <button
      ref={buddyRef}
      type="button"
      className={cls}
      onClick={handleClick}
      aria-hidden="true"
      tabIndex={0}
    >
      <span className="buddy-prompt">❯ </span>
      <span className="buddy-face">{face}</span>
      {displayWord && (
        <span className="buddy-word">{displayWord}</span>
      )}
    </button>
  );
}
