"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { SHELL, WRAP } from "@/components/desk";

// The chrome every route except the home page wears. The home page has its own
// Desk nav (src/components/home-desk/DeskNav.tsx) with the secrets chip; the
// secrets live on /, so the inner pages do not count them.
//
// Four destinations. /fde and /lab stay live and reachable by URL but are not
// linked here (ADR 0014, decision D3).
const NAV: { label: string; href: Route }[] = [
  { label: "work", href: "/projects" },
  { label: "writing", href: "/blog" },
  { label: "about", href: "/resume" },
  { label: "channel", href: "/youtube" },
];

/** `meta` is the page's own count line, shown on the right on wider screens. */
export function SiteHeader({ meta }: { meta?: string }) {
  const pathname = usePathname();

  // usePathname is typed as string but returns null outside an app-router
  // context, which is how every component test renders this. Nothing is
  // current in that case, rather than throwing.
  const isActive = (href: string) =>
    pathname != null && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky-bar sticky top-0 z-[var(--tr-z-masthead)] border-b-[1.5px] border-tr-hairline bg-tr-bg/92 backdrop-blur-[8px]">
      <div className={`${WRAP} ${SHELL} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5`}>
        <Link href="/" aria-label="jay.hemnani, home" className="text-[20px] font-extrabold tracking-[-0.02em] hover:text-tr-text">
          jay<span aria-hidden="true" className="text-tr-accent-hand">.</span>hemnani
        </Link>
        {/* gap-x-3 below sm: at 320px the four links fit one row, so the header
            stays two rows (91px) and the page's 100px scroll padding clears it. */}
        <nav aria-label="Main" className="order-last flex w-full flex-wrap gap-x-3 gap-y-1 font-mono text-[13px] sm:order-none sm:w-auto sm:gap-x-5">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? "rounded-[6px] bg-tr-butter px-2 py-[2px] text-tr-text hover:text-tr-text" : "px-2 py-[2px] text-tr-text hover:text-tr-accent-ink"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 font-mono text-[13px]">
          {meta && <span className="hidden text-[12px] text-tr-text-faint lg:inline">{meta}</span>}
          <Link href={"/#hi" as Route} className="underline">
            say hi →
          </Link>
        </div>
      </div>
    </header>
  );
}
