"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NAV } from "./nav-links";

// Where the links move up beside the logo. Below it they take a row of their
// own. The home header carries the secrets chip too, so it needs lg.
const INLINE = {
  sm: "sm:order-none sm:w-auto sm:gap-x-3",
  lg: "lg:order-none lg:w-auto lg:gap-x-3",
};

/** The page links in every header, the home page's included. */
export function MainNav({ inline = "sm" }: { inline?: keyof typeof INLINE }) {
  const pathname = usePathname();

  // usePathname is typed as string but returns null outside an app-router
  // context, which is how every component test renders this. Nothing is
  // current in that case, rather than throwing.
  const isActive = (href: string) =>
    pathname != null && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    // No gap below sm, the links' own padding spaces them: at 320px the five
    // fit one row, so the header stays two rows and the page's 100px scroll
    // padding clears it.
    <nav aria-label="Main" className={`order-last flex w-full flex-wrap gap-y-1 font-mono text-[13px] ${INLINE[inline]}`}>
      {NAV.map((item) => (
        <NavLink key={item.href} href={item.href} active={isActive(item.href)}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

// The header is in view on every load, so plain Links would prefetch all five
// pages up front: on / that took the prefetched payloads from 55 KB to 176 KB.
// Each link prefetches when a pointer or focus reaches it instead, the pattern
// the Next docs give for this, which still lands before most clicks.
function NavLink({ href, active, children }: { href: Route; active: boolean; children: ReactNode }) {
  const [warm, setWarm] = useState(false);
  const wake = () => setWarm(true);
  return (
    <Link
      href={href}
      prefetch={warm ? null : false}
      onPointerEnter={wake}
      onFocus={wake}
      aria-current={active ? "page" : undefined}
      className={active ? "rounded-[6px] bg-tr-butter px-2 py-[2px] text-tr-text hover:text-tr-text" : "px-2 py-[2px] text-tr-text hover:text-tr-accent-ink"}
    >
      {children}
    </Link>
  );
}
