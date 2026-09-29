"use client";

import dynamic from "next/dynamic";

// Decorative, behind everything, and it renders nothing at all under reduced
// motion or on a machine without WebGL. next/dynamic only splits a chunk off
// when it is called from a Client Component, which is why this wrapper exists:
// called from the server-rendered HomeV4 it stayed in the first-load bundle.
export const GlBackdropLazy = dynamic(() => import("./GlBackdrop").then((m) => m.GlBackdrop), { ssr: false });
