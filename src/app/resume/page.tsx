"use client";

import { useState } from "react";
import { Download, ArrowLeft, Briefcase, Database, Brain, Code } from "lucide-react";
import Link from "next/link";

const RESUME_VERSIONS = [
  {
    id: "de",
    title: "Data Engineer",
    description: "Kafka, Airflow, ETL pipelines, distributed systems",
    icon: Database,
    file: "/resume/jay-hemnani-de.pdf",
    color: "#3b82f6",
  },
  {
    id: "ml",
    title: "ML Engineer",
    description: "FAISS, LangChain, RAG pipelines, model serving",
    icon: Brain,
    file: "/resume/jay-hemnani-ml.pdf",
    color: "#8b5cf6",
  },
  {
    id: "swe",
    title: "Backend / SWE",
    description: "Microservices, REST APIs, distributed architecture",
    icon: Code,
    file: "/resume/jay-hemnani-swe.pdf",
    color: "#10b981",
  },
  {
    id: "analyst",
    title: "Data Analyst",
    description: "Tableau, Power BI, SQL, dashboards & visualization",
    icon: Briefcase,
    file: "/resume/jay-hemnani-analyst.pdf",
    color: "#f59e0b",
  },
];

export default function ResumePage() {
  const [selectedVersion, setSelectedVersion] = useState(RESUME_VERSIONS[0]);

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Resume
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Select the version that best matches the role you&apos;re interested in.
          </p>
        </header>

        {/* Role Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {RESUME_VERSIONS.map((version) => {
            const Icon = version.icon;
            const isSelected = selectedVersion.id === version.id;
            return (
              <button
                key={version.id}
                onClick={() => setSelectedVersion(version)}
                className="relative p-5 rounded-xl text-left transition-all duration-200"
                style={{
                  background: isSelected ? `${version.color}15` : 'var(--bg-secondary)',
                  border: `2px solid ${isSelected ? version.color : 'var(--border)'}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2.5 rounded-lg"
                    style={{ background: `${version.color}20` }}
                  >
                    <Icon size={22} style={{ color: version.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {version.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {version.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                    style={{ background: version.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Preview & Download Section */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedVersion.title} Resume
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                1-page PDF optimized for {selectedVersion.title.toLowerCase()} roles
              </p>
            </div>
            <a
              href={selectedVersion.file}
              download={`Jay_Hemnani_${selectedVersion.title.replace(/\s+/g, '_')}_Resume.pdf`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: selectedVersion.color,
                color: 'white',
              }}
            >
              <Download size={18} />
              Download PDF
            </a>
          </div>

          {/* PDF Preview */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <iframe
              src={`${selectedVersion.file}#view=FitH`}
              className="w-full"
              style={{ height: '600px', background: 'white' }}
              title={`${selectedVersion.title} Resume Preview`}
            />
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          All resumes are tailored versions highlighting relevant experience for each role type.
        </p>
      </div>
    </div>
  );
}
