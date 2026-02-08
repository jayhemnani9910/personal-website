import { ProjectSummary } from "@/lib/content";

interface ProjectDNAStripProps {
    projects: ProjectSummary[];
}

export function ProjectDNAStrip({ projects }: ProjectDNAStripProps) {
    const totalProjects = projects.length;
    const totalTech = new Set(projects.flatMap((p) => p.tech)).size;
    const totalDomains = new Set(projects.map((p) => p.domain)).size;

    const stats = [
        { value: totalProjects, label: "Projects" },
        { value: totalTech, label: "Technologies" },
        { value: totalDomains, label: "Domains" },
    ];

    return (
        <section className="section-full py-16">
            <div className="section-shell">
                {/* Divider */}
                <div className="h-px mb-16" style={{ background: 'var(--border)' }} />

                <div className="flex justify-center items-center gap-16 md:gap-24">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="title-xl mb-2" style={{ color: 'var(--accent)' }}>
                                {stat.value}
                            </div>
                            <div className="body-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
