import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { ViewCounter } from "@/components/ViewCounter";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    const isShowcase = id in SHOWCASE_PROJECTS;

    return (
        <div className="editorial">
            <EditorialMasthead active="work" />
            {isShowcase ? <ProjectShowcase project={project} /> : <ProjectDetail project={project} />}
            <div className="section-wide py-10 mb-12 flex items-center justify-end">
                <ViewCounter slug={id} />
            </div>
            <EditorialColophon />
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    return {
        title: project.title,
        description: project.summary,
        alternates: {
            canonical: `/projects/${id}`,
        },
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
