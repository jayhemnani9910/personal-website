import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { ViewCounter } from "@/components/ViewCounter";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { JSX } from "react";

/**
 * The project body is short overview prose. It is rendered here, in the server
 * component, because MDXRemote is server-only and both ProjectDetail and
 * ProjectShowcase are client components; they receive the finished node.
 *
 * Headings are demoted by one level so the page keeps exactly one h1 (the
 * project title) and heading order stays sequential, whatever an author writes.
 * Bodies are not supposed to carry a top-level heading at all, which
 * content.test.ts checks, so this is the belt to that file's braces.
 */
const overviewComponents = {
    h1: (props: JSX.IntrinsicElements["h1"]) => <h2 {...props} />,
    h2: (props: JSX.IntrinsicElements["h2"]) => <h3 {...props} />,
    h3: (props: JSX.IntrinsicElements["h3"]) => <h4 {...props} />,
    a: (props: JSX.IntrinsicElements["a"]) => (
        <a target="_blank" rel="noreferrer" {...props} />
    ),
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    const isShowcase = id in SHOWCASE_PROJECTS;
    const overview = project.content.trim() ? (
        <MDXRemote source={project.content} components={overviewComponents} />
    ) : null;

    return (
        <main id="main-content" className="editorial tr-editorial-scope">
            <EditorialMasthead active="work" />
            {isShowcase
                ? <ProjectShowcase project={project} overview={overview} />
                : <ProjectDetail project={project} overview={overview} />}
            <div className="section-wide py-10 mb-12 flex items-center justify-end">
                <ViewCounter slug={id} />
            </div>
            <EditorialColophon />
        </main>
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
