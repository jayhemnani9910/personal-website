import Link from "next/link";
import { SITE_CONFIG } from "@/../content/site";

// The footer the v4 design screens carry: one rule, one surface, a copyright
// and a way back. The home page has its own slimmer copyright and back-to-top
// bar; this is the version every other route uses.
export function SiteFooter() {
  return (
    <footer className="border-t border-tr-hairline bg-tr-surface-1">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 px-[clamp(1rem,4vw,2rem)] py-6 font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] text-tr-text-faint">
        <span>{SITE_CONFIG.copyright}</span>
        <Link href="/" data-cursor="OPEN" className="hover:text-tr-accent">
          ← home
        </Link>
      </div>
    </footer>
  );
}
