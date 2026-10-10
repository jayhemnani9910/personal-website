import Link from "next/link";
import type { Route } from "next";
import { SITE_CONFIG } from "@/../content/site";
import { SHELL, WRAP } from "@/components/desk";
import { ReaderToggle } from "./ReaderToggle";

const LINKS: { label: string; href: Route }[] = [
  { label: "home", href: "/" },
  { label: "work", href: "/projects" },
  { label: "writing", href: "/blog" },
  { label: "about", href: "/resume" },
  { label: "channel", href: "/youtube" },
];

// The small sibling of the home page's contact band, so leaving / and coming
// back feels like one site. Every route but the home page uses it.
export function SiteFooter() {
  return (
    <footer className="ink-panel bg-tr-text text-tr-on-ink">
      <div className={`${WRAP} ${SHELL} py-7`}>
        <Link
          href={"/#hi" as Route}
          className="inline-block -rotate-2 font-hand text-[26px] text-tr-butter hover:text-tr-butter hover:underline"
        >
          that&apos;s the page. got a vague brief? →
        </Link>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[12px] text-tr-on-ink-faint">
          <span>{SITE_CONFIG.copyright}</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ReaderToggle className="cursor-pointer hover:text-tr-butter" />
            <span aria-hidden="true">·</span>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-tr-butter">
                  {l.label}
                </Link>
              ))}
            </nav>
          </span>
        </div>
      </div>
    </footer>
  );
}
