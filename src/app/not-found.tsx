"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Glitch text effect component
function GlitchText({ text }: { text: string }) {
  const [glitchText, setGlitchText] = useState(text);

  useEffect(() => {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
    let interval: NodeJS.Timeout;

    const glitch = () => {
      const arr = text.split("");
      const randomIndex = Math.floor(Math.random() * arr.length);
      arr[randomIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      setGlitchText(arr.join(""));

      setTimeout(() => setGlitchText(text), 100);
    };

    interval = setInterval(glitch, 2000);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{glitchText}</span>
      <span
        className="absolute top-0 left-0.5 opacity-70 z-0"
        style={{ color: "var(--accent-cyan, #00F5FF)" }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 -left-0.5 opacity-70 z-0"
        style={{ color: "var(--accent-purple, #A855F7)" }}
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          {/* Glitch 404 */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-[8rem] md:text-[12rem] font-bold leading-none mb-4 font-mono"
            style={{ color: "var(--text-primary)" }}
          >
            <GlitchText text="404" />
          </motion.h1>

          {/* Terminal-style message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-mono text-sm md:text-base mb-8 p-4 rounded-lg text-left"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)"
            }}
          >
            <p className="text-red-400">ERROR: Page not found</p>
            <p style={{ color: "var(--text-muted)" }}>
              The requested resource does not exist on this server.
            </p>
            <p style={{ color: "var(--accent-cyan, #00F5FF)" }} className="mt-2">
              guest@jey-os:~$ <span className="animate-pulse">_</span>
            </p>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/" className="btn btn-primary">
              Return Home
            </Link>
            <Link href="/#projects" className="btn btn-secondary">
              View Projects
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
