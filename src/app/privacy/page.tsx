import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/page-metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_CONFIG } from "@/../content/site";
import { CARD, H1, H2, HIGHLIGHT, KICKER, LABEL, LEDE, SHELL, WRAP } from "@/components/desk";
import { ForgetButton } from "./ForgetButton";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "What jayhemnani.in keeps about a visit, where, and for how long. No cookies, no ads, no tracking across sites.",
  path: "/privacy",
});

// Keep this in step with the code: every row names what the site really
// stores. The browser keys live in src/lib/storage.ts and deskStore.ts, the
// server ones in src/app/api/*.
const UPDATED = "12 October 2026";

function Row({ what, where, kept, children }: { what: string; where: string; kept: string; children: ReactNode }) {
  return (
    <li className="grid gap-2 border-t-[1.5px] border-dashed border-tr-hairline py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
      <div>
        <h3 className="text-[17px] font-bold leading-snug">{what}</h3>
        <p className={`${LABEL} mt-1.5`}>
          {where} · {kept}
        </p>
      </div>
      <p className="text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{children}</p>
    </li>
  );
}

const LINK = "underline hover:text-tr-text";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        <section className={`${WRAP} ${SHELL} pb-8 pt-[clamp(40px,6vw,72px)]`}>
          <p className={`${KICKER} mb-4`}>/privacy · updated {UPDATED}</p>
          <h1 className={H1}>
            No cookies. <span className={HIGHLIGHT}>Not even one.</span>
          </h1>
          <p className={`${LEDE} mt-6 max-w-[60ch]`}>
            This site sets no cookies, shows no ads, and does not follow you to other sites. Here is everything it does
            keep, where it lives, and for how long.
          </p>
        </section>

        <section aria-labelledby="browser-h2" className={`${WRAP} ${SHELL} pb-12`}>
          <h2 id="browser-h2" className={`${H2} mb-4`}>
            In your browser
          </h2>
          <p className={`${LEDE} mb-2 max-w-[60ch]`}>Saved on your device for the site&apos;s small features. None of it is ever sent to me.</p>
          <ul>
            <Row what="Reader mode" where="your browser" kept="until you clear it">
              Whether you turned reader mode on, so it stays on next time.
            </Row>
            <Row what="Visit count" where="your browser" kept="until you clear it">
              How many times you have opened the home page, for the &ldquo;visit #7&rdquo; line.
            </Row>
            <Row what="Secrets found" where="your browser" kept="until you clear it">
              Which of the home page&apos;s hidden secrets you found.
            </Row>
            <Row what="Already counted" where="your browser" kept="until the tab closes">
              Notes that this tab already counted your visit and each project view, so a reload does not count twice.
            </Row>
          </ul>
          <div className={`${CARD} mt-4 max-w-[640px] p-5`}>
            <p className="text-[15px] leading-[var(--tr-lh-body)]">
              One click clears all of it. Your next visit to the home page counts as your first.
            </p>
            <ForgetButton />
          </div>
        </section>

        <section aria-labelledby="server-h2" className={`${WRAP} ${SHELL} pb-12`}>
          <h2 id="server-h2" className={`${H2} mb-4`}>
            On my server
          </h2>
          <ul>
            <Row what="Project view counts" where="Upstash Redis" kept="24 hours">
              Each project page counts its views. To count you once a day, the site keeps a scrambled code made from your
              IP address (a keyed hash) for 24 hours. The address itself is never stored, and the code can&apos;t be turned
              back into it.
            </Row>
            <Row what="Rate limits" where="Upstash Redis" kept="1 to 10 minutes">
              The same scrambled code, counting requests for a few minutes so a script can&apos;t flood the guestbook, the
              view counter or the simulator.
            </Row>
            <Row what="Guestbook notes" where="Upstash Redis" kept="until 500 newer notes">
              The name and message you write, and when. They are public on the home page. The 500 newest are kept. Want
              yours gone? Email me and I&apos;ll remove it.
            </Row>
            <Row what="FDE simulator" where="Google Gemini, Upstash Redis" kept="30 days">
              What you type is sent to Google&apos;s Gemini to write the plan. The plan is then saved for 30 days, filed
              under a fingerprint of your text (not the text itself), so the same brief gets the same answer.
            </Row>
          </ul>
        </section>

        <section aria-labelledby="analytics-h2" className={`${WRAP} ${SHELL} pb-[clamp(4rem,8vw,6rem)]`}>
          <h2 id="analytics-h2" className={`${H2} mb-4`}>
            Analytics and hosting
          </h2>
          <div className="max-w-[60ch] space-y-4 text-[16px] leading-[var(--tr-lh-body)] text-tr-text-mute">
            <p>
              The site runs on Vercel. Its Web Analytics counts page views and Speed Insights measures how fast pages load.
              Neither uses cookies or tracks you across sites. Vercel describes what they collect in its{" "}
              <a className={LINK} href="https://vercel.com/docs/analytics/privacy-policy">
                analytics privacy notes
              </a>
              ,{" "}
              <a className={LINK} href="https://vercel.com/docs/speed-insights/privacy-policy">
                Speed Insights notes
              </a>{" "}
              and{" "}
              <a className={LINK} href="https://vercel.com/legal/privacy-policy">
                privacy policy
              </a>
              .
            </p>
            <p>
              Like any host, Vercel sees your IP address when it serves you a page. Nothing is loaded from anywhere else:
              no fonts, embeds, pixels or trackers from other companies.
            </p>
            <p>
              Questions, or something you want removed:{" "}
              <a className={LINK} href={`mailto:${SITE_CONFIG.social.email}`}>
                {SITE_CONFIG.social.email}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
