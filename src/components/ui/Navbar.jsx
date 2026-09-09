'use client';

import { useStore } from '@/store/useStore';

const LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'story', label: 'Story' },
  { id: 'booking', label: 'Tables' },
  { id: 'menu', label: 'Menu' },
  { id: 'visit', label: 'Visit' },
];

export function scrollToSection(id) {
  // 3D scroll container first, 2D fallback sections second.
  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  document.getElementById(`fallback-${id}`)?.scrollIntoView({ behavior: 'smooth' });
}

/** Fixed top bar — pointer-events-auto so it sits above the 3D canvas. */
export function Navbar() {
  const cartItems = useStore((s) => s.cartItems);
  const openCart = useStore((s) => s.openCart);
  const activeSection = useStore((s) => s.activeSection);
  const count = cartItems.reduce((n, i) => n + i.qty, 0);

  return (
    <header className="pointer-events-auto fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <button
        onClick={() => scrollToSection('hero')}
        className="rounded-full bg-surface-container-lowest/70 px-4 py-2 font-display text-lg tracking-tight text-on-surface backdrop-blur-xl"
        aria-label="AURA Dine — back to top"
      >
        AURA<span className="italic text-primary"> Dine</span>
      </button>

      <nav className="hidden items-center gap-1 rounded-full bg-surface-container-lowest/70 p-1 backdrop-blur-xl md:flex" aria-label="Sections">
        {LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => scrollToSection(l.id)}
            aria-current={activeSection === l.id ? 'page' : undefined}
            className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeSection === l.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={openCart}
          className="relative rounded-full bg-surface-container-lowest/70 p-2.5 text-on-surface backdrop-blur-xl transition-colors hover:text-primary"
          aria-label={`Open order, ${count} items`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-on-primary">
              {count}
            </span>
          )}
        </button>
        <button
          onClick={() => scrollToSection('booking')}
          data-cursor="RESERVE"
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(255,190,128,0.35)] transition-transform hover:scale-105 active:scale-95"
        >
          Book a Table
        </button>
      </div>
    </header>
  );
}

export default Navbar;
