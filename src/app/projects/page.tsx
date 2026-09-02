import type { Metadata } from "next";
import { getProjectSummaries } from "@/lib/content";
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

    return <ProjectsClient projects={projects} />;
}
