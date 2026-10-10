"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ReactLenis, useLenis } from "lenis/react";
import { TerminalProvider, useTerminal } from "@/context/TerminalContext";
import { SkipLink } from "@/components/SkipLink";
import { TransitionLayout } from "@/components/TransitionLayout";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ReaderMode } from "@/components/ReaderMode";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePathname } from "next/navigation";

// The shell renders nothing until it is opened, by a keyboard shortcut
// (Ctrl/Cmd+K or backtick, handled in TerminalContext) or the footer's "open
// the shell" button. So it is not in any page's first-load JS: it comes down
// the first time it opens and stays mounted after that.
const TerminalOverlay = dynamic(() => import("@/components/TerminalOverlay").then((m) => m.TerminalOverlay), {
    ssr: false,
});

function LazyTerminal({ projectCount }: { projectCount: number }) {
    const { isOpen } = useTerminal();
    const [opened, setOpened] = useState(false);
    if (isOpen && !opened) setOpened(true);
    return opened ? <TerminalOverlay projectCount={projectCount} /> : null;
}

// Lenis's own frame loop runs every frame for as long as the page is open,
// even when nothing moves. This one runs only while Lenis is gliding. Every
// glide starts in scrollTo, wheel and touch included, so that is where it wakes.
function LenisFrames() {
    const lenis = useLenis();
    useEffect(() => {
        if (!lenis) return;
        let id = 0;
        const tick = (time: number) => {
            lenis.raf(time);
            id = lenis.isScrolling === "smooth" ? requestAnimationFrame(tick) : 0;
        };
        const scrollTo = lenis.scrollTo;
        // The instance is Lenis's, not React state: wrapping its method is
        // how the loop hears a glide start.
        // eslint-disable-next-line react-hooks/immutability
        lenis.scrollTo = (...args) => {
            scrollTo.apply(lenis, args);
            if (id || lenis.isScrolling !== "smooth") return;
            // Lenis times a frame from the last one it saw; after a rest that
            // gap would finish the glide in a single jump.
            lenis.time = 0;
            id = requestAnimationFrame(tick);
        };
        return () => {
            cancelAnimationFrame(id);
            lenis.scrollTo = scrollTo;
        };
    }, [lenis]);
    return null;
}

export function ClientLayout({ children, projectCount }: { children: React.ReactNode; projectCount: number }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const pathname = usePathname();
    const isHome = pathname === "/";
    const smoothScroll = isHome && !prefersReducedMotion;

    return (
        <MotionProvider>
            <ReaderMode />
            <SkipLink />
            {/* Lenis in root mode drives the document scroller, so it does not
                need to wrap the page. As a childless sibling it can come and go
                (home only, never under reduced motion) without changing the
                tree above the page, which used to remount everything on every
                navigation into or out of /. `duration` is the one tuning knob:
                with it set, Lenis ignores `lerp`. */}
            {smoothScroll && <ReactLenis root autoRaf={false} options={{ duration: 1.2 }} />}
            {smoothScroll && <LenisFrames />}
            <TerminalProvider>
                <LazyTerminal projectCount={projectCount} />
                <TransitionLayout>{children}</TransitionLayout>
            </TerminalProvider>
        </MotionProvider>
    );
}
