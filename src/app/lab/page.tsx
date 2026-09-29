import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_CONFIG } from "@/../content/site";
import { LabTabs } from "./LabTabs";

const MONO = "font-[family-name:var(--ff-mono)]";
const CONTAINER = "mx-auto max-w-[1280px] px-[clamp(1rem,4vw,2rem)]";
const TWO_COL = "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]";

export default function LabPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        {/* ========== INTRO ========== */}
        <section className={`${CONTAINER} grid items-end gap-[clamp(2rem,5vw,5rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-8 ${TWO_COL}`}>
          <div>
            <p className={`${MONO} mb-3 text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
              /LAB · EXPERIMENTS
            </p>
            <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
              Half-finished, on purpose.
            </h1>
          </div>
          <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
            Things I am building, exploring, and keeping an eye on. Shown as they actually stand, not
            cleaned up for the visit.
          </p>
        </section>

        {/* ========== TABS + PANELS ========== */}
        <LabTabs />

        {/* ========== COLLABORATE ========== */}
        <section className="border-t border-tr-hairline bg-tr-surface-1">
          <div className={`${CONTAINER} flex flex-col gap-5 py-[clamp(3rem,6vw,5rem)] sm:flex-row sm:items-end sm:justify-between`}>
            <div>
              <h2 className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text">
                Want to collaborate?
              </h2>
              <p className="mt-2 max-w-[46ch] text-tr-text-mute">
                Always open to interesting projects and ideas.
              </p>
            </div>
            <a
              href={`mailto:${SITE_CONFIG.social.email}`}
              data-cursor="OPEN"
              className="flex flex-col border border-tr-hairline bg-tr-bg px-5 py-4 no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-accent"
            >
              <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute`}>
                Open the line
              </span>
              <span className="text-[length:var(--tr-t-h3)] font-medium text-tr-text">
                {SITE_CONFIG.social.email}
              </span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
