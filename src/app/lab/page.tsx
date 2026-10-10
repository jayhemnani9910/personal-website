import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_CONFIG } from "@/../content/site";
import { BTN, H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";
import { LabTabs } from "./LabTabs";

export const metadata: Metadata = pageMetadata({
  title: "Lab",
  description:
    "Things Jay Hemnani is building, exploring, and keeping an eye on. Half-finished on purpose, shown anyway.",
  path: "/lab",
});

export default function LabPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        {/* ========== INTRO ========== */}
        <section className={`${WRAP} ${SHELL} grid items-end gap-[clamp(2rem,5vw,5rem)] pb-8 pt-[clamp(40px,6vw,72px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <p className={`${KICKER} mb-4`}>/lab · experiments</p>
            <h1 className={H1}>
              Half-finished, <span className={HIGHLIGHT}>on purpose.</span>
            </h1>
          </div>
          <p className={`${LEDE} max-w-[56ch]`}>
            Things I am building, exploring, and keeping an eye on. Shown as they actually stand, not
            cleaned up for the visit.
          </p>
        </section>

        {/* ========== TABS + PANELS ========== */}
        <LabTabs />

        {/* ========== COLLABORATE ========== */}
        <section className={`${WRAP} ${SHELL} pb-[clamp(4rem,8vw,6rem)]`}>
          <div className="flex max-w-[620px] -rotate-1 flex-col items-start gap-4 rounded-[20px] border-[1.5px] border-tr-hairline bg-tr-butter p-[clamp(22px,3vw,32px)]">
            <h2 className="font-hand text-[30px] font-normal leading-[var(--tr-lh-hand)] tracking-normal">
              want to build something half-finished together?
            </h2>
            <p className="text-[17px] leading-[var(--tr-lh-body)] text-tr-text-mute">
              Always open to interesting projects and ideas.
            </p>
            <a href={`mailto:${SITE_CONFIG.social.email}`} className={`${BTN} font-mono text-[14px]`}>
              {SITE_CONFIG.social.email} <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
