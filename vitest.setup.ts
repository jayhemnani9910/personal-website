// jsdom implements neither matchMedia nor ResizeObserver, and the motion layer
// reaches for both: usePrefersReducedMotion drives every animation primitive
// and reader mode through useSyncExternalStore, so any component rendering the
// masthead dies on mount without this.
//
// matches:false means tests run as "motion allowed", the default a visitor gets.

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// framer-motion's scroll/viewport hooks probe this.
window.scrollTo = () => {};

// Testing Library only auto-cleans when vitest globals are on, and this repo
// imports describe/it/expect explicitly instead. Without this every render()
// appends to the same document.body and the second test onwards fails with
// "found multiple elements".
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
