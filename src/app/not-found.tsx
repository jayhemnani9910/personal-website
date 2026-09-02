import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const MONO = "font-[family-name:var(--ff-mono)]";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader />

      <div className="flex flex-1 items-center px-[clamp(1rem,4vw,2rem)] py-[clamp(3rem,6vw,5rem)]">
        <div className="mx-auto max-w-[1280px]">
          <p className={`mb-3 ${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
            /404 · NO ROUTE
          </p>

          <h1 className="max-w-[24ch] text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
            This page does not exist.
          </h1>

          <p className="mt-5 max-w-[42ch] text-tr-text-mute [text-wrap:pretty]">
            The link was wrong, or the page moved. Either way, nothing is here.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              data-cursor="OPEN"
              className={`tr-cta inline-flex items-center justify-center border border-transparent px-[1.5em] py-[.875em] ${MONO} text-[length:var(--tr-t-mono)] uppercase tracking-[.04em] no-underline`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              data-cursor="OPEN"
              className={`inline-flex items-center justify-center border border-tr-hairline px-[1.5em] py-[.875em] ${MONO} text-[length:var(--tr-t-mono)] uppercase tracking-[.04em] text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-text`}
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
