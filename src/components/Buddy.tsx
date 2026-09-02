"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// ---- expression glyph map ----
type Expression = "rest" | "blink" | "left" | "right" | "up" | "down" | "surprised" | "happy";

// Two individual eye chars per expression. Shared by both variants, and
// kept separate from the surrounding brackets/frame so the eyes can be
// colored independently (the one "alive" signal Buddy is allowed to carry).
const EYE_CHARS: Record<Expression, [string, string]> = {
  rest:      ["o", "o"],
  blink:     ["-", "-"],
  left:      ["<", "<"],
  right:     [">", ">"],
  up:        ["'", "'"],
  down:      [".", "."],
  surprised: ["O", "O"],
  happy:     ["^", "^"],
};

// ---- idle frame cycle (arms + legs) ----
// Frame A: arms "=|_-_|=", legs " /| |\\ "
// Frame B: arms "-|_-_|-", legs " (| |) "
const IDLE_FRAMES: Array<{ arms: string; legs: string }> = [
  { arms: "=|_-_|=", legs: " /| |\\ " },
  { arms: "-|_-_|-", legs: " (| |) " },
];

// ---- word pools ----
const IDLE_WORDS = ["idle", "reading", "still here", "hello", "shipping", "thinking"];
const IDLE_WORDS_FOOTER = [...IDLE_WORDS, "up to top"];
const INTERACTION_WORDS_CLICK = ["hi there", "press me", "^_^", "hello"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build a rounded speech bubble above the sprite.
// The sprite is 7 chars wide. The bubble is centered over it.
// Format (content padded with one space each side):
//  ╭───────╮
//  │ hello │
//  ╰───╥───╯
function buildBubble(text: string): string {
  const inner = ` ${text} `;
  const width = inner.length;       // e.g. " hello " = 7 chars
  const top    = "╭" + "─".repeat(width) + "╮";
  const mid    = "│" + inner + "│";
  const tailPos = Math.floor(width / 2); // center position in the inner content
  const bottomLeft  = "─".repeat(tailPos);
  const bottomRight = "─".repeat(width - tailPos - 1);
  const bot    = "╰" + bottomLeft + "╥" + bottomRight + "╯";
  return [top, mid, bot].join("\n");
}

interface BuddyProps {
  variant?: "mini" | "full";
  className?: string;
}

export function Buddy({ variant = "mini", className }: BuddyProps) {
  const { theme } = useTheme();

  // ---- reduced motion preference (SSR-safe, reacts to live changes) ----
  const prefersReducedMotion = usePrefersReducedMotion();

  // ---- state ----
  const [expression, setExpression] = useState<Expression>("rest");
  const [word, setWord] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [idleFrame, setIdleFrame] = useState(0); // 0 = Frame A, 1 = Frame B

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
  const buddyRef = useRef<HTMLDivElement>(null);

  // idle word timer refs
  const idleWordShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWordClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // blink timer ref
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // idle frame interval ref
  const idleFrameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (prefersReducedMotion) return;
    if (prevThemeRef.current === null) {
      prevThemeRef.current = theme;
      return;
    }
    if (prevThemeRef.current === theme) return;
    prevThemeRef.current = theme;

    clearThemeTimers();

    const interactionWord = theme === "dark" ? "ooh, dark" : "bright!";

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
  }, [theme, clearThemeTimers, prefersReducedMotion]);

  // ---- cursor tracking ----
  useEffect(() => {
    if (prefersReducedMotion) return;

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
  }, [setResting, prefersReducedMotion]);

  // ---- scroll reaction ----
  useEffect(() => {
    if (prefersReducedMotion) return;

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
  }, [prefersReducedMotion]);

  // ---- blink loop ----
  useEffect(() => {
    if (prefersReducedMotion) return;

    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 2000;
      blinkTimerRef.current = setTimeout(() => {
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
  }, [prefersReducedMotion]);

  // ---- idle word loop ----
  useEffect(() => {
    if (prefersReducedMotion) return;

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
  }, [variant, prefersReducedMotion]);

  // ---- idle frame cycle (full variant only) ----
  useEffect(() => {
    if (variant !== "full") return;
    if (prefersReducedMotion) return;

    idleFrameIntervalRef.current = setInterval(() => {
      setIdleFrame((f) => (f === 0 ? 1 : 0));
    }, 600);

    return () => {
      if (idleFrameIntervalRef.current) clearInterval(idleFrameIntervalRef.current);
    };
  }, [variant, prefersReducedMotion]);

  // ---- click handler ----
  const handleClick = useCallback(() => {
    clearThemeTimers();

    const w = INTERACTION_WORDS_CLICK[clickWordIndexRef.current % INTERACTION_WORDS_CLICK.length];
    clickWordIndexRef.current += 1;

    setExpression("surprised");
    setWord(null);

    if (!prefersReducedMotion) {
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
  }, [clearThemeTimers, prefersReducedMotion]);

  // ---- render ----
  // Buddy is decorative: clicking it triggers a small face/word reaction
  // with no outcome that matters to someone who can't see it, so it stays
  // out of the tab order and hidden from assistive tech entirely. A
  // focusable element marked aria-hidden is an invalid combination (a
  // screen-reader user could tab to a stop declared invisible to them),
  // which a <button> is even with no tabIndex set, since buttons are
  // natively focusable. Rendering a plain div instead removes that
  // implicit focusability outright; the click handler keeps working for
  // mouse users, it just leaves the tab order.
  const [eye1, eye2] = EYE_CHARS[expression];
  // The one thing allowed to take the accent: the eyes, and only while Buddy is
  // reacting to something real (a click or a theme change), never during
  // ambient cursor/scroll tracking or the idle blink loop.
  const isReacting = expression === "surprised" || expression === "happy";
  const eyeStyle = isReacting
    ? { color: "var(--tr-accent)" }
    : undefined;

  const variantClass = variant === "full" ? "buddy buddy--full" : "buddy buddy--mini";
  const cls = [variantClass, bouncing ? "buddy--bounce" : "", className ?? ""].filter(Boolean).join(" ");

  // words with trailing ellipsis for "thinking"/"reading"-type words
  const ellipsisWords = new Set(["thinking", "reading", "shipping", "idle"]);
  const displayWord = word
    ? ellipsisWords.has(word)
      ? `${word}…`
      : word
    : null;

  if (variant === "full") {
    const frame = prefersReducedMotion ? IDLE_FRAMES[0] : IDLE_FRAMES[idleFrame];
    const bubble = displayWord ? buildBubble(displayWord) : null;

    return (
      <div ref={buddyRef} className={cls} onClick={handleClick} aria-hidden="true">
        <span className="buddy-art" style={{ color: "var(--tr-text-mute)" }}>
          {bubble && (
            <>
              {bubble}
              {"\n"}
            </>
          )}
          {" .---. "}
          {"\n"}
          {" |"}
          <span style={eyeStyle}>{eye1}</span>
          {" "}
          <span style={eyeStyle}>{eye2}</span>
          {"| "}
          {"\n"}
          {frame.arms}
          {"\n"}
          {frame.legs}
        </span>
      </div>
    );
  }

  // mini variant
  return (
    <div ref={buddyRef} className={cls} onClick={handleClick} aria-hidden="true">
      <span className="buddy-prompt" style={{ color: "var(--tr-text-mute)" }}>&#10095; </span>
      <span className="buddy-face" style={{ color: "var(--tr-text-mute)" }}>
        {"["}
        <span style={eyeStyle}>{eye1}</span>
        {" "}
        <span style={eyeStyle}>{eye2}</span>
        {"]"}
      </span>
      {displayWord && (
        <span className="buddy-word" style={{ color: "var(--tr-text-mute)" }}>{displayWord}</span>
      )}
    </div>
  );
}
