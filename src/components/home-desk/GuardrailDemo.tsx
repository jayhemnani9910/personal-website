"use client";

import { useState } from "react";
import { quoteSupported, type GuardrailResult } from "@/lib/quote-guardrail";
import { BTN, CARD, CHIP, LABEL, PILL, PILL_ACTIVE } from "@/components/desk";

// A made-up chart, written for this demo. No real patient is on this site.
const PAGES: Record<number, string> = {
  1: "Discharge note. Impression: acute gastroenteritis with dehydration. Urine culture awaited.",
  2: "ER chart. Glucose 443 mg/dL. Ultrasound suggestive of pyelonephritis.",
};

const ATTEMPTS = [
  { label: "A real quote", page: 1, quote: "acute gastroenteritis with dehydration" },
  { label: "A confident upgrade", page: 2, quote: "confirmed pyelonephritis" },
  { label: "The wrong page", page: 1, quote: "Glucose 443 mg/dL" },
  { label: "A result that isn't back", page: 1, quote: "Urine culture negative" },
];

export function GuardrailDemo() {
  const [page, setPage] = useState(1);
  const [quote, setQuote] = useState("");
  const [result, setResult] = useState<GuardrailResult | null>(null);

  const check = (p: number, q: string) => {
    setPage(p);
    setQuote(q);
    setResult(quoteSupported(PAGES, p, q));
  };

  return (
    <div className={`${CARD} grid gap-6 p-[clamp(18px,3vw,32px)] lg:grid-cols-2`}>
      <div>
        <p className={LABEL}>The chart (made up, no real patient)</p>
        {Object.entries(PAGES).map(([n, text]) => (
          <p key={n} className="mt-3 rounded-[10px] bg-tr-surface-2 p-3.5 text-[14px] leading-normal">
            <span className={`${CHIP} mr-2 bg-tr-surface-1`}>page {n}</span>
            {text}
          </p>
        ))}
        <p className={`${LABEL} mt-6`}>Things an agent might try</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ATTEMPTS.map((a) => (
            <li key={a.label}>
              <button type="button" className={`${PILL} cursor-pointer`} onClick={() => check(a.page, a.quote)}>
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(page, quote);
        }}
      >
        <p className={LABEL}>record_field()</p>
        <fieldset className="mt-3">
          <legend className="sr-only">Cited page</legend>
          <div className="flex gap-2">
            {[1, 2].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={page === n}
                className={`${PILL} cursor-pointer ${page === n ? PILL_ACTIVE : ""}`}
                onClick={() => setPage(n)}
              >
                page {n}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor="guardrail-quote" className="mt-4 block text-[15px] font-semibold">
          Your quote. Try to sneak something past it.
        </label>
        <textarea
          id="guardrail-quote"
          rows={2}
          maxLength={200}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          className="mt-2 w-full rounded-[10px] border-[1.5px] border-tr-hairline bg-tr-bg p-3 font-mono text-[14px]"
        />
        <button type="submit" className={`${BTN} mt-3 cursor-pointer`}>
          Run the check
        </button>
        <p aria-live="polite" className="mt-4 min-h-[52px] font-mono text-[14px] leading-normal">
          {result &&
            (result.ok ? (
              <>
                <b>recorded.</b> It&apos;s on page {page}, so it stays.
              </>
            ) : (
              <>
                <b>refused:</b> {result.reason}
              </>
            ))}
        </p>
      </form>
    </div>
  );
}
