"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import { TerminalProvider, useTerminal } from "@/context/TerminalContext";
import { SkipLink } from "@/components/SkipLink";
import { TransitionLayout } from "@/components/TransitionLayout";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Preloader } from "@/components/motion/Preloader";
import { Cursor } from "@/components/motion/Cursor";
import { ReaderMode } from "@/components/ReaderMode";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePathname } from "next/navigation";

// The shell renders nothing until it is opened, and off the home page the only
// way in is a keyboard shortcut (Ctrl/Cmd+K or backtick, handled in
// TerminalContext). So it is not in any page's first-load JS: it comes down the
// first time it opens and stays mounted after that.
const TerminalOverlay = dynamic(() => import("@/components/TerminalOverlay").then((m) => m.TerminalOverlay), {
    ssr: false,
});

function LazyTerminal({ projectCount }: { projectCount: number }) {
    const { isOpen } = useTerminal();
    const [opened, setOpened] = useState(false);
    if (isOpen && !opened) setOpened(true);
    return opened ? <TerminalOverlay projectCount={projectCount} /> : null;
}

export function ClientLayout({ children, projectCount }: { children: React.ReactNode; projectCount: number }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const pathname = usePathname();
    const smoothScroll = pathname === "/" && !prefersReducedMotion;

    return (
        <MotionProvider>
            {/* Overlays: both self-gate to nothing under reduced motion / touch,
                and neither wraps page content (the preloader is a sibling scrim
                that paints over already-rendered content, the cursor is a fixed
                reticle). Order does not matter since both are position:fixed. */}
            <ReaderMode />
            <Preloader />
            <Cursor />
            <SkipLink />
            {/* Lenis in root mode drives the document scroller, so it does not
                need to wrap the page. As a childless sibling it can come and go
                (home only, never under reduced motion) without changing the
                tree above the page, which used to remount everything on every
                navigation into or out of /. `duration` is the one tuning knob:
                with it set, Lenis ignores `lerp`. */}
            {smoothScroll && <ReactLenis root options={{ duration: 1.2 }} />}
            <TerminalProvider>
                <LazyTerminal projectCount={projectCount} />
                <TransitionLayout>{children}</TransitionLayout>
            </TerminalProvider>
        </MotionProvider>
    );
}
