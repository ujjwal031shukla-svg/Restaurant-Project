'use client';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/Navbar';
import { SectionIndicators } from '@/components/ui/SectionIndicators';
import { BookingDrawer } from '@/components/ui/BookingDrawer';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { MenuOverlay } from '@/components/ui/MenuOverlay';
import { Footer } from '@/components/ui/Footer';

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
  return (
    <main className="relative h-screen bg-background text-on-surface">
      {/* Fixed 3D scroll rig owns its scroll container (5 pages). */}
      <MainCanvas />

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
