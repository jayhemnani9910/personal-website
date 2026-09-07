import { Buddy } from "@/components/Buddy";
import { COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] tracking-normal text-tr-text-mute';

export function HomeFooter() {
  return (
    <footer className="relative z-[1] border-t border-tr-hairline bg-tr-surface-1">
      <div className={`max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] py-3 flex items-center justify-between gap-4 ${MONO}`}>
        <span>{COPY.footerLine}</span>
        {/* Below lg the section rail is hidden, so this is the only place the
            mascot can live. The wrapper carries `lg:hidden` rather than Buddy
            itself: the .buddy display rules in globals.css are unlayered, and
            unlayered CSS beats every Tailwind utility, so `hidden` on the
            component would not take. */}
        <span className="lg:hidden">
          <Buddy variant="mini" />
        </span>
        <span>
          <a href="#brief">Back to top ↑</a>
        </span>
      </div>
    </footer>
  );
}
