"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { useState, type MouseEvent } from "react";
import type { NavItem } from "@/data/home";
import { useTheme } from "@/context/ThemeContext";
import { ThemeGlyph } from "@/components/ThemeGlyph";
import { useTerminal } from "@/context/TerminalContext";
import { scrollToTarget } from "@/lib/scroll";
import { useScrollState } from "./useScrollState";

type Pill = { x: number; w: number } | null;

const ROW_CLASS =
  "block leading-5 transition-transform duration-[450ms] ease-[var(--tr-ease)] group-hover:-translate-y-5";

export function HomeHeader({ nav }: { nav: NavItem[] }) {
  const { scrolled, progress } = useScrollState();
  const { toggleTheme } = useTheme();
  const { toggleTerminal } = useTerminal();
  const lenis = useLenis();
  const [pill, setPill] = useState<Pill>(null);

  const jump = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(href, lenis);
  };

  const handlePillEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const navEl = e.currentTarget.closest("nav");
    if (!navEl) return;
    const navRect = navEl.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();
    setPill({ x: rect.left - navRect.left, w: rect.width });
  };

  return (
    <header
      className="sticky top-0 z-[var(--tr-z-masthead)] backdrop-blur-[14px]"
      style={{ background: "color-mix(in srgb, var(--tr-bg) 82%, transparent)" }}
    >
      <div
        className={`mx-auto flex min-w-0 max-w-[1280px] items-center justify-between gap-4 px-[clamp(1rem,4vw,2rem)] transition-[height] duration-[400ms] ease-[var(--tr-ease)] ${
          scrolled ? "h-12" : "h-[60px]"
        }`}
      >
        <a
          href="#brief"
          onClick={jump("#brief")}
          className="group relative block h-5 min-w-[11ch] overflow-hidden text-[13px] font-semibold tracking-[-.01em] text-tr-text"
        >
          <span className={ROW_CLASS}>Jay Hemnani</span>
          <span className={`${ROW_CLASS} font-mono font-normal text-tr-accent`}>
            jay@hemnani ~{" "}
            <span aria-hidden="true" className="animate-[v4-caret_1s_steps(1)_infinite]">
              ▌
            </span>
          </span>
        </a>

        <nav
          className="relative hidden items-center gap-1 text-[13px] sm:flex"
          onMouseLeave={() => setPill(null)}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 rounded-full bg-tr-surface-2 transition-[left,width,opacity] duration-[350ms] ease-[var(--tr-ease)]"
            style={{ left: pill ? `${pill.x}px` : "0px", width: pill ? `${pill.w}px` : "0px", opacity: pill ? 1 : 0 }}
          />
          {nav.map((item) => {
            const isHash = item.href.startsWith("#");
            const linkClass =
              "group relative z-[1] block h-[30px] overflow-hidden px-[.8rem] text-tr-text-mute hover:text-tr-text";
            const lines = (
              <>
                <span className="block leading-[30px] transition-transform duration-[400ms] ease-[var(--tr-ease)] group-hover:-translate-y-[30px]">
                  {item.label}
                </span>
                <span className="block font-mono text-[11px] leading-[30px] tracking-[.06em] text-tr-accent transition-transform duration-[400ms] ease-[var(--tr-ease)] group-hover:-translate-y-[30px]">
                  {item.alt}
                </span>
              </>
            );
            return isHash ? (
              <a key={item.href} href={item.href} onClick={jump(item.href)} onMouseEnter={handlePillEnter} data-cursor="JUMP" className={linkClass}>
                {lines}
              </a>
            ) : (
              <Link key={item.href} href={item.href} onMouseEnter={handlePillEnter} data-cursor="JUMP" className={linkClass}>
                {lines}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            data-cursor="RUN"
            onClick={toggleTerminal}
            className="inline-flex h-[30px] items-center gap-2 rounded-[var(--tr-r-md)] border border-tr-hairline px-[.7rem] text-tr-text-mute transition-colors hover:border-tr-accent hover:text-tr-text"
          >
            shell <kbd className="rounded border border-tr-hairline px-1 text-tr-text-faint">`</kbd>
          </button>
          <button
            type="button"
            aria-label="Toggle theme"
            data-cursor="FLIP"
            onClick={toggleTheme}
            className="h-[30px] w-[30px] rounded-[var(--tr-r-md)] border border-tr-hairline text-tr-text-mute transition-[transform,color,border-color] duration-500 ease-[var(--tr-ease)] hover:border-tr-accent hover:text-tr-text [[data-theme=light]_&]:rotate-180"
          >
            <ThemeGlyph />
          </button>
        </div>
      </div>
      <div aria-hidden="true" className="relative h-px bg-tr-hairline">
        <span
          className="absolute top-0 left-0 h-px bg-tr-accent transition-[width] duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </header>
  );
}
