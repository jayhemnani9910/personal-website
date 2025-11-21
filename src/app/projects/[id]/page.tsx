import { PROJECTS, getProjectById } from "@/data/projects";
import { ProjectDetail } from "@/components/ProjectDetail";
import { notFound } from "next/navigation";

export default function ProjectPage({ params }: { params: { id: string } }) {
    const project = getProjectById(params.id);

    if (!project) {
        notFound();
    }

    return <ProjectDetail project={project} />;
}

export function generateStaticParams() {
    return PROJECTS.map((project) => ({
        id: project.id,
    }));
}
