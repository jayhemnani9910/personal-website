import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const mono: CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: ".08em",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-instrument)",
};

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader />

      <div className="flex flex-1 items-center px-[clamp(1.25rem,5vw,2rem)] pt-[var(--tr-s-12)] pb-[var(--tr-s-10)]">
        <div className="mx-auto max-w-[46rem]">
          <p className="mb-[var(--tr-s-4)] text-[.75rem] uppercase text-tr-text-mute" style={mono}>
            404 / No route
          </p>

          <h1
            className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[var(--tr-lh-display)] tracking-[-.02em] text-tr-text"
            style={serif}
          >
            This page does not exist.
          </h1>

          <p
            className="mb-[var(--tr-s-6)] max-w-[42ch] text-[length:var(--tr-t-body)] leading-relaxed text-tr-text-mute"
            style={serif}
          >
            The link was wrong, or the page moved. Either way, nothing is here.
          </p>

          <div className="flex flex-wrap gap-[var(--tr-s-3)]">
            <Link
              href="/"
              className="tr-cta inline-flex items-center justify-center border border-transparent px-[1.5em] py-[.875em] text-[length:var(--tr-t-mono)] uppercase no-underline"
              style={mono}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center border border-tr-hairline px-[1.5em] py-[.875em] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-text"
              style={mono}
            >
              Projects
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
