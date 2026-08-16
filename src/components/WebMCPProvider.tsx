"use client";

import { useEffect } from "react";
import { registerWebMCPTools, unregisterWebMCPTools, isWebMCPAvailable } from "@/lib/webmcp";
import type { SiteData } from "@/lib/webmcp";

interface WebMCPProviderProps {
  data: SiteData;
}

/**
 * Client component that initializes WebMCP tools on mount.
 * Receives pre-loaded site data from a server component parent.
 *
 * WebMCP (W3C standard) lets AI agents interact with the site
 * via navigator.modelContext in Chrome 146+.
 */
export function WebMCPProvider({ data }: WebMCPProviderProps) {
  useEffect(() => {
    if (!isWebMCPAvailable()) return;

    registerWebMCPTools(data);

    return () => {
      unregisterWebMCPTools();
    };
  }, [data]);

  // Renders nothing — purely a side-effect component
  return null;
}
