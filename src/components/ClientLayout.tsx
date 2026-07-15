"use client";

import { ReactLenis } from "lenis/react";
import { TerminalProvider } from "@/context/TerminalContext";
import { TerminalOverlay } from "@/components/TerminalOverlay";
import { SkipLink } from "@/components/SkipLink";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TransitionLayout } from "@/components/TransitionLayout";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Preloader } from "@/components/motion/Preloader";
import { Cursor } from "@/components/motion/Cursor";
import { ReaderMode } from "@/components/ReaderMode";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const pathname = usePathname();
    const isLanding = pathname === "/";

    const content = (
        <TerminalProvider>
            <TerminalOverlay />
            <TransitionLayout>
                {children}
            </TransitionLayout>
        </TerminalProvider>
    );

    return (
        <MotionProvider>
            {/* Overlays: both self-gate to nothing under reduced motion / touch,
                and neither wraps page content (the preloader is a sibling scrim
                that paints over already-rendered content, the cursor is a fixed
                reticle). Order does not matter since both are position:fixed. */}
            <ReaderMode />
            <Preloader />
            <Cursor />
            <ScrollToTop />
            <SkipLink />
            {prefersReducedMotion || !isLanding ? (
                content
            ) : (
                <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothWheel: true }}>
                    {content}
                </ReactLenis>
            )}
        </MotionProvider>
    );
}
