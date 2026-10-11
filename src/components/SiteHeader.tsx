"use client";

import Link from "next/link";
import type { Route } from "next";
import { SHELL, SHELL_CHIP, WRAP } from "@/components/desk";
import { MainNav } from "./MainNav";
import { ShellButton } from "./ShellButton";

// The chrome every route except the home page wears. The home page has its own
// Desk nav (src/components/home-desk/DeskNav.tsx) with the secrets chip; the
// secrets live on /, so the inner pages do not count them. Both share MainNav.

/** `meta` is the page's own count line, shown on the right on wider screens. */
export function SiteHeader({ meta }: { meta?: string }) {
  return (
    <header className="sticky-bar sticky top-0 z-[var(--tr-z-masthead)] border-b-[1.5px] border-tr-hairline bg-tr-bg/92 backdrop-blur-[8px]">
      <div className={`${WRAP} ${SHELL} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5`}>
        <Link href="/" aria-label="jay.hemnani, home" className="text-[20px] font-extrabold tracking-[-0.02em] hover:text-tr-text">
          jay<span aria-hidden="true" className="text-tr-accent-hand">.</span>hemnani
        </Link>
        <MainNav />
        <div className="flex items-center gap-4 font-mono text-[13px]">
          {meta && <span className="hidden text-[12px] text-tr-text-faint lg:inline">{meta}</span>}
          <ShellButton className={SHELL_CHIP}>
            <span aria-hidden="true">&gt;_</span>
            <span className="max-sm:sr-only"> shell</span>
          </ShellButton>
          <Link href={"/#hi" as Route} className="underline">
            say hi →
          </Link>
        </div>
      </div>
    </header>
  );
}

