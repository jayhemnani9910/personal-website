"use client";

import { useLenis } from "lenis/react";
import { scrollToTarget } from "@/lib/scroll";

/**
 * SkipLink Component
 * 
 * Accessibility component that allows keyboard users to skip navigation
 * and jump directly to main content.
 * 
 * Invisible until focused via keyboard (Tab key).
 */
export function SkipLink() {
  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector("main");
    if (!main) return;
    main.tabIndex = -1;
    main.focus();
    scrollToTarget(main, lenis, -80);
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}
