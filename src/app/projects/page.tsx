import type { Metadata } from "next";
import { getProjectSummaries } from "@/lib/content";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { ProjectsClient } from "./ProjectsClient";

export const metadata: Metadata = {
    title: "The Work",
    description:
        "The full project catalogue: production systems, research prototypes, and a few honest experiments, filterable by domain.",
    alternates: {
        canonical: "/projects",
    },
};

export default async function ProjectsPage() {
    const projects = await getProjectSummaries();

    // The catalogue cards show the project's hero art. That art lives in
    // SHOWCASE_PROJECTS, which is a plain module but pulls in @/lib/webmcp, so
    // it is resolved here on the server and handed down as a plain string
    // rather than imported into the client bundle.
    const withHero = projects.map((p) => ({
        ...p,
        hero: SHOWCASE_PROJECTS[p.id]?.hero,
    }));

    return <ProjectsClient projects={withHero} />;
}
