"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { Buddy } from "@/components/Buddy";

type Section = "cover" | "work" | "writing" | "about" | "fde";

export function EditorialMasthead({ active }: { active?: Section }) {
  const { toggleTheme } = useTheme();
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="mh-issue tabular">
          <Buddy variant="mini" className="mh-buddy" />
        </div>
        <Link className="mh-logo" href="/">
          Jay Hemnani
        </Link>
        <nav className="mh-nav">
          <Link href="/" className={active === "cover" ? "active" : undefined}>Cover</Link>
          <Link href="/projects" className={active === "work" ? "active" : undefined}>Work</Link>
          <Link href="/blog" className={active === "writing" ? "active" : undefined}>Writing</Link>
          <Link href="/resume" className={active === "about" ? "active" : undefined}>About</Link>
          <Link href="/fde" className={active === "fde" ? "active" : undefined}>FDE</Link>
          <button className="mh-theme" type="button" aria-label="Toggle theme" onClick={toggleTheme} />
        </nav>
      </div>
    </header>
  );
}
