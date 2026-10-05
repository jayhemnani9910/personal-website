"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// ---- expression glyph map ----
type Expression = "rest" | "blink" | "left" | "right" | "up" | "down" | "surprised" | "happy";

// Two individual eye chars per expression, kept
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
  className?: string;
}

export function Buddy({ className }: BuddyProps) {
  const { theme } = useTheme();

  // ---- reduced motion preference (SSR-safe, reacts to live changes) ----
  const prefersReducedMotion = usePrefersReducedMotion();

  // ---- state ----
  const [expression, setExpression] = useState<Expression>("rest");
  const [word, setWord] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [idleFrame, setIdleFrame] = useState(0); // 0 = Frame A, 1 = Frame B
  const [hovered, setHovered] = useState(false);

  // resting expression: what blink/idle return to (cursor+scroll update this)
  const restingRef = useRef<Expression>("rest");
  // track scroll position
  const lastScrollYRef = useRef(0);
  // scroll settle timer
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // whether scroll is currently driving the expression
  const scrollActiveRef = useRef(false);
  // whether a click or theme reaction is showing: cursor, scroll and blink then
  // leave the visible face alone until the reaction's last step clears it
  const reactingRef = useRef(false);

  // rAF gate refs
  const rafPendingMouseRef = useRef(false);
  const rafPendingScrollRef = useRef(false);
  const lastMouseEventRef = useRef<{ x: number; y: number } | null>(null);

  // click word cycling
  const clickWordIndexRef = useRef(0);

  // theme reaction: skip first mount
  const prevThemeRef = useRef<string | null>(null);
  const themeInteractionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // the click reaction's pending step, so a second click restarts the sequence
  // instead of the first click's reset cutting the second one short
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // buddy element ref for bounding rect
  const buddyRef = useRef<HTMLDivElement>(null);

  // ---- helpers ----
  const setResting = useCallback((expr: Expression) => {
    restingRef.current = expr;
    if (!scrollActiveRef.current && !reactingRef.current) {
      setExpression(expr);
    }
  }, []);

  const clearThemeTimers = useCallback(() => {
    if (themeInteractionRef.current) {
      clearTimeout(themeInteractionRef.current);
      themeInteractionRef.current = null;
      // a theme reaction cut short never reaches the step that clears this
      reactingRef.current = false;
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
      reactingRef.current = true;
      setExpression("surprised");
      setWord(null);
      themeInteractionRef.current = setTimeout(() => {
        setExpression("happy");
        setWord(interactionWord);
        themeInteractionRef.current = setTimeout(() => {
          reactingRef.current = false;
          setExpression(restingRef.current);
          setWord(null);
        }, 900);
      }, 250);
    }, 0);

    return clearThemeTimers;
  }, [theme, clearThemeTimers, prefersReducedMotion]);

  // ---- unmount: no reaction step may fire after Buddy is gone ----
  useEffect(() => {
    const clickTimer = clickTimerRef;
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

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
          if (!reactingRef.current) setExpression(delta > 0 ? "down" : "up");

          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
          scrollTimerRef.current = setTimeout(() => {
            scrollActiveRef.current = false;
            if (!reactingRef.current) setExpression(restingRef.current);
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

    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 2000;
      timer = setTimeout(() => {
        if (!scrollActiveRef.current && !reactingRef.current) {
          setExpression("blink");
          timer = setTimeout(() => {
            if (!reactingRef.current) setExpression(restingRef.current);
            scheduleBlink();
          }, 140);
        } else {
          scheduleBlink();
        }
      }, delay);
    };

    scheduleBlink();

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // ---- idle word loop ----
  useEffect(() => {
    if (prefersReducedMotion) return;

    let showTimer: ReturnType<typeof setTimeout>;
    let clearTimer: ReturnType<typeof setTimeout>;
    const scheduleWord = () => {
      const delay = 8000 + Math.random() * 6000;
      showTimer = setTimeout(() => {
        setWord(pickRandom(IDLE_WORDS));
        clearTimer = setTimeout(() => {
          setWord(null);
          scheduleWord();
        }, 3000);
      }, delay);
    };

    scheduleWord();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(clearTimer);
    };
  }, [prefersReducedMotion]);

  // ---- idle frame cycle ----
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIdleFrame((f) => (f === 0 ? 1 : 0));
    }, 600);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // ---- click handler ----
  const handleClick = useCallback(() => {
    clearThemeTimers();
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    const w = INTERACTION_WORDS_CLICK[clickWordIndexRef.current % INTERACTION_WORDS_CLICK.length];
    clickWordIndexRef.current += 1;

    const settle = () => {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        reactingRef.current = false;
        setExpression(restingRef.current);
        setWord(null);
      }, 900);
    };

    reactingRef.current = true;
    setExpression("surprised");
    setWord(null);

    if (!prefersReducedMotion) {
      // The bounce class comes off on animationend (see the div below), not
      // here: removing it at 120 ms cut the 280 ms bounce off mid-flight.
      setBouncing(true);
      clickTimerRef.current = setTimeout(() => {
        setExpression("happy");
        setWord(w);
        settle();
      }, 120);
    } else {
      // Still goes back to rest after the same beat. That is a state change,
      // not motion, and nothing else would reset it: every idle loop is off
      // under reduced motion.
      setExpression("happy");
      setWord(w);
      settle();
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
  // A click runs surprised -> happy -> rest with a word, and that sequence has
  // to survive hovering, since you have to be on him to click him. So a
  // reaction wins; hover only supplies a face when nothing else is happening.
  const isReacting = expression === "surprised" || expression === "happy";
  const shown: Expression = isReacting ? expression : hovered ? "happy" : expression;
  const [eye1, eye2] = EYE_CHARS[shown];
  // The eyes are the one part that carries a hue. Yellow at rest, green while
  // he is reacting to something real (a click or a theme change). Both are
  // classes rather than inline styles so the hover rules in globals.css can
  // reach the rest of the sprite without being outranked.
  const eyeClass = isReacting ? "buddy-eye buddy-eye--reacting" : "buddy-eye";

  const cls = ["buddy buddy--full", bouncing ? "buddy--bounce" : "", className ?? ""].filter(Boolean).join(" ");

  // words with trailing ellipsis for "thinking"/"reading"-type words
  const ellipsisWords = new Set(["thinking", "reading", "shipping", "idle"]);
  const displayWord = word
    ? ellipsisWords.has(word)
      ? `${word}…`
      : word
    : null;

  const frame = prefersReducedMotion ? IDLE_FRAMES[0] : IDLE_FRAMES[idleFrame];
  const bubble = displayWord ? buildBubble(displayWord) : null;

  // `data-cursor` is the text printed in the cursor chip, so it cannot double
  // as the kind key: "LABEL" is what the comp calls this ring, and it would
  // have shown up on screen as the word LABEL. `data-cursor-kind` picks the
  // ring directly, which is the 48px accent one drawn for exactly this sprite.
  return (
    <div
      ref={buddyRef}
      className={cls}
      onClick={handleClick}
      onAnimationEnd={(e) => {
        if (e.animationName === "buddy-bounce") setBouncing(false);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor="POKE"
      data-cursor-kind="buddy"
      aria-hidden="true"
    >
      <span className="buddy-art">
        {bubble && (
          <>
            {bubble}
            {"\n"}
          </>
        )}
        {" .---. "}
        {"\n"}
        {" |"}
        <span className={eyeClass}>{eye1}</span>
        {" "}
        <span className={eyeClass}>{eye2}</span>
        {"| "}
        {"\n"}
        {/* Arms and legs sit one neutral tier below the head, so the sprite
            reads as a shape instead of an even block of glyphs. */}
        <span className="buddy-limbs">{frame.arms}</span>
        {"\n"}
        <span className="buddy-limbs">{frame.legs}</span>
      </span>
    </div>
  );
}
