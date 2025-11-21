"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { RESUME } from "@/data/resume";
import { useRef } from "react";

const Word = ({ children, range, progress }: { children: string; range: [number, number]; progress: MotionValue<number> }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-2 inline-block transition-opacity duration-500">
      {children}
    </motion.span>
  );
};

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.5"],
  });

  const words = RESUME.summary.split(" ");

  return (
    <section ref={containerRef} id="about" className="relative py-32 container mx-auto px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-mono text-[var(--color-accent-cyan)] mb-12 tracking-widest uppercase"
        >
          About Me
        </motion.h2>

        <div className="mb-32">
          <p className="text-4xl md:text-6xl font-bold leading-tight text-white flex flex-wrap tracking-tight">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;
              return (
                <Word key={i} range={[start, end]} progress={scrollYProgress}>
                  {word}
                </Word>
              );
            })}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-8 text-[var(--color-text-primary)] px-2 tracking-tight">Core Competencies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESUME.skills.find(s => s.category === "Core Competencies")?.items.map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
              >
                <span className="text-[var(--color-accent-primary)] text-xl group-hover:scale-110 transition-transform">▹</span>
                <span className="text-[var(--color-text-secondary)] font-medium text-lg group-hover:text-white transition-colors">{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
