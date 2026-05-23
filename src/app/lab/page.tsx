"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { LAB_ITEMS, type LabItem } from "@/data/lab";

type TabKey = "building" | "exploring" | "radar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "building", label: "Building" },
  { key: "exploring", label: "Exploring" },
  { key: "radar", label: "On the radar" },
];

function LabCard({ item }: { item: LabItem }) {
  const progress = "progress" in item ? (item as LabItem & { progress?: number }).progress : undefined;
  return (
    <article className="lab-card">
      <div className="lab-card-head">
        <h3>{item.title}</h3>
        {item.link && (
          <a className="lab-gh" href={item.link} target="_blank" rel="noreferrer" aria-label={`${item.title} on GitHub`}>
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>
      <p>{item.description}</p>
      {progress !== undefined && (
        <div>
          <div className="lab-progress-meta"><span>Progress</span><b>{progress}%</b></div>
          <div className="lab-progress-track"><div className="lab-progress-bar" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {item.tags?.length > 0 && (
        <div className="lab-tags">
          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
    </article>
  );
}

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("building");

  return (
    <main id="main-content" className="editorial min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <EditorialMasthead />

      <section className="lab-hero shell">
        <div className="eyebrow"><span className="dot" /><span>The Lab · Work in progress</span></div>
        <h1 className="display lab-title">Experiments, <span className="italic">in progress.</span></h1>
        <p className="deck lab-deck">Things I am building, exploring, and keeping an eye on. Half-finished on purpose, shown anyway.</p>
      </section>

      <section className="shell">
        <div className="lab-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`filter-chip${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} <span className="filter-chip-count">{LAB_ITEMS[tab.key].length}</span>
            </button>
          ))}
        </div>

        <div className="lab-grid">
          {LAB_ITEMS[activeTab].map((item) => (
            <LabCard key={item.id} item={item} />
          ))}
        </div>

        <div className="lab-cta">
          <div>
            <h3>Want to collaborate?</h3>
            <p>Always open to interesting projects and ideas.</p>
          </div>
          <a className="cta-button" href="mailto:jayhemnani992000@gmail.com" style={{ minWidth: 280 }}>
            <span className="mono xs upper muted">Open the line</span>
            <span className="cta-mail">jayhemnani992000@gmail.com</span>
          </a>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
