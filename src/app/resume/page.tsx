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
          /* Override CSS variables for light theme */
          :root {
            --bg-primary: #ffffff !important;
            --bg-secondary: #f8f9fa !important;
            --text-primary: #1a1a1a !important;
            --text-secondary: #4a4a4a !important;
            --text-muted: #6a6a6a !important;
            --border: #e0e0e0 !important;
            --border-strong: #cccccc !important;
            --accent: #0066cc !important;
          }

          /* Base body styles for print */
          body {
            background: white !important;
            color: #1a1a1a !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide non-essential elements */
          nav,
          footer,
          .no-print {
            display: none !important;
          }

          /* Reset backgrounds for all elements */
          main, section, div, header {
            background: transparent !important;
          }

          /* Container width for print */
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Page wrapper - remove padding */
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }

          /* Typography for print */
          h1 {
            font-size: 18pt !important;
            margin-bottom: 0.25rem !important;
          }
          h2 {
            font-size: 14pt !important;
            page-break-after: avoid !important;
            margin-bottom: 0.5rem !important;
          }
          h3 {
            font-size: 12pt !important;
          }
          h4 {
            font-size: 11pt !important;
          }

          /* Prevent page breaks inside sections */
          section {
            page-break-inside: avoid !important;
          }

          /* Keep headings with their content */
          h2, h3, h4 {
            page-break-after: avoid !important;
          }

          /* Links - just show text, no decorations */
          a {
            text-decoration: none !important;
            color: inherit !important;
          }

          /* Remove shadows, borders, and other decorative elements */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Ensure text colors are dark for readability */
          p, span, li {
            color: #4a4a4a !important;
          }

          h1, h2, h3, h4, .font-bold, .font-semibold {
            color: #1a1a1a !important;
          }

          /* Muted text stays slightly lighter but still readable */
          .text-muted, [style*="text-muted"] {
            color: #6a6a6a !important;
          }

          /* Grid adjustments for print */
          .grid {
            display: block !important;
          }

          .grid-cols-2, .grid-cols-4 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }

          /* Reduce spacing for print */
          .mb-8 {
            margin-bottom: 1rem !important;
          }

          .mb-6 {
            margin-bottom: 0.75rem !important;
          }

          .gap-4 {
            gap: 0.5rem !important;
          }
        }
      `}</style>

      <div className="min-h-screen py-12 px-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="print-container max-w-4xl mx-auto">
          {/* Download Button - Hidden in Print */}
          <div className="no-print mb-8 flex justify-end">
            <button
              onClick={handleDownload}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>

          {/* Header */}
          <header className="mb-8 pb-6" style={{ borderBottom: '2px solid var(--border-strong)' }}>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {RESUME.name}
            </h1>
            <p className="text-xl mb-3" style={{ color: 'var(--text-secondary)' }}>
              {RESUME.tagline}
            </p>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>{RESUME.location}</span>
              <span>•</span>
              <a
                href={`mailto:${RESUME.contact.email}`}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {RESUME.contact.email}
              </a>
              <span>•</span>
              <a
                href={RESUME.contact.github}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              {RESUME.contact.linkedin && (
                <>
                  <span>•</span>
                  <a
                    href={RESUME.contact.linkedin}
                    className="transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </>
              )}
            </div>
          </header>

          {/* Summary */}
          <section className="mb-8">
            <h2
              className="text-2xl font-bold mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
            >
              Professional Summary
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {RESUME.summary}
            </p>
          </section>

          {/* Core Competencies */}
          <section className="mb-8">
            <h2
              className="text-2xl font-bold mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
            >
              Core Competencies
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {RESUME.coreCompetencies.map((competency, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{competency}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section className="mb-8">
            <h2
              className="text-2xl font-bold mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
            >
              Technical Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {RESUME.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {skillGroup.category}
                  </h3>
                  <ul className="space-y-1">
                    {skillGroup.items.map((skill, skillIdx) => (
                      <li key={skillIdx} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
            <h2
              className="text-2xl font-bold mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
            >
              Professional Experience
            </h2>
            {RESUME.experience.map((company, companyIdx) => (
              <div key={companyIdx} className="mb-6 last:mb-0">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {company.name}
                </h3>
                {company.roles.map((role, roleIdx) => (
                  <div key={roleIdx} className="mt-3">
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {role.title}
                      </h4>
                      {role.period?.label && (
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {role.period.label}
                        </span>
                      )}
                    </div>
                    {role.summary && (
                      <p className="text-sm italic mb-2" style={{ color: 'var(--text-muted)' }}>
                        {role.summary}
                      </p>
                    )}
                    <ul className="space-y-2">
                      {role.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start">
                          <span className="mr-2" style={{ color: 'var(--text-muted)' }}>•</span>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {bullet.text}
                          </span>
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
            <h2
              className="text-2xl font-bold mb-3 pb-2"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
            >
              Education
            </h2>
            {RESUME.education.map((edu, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {edu.institution}
                  </h3>
                  {edu.location && (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {edu.location}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{edu.degree}</p>
                {edu.gpa && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.courses && edu.courses.length > 0 && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-semibold">Relevant Coursework:</span> {edu.courses.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </section>

          {/* Publications */}
          {RESUME.publications && RESUME.publications.length > 0 && (
            <section className="mb-8">
              <h2
                className="text-2xl font-bold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}
              >
                Publications & Projects
              </h2>
              {RESUME.publications.map((pub, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {pub.title}
                  </h3>
                  {pub.description && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pub.description}
                    </p>
                  )}
                  {pub.link && (
                    <a
                      href={pub.link}
                      className="text-sm hover:underline"
                      style={{ color: 'var(--accent)' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
