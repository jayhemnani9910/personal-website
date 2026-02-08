"use client";

import { ReactLenis } from "lenis/react";
import { TerminalProvider } from "@/context/TerminalContext";
import { TerminalOverlay } from "@/components/TerminalOverlay";
import { SkipLink } from "@/components/SkipLink";
import { TransitionLayout } from "@/components/TransitionLayout";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const prefersReducedMotion = useReducedMotion();
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
        <>
            <SkipLink />
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
