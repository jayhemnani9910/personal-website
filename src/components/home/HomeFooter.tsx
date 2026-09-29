"use client";

import { COPY } from "@/data/home";
import { ReaderToggle } from "@/components/ReaderToggle";
import { useJump } from "./useJump";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] tracking-normal text-tr-text-mute';

export function HomeFooter() {
  const jump = useJump();

  return (
    <footer className="relative z-[1] border-t border-tr-hairline bg-tr-surface-1">
      <div className={`max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] py-3 flex items-center justify-between gap-4 ${MONO}`}>
        <span>{COPY.footerLine}</span>
        <span className="flex gap-6">
          <ReaderToggle />
          <a href="#brief" onClick={jump("#brief")}>
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </span>
      </div>
    </footer>
  );
}
