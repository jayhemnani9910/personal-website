"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function JHPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 rounded-full border-2" style={{ borderColor: 'var(--accent)', background: 'var(--bg-secondary)' }}>
            <span className="font-mono font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>JH</span>
          </div>

          {/* Coming Soon */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Coming Soon
          </h1>

          <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Something new is in the works. Stay tuned.
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mb-12">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:gap-3"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
