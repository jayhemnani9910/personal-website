"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual codebase)
// =============================================================================

const MODALITIES = [
    { name: "ProtT5", purpose: "Sequence Encoder", desc: "Protein language model (Rostlab/prot_t5_xl_uniref50) generates 1024-dim embeddings from amino acid sequences.", color: "#7c3aed" },
    { name: "GATv2 + VDOS", purpose: "Structure & Dynamics", desc: "Graph Attention Network encodes protein topology. Vibrational Density of States from Normal Mode Analysis captures dynamics invisible to static models.", color: "#0ea5e9" },
    { name: "ChemBERTa + DRFP", purpose: "Chemical Encoder", desc: "Chemical language model (seyonec/ChemBERTa-zinc-base-v1) with Differential Reaction Fingerprints encodes substrates into 512-dim embeddings.", color: "#f59e0b" },
];

const HIGHLIGHTS = [
    "Physics-informed approach — VDOS from Normal Mode Analysis captures protein vibrations, not just static structure",
    "MM-Drop training — multimodal dropout ensures robustness when one modality is missing",
    "Two-phase architecture — QDD framework (Phase 1-2) + VibroPredict enzyme kinetics (Phase 3)",
    "139 unit tests across core modules and VibroPredict subsystem",
    "8 Jupyter notebooks — from quickstart to ablation studies",
    "CLI tools + batch inference pipeline for production use",
];

const TECH = ["PyTorch Geometric", "ProDy", "BioPython", "RDKit", "Transformers", "ProtT5", "ChemBERTa"];

// =============================================================================
// ANIMATIONS (kept from v1 — strongest visuals)
// =============================================================================

