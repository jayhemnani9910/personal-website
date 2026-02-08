import { getProjectSummaries } from "@/lib/content";
import { ProjectsClient } from "./ProjectsClient";

export default async function ProjectsPage() {
    const projects = await getProjectSummaries();
    return <ProjectsClient projects={projects} />;
}
