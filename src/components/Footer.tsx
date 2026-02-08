"use client";

import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const lenis = useLenis();

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      className="py-6"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="section-shell">
        <div className="flex justify-between items-center">
          {/* Copyright */}
          <p className="body-sm" style={{ color: "var(--text-muted)" }}>
            © {currentYear} Jay Hemnani
          </p>

          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2 body-sm transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
