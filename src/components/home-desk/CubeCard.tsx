"use client";

import { useState } from "react";
import { useDesk } from "./SecretsProvider";

const FACE = ["#e8553a", "#ffd84d", "#7cc3e8", "#9ed39a", "#ffffff", "#f39a3c"];
const SOLVED = Array<string>(9).fill(FACE[0]);

export function CubeCard({ pb }: { pb: string }) {
  const { found } = useDesk();
  const [cells, setCells] = useState(SOLVED);
  const solved = cells.every((c) => c === cells[0]);

  const scramble = () => {
    setCells(cells.map(() => FACE[Math.floor(Math.random() * FACE.length)]));
    found("cube", "Scrambled. Now solve it. I'll wait.");
  };

  return (
    <div className="flex items-center gap-5 rounded-[18px] border-[1.5px] border-dashed border-desk-ink bg-desk-card p-5">
      <button
        type="button"
        onClick={scramble}
        aria-label="Scramble the cube face"
        className="desk-cube grid shrink-0 cursor-pointer grid-cols-[repeat(3,26px)] gap-[3px] rounded-lg bg-desk-ink p-[5px]"
      >
        {cells.map((c, i) => (
          <span key={i} className="size-[26px] rounded-[4px] transition-colors duration-[250ms]" style={{ background: c }} />
        ))}
      </button>
      <div>
        <p className="font-desk-mono text-[11px] text-desk-muted">PERSONAL BEST · WCA OFFICIAL</p>
        <p className="text-[34px] font-extrabold tracking-[-0.03em]">{pb}s</p>
        <p aria-live="polite" className="text-[14px] text-desk-muted">
          {solved ? "Click the face to scramble it. I promise I'm faster than this." : `Scrambled. Give me ${pb} seconds.`}
        </p>
      </div>
    </div>
  );
}
