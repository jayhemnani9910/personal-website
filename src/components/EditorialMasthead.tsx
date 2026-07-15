"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";

type Section = "cover" | "work" | "writing" | "about" | "fde";

// `as const` keeps each href a string literal (e.g. "/projects") rather than
// widened to `string`, which next.config.ts's typedRoutes requires for <Link>.
const NAV_LINKS = [
  { href: "/", label: "Cover", section: "cover" },
  { href: "/projects", label: "Work", section: "work" },
  { href: "/blog", label: "Writing", section: "writing" },
  { href: "/resume", label: "About", section: "about" },
  { href: "/fde", label: "FDE", section: "fde" },
] as const;

const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const HEADER_PAD = "px-[clamp(1.25rem,5vw,2rem)] py-[1.1rem]";

// The mockup's ambient dot pulse (2.6s) isn't itself a motion-tokens.ts value,
// so it's derived from DUR.slow (the token nearest in spirit: a slow, settled
// motion) rather than a bare literal.
const MCP_DOT_DURATION = DUR.slow * 4;

// framer-motion's `ease` wants an exact 4-tuple, not the `number[]` a spread
// of EASE widens to, so re-tuple it here off the same token values.
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

export function EditorialMasthead({ active }: { active?: Section }) {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const indexButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Focus is NOT restored here on purpose. The Index button lives inside
    // headerInnerRef, which is `inert` while the overlay is open, and an inert
    // subtree cannot take focus, so calling .focus() at this point is silently
    // ignored and focus falls to <body>. The restore happens in the effect
    // cleanup below, after `inert` is lifted.
  }, []);

  // Focus trap + Escape-to-close for the mobile overlay, kept entirely local
  // to this component. TerminalOverlay is getting its own trap from another
  // agent right now, and the two must not share code.
  useEffect(() => {
    if (!menuOpen) return;

    // Captured now, not re-read in the cleanup below: by the time cleanup
    // runs the ref could in principle point elsewhere, so the node to
    // restore focus to is pinned at the moment the overlay actually opens.
    const indexButton = indexButtonRef.current;

    const getFocusable = () =>
      Array.from(overlayRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);

    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The full-screen overlay visually covers two things: the collapsed
    // header row it renders alongside (same <header>, so not reachable via
    // the Tab trap above, which only walks the overlay's own subtree), and
    // the rest of the page (every other page nests <EditorialMasthead> as
    // <main>'s first child, so the header's siblings are the actual page
    // content). `inert` removes both from the accessibility tree and focus
    // order, so a screen reader's virtual cursor can't wander into content
    // that's covered on screen, on top of what the Tab trap already blocks.
    const inertTargets: HTMLElement[] = [];
    if (headerInnerRef.current) inertTargets.push(headerInnerRef.current);
    const mainEl = headerRef.current?.parentElement;
    if (mainEl) {
      Array.from(mainEl.children).forEach((el) => {
        if (el !== headerRef.current && el instanceof HTMLElement) inertTargets.push(el);
      });
    }
    inertTargets.forEach((el) => {
      el.inert = true;
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      inertTargets.forEach((el) => {
        el.inert = false;
      });
      // Un-inert FIRST (above), THEN restore focus. Order is load-bearing:
      // focusing the Index button while its subtree is still inert is a no-op,
      // and focus silently falls to <body>, stranding the keyboard user who
      // just pressed Escape. On unmount indexButton is null and this no-ops.
      indexButton?.focus();
    };
  }, [menuOpen, closeMenu]);

  const overlayContent = (
    <>
      <div className={`flex items-center justify-between ${HEADER_PAD}`}>
        <Link
          href="/"
          onClick={closeMenu}
          className="text-[.8125rem] uppercase text-tr-text no-underline"
          style={mono}
        >
          Jay Hemnani
        </Link>
        <button
          type="button"
          ref={closeButtonRef}
          onClick={closeMenu}
          className="text-[.75rem] uppercase text-tr-text-mute"
          style={mono}
        >
          Close
        </button>
      </div>

      <nav
        aria-label="Primary"
        className="flex flex-1 flex-col justify-center overflow-y-auto px-[clamp(1.25rem,5vw,2rem)]"
      >
        {NAV_LINKS.map(({ href, label, section }, i) => (
          <Link
            key={href}
            href={href}
            onClick={closeMenu}
            className={`flex items-baseline gap-[var(--tr-s-4)] border-t border-tr-hairline py-[var(--tr-s-4)] no-underline first:border-t-0 ${
              active === section ? "text-tr-ember" : "text-tr-text"
            }`}
          >
            <span className="text-[.75rem] text-tr-text-mute" style={mono}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[length:var(--tr-t-h2)] leading-none" style={serif}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[var(--tr-z-masthead)] border-b border-transparent transition-[border-color,background-color] duration-[var(--tr-dur-base)] ease-[var(--tr-ease)]"
      style={{
        borderBottomColor: scrolled ? "var(--tr-hairline)" : "transparent",
        backgroundColor: scrolled ? "color-mix(in srgb, var(--tr-bg) 84%, transparent)" : "transparent",
      }}
    >
      <div
        ref={headerInnerRef}
        className={`mx-auto flex max-w-[1400px] items-center justify-between gap-[var(--tr-s-4)] ${HEADER_PAD}`}
      >
        <Link href="/" className="text-[.8125rem] uppercase text-tr-text no-underline" style={mono}>
          Jay Hemnani
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-[var(--tr-s-5)]">
          <div className="hidden items-center gap-[var(--tr-s-5)] sm:flex">
            {NAV_LINKS.map(({ href, label, section }) => (
              <Link
                key={href}
                href={href}
                className={`text-[.75rem] uppercase no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  active === section ? "text-tr-text" : "text-tr-text-mute hover:text-tr-text"
                }`}
                style={mono}
              >
                {label}
              </Link>
            ))}
          </div>

          <span
            className="hidden items-center gap-2 whitespace-nowrap text-[.6875rem] uppercase text-tr-text-mute sm:flex"
            style={mono}
          >
            <m.span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-tr-ember shadow-[var(--tr-glow-box)]"
              animate={prefersReducedMotion ? undefined : { opacity: [1, 0.35, 1] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: MCP_DOT_DURATION, repeat: Infinity, ease: CUBIC_EASE }
              }
            />
            MCP: 8 tools
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="relative h-5 w-9 shrink-0 rounded-full border border-tr-hairline p-0.5"
          >
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full bg-tr-ember transition-[left] duration-[var(--tr-dur-base)] ease-[var(--tr-ease)]"
              style={{ left: theme === "light" ? "calc(100% - 15px)" : "2px" }}
            />
          </button>

          <button
            type="button"
            ref={indexButtonRef}
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-overlay"
            className="text-[.75rem] uppercase text-tr-text sm:hidden"
            style={mono}
          >
            Index
          </button>
        </nav>
      </div>

      {prefersReducedMotion ? (
        menuOpen && (
          <div
            id="mobile-nav-overlay"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[var(--tr-z-overlay)] flex flex-col bg-tr-bg sm:hidden"
          >
            {overlayContent}
          </div>
        )
      ) : (
        <AnimatePresence>
          {menuOpen && (
            <m.div
              id="mobile-nav-overlay"
              ref={overlayRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="fixed inset-0 z-[var(--tr-z-overlay)] flex flex-col bg-tr-bg sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: CUBIC_EASE }}
            >
              {overlayContent}
            </m.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
