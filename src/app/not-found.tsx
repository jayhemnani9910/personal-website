import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BTN, BTN_PRIMARY, H1, HAND, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";

// robots: null drops the layout's "index, follow" and googlebot tags. Next
// adds its own noindex to a 404, so the page carries exactly that one.
export const metadata: Metadata = {
  title: "Page not found",
  robots: null,
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        <div className={`${WRAP} ${SHELL} flex min-h-[60vh] w-full flex-col justify-center py-[clamp(48px,8vw,96px)]`}>
          <p className={KICKER}>/404 · no route</p>

          <h1 className={`${H1} mt-3`}>
            Nothing here. I <span className={HIGHLIGHT}>checked twice.</span>
          </h1>

          <p className={`${LEDE} mt-6 max-w-[42ch]`}>
            The link was wrong, or the page moved. Two ways out below.
          </p>

          <p className={`${HAND} mt-4 max-w-[720px] -rotate-1 [text-wrap:balance]`}>
            (the throwable tiles are on the home page, if that&apos;s what you came for)
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={BTN_PRIMARY}>
              <span aria-hidden="true">←</span> home
            </Link>
            <Link href="/projects" className={BTN}>
              the work <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
