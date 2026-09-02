"use client";

import { useState } from "react";

interface SkillGroup {
  category: string;
  items: string[];
}

const MONO = "font-[family-name:var(--ff-mono)]";

// The design's copy ("Click a group to see where it was used") points at a
// "USED IN · <sentence>" line per group. resume.ts carries no such field, and
// nothing here invents where a skill was actually used, so that line is
// omitted rather than fabricated.
export function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  const [active, setActive] = useState(0);
  const current = groups[active];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap gap-2">
        {groups.map((g, i) => (
          <button
            key={g.category}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={`${MONO} h-[30px] rounded-full border px-[.8rem] text-[12.5px] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
              i === active
                ? "border-tr-ember bg-tr-ember text-tr-on-ember"
                : "border-tr-hairline text-tr-text-mute hover:border-tr-ember"
            }`}
          >
            {g.category}
          </button>
        ))}
      </div>
      {current ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {current.items.map((item) => (
            <span
              key={item}
              className={`${MONO} rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-bg px-[10px] py-[6px] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
