import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewCounter } from "@/components/ViewCounter";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { JSX } from "react";

/**
 * The project body is short overview prose. It is rendered here, in the server
 * component, because MDXRemote is server-only and ProjectDetail is a client
 * component; it receives the finished node.
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

    // Every project renders through the same v4 template now; the old
    // tabbed ProjectShowcase path is gone. Order and neighbours come from
    // the same priority-then-id sort the work index uses, so "01 / 27" and
    // the prev/next footer agree with what /projects shows.
    const allProjects = await getAllProjects();
    const index = allProjects.findIndex((p) => p.id === id);
    const total = allProjects.length;
    const next = allProjects[(index + 1) % total];

    const overview = project.content.trim() ? (
        <MDXRemote source={project.content} components={overviewComponents} />
    ) : null;

    const meta = `${String(index + 1).padStart(2, "0")} / ${total}`;

    return (
        <main id="main-content" className="bg-tr-bg text-tr-text">
            <SiteHeader meta={meta} />
            <ProjectDetail
                project={project}
                overview={overview}
                nextProject={{ id: next.id, title: next.title, index: allProjects.indexOf(next) + 1 }}
            />
            <div className="mx-auto flex max-w-[1280px] items-center justify-end px-[clamp(1rem,4vw,2rem)] py-6">
                <ViewCounter slug={id} />
            </div>
            <SiteFooter />
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
