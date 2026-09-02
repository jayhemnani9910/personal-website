import Link from "next/link";
import type { CSSProperties } from "react";
import { Buddy } from "@/components/Buddy";

// `as const` keeps each href a string literal rather than widened to
// `string`, which next.config.ts's typedRoutes requires for <Link>.
const INSIDE_LINKS = [
  { href: "/", label: "Cover" },
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "About" },
] as const;

const ELSEWHERE_LINKS = [
  { href: "https://github.com/jayhemnani9910", label: "GitHub" },
  { href: "https://linkedin.com/in/jayhemnani", label: "LinkedIn" },
  { href: "https://x.com/jeyhemnani9", label: "Twitter" },
  { href: "https://youtube.com/@jayhemnani", label: "YouTube" },
];

const mono: CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: ".08em",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-instrument)",
};

const linkClass =
  "block w-fit border-b border-transparent py-1 text-[13px] text-tr-text no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember hover:text-tr-ember";

// A visual group label, not a document heading: there is no <h3> above these
// in the outline, so a real <h4> here fails Lighthouse's heading-order check.
const labelClass = "mb-[var(--tr-s-3)] text-[.625rem] uppercase text-tr-text-mute";

export function EditorialColophon() {
  return (
    <footer className="border-t border-tr-hairline bg-tr-surface-1">
      <div className="mx-auto grid max-w-[1400px] gap-[var(--tr-s-8)] px-[clamp(1.25rem,5vw,2rem)] py-[var(--tr-s-10)] sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="max-w-[28ch] text-[1.0625rem] italic leading-relaxed text-tr-text-mute" style={serif}>
            A personal portfolio,
            <br />
            set in Newsreader and JetBrains Mono.
          </p>
        </div>

        <nav aria-label="Site">
          <p className={labelClass} style={mono}>Inside</p>
          {INSIDE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Elsewhere">
          <p className={labelClass} style={mono}>Elsewhere</p>
          {ELSEWHERE_LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkClass}>
              {l.label}
            </a>
          ))}
        </nav>

        <div>
          <p className={labelClass} style={mono}>Imprint</p>
          <a href="mailto:jayhemnani992000@gmail.com" className={linkClass}>
            jayhemnani992000@<wbr />gmail.com
          </a>
          <span className="block py-1 text-[13px] text-tr-text-faint">Gujarat, India</span>
        </div>
      </div>

      {/* Buddy is decorative and aria-hidden, so it stays out of the tab order
          and the accessibility tree. It is an ASCII face, so it belongs to the
          mono channel: --tr-text-mute at rest, with ember only on its eyes and
          only while it is actually reacting. */}
      <div className="flex justify-center pb-[var(--tr-s-6)] text-tr-text-mute">
        <Buddy variant="full" />
      </div>

      <div className="border-t border-tr-hairline px-[clamp(1.25rem,5vw,2rem)] py-[var(--tr-s-4)]">
        <span className="text-[.625rem] uppercase text-tr-text-faint" style={mono}>
          © 2026 Jay Hemnani · All rights reserved, most reserved gently.
        </span>
      </div>
    </footer>
  );
}
