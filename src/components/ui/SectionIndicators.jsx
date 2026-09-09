'use client';

import { useStore } from '@/store/useStore';
import { scrollToSection } from './Navbar';

const DOTS = ['hero', 'story', 'booking', 'menu', 'visit'];

/** Floating right-edge progress dots + thin progress bar. */
export function SectionIndicators() {
  const activeSection = useStore((s) => s.activeSection);
  const scrollProgress = useStore((s) => s.scrollProgress);

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 right-3 z-30 hidden flex-col items-center justify-center gap-3 sm:flex" aria-hidden={false}>
        {DOTS.map((id) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            aria-label={`Go to ${id}`}
            aria-current={activeSection === id ? 'true' : undefined}
            className="pointer-events-auto group p-2.5"
          >
            <span
              className={`block rounded-full transition-all ${
                activeSection === id
                  ? 'h-6 w-2 bg-primary shadow-[0_0_10px_rgba(255,190,128,0.6)]'
                  : 'h-2 w-2 bg-surface-container-highest group-hover:bg-secondary'
              }`}
            />
          </button>
        ))}
      </div>
      {/* Top scroll progress hairline */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent" aria-hidden>
        <div
          className="h-full bg-gradient-to-r from-secondary to-primary transition-[width]"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>
    </>
  );
}

export default SectionIndicators;
