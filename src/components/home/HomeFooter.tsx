import { Buddy } from "@/components/Buddy";
import { COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-xs)] tracking-normal text-tr-text-faint';

export function HomeFooter({ toolCount }: { toolCount: number }) {
  return (
    <footer className="relative z-[1] border-t border-tr-hairline bg-tr-surface-1">
      <div className={`max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] py-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr] items-center ${MONO}`}>
        <span>{COPY.footerLine(toolCount)}</span>
        <Buddy variant="full" />
        <span className="lg:text-right">
          {COPY.footerTop} <a href="#brief">top ↑</a>
        </span>
      </div>
    </footer>
  );
}
