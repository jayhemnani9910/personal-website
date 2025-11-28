"use client";

import { ReactLenis } from "lenis/react";
import { ChronosBackground } from "@/components/ChronosBackground";
import { AmbientBackground } from "@/components/AmbientBackground";
import { MousePositionProvider } from "@/context/MousePositionContext";
import { GlobalBackground } from "@/components/GlobalBackground";
import { TerminalProvider } from "@/context/TerminalContext";
import { TerminalOverlay } from "@/components/TerminalOverlay";
import { SkipLink } from "@/components/SkipLink";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = useReducedMotion();
    const pathname = usePathname();
    const isLanding = pathname === "/";
    const needsMouse = !prefersReducedMotion && isLanding;

    const inner = (
        <TerminalProvider>
            {!prefersReducedMotion && isLanding && <GlobalBackground />}
            <TerminalOverlay />
            {children}
        </TerminalProvider>
    );

    const content = needsMouse ? (
        <MousePositionProvider>{inner}</MousePositionProvider>
    ) : (
        inner
    );

    return (
        <>
            <SkipLink />
            {!prefersReducedMotion && isLanding && <AmbientBackground />}
            {!prefersReducedMotion && isLanding && <ChronosBackground />}
            {prefersReducedMotion || !isLanding ? (
                content
            ) : (
                <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothWheel: true }}>
                    {content}
                </ReactLenis>
            )}
        </>
    );
}
