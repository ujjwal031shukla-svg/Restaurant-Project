'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { getScrollEl, prefersReduced } from '@/lib/scrollfx';

gsap.registerPlugin(ScrollTrigger);

/**
 * Kinetic headline: splits into chars and staggers them up with a touch of
 * rotation as the heading scrolls into view (ScrollTrigger on the 3D
 * journey's scroll container). Reverts cleanly for StrictMode/HMR.
 */
export function KineticTitle({ as: Tag = 'h2', children, className = '', stagger = 0.022 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let split = null;
    let trigger = null;
    let cancelled = false;
    let polls = 0;

    const setup = () => {
      if (cancelled || !ref.current) return;
      const scroller = getScrollEl();
      if (!scroller && polls < 40) {
        polls += 1;
        setTimeout(setup, 250);
        return;
      }
      try {
        split = new SplitType(el, { types: 'lines,chars', lineClass: 'kline', charClass: 'kchar' });
      } catch {
        return; // SplitType unsupported — leave the plain heading.
      }
      const chars = el.querySelectorAll('.kchar');
      if (!chars.length) return;
      if (prefersReduced()) {
        gsap.set(chars, { yPercent: 0, rotate: 0, opacity: 1 });
        return;
      }
      gsap.set(chars, { yPercent: 115, rotate: 7, opacity: 0 });
      trigger = ScrollTrigger.create({
        trigger: el,
        scroller: scroller || undefined,
        start: 'top 88%',
        once: true,
        onEnter: () =>
          gsap.to(chars, {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            stagger,
          }),
      });
      // Already in view (e.g. hero on load) — play immediately.
      ScrollTrigger.refresh();
    };
    setup();

    return () => {
      cancelled = true;
      if (trigger) trigger.kill();
      if (split) split.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag ref={ref} className={`kinetic ${className}`}>
      {children}
    </Tag>
  );
}

export default KineticTitle;
