// Shared mutable scroll-FX state (no React re-renders in the hot path).
// Written by SmoothScroll's Lenis loop, read by ScrollRig (camera roll)
// and overlay skew transforms.

export const scrollFX = {
  /** Latest Lenis scroll velocity (px/frame-ish), decayed toward 0. */
  velocity: 0,
};

let scrollEl = null;
/** The drei ScrollControls internal scroll container (set once found). */
export function setScrollEl(el) {
  scrollEl = el;
}
export function getScrollEl() {
  return scrollEl;
}

export function prefersReduced() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function finePointer() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: fine)').matches
  );
}
