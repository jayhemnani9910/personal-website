import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { getProjectSummaries } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";
import { ProjectsClient } from "./ProjectsClient";

export const metadata: Metadata = pageMetadata({
    title: "The Work",
    description:
        "The full project catalogue: production systems, research prototypes, and a few honest experiments, filterable by domain.",
    path: "/projects",
});

export default async function ProjectsPage() {
    const projects = await getProjectSummaries();

    // Only the filter bar and the list need state; the header, the intro and
    // the footer render on the server and ship no JS.
    // The span the list covers, read off the projects' own periods so it moves
    // when a project is added or re-dated.
    const years = projects.map((p) => Number(p.period?.match(/\d{4}/)?.[0])).filter((y) => y > 0);
    const first = Math.min(...years);
    const last = Math.max(...years);

    return (
        <>
            <SiteHeader />
            <main id="main-content" className="bg-tr-bg text-tr-text">
                {/* Intro */}
                <section className={`${WRAP} ${SHELL} pt-[clamp(40px,6vw,72px)] pb-8`}>
                  <div className="grid items-end gap-[clamp(24px,5vw,80px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                    <div>
                      <p className={`mb-4 ${KICKER}`}>/work · {first} → {last}</p>
                      <h1 className={H1}>
                        <span className={HIGHLIGHT}>{projects.length}</span>, sorted by what they&apos;d cost you to ignore.
                      </h1>
                    </div>
                    <p className={`max-w-[56ch] ${LEDE}`}>
                      Priority first, then alphabetical, the same order the code uses. The last entries are student
                      work and are labelled as such; leaving them out would be curating, not documenting.
                    </p>
                  </div>
                </section>
                <ProjectsClient projects={projects} />
            </main>
            <SiteFooter />
        </>
    );
}
