'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';

function statusFor(p) {
  if (p < 30) return 'Firing the binchotan…';
  if (p < 60) return 'Plating the signatures…';
  if (p < 95) return 'Pouring the pairings…';
  return 'Almost seated…';
}

/**
 * Fullscreen load veil. Lives next to (not inside) <Canvas> and subscribes
 * to drei's global loading store, so HDRI / GLB suspense populates the bar.
 * Guarantees a minimum 900ms display to avoid a flash on fast connections.
 */
export function Preloader() {
  const { progress, active } = useProgress();
  const [shown, setShown] = useState(true);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (progress >= 100 && !active) {
      const wait = Math.max(0, 900 - (Date.now() - mountedAt.current));
      const t = setTimeout(() => setShown(false), wait);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  const pct = Math.round(progress);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-background px-6"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-label="Loading 3D experience"
          role="status"
        >
          <p className="rounded-full bg-surface-container px-4 py-1 text-xs uppercase tracking-widest text-primary">
            Omakase & Molecular Gastronomy
          </p>
          <p className="font-display text-4xl tracking-tight text-on-surface sm:text-5xl">
            Tentative <span className="italic font-light text-primary">Heaven</span>
          </p>
          <div className="w-64 max-w-full">
            <div className="h-1 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="uppercase tracking-widest text-on-surface-variant">{statusFor(pct)}</span>
              <span className="font-mono text-primary">{pct}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Preloader;
