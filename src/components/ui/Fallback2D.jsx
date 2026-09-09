'use client';

import { CATEGORIES, DISHES, SHOWCASE_IDS, dishesByCategory } from '@/data/menu';
import { TABLES, useStore } from '@/store/useStore';

function scrollToFallback(id) {
  document.getElementById(`fallback-${id}`)?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Graceful 2D fallback for devices without WebGL (or a crashed GL context).
 * Fully keyboard-navigable, reuses the same store so booking + cart drawers
 * (rendered above in page.jsx) keep working with zero 3D dependency.
 */
export function Fallback2D() {
  const menuCategory = useStore((s) => s.menuCategory);
  const setMenuCategory = useStore((s) => s.setMenuCategory);
  const addToOrder = useStore((s) => s.addToOrder);
  const openCart = useStore((s) => s.openCart);
  const selectedTableId = useStore((s) => s.selectedTableId);
  const openBooking = useStore((s) => s.openBooking);

  const showcase = SHOWCASE_IDS.map((id) => DISHES.find((d) => d.id === id)).filter(Boolean);
  const menu = dishesByCategory(menuCategory);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background text-on-surface">
      {/* Hero */}
      <section id="fallback-hero" className="flex min-h-[92vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="rounded-full bg-surface-container px-4 py-1 text-xs uppercase tracking-widest text-primary">
          2D mode · WebGL unavailable
        </p>
        <h1 className="font-display text-5xl tracking-tight">
          Tentative <span className="italic font-light text-primary">Heaven</span>
        </h1>
        <p className="max-w-xl text-on-surface-variant">
          Your browser couldn&apos;t start WebGL, so here&apos;s the full experience in 2D —
          every dish, table and the complete menu below.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => openBooking(selectedTableId ?? 'T-04')} className="rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-primary">
            Book a Table
          </button>
          <button onClick={() => scrollToFallback('menu')} className="rounded-full bg-surface-container-high px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-surface">
            Explore Menu
          </button>
        </div>
      </section>

      {/* Story */}
      <section id="fallback-story" className="mx-auto grid max-w-5xl gap-4 px-6 py-16 md:grid-cols-3">
        {showcase.map((d, i) => (
          <article key={d.id} className="rounded-2xl bg-surface-container-lowest p-5 shadow-xl">
            <div className="mb-4 h-32 rounded-xl" style={{ background: `linear-gradient(135deg, ${d.accent}55, #1c1b1b)` }} aria-hidden />
            <p className="text-xs uppercase tracking-widest text-primary">Course 0{i + 1}</p>
            <h2 className="font-display text-2xl">{d.name}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{d.desc}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-2xl text-primary">${d.price}</span>
              <button onClick={() => { addToOrder({ id: d.id, name: d.name, price: d.price }); openCart(); }} className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary">
                Add
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Tables */}
      <section id="fallback-booking" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-3xl">Select Your Atmosphere</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Tap a table to open its reservation card.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABLES.map((t) => {
            const reserved = t.status === 'reserved';
            const selected = selectedTableId === t.id;
            return (
              <button
                key={t.id}
                disabled={reserved}
                onClick={() => openBooking(t.id)}
                className={`rounded-xl p-4 text-left transition-all ${
                  selected
                    ? 'bg-primary/20 shadow-[0_0_24px_rgba(255,190,128,0.25)] ring-2 ring-primary'
                    : reserved
                      ? 'cursor-not-allowed bg-surface-container-lowest/40 opacity-40'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
              >
                <span className={`text-sm font-bold ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {t.id}{t.vip ? ' VIP' : ''}
                </span>
                <span className="block text-xs uppercase text-on-surface-variant">
                  {reserved ? 'Reserved' : `${t.seats} Seats · ${t.zone}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Menu */}
      <section id="fallback-menu" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-3xl">The Degustation Archive</h2>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setMenuCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                menuCategory === c ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {menu.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4">
              <div className="h-14 w-14 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${d.accent}, #1c1b1b)` }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{d.name}</p>
                <p className="truncate text-xs text-on-surface-variant">{d.desc}</p>
                <p className="text-sm font-bold text-primary">${d.price}</p>
              </div>
              <button onClick={() => addToOrder({ id: d.id, name: d.name, price: d.price })} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-lg text-on-surface hover:bg-primary hover:text-on-primary" aria-label={`Add ${d.name} to order`}>
                +
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Visit */}
      <section id="fallback-visit" className="mx-auto max-w-5xl px-6 pb-24 pt-8 text-sm text-on-surface-variant">
        <p className="font-display text-2xl text-on-surface">Visit us</p>
        <p className="mt-2">Level 42, Garden Tower · Tue – Sun · 6 PM – 11 PM</p>
        <p>+81 03-1234-5678 · reserve@auradine.example</p>
      </section>
    </div>
  );
}

export default Fallback2D;
