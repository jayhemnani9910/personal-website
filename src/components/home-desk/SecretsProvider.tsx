"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { EGGS_KEY, countVisit, parseEggs, readEggs, useStored, writeStored } from "./deskStore";

export type SecretId = "fling" | "cube" | "logo" | "hello" | "konami";

export const SECRETS: { id: SecretId; title: string; hint: string }[] = [
  { id: "fling", title: "Yeet", hint: "Throw a tile. Really throw it." },
  { id: "cube", title: "Scrambler", hint: "Something in House rules is clickable." },
  { id: "logo", title: "Persistent", hint: "Knock on the logo. A few times." },
  { id: "hello", title: "Polite", hint: "Just type hello. Anywhere." },
  { id: "konami", title: "Old soul", hint: "The footer knows." },
];

/** What the playground lets the rest of the page do to it. */
export type PlaygroundHandle = { storm: () => void; wave: () => void };

type Desk = {
  eggs: string[];
  found: (id: SecretId, message: string) => void;
  say: (message: string) => void;
  playgroundRef: RefObject<PlaygroundHandle | null>;
};

const DeskContext = createContext<Desk | null>(null);

export function useDesk(): Desk {
  const desk = useContext(DeskContext);
  if (!desk) throw new Error("useDesk must be used inside <SecretsProvider>");
  return desk;
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const TOAST_MS = 2600;

export function SecretsProvider({ children }: { children: ReactNode }) {
  const eggs = parseEggs(useStored(EGGS_KEY));
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playgroundRef = useRef<PlaygroundHandle | null>(null);

  const say = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), TOAST_MS);
  }, []);

  const found = useCallback(
    (id: SecretId, message: string) => {
      const current = readEggs();
      if (current.includes(id)) {
        say(message);
        return;
      }
      const next = [...current, id];
      writeStored(EGGS_KEY, JSON.stringify(next));
      say(`Secret ${next.length}/${SECRETS.length} · ${message}`);
    },
    [say],
  );

  useEffect(() => {
    countVisit();
  }, []);

  // "hello" and the Konami code, typed anywhere but a text field.
  useEffect(() => {
    let keys: string[] = [];
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      keys = [...keys, e.key].slice(-KONAMI.length);
      if (KONAMI.every((k, i) => keys[i] === k)) {
        found("konami", "Cheat code accepted. Tile storm incoming.");
        playgroundRef.current?.storm();
      }
      typed = (typed + e.key).slice(-5).toLowerCase();
      if (typed === "hello") {
        found("hello", "Hello yourself. The tiles say hi too.");
        playgroundRef.current?.wave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(toastTimer.current);
    };
  }, [found]);

  // `eggs` is a fresh array every render; key the memo on its contents.
  const eggKey = eggs.join(",");
  const value = useMemo(
    () => ({ eggs: eggKey ? eggKey.split(",") : [], found, say, playgroundRef }),
    [eggKey, found, say],
  );

  return (
    <DeskContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-7 z-40 flex justify-center px-4"
      >
        {toast && (
          <p className="max-w-full rounded-full border-[1.5px] border-desk-ink bg-desk-butter px-5 py-3 text-[15px] font-semibold text-desk-ink shadow-[4px_4px_0_var(--desk-ink)]">
            {toast}
          </p>
        )}
      </div>
    </DeskContext.Provider>
  );
}
