"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BTN, BTN_PRIMARY, H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";

// Any exception thrown while rendering a page lands here instead of Next's
// default screen, which is off-design and offers only "Reload". Same shape as
// the 404 page, with a retry that re-renders the segment. No site header or
// footer: this module loads with every page, so it stays small.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <main id="main-content" className="flex flex-1 flex-col">
        <div className={`${WRAP} ${SHELL} flex min-h-[60vh] w-full flex-col justify-center py-[clamp(48px,8vw,96px)]`}>
          <p className={KICKER}>/error · something broke</p>

          <h1 className={`${H1} mt-3`}>
            That one&apos;s on me. <span className={HIGHLIGHT}>Not you.</span>
          </h1>

          <p className={`${LEDE} mt-6 max-w-[42ch]`}>
            Something on this page failed while it loaded. Try it again, or head somewhere that works.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => retry()} className={`${BTN_PRIMARY} cursor-pointer`}>
              try again
            </button>
            <Link href="/" className={BTN}>
              home <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
