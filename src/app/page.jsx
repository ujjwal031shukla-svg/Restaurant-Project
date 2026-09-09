'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/Navbar';
import { SectionIndicators } from '@/components/ui/SectionIndicators';
import { BookingDrawer } from '@/components/ui/BookingDrawer';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { MenuOverlay } from '@/components/ui/MenuOverlay';
import { Footer } from '@/components/ui/Footer';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { TABLES, useStore } from '@/store/useStore';

// Static splash while the canvas chunk downloads — intentionally dependency-free
// so drei/three stay out of the initial bundle.
function StaticSplash() {
  return (
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center gap-4 bg-background">
      <p className="font-display text-3xl text-on-surface">
        AURA<span className="italic text-primary"> Dine</span>
      </p>
      <div className="h-1 w-40 animate-pulse rounded-full bg-surface-container-highest" />
    </div>
  );
}

// Canvas touches WebGL — client-only, no SSR.
const MainCanvas = dynamic(() => import('@/components/3d/MainCanvas'), {
  ssr: false,
  loading: () => <StaticSplash />,
});

export default function Page() {
  // Shareable reservation links: /?booking=T-04 opens that table's drawer
  // (ignored for unknown/reserved ids — openBooking guards both).
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get('booking');
      const table = TABLES.find((t) => t.id === id);
      if (table && table.status !== 'reserved') useStore.getState().openBooking(table.id);
    } catch {
      /* non-browser or malformed query — stay on the default view */
    }
  }, []);

  return (
    <main className="relative h-screen bg-[#0a0a0a] text-on-surface">
      {/* Fixed 3D scroll rig owns its scroll container (5 pages). */}
      <MainCanvas />
      {/* Lenis inertia + speed-skew for the journey's scroll container. */}
      <SmoothScroll />
      {/* Award-style floating cursor (fine pointers only). */}
      <CustomCursor />

      {/* 2D overlays above the canvas (z-30+). Drawers render last for top stacking. */}
      <Navbar />
      <SectionIndicators />
      <MenuOverlay />
      <Footer />
      <BookingDrawer />
      <CartDrawer />
    </main>
  );
}
