"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink, FileText } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against notebook + IEEE paper)
// =============================================================================

const BASE_MODELS = [
    { name: "Gaussian Naive Bayes", type: "Probabilistic" },
    { name: "Random Forest", type: "Ensemble" },
    { name: "Decision Tree", type: "Tree-based" },
    { name: "Support Vector Machine", type: "Kernel" },
    { name: "ANN (MLPClassifier)", type: "Neural Network" },
    { name: "Logistic Regression", type: "Linear" },
];

const DATASET_FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
];

const HIGHLIGHTS = [
    "6 base classifiers with hyperparameter tuning via cross-validation",
    "Stacking ensemble — base model predictions become meta-learner features",
    "PIMA Indians Diabetes Dataset — 768 instances, 8 clinical features",
    "Mean imputation for zero-value handling + feature scaling",
    "Published at AIMV 2021 (IEEE Xplore) — 10 citations",
];

// =============================================================================
// MAIN
// =============================================================================

export function DiabetesStackingPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <p className="eyebrow">Machine Learning</p>
                            <a href="https://ieeexplore.ieee.org/document/9670920" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                                style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)", color: "var(--accent)", border: "1px solid rgba(var(--accent-rgb, 10, 132, 255), 0.2)" }}>
                                <FileText className="w-3 h-3" /> IEEE Xplore
                            </a>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Diabetes Prediction</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Stacking ensemble classifier for early diabetes prediction using 6 base models with cross-validated hyperparameter tuning. Published at AIMV 2021 on IEEE Xplore.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                                <Github className="w-4 h-4" /> Source Code
                            </a>
                        )}
                        <a href="https://ieeexplore.ieee.org/document/9670920" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors" style={{ borderColor: "var(--border)" }}>
                            <FileText className="w-4 h-4" /> Read Paper
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['Python', 'Scikit-learn', 'Pandas', 'NumPy'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* STACKING ARCHITECTURE */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stacking Ensemble</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">6 base classifiers → meta-learner</p>
                    </motion.div>

                    {/* Base models grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {BASE_MODELS.map((model, i) => (
                            <motion.div
                                key={model.name}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                whileHover={{ y: -3, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-4 rounded-xl border transition-colors duration-200"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <div className="text-sm font-semibold text-[var(--text-primary)]">{model.name}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-0.5">{model.type}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Arrow down to meta-learner */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-px h-8" style={{ background: "var(--accent)" }} />
                            <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>predictions as features</span>
                            <div className="w-px h-8" style={{ background: "var(--accent)" }} />
                        </div>
                    </div>

                    {/* Meta-learner */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-5 rounded-xl border-2 text-center max-w-xs mx-auto"
                        style={{ borderColor: "var(--accent)", background: "rgba(var(--accent-rgb, 10, 132, 255), 0.05)" }}
                    >
                        <div className="text-base font-bold text-[var(--text-primary)]">Meta-Learner</div>
                        <div className="text-sm" style={{ color: "var(--accent)" }}>Logistic Regression</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Test accuracy: 74.46%</div>
                    </motion.div>
                </div>
            </section>

            {/* DATASET */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Dataset</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">PIMA Indians Diabetes</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">768 instances · 8 clinical features · binary classification</p>
                    </motion.div>
                    <div className="flex flex-wrap gap-2">
                        {DATASET_FEATURES.map((feat, i) => (
                            <motion.span
                                key={feat}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04, duration: 0.3 }}
                                className="px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}
                            >
                                {feat}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Methodology</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Key Points</h2>
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

            {/* PUBLICATION */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }}>
                        <p className="eyebrow mb-4">Publication</p>
                        <div className="p-6 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                                &quot;Diabetes Prediction, using Stacking Classifier&quot;
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-3">
                                V. Khilwani, V. Gondaliya, S. Patel, J. Hemnani, B. Gandhi, S.K. Bharti
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                                <span>AIMV 2021</span>
                                <span>·</span>
                                <span>IEEE Xplore</span>
                                <span>·</span>
                                <span>DOI: 10.1109/AIMV53313.2021.9670920</span>
                                <span>·</span>
                                <span>10 citations</span>
                            </div>
                            <a href="https://ieeexplore.ieee.org/document/9670920" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-sm font-medium transition-colors hover:opacity-80"
                                style={{ color: "var(--accent)" }}>
                                <FileText className="w-4 h-4" /> Read on IEEE Xplore <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                                <Github className="w-4 h-4" /> Source Code <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        <div className="flex gap-6 font-mono text-xs">
                            <span><span style={{ color: "var(--accent)" }}>6</span> <span className="text-[var(--text-muted)]">Models</span></span>
                            <span><span style={{ color: "var(--accent)" }}>768</span> <span className="text-[var(--text-muted)]">Samples</span></span>
                            <span><span style={{ color: "var(--accent)" }}>IEEE</span> <span className="text-[var(--text-muted)]">Published</span></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                        <ReactionBar slug={project.id} />
                        <ViewCounter slug={project.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
