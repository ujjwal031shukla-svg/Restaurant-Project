'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReduced, scrollFX, setScrollEl } from '@/lib/scrollfx';

gsap.registerPlugin(ScrollTrigger);

function findScroller() {
  if (typeof document === 'undefined') return null;
  const els = Array.from(document.querySelectorAll('main div'));
  return els.find((el) => el.scrollHeight > el.clientHeight + 200) ?? null;
}

/**
 * Ultra-smooth inertia scrolling for the 3D journey. Our scroll doesn't live
 * on window — drei ScrollControls owns an internal scroll container — so
 * Lenis attaches to THAT element (wrapper mode). ScrollControls keeps reading
 * native scrollTop, so camera + progress sync are untouched.
 *
 * Side effects, all in one gsap-driven loop:
 * - Lenis velocity → shared scrollFX.velocity (camera roll, skew)
 * - speed-skew on the scroll content (lerped, clamped, reduced-motion safe)
 * - ScrollTrigger sync + refresh once layout settles
 */
export function SmoothScroll() {
  useEffect(() => {
    let lenis = null;
    let tickerFn = null;
    let content = null;
    let scroller = null;
    let cancelled = false;
    let tries = 0;

    const timer = setInterval(() => {
      tries += 1;
      scroller = findScroller();
      if (!scroller && tries < 50) return; // MainCanvas (ssr:false) may lag
      clearInterval(timer);
      if (cancelled || !scroller) return;
      setScrollEl(scroller);
      content = scroller.firstElementChild;

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      const lateRefresh = setTimeout(refresh, 2500);

      if (prefersReduced()) {
        // No smoothing, no skew — native scroll stays fully usable.
        cleanupFns.push(() => {
          window.removeEventListener('load', refresh);
          clearTimeout(lateRefresh);
        });
        return;
      }

      lenis = new Lenis({
        wrapper: scroller,
        content: content ?? undefined,
        lerp: 0.09,
        smoothWheel: true,
      });
      lenis.on('scroll', (e) => {
        scrollFX.velocity = e.velocity || 0;
        ScrollTrigger.update();
      });

      let skew = 0;
      tickerFn = (time) => {
        lenis.raf(time);
        // Decay the velocity tail so skew/roll settle back to 0.
        scrollFX.velocity *= 0.9;
        const target = Math.max(-5, Math.min(5, scrollFX.velocity * 0.3));
        skew += (target - skew) * 0.12;
        if (content && Math.abs(skew) > 0.01) {
          content.style.transform = `skewY(${(-skew).toFixed(3)}deg)`;
        } else if (content && content.style.transform) {
          content.style.transform = '';
        }
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      cleanupFns.push(() => {
        window.removeEventListener('load', refresh);
        clearTimeout(lateRefresh);
      });
    }, 200);

    const cleanupFns = [];
    return () => {
      cancelled = true;
      clearInterval(timer);
      cleanupFns.forEach((fn) => fn());
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (lenis) lenis.destroy();
      scrollFX.velocity = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default SmoothScroll;
