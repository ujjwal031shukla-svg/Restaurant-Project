'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, DISHES, dishesByCategory } from '@/data/menu';
import { useStore } from '@/store/useStore';

/**
 * Bottom-anchored menu controls — visible only on the menu section.
 * Filter pills drive `menuCategory`; the dish card mirrors `selectedDishId`
 * (the same state Menu3D renders) with prev/next + Add to Order.
 */
export function MenuOverlay() {
  const activeSection = useStore((s) => s.activeSection);
  const menuCategory = useStore((s) => s.menuCategory);
  const setMenuCategory = useStore((s) => s.setMenuCategory);
  const selectedDishId = useStore((s) => s.selectedDishId);
  const setSelectedDishId = useStore((s) => s.setSelectedDishId);
  const addToOrder = useStore((s) => s.addToOrder);
  const openCart = useStore((s) => s.openCart);

  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  const visible = activeSection === 'menu';

  const filtered = dishesByCategory(menuCategory);
  const dish = DISHES.find((d) => d.id === selectedDishId) ?? filtered[0] ?? DISHES[0];
  const idx = Math.max(0, filtered.findIndex((d) => d.id === dish?.id));

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const step = (dir) => {
    if (filtered.length === 0) return;
    const next = filtered[(idx + dir + filtered.length) % filtered.length];
    setSelectedDishId(next.id);
  };

  const handleAdd = () => {
    if (!dish) return;
    addToOrder({ id: dish.id, name: dish.name, price: dish.price });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <AnimatePresence>
      {visible && dish && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 px-4 pb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto no-scrollbar rounded-full bg-surface-container-lowest/80 p-1.5 backdrop-blur-xl">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setMenuCategory(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  menuCategory === c ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-surface-container-lowest/85 p-3 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => step(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high" aria-label="Previous dish">←</button>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="truncate font-display text-lg text-on-surface">{dish.name}</h3>
                <span className="shrink-0 font-display text-xl text-primary">${dish.price}</span>
              </div>
              <p className="truncate text-xs text-on-surface-variant">{dish.desc}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-widest text-secondary">
                {idx + 1} / {filtered.length} · {dish.category} · Drag dish to rotate
              </p>
            </div>
            <button onClick={() => step(1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high" aria-label="Next dish">→</button>
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                onClick={handleAdd}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  added ? 'bg-secondary text-on-primary' : 'bg-primary text-on-primary hover:bg-secondary'
                }`}
              >
                {added ? 'Added ✓' : 'Add'}
              </button>
              <button onClick={openCart} className="rounded-full bg-surface-container-high px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-surface hover:bg-surface-container-highest">
                View
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MenuOverlay;
