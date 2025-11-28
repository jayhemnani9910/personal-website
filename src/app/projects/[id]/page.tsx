import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    return <ProjectDetail project={project} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const { id } = params;
    const project = await getProject(id);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    return {
        title: project.title,
        description: project.summary,
        openGraph: {
            title: project.title,
            description: project.summary,
            type: "article",
            tags: project.tags,
        },
    };
}

export async function generateStaticParams() {
    const projects = await getAllProjects();
    return projects.map((project) => ({
        id: project.id,
    }));
}
