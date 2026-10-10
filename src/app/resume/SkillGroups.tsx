"use client";

import { useState } from "react";
import { CHIP, PILL, PILL_ACTIVE } from "@/components/desk";

interface SkillGroup {
  category: string;
  items: string[];
}


// The design's copy ("Click a group to see where it was used") pointed at a
// "USED IN · <sentence>" line per group. resume.ts carries no such field, and
// nothing here invents where a skill was actually used, so that line is
// omitted rather than fabricated, and the page copy says what the click does.
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
            className={`${PILL} cursor-pointer ${i === active ? PILL_ACTIVE : "hover:bg-tr-surface-2"}`}
          >
            {g.category}
          </button>
        ))}
      </div>
      {/* Polite live region, so the swap is not silent to a screen reader. */}
      {current ? (
        <div aria-live="polite" className="mt-5 flex flex-wrap gap-1.5 border-t border-dashed border-tr-rule-soft pt-5">
          {current.items.map((item) => (
            <span key={item} className={CHIP}>
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
