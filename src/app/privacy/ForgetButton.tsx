"use client";

import { useState } from "react";
import { BTN } from "@/components/desk";
import { forgetVisitor } from "@/components/home-desk/deskStore";

export function ForgetButton() {
  const [done, setDone] = useState(false);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={() => {
          forgetVisitor();
          setDone(true);
        }}
        className={`${BTN} cursor-pointer font-mono text-[14px]`}
      >
        forget me on this browser
      </button>
      <p aria-live="polite" className="font-mono text-[13px] text-tr-text-faint">
        {done ? "Done. This browser holds nothing from this site now." : ""}
      </p>
    </div>
  );
}
