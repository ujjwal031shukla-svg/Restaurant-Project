'use client';

import { useEffect, useRef, useState } from 'react';
import { finePointer } from '@/lib/scrollfx';

/**
 * Floating luxury cursor: gold dot + trailing ring that expands into a
 * labeled pill over interactive elements. Opt in per element with
 * data-cursor="VIEW DISH" (any short label). Fine pointers only — touch
 * devices keep the native experience, and `cursor: none` is applied via
 * the `fine-pointer` class on <html> (see globals.css).
 */
export function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pill = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!finePointer()) return undefined;
    setEnabled(true);
    document.documentElement.classList.add('fine-pointer');

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let label = '';
    let down = false;
    let raf = 0;

    const apply = () => {
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) {
        ringPos.x += (pos.x - ringPos.x) * 0.16;
        ringPos.y += (pos.y - ringPos.y) * 0.16;
        const s = down ? 0.8 : 1;
        ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) scale(${s})`;
      }
      if (pill.current) {
        pill.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        pill.current.style.opacity = label ? '1' : '0';
      }
      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const onOver = (e) => {
      const hit = e.target?.closest?.('[data-cursor]');
      const next = hit?.getAttribute('data-cursor') ?? '';
      if (next !== label) {
        label = next;
        if (pill.current) pill.current.textContent = label;
        ring.current?.classList.toggle('cursor-live', Boolean(label));
      }
    };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.classList.remove('fine-pointer');
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
      <div ref={dot} className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-primary" />
      <div
        ref={ring}
        className="cursor-ring absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-primary/70 transition-[width,height,margin,background-color] duration-300"
      />
      <div
        ref={pill}
        className="absolute left-0 top-0 -ml-10 -mt-12 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary opacity-0 transition-opacity duration-200"
      />
    </div>
  );
}

export default CustomCursor;
