"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { ThemeGlyph } from "@/components/ThemeGlyph";

// The chrome every route except the home page wears, taken from the v4 design
// screens (docs/design: Work Index, Writing, About, Channel and Project Detail
// all carry this identical header). The home page keeps its own taller,
// animated HomeHeader, which is part of that page's staging.
//
// Four destinations, matching the design. /fde and /lab stay live and reachable
// by URL but are not linked here (ADR 0014, decision D3).
const NAV: { label: string; href: Route }[] = [
  { label: "Work", href: "/projects" },
  { label: "Writing", href: "/blog" },
  { label: "About", href: "/resume" },
  { label: "Channel", href: "/youtube" },
];

const MONO = "font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)]";

// Driven by the attribute rather than by state, for the same reason ThemeGlyph
// is: the server cannot know the theme, so a state-driven transform mismatched
// on hydration for every light-theme visitor.
const ROTATE_IN_LIGHT = "[[data-theme=light]_&]:rotate-180";

/** `meta` is the page's own count line, shown to the left of the theme toggle. */
export function SiteHeader({ meta }: { meta?: string }) {
  const pathname = usePathname();
  const { toggleTheme } = useTheme();

  // usePathname is typed as string but returns null outside an app-router
  // context, which is how every component test renders this. Nothing is
  // current in that case, rather than throwing.
  const isActive = (href: string) =>
    pathname != null && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className="sticky top-0 z-[var(--tr-z-masthead)] border-b border-tr-hairline backdrop-blur-[14px]"
      style={{ background: "color-mix(in srgb, var(--tr-bg) 86%, transparent)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-[clamp(1rem,4vw,2rem)]">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
          <Link href="/" data-cursor="OPEN" className="font-semibold tracking-[-.01em]">
            Jay Hemnani
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="OPEN"
              aria-current={isActive(item.href) ? "page" : undefined}
              className={
                isActive(item.href)
                  ? "border-b border-tr-accent pb-px text-tr-text"
                  : "text-tr-text-mute hover:text-tr-text"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={`flex shrink-0 items-center gap-2 ${MONO}`}>
          {meta && <span className="hidden text-tr-text-faint sm:inline">{meta}</span>}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-cursor="FLIP"
            className={`h-[30px] w-[30px] rounded-[var(--tr-r-md)] border border-tr-hairline text-tr-text-mute transition-[transform,color,border-color] duration-500 ease-[var(--tr-ease)] hover:border-tr-accent hover:text-tr-text ${ROTATE_IN_LIGHT}`}
          >
            <ThemeGlyph />
          </button>
        </div>
      </div>
    </header>
  );
}
