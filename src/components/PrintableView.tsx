import { RESUME } from "@/data/resume";

export function PrintableView() {
    return (
        <div className="hidden print:block bg-white text-black p-8 max-w-[210mm] mx-auto">
            {/* Header */}
            <div className="mb-8 border-b-2 border-black pb-4">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">{RESUME.name}</h1>
                <p className="text-xl text-gray-700 font-medium">{RESUME.tagline}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-3 font-mono">
                    <span className="flex items-center gap-2">{RESUME.contact.email}</span>
                    {RESUME.location && <span className="flex items-center gap-2">{RESUME.location}</span>}
                    {RESUME.contact.linkedin && <span className="flex items-center gap-2">{RESUME.contact.linkedin}</span>}
                    {RESUME.contact.github && <span className="flex items-center gap-2">{RESUME.contact.github}</span>}
                </div>
            </div>

            {/* Experience */}
            <div className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-800">Experience</h2>
                <div className="space-y-6">
                    {RESUME.experience.map((company, i) => (
                        <div key={i}>
                            <h3 className="font-bold text-lg mb-2">{company.name}</h3>
                            {company.roles.map((role, j) => (
                                <div key={j} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold">{role.title}</h4>
                                        {role.period?.label && <span className="text-sm font-mono text-gray-600">{role.period.label}</span>}
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-gray-700 leading-relaxed">
                                        {role.bullets.map((b, k) => (
                                            <li key={k}>{b.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Education */}
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-800">Education</h2>
                    {RESUME.education.map((edu, i) => (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{edu.institution}</h3>
                            </div>
                            {edu.location && <div className="text-sm text-gray-600 mb-1">{edu.location}</div>}
                            <div className="font-medium">{edu.degree}</div>
                            {edu.gpa && <div className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</div>}
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-800">Skills</h2>
                    <div className="space-y-4">
                        {RESUME.skills.map((cat, i) => (
                            <div key={i}>
                                <h3 className="font-bold text-sm mb-1 text-gray-700">{cat.category}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{cat.items.map(item => item.name).join(", ")}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