function MoleculeToGraphAnimation() {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setPhase((p) => (p + 1) % 3), 2500);
        return () => clearInterval(interval);
    }, []);

    const atoms = [
        { id: 'C1', x: 25, y: 50, element: 'C', color: '#4a4a4a' },
        { id: 'C2', x: 50, y: 50, element: 'C', color: '#4a4a4a' },
        { id: 'O', x: 75, y: 50, element: 'O', color: '#ef4444' },
    ];
    const bonds = [{ from: 'C1', to: 'C2' }, { from: 'C2', to: 'O' }];
    const getPos = (id: string) => atoms.find(a => a.id === id)!;

    return (
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="absolute top-4 left-4 flex gap-2">
                {['Molecule', 'Transform', 'Graph'].map((label, i) => (
                    <span key={label} className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${phase === i ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
                        {label}
                    </span>
                ))}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] font-mono text-sm text-[var(--text-muted)]">
                CCO (Ethanol)
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {bonds.map((bond, i) => {
                    const from = getPos(bond.from), to = getPos(bond.to);
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={phase === 2 ? 'var(--accent)' : '#666'} strokeWidth={phase === 2 ? 0.8 : 1.5} strokeDasharray={phase === 1 ? '2,2' : 'none'} className="transition-all duration-500" style={{ opacity: phase === 1 ? 0.5 : 1 }} />;
                })}
                {atoms.map((atom) => (
                    <g key={atom.id} className="transition-all duration-500">
                        <circle cx={atom.x} cy={atom.y} r={phase === 2 ? 6 : 4} fill={phase === 2 ? 'var(--accent)' : atom.color} className="transition-all duration-500" />
                        {phase !== 2 && <text x={atom.x} y={atom.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="4" fontWeight="bold">{atom.element}</text>}
                        {phase === 2 && <text x={atom.x} y={atom.y + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="3" fontFamily="monospace">[6, 4, 0...]</text>}
                    </g>
                ))}
            </svg>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                    {phase === 0 && 'Molecular Structure'}{phase === 1 && 'Extracting Features...'}{phase === 2 && 'Graph Representation'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                    {phase === 0 && 'Atoms and bonds'}{phase === 1 && 'Atomic number, charge, hybridization'}{phase === 2 && 'Nodes with feature vectors, edges with bond types'}
                </div>
            </div>
        </div>
    );
}

function MessagePassingAnimation() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setStep((s) => (s + 1) % 4), 1500);
        return () => clearInterval(interval);
    }, []);

    const nodes = [{ id: 0, x: 50, y: 20 }, { id: 1, x: 25, y: 45 }, { id: 2, x: 75, y: 45 }, { id: 3, x: 35, y: 75 }, { id: 4, x: 65, y: 75 }];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2], [3, 4]];
    const activeNode = step < 4 ? step : null;
    const neighbors = activeNode !== null ? edges.filter(e => e.includes(activeNode)).map(e => e[0] === activeNode ? e[1] : e[0]) : [];

    return (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="absolute top-4 left-4 text-xs text-[var(--text-muted)]">GATv2 Message Passing</div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {edges.map(([from, to], i) => {
                    const f = nodes[from], t = nodes[to];
                    const isActive = (neighbors.includes(from) && activeNode === to) || (neighbors.includes(to) && activeNode === from);
                    return <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={isActive ? 'var(--accent)' : 'var(--border)'} strokeWidth={isActive ? 1.5 : 0.5} className="transition-all duration-300" />;
                })}
                {activeNode !== null && neighbors.map((nId) => {
                    const from = nodes[nId], to = nodes[activeNode];
                    return <circle key={`msg-${nId}`} r="2" fill="var(--accent)" className="animate-pulse"><animateMotion dur="1s" repeatCount="indefinite" path={`M${from.x},${from.y} L${to.x},${to.y}`} /></circle>;
                })}
                {nodes.map((node) => {
                    const isActive = node.id === activeNode;
                    const isSending = neighbors.includes(node.id);
                    return (
                        <g key={node.id}>
                            <circle cx={node.x} cy={node.y} r={isActive ? 8 : 6} fill={isActive ? 'var(--accent)' : isSending ? '#3b82f6' : 'var(--bg-tertiary)'} stroke={isActive ? 'white' : 'var(--border)'} strokeWidth={isActive ? 2 : 1} className="transition-all duration-300" />
                            <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill={isActive || isSending ? 'white' : 'var(--text-muted)'} fontSize="4" fontWeight="bold">{node.id}</text>
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="text-sm font-medium text-[var(--text-primary)]">{activeNode !== null ? `Node ${activeNode} aggregating from neighbors` : 'Aggregation Complete'}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1 font-mono">h<sub>i</sub> = σ(Σ<sub>j∈N(i)</sub> α<sub>ij</sub>·W·h<sub>j</sub>)</div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function NobelDataIntelligencePage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <p className="eyebrow mb-3">Computational Biology</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Nobel Data Intelligence</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Physics-informed deep learning for protein stability and enzyme kinetics. Treats proteins as vibrating machines — extracting Vibrational Density of States from Normal Mode Analysis for a novel tri-modal prediction architecture.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                                <Github className="w-4 h-4" /> View on GitHub
                            </a>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {TECH.slice(0, 5).map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* FIGURE 1 — Molecule to Graph */}
            <section className="py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={SPRINGS.default}>
                        <MoleculeToGraphAnimation />
                        <p className="text-xs text-center mt-3 italic" style={{ color: "var(--text-muted)" }}>Fig. 1 — Molecular structure transformed into a graph representation for GNN processing.</p>
                    </motion.div>
                </div>
            </section>

            {/* TRI-MODAL ARCHITECTURE */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-10">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tri-Modal Fusion</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">Three encoders capture sequence, structure+dynamics, and chemical features. Gated attention fusion combines them for prediction.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {MODALITIES.map((mod, i) => (
                            <motion.div
                                key={mod.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: EASINGS.apple }}
                                whileHover={{ y: -4, borderColor: mod.color, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-6 rounded-xl border transition-colors duration-300"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <div className="w-3 h-3 rounded-full mb-3" style={{ background: mod.color }} />
                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{mod.name}</h3>
                                <p className="text-xs font-medium mb-3" style={{ color: mod.color }}>{mod.purpose}</p>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{mod.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                    {/* Flow indicator */}
                    <div className="hidden md:flex items-center justify-center gap-2 mt-8 font-mono text-xs">
                        <span style={{ color: "#7c3aed" }}>ProtT5</span>
                        <span className="text-[var(--text-muted)]">+</span>
                        <span style={{ color: "#0ea5e9" }}>GATv2+VDOS</span>
                        <span className="text-[var(--text-muted)]">+</span>
                        <span style={{ color: "#f59e0b" }}>ChemBERTa</span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span className="text-[var(--accent)]">TriModalFusion</span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span className="text-[var(--text-primary)]">Prediction</span>
                    </div>
                </div>
            </section>

            {/* FIGURE 2 — Message Passing */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }}>
                            <p className="eyebrow mb-2">GATv2</p>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Attention-Based Message Passing</h2>
                            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                                Each node aggregates information from neighbors using learned attention weights. After multiple layers, atoms encode their full molecular environment — capturing the chemical context that determines protein behavior.
                            </p>
                            <p className="text-xs italic text-[var(--text-muted)]">Fig. 2 — GATv2 message passing with attention-weighted neighbor aggregation.</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5, ease: EASINGS.apple }}>
                            <MessagePassingAnimation />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Framework</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What Makes It Unique</h2>
                    </motion.div>
                    <div className="space-y-3">
                        {HIGHLIGHTS.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                        <Github className="w-4 h-4" /> jayhemnani9910/nobel-dataintelligence <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex gap-6 font-mono text-xs">
                        <span><span style={{ color: "var(--accent)" }}>139</span> <span className="text-[var(--text-muted)]">Tests</span></span>
                        <span><span style={{ color: "var(--accent)" }}>8</span> <span className="text-[var(--text-muted)]">Notebooks</span></span>
                        <span><span style={{ color: "var(--accent)" }}>3</span> <span className="text-[var(--text-muted)]">Phases</span></span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    <ReactionBar slug={project.id} />
                    <ViewCounter slug={project.id} />
                </div>
            </div>
        </div>
    );
}
