import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail, type DeepDiveProse } from "@/components/ProjectDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewCounter } from "@/components/ViewCounter";
import { SHELL, WRAP } from "@/components/desk";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { JSX } from "react";

/**
 * The project body is short overview prose. It is rendered here, in the route,
 * because MDXRemote is an async server component; ProjectDetail receives the
 * finished node.
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
    // Only an absolute http(s) link opens a new tab; a site path or a
    // #fragment stays in this one.
    a: (props: JSX.IntrinsicElements["a"]) =>
        /^https?:\/\//.test(props.href ?? "") ? <a target="_blank" rel="noreferrer" {...props} /> : <a {...props} />,
    // A fenced block scrolls sideways. Chromium lets Tab reach a scroller on
    // its own; Safari does not, so it is focusable. Not a named region: a page
    // can hold several, and landmarks with one shared name tell nobody apart.
    pre: (props: JSX.IntrinsicElements["pre"]) => <pre tabIndex={0} {...props} />,
};

// Deep-dive sections authored as one markdown string instead of structured
// items. Parsed as plain markdown ("md"), not MDX, so a stray < or { in the
// text is prose rather than a compile error.
const PROSE_SECTIONS = ["context", "architecture", "components", "dataFlow", "keyDecisions", "codeSnippets", "learnings"] as const;

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    // Every project renders through the same template now; the old
    // tabbed ProjectShowcase path is gone. Order and neighbours come from
    // the same priority-then-id sort the work index uses, so the "01 / N"
    // counter and the next-project footer agree with what /projects shows.
    const allProjects = await getAllProjects();
    const index = allProjects.findIndex((p) => p.id === id);
    const total = allProjects.length;
    const nextIndex = (index + 1) % total;
    const next = allProjects[nextIndex];

    const overview = project.content.trim() ? (
        <MDXRemote source={project.content} components={overviewComponents} />
    ) : null;

    const prose: DeepDiveProse = {};
    for (const key of PROSE_SECTIONS) {
        const text = project.deepDive?.[key];
        if (typeof text === "string" && text.trim()) {
            prose[key] = (
                <MDXRemote source={text} components={overviewComponents} options={{ mdxOptions: { format: "md" } }} />
            );
        }
    }

    const meta = `${String(index + 1).padStart(2, "0")} / ${total}`;

    return (
        <>
            <SiteHeader meta={meta} />
            <main id="main-content" className="bg-tr-bg text-tr-text">
                <ProjectDetail
                    project={project}
                    overview={overview}
                    prose={prose}
                    nextProject={{ id: next.id, title: next.title, index: nextIndex + 1 }}
                />
                <div className={`${WRAP} ${SHELL} flex justify-end pb-6`}>
                    <ViewCounter slug={id} />
                </div>
            </main>
            <SiteFooter />
        </>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        return {
            title: "Project Not Found",
            robots: { index: false },
        };
    }

    return pageMetadata({
        title: project.title,
        description: project.description ?? project.summary,
        path: `/projects/${id}`,
        type: "article",
        article: { tags: project.tags },
    });
}

// Every id is generated at build; an unknown one is a 404 served with the
// site's not-found page, not an on-demand render with an empty body.
export const dynamicParams = false;

export async function generateStaticParams() {
    const projects = await getAllProjects();
    return projects.map((project) => ({
        id: project.id,
    }));
}
