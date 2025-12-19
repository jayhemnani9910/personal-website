"use client";

import { motion } from "framer-motion";
import { RESUME } from "@/data/resume";

const CATEGORY_ICONS: Record<string, string> = {
  "Languages": "💻",
  "Data": "🗄️",
  "ML/AI": "🧠",
  "MLOps": "⚙️",
  "Cloud": "☁️",
  "Visualization": "📊",
};

export function ToolkitSection() {
  return (
    <section id="toolkit" className="section-block">
      {/* Section Divider */}
      <div className="section-wide mb-12">
        <div className="h-px bg-[var(--border)]" />
      </div>

      <div className="section-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="eyebrow mb-3 block">Technologies</span>
          <h2 className="title-xl">Toolkit</h2>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESUME.skills.map((category, idx) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">
                  {CATEGORY_ICONS[category.category] || "🔧"}
                </span>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {category.category}
                </h3>
              </div>

              {/* Tech Pills */}
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <span
                    key={item.name}
                    className="px-3 py-1.5 text-sm rounded-full transition-colors"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
