'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { DISHES } from '@/data/menu';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(Draggable);

/**
 * Horizontal drag slider through the full dish archive. GSAP Draggable with
 * hand-rolled inertia (no Club plugins): release velocity carries the strip
 * with a power3 ease into clamped bounds. Clicking a thumb syncs the 3D
 * inspector (category + dish). A drag suppresses the click that follows it.
 */
export function DishStrip() {
  const track = useRef(null);
  const selectedDishId = useStore((s) => s.selectedDishId);
  const setSelectedDishId = useStore((s) => s.setSelectedDishId);
  const setMenuCategory = useStore((s) => s.setMenuCategory);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let moved = 0;

    const maxScroll = () => Math.max(0, el.scrollWidth - el.parentElement.clientWidth);
    const inst = Draggable.create(el, {
      type: 'x',
      bounds: { minX: -maxScroll(), maxX: 0 },
      onPress() {
        gsap.killTweensOf(el);
        lastX = gsap.getProperty(el, 'x');
        lastT = performance.now();
        vel = 0;
        moved = 0;
      },
      onDrag() {
        const now = performance.now();
        const x = gsap.getProperty(el, 'x');
        const dt = Math.max(1, now - lastT);
        vel = ((x - lastX) / dt) * 16;
        moved += Math.abs(x - lastX);
        lastX = x;
        lastT = now;
      },
      onDragEnd() {
        const max = maxScroll();
        const target = Math.max(-max, Math.min(0, gsap.getProperty(el, 'x') + vel * 22));
        gsap.to(el, {
          x: target,
          duration: 0.9,
          ease: 'power3.out',
          onUpdate: () => inst[0].update(),
        });
      },
      onClick(e) {
        // A real drag must not also fire the thumb click beneath it.
        if (moved > 8) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    })[0];

    const onResize = () => inst.applyBounds({ minX: -maxScroll(), maxX: 0 });
    window.addEventListener('resize', onResize);
    const imgs = Array.from(el.querySelectorAll('img'));
    const onImg = () => inst.applyBounds({ minX: -maxScroll(), maxX: 0 });
    imgs.forEach((img) => img.addEventListener('load', onImg));

    return () => {
      window.removeEventListener('resize', onResize);
      imgs.forEach((img) => img.removeEventListener('load', onImg));
      inst.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="pointer-events-auto w-full max-w-xl overflow-hidden"
      data-cursor="DRAG"
      aria-label="Drag through all dishes"
    >
      <div ref={track} className="flex w-max cursor-grab gap-2.5 pb-1 active:cursor-grabbing">
        {DISHES.map((d) => {
          const active = d.id === selectedDishId;
          return (
            <button
              key={d.id}
              onClick={() => {
                setMenuCategory(d.category);
                setSelectedDishId(d.id);
              }}
              data-cursor="VIEW DISH"
              aria-label={`Inspect ${d.name}`}
              aria-pressed={active}
              className={`flex w-20 shrink-0 flex-col gap-1 rounded-xl p-1.5 text-left transition-all ${
                active ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface-container-lowest/80 hover:bg-surface-container-high'
              }`}
            >
              {d.photo ? (
                <img src={d.photo} alt="" draggable={false} loading="lazy" className="pointer-events-none h-12 w-full rounded-lg object-cover" />
              ) : (
                <div className="pointer-events-none h-12 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${d.accent}, #1c1b1b)` }} aria-hidden />
              )}
              <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-on-surface">{d.name}</span>
              <span className="text-[11px] font-bold text-primary">${d.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DishStrip;
