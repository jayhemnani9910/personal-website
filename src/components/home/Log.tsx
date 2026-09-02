import { COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint';

type LogEntry = { when: string; role: string; org: string; what: string };

export function Log({ entries }: { entries: LogEntry[] }) {
  return (
    <section
      id="log"
      aria-labelledby="log-h2"
      className="border-t border-tr-hairline py-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)]"
    >
      <div>
        <h2
          id="log-h2"
          className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium"
        >
          {COPY.logH2}
        </h2>
        <p className="mt-5 max-w-[40ch] text-tr-text-mute">{COPY.logDeck}</p>
        <p className={`${MONO} mt-4`}>{COPY.logAside}</p>
      </div>

      <ol className="list-none m-0 p-0">
        {entries.map((e) => (
          <li key={`${e.when}-${e.org}`} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-6 py-4 border-t border-tr-hairline">
            <span className={`${MONO} pt-[3px]`}>{e.when}</span>
            <div>
              <p className="font-medium tracking-[-.01em]">
                {e.role} <span className="text-tr-text-mute font-normal">· {e.org}</span>
              </p>
              <p className="mt-[.3rem] text-[13.5px] leading-[var(--tr-lh-prose)] text-tr-text-mute">{e.what}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
