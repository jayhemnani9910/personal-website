"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MSG_MAX, NAME_MAX } from "@/lib/guestbook";
import { useDesk } from "./SecretsProvider";
import { BTN_PRIMARY } from "@/components/desk";

type WallNote = { name: string; msg: string; at: number };

const STICKY = ["#ffd84d", "#ffc2b3", "#bfe3f5", "#cdeec9", "#e2d2fb"];

// Shown only while the wall is empty, and signed by the one person it is true of.
const EMPTY_NOTE: WallNote = { name: "jay", msg: "the fridge is empty. first sticky gets eternal glory (and a spot at the top).", at: 0 };

const ERRORS: Record<string, string> = {
  empty: "A blank sticky? Bold. Write something.",
  rate_limited: "That's a lot of stickies for ten minutes. Try again in a bit.",
  blocked: "That one won't stick. Try different words.",
  too_long: `Stickies are small. ${MSG_MAX} characters, tops.`,
};
const FALLBACK_ERROR = "The fridge door is stuck. Try again in a minute.";

const INPUT = "min-w-0 rounded-xl border-[1.5px] border-tr-hairline bg-tr-surface-1 px-3.5 py-3 text-[16px]";

export function Guestbook() {
  const { say } = useDesk();
  const [notes, setNotes] = useState<WallNote[] | null>(null);
  // A failed load is not an empty wall: saying "be the first" while the store
  // is down invites a post that will fail too.
  const [loadFailed, setLoadFailed] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);

  // The notes arrive after the first paint and push everything below the wall
  // down. A visitor who came in on a link to a section further down (/#hi, from
  // every page's "say hi") would land mid-wall instead, so once the notes are
  // in, the section is brought back into view, unless they have scrolled since.
  const userScrolled = useRef(false);
  useEffect(() => {
    const mark = () => {
      userScrolled.current = true;
    };
    // pointerdown covers a scrollbar drag, which fires no wheel or touch event.
    const events = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);
  useEffect(() => {
    if (notes === null || userScrolled.current || !location.hash) return;
    const wall = document.getElementById("guestbook");
    let id = location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // A malformed escape in a hand-typed link: look the raw hash up instead.
    }
    const target = document.getElementById(id);
    if (wall && target && wall.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) {
      target.scrollIntoView({ block: "start" });
    }
  }, [notes]);

  useEffect(() => {
    let live = true;
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      // A note posted while the wall was still loading is already up; keep it
      // on top rather than letting the loaded list replace it.
      .then((data: { notes: WallNote[] }) => {
        if (!live) return;
        setNotes((prev) => {
          if (!prev?.length) return data.notes;
          const mine = (n: WallNote) => prev.some((p) => p.at === n.at && p.msg === n.msg && p.name === n.name);
          return [...prev, ...data.notes.filter((n) => !mine(n))];
        });
      })
      .catch(() => {
        if (!live) return;
        setNotes([]);
        setLoadFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const text = msg.trim();
    if (!text) return say(ERRORS.empty);

    // Optimistic: the note goes up now and comes down again if the post fails.
    const draft: WallNote = { name: name.trim() || "anonymous", msg: text, at: Date.now() };
    setNotes((prev) => [draft, ...(prev ?? [])]);
    setMsg("");
    setPending(true);
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, msg: text }),
      });
      const data: { note?: WallNote; error?: string } = await r.json().catch(() => ({}));
      if (!r.ok || !data.note) throw new Error(data.error ?? "");
      const saved = data.note;
      setNotes((prev) => (prev ?? []).map((n) => (n === draft ? saved : n)));
      say("Stuck to the fridge. Thanks!");
    } catch (err) {
      setNotes((prev) => (prev ?? []).filter((n) => n !== draft));
      setMsg(text);
      say(ERRORS[err instanceof Error ? err.message : ""] ?? FALLBACK_ERROR);
    } finally {
      setPending(false);
    }
  };

  const wall = notes && notes.length > 0 ? notes : loadFailed ? [] : [EMPTY_NOTE];
  const count = notes?.length ?? 0;

  return (
    <section id="guestbook" aria-labelledby="guestbook-h2" className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] py-[60px]">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="guestbook-h2" className="text-[length:clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.035em]">
          Leave a sticky
        </h2>
        <p className="font-mono text-[13px] text-tr-text-faint">
          {notes === null
            ? "counting notes…"
            : loadFailed
              ? count === 0
                ? "couldn't reach the fridge. notes are safe, just not here right now."
                : "your note's up. the rest of the fridge didn't load."
              : `${count} ${count === 1 ? "note" : "notes"} on the fridge`}
        </p>
      </div>

      <form onSubmit={submit} className="mb-7 flex flex-wrap gap-2.5">
        <label className="sr-only" htmlFor="gb-name">
          Your name
        </label>
        <input
          id="gb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          maxLength={NAME_MAX}
          autoComplete="nickname"
          className={`${INPUT} flex-[0_1_180px]`}
        />
        <label className="sr-only" htmlFor="gb-msg">
          Your note
        </label>
        <input
          id="gb-msg"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="say something nice (or a bad joke)"
          maxLength={MSG_MAX}
          autoComplete="off"
          className={`${INPUT} flex-[1_1_260px]`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`${BTN_PRIMARY} cursor-pointer px-5! py-3! text-[16px] disabled:cursor-wait disabled:opacity-70`}
        >
          stick it
        </button>
      </form>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[22px]">
        {wall.map((n, i) => {
          // Colour and tilt follow the note's position from the oldest, so a
          // new note does not repaint every note already on the wall.
          const k = wall.length - 1 - i;
          return (
            <li
              key={`${n.at}-${k}`}
              className="desk-sticky flex min-h-[130px] flex-col gap-2.5 px-4 pb-3.5 pt-[18px] shadow-[0_8px_14px_-8px_rgba(29,26,22,0.45)]"
              style={{ background: STICKY[k % STICKY.length], ["--rot" as string]: `${((k * 37) % 9) - 4}deg` }}
            >
              <p className="flex-1 font-hand text-[23px] leading-[var(--tr-lh-hand)] [overflow-wrap:anywhere]">{n.msg}</p>
              <p className="font-mono text-[11px]">— {n.name}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
