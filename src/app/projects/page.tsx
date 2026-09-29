import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { getProjectSummaries } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectsClient } from "./ProjectsClient";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";

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
    return (
        <>
            <SiteHeader />
            <main id="main-content" className="bg-tr-bg text-tr-text">
                {/* Intro */}
                <section className={`${SHELL} pt-[clamp(2.5rem,5vw,4rem)] pb-6`}>
                  <div className={`${WRAP} grid gap-[clamp(2rem,5vw,5rem)] items-end lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
                    <div>
                      <p className={`mb-3 ${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
                        /WORK · 2019 → 2026
                      </p>
                      <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
                        {projects.length}, sorted by what they&apos;d cost you to ignore.
                      </h1>
                    </div>
                    <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
                      Priority first, then alphabetical, the same order the code uses. The early entries are student
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
