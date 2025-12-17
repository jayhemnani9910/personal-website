"use client";

import { RESUME } from "@/data/resume";
import { Download } from "lucide-react";

export default function ResumePage() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          section {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white text-black py-12 px-6">
        <div className="print-container max-w-4xl mx-auto">
          {/* Download Button - Hidden in Print */}
          <div className="no-print mb-8 flex justify-end">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>

          {/* Header */}
          <header className="mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-4xl font-bold mb-2">{RESUME.name}</h1>
            <p className="text-xl text-gray-700 mb-3">{RESUME.tagline}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{RESUME.location}</span>
              <span>•</span>
              <a href={`mailto:${RESUME.contact.email}`} className="hover:text-black">
                {RESUME.contact.email}
              </a>
              <span>•</span>
              <a href={RESUME.contact.github} className="hover:text-black" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              {RESUME.contact.linkedin && (
                <>
                  <span>•</span>
                  <a href={RESUME.contact.linkedin} className="hover:text-black" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </>
              )}
            </div>
          </header>

          {/* Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Professional Summary</h2>
            <p className="text-gray-800 leading-relaxed">{RESUME.summary}</p>
          </section>

          {/* Core Competencies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Core Competencies</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {RESUME.coreCompetencies.map((competency, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="text-gray-800">{competency}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Technical Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {RESUME.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-gray-900 mb-2">{skillGroup.category}</h3>
                  <ul className="space-y-1">
                    {skillGroup.items.map((skill, skillIdx) => (
                      <li key={skillIdx} className="text-sm text-gray-700">
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Professional Experience</h2>
            {RESUME.experience.map((company, companyIdx) => (
              <div key={companyIdx} className="mb-6 last:mb-0">
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                {company.roles.map((role, roleIdx) => (
                  <div key={roleIdx} className="mt-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="font-semibold text-gray-800">{role.title}</h4>
                      {role.period?.label && (
                        <span className="text-sm text-gray-600">{role.period.label}</span>
                      )}
                    </div>
                    {role.summary && (
                      <p className="text-sm text-gray-600 italic mb-2">{role.summary}</p>
                    )}
                    <ul className="space-y-2">
                      {role.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start">
                          <span className="mr-2 text-gray-600">•</span>
                          <span className="text-gray-800 text-sm">{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Education</h2>
            {RESUME.education.map((edu, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  {edu.location && <span className="text-sm text-gray-600">{edu.location}</span>}
                </div>
                <p className="text-gray-800">{edu.degree}</p>
                {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                {edu.courses && edu.courses.length > 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Relevant Coursework:</span> {edu.courses.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </section>

          {/* Publications */}
          {RESUME.publications && RESUME.publications.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-2">Publications & Projects</h2>
              {RESUME.publications.map((pub, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <h3 className="font-semibold text-gray-900">{pub.title}</h3>
                  {pub.description && <p className="text-sm text-gray-700">{pub.description}</p>}
                  {pub.link && (
                    <a href={pub.link} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      View Publication
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
