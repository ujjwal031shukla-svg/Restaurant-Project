'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Scroll, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { scrollToSection } from '@/components/ui/Navbar';
import { scrollFX } from '@/lib/scrollfx';
import { KineticTitle } from '@/components/ui/KineticTitle';
import { Hero3D } from './Hero3D';
import { DishShowcase3D } from './DishShowcase3D';
import { TableBooking3D } from './TableBooking3D';
import { Menu3D } from './Menu3D';

// Camera waypoints — one per ScrollControls page (5 pages).
const WAYPOINTS = [
  { pos: [0, 1.5, 8], look: [0, 0.5, 0] }, // 0 hero — frontal orbit
  { pos: [4.5, 2.2, 5.5], look: [0, 0.5, 0] }, // 1 story — spline glide
  { pos: [0, 9, 3.2], look: [0, 0, 0.4] }, // 2 booking — top-down / isometric
  { pos: [0, 1.6, 5.2], look: [0, 0.6, 0] }, // 3 menu — grounded inspector
  { pos: [0, 1.2, 7.5], look: [0, 0.8, 0] }, // 4 finale / footer
];

const SECTIONS = ['hero', 'story', 'booking', 'menu', 'visit'];

function sectionForOffset(offset) {
  const idx = Math.min(SECTIONS.length - 1, Math.floor(offset * SECTIONS.length));
  return SECTIONS[idx];
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _curLook = new THREE.Vector3(0, 0.5, 0);

/**
 * Must be a child of <ScrollControls>. Drives the default camera along
 * WAYPOINTS from scroll offset and mirrors progress into the Zustand store
 * so 2D overlays stay in sync.
 */
export function ScrollRig() {
  const scroll = useScroll();
  const lastSection = useRef('hero');
  const roll = useRef(0);
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const curve = useMemo(() => {
    const pts = WAYPOINTS.map((w) => new THREE.Vector3(...w.pos));
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.4);
  }, []);

  const lookCurve = useMemo(() => {
    const pts = WAYPOINTS.map((w) => new THREE.Vector3(...w.look));
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.4);
  }, []);

  useFrame((state, delta) => {
    const offset = THREE.MathUtils.clamp(scroll.offset, 0, 1);

    // Smooth camera glide along spline, plus a whisper of handheld sway
    // so the frame never feels frozen between scroll inputs.
    curve.getPoint(offset, _pos);
    lookCurve.getPoint(offset, _look);
    // Responsive distance: pull back on narrow/portrait screens so the
    // dishes and tables stay comfortably in frame on phones.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const dist = aspect < 0.75 ? 1.45 : aspect < 1.1 ? 1.2 : 1;
    _pos.sub(_look).multiplyScalar(dist).add(_look);
    const t = state.clock.elapsedTime;
    _pos.x += Math.sin(t * 0.45) * 0.06;
    _pos.y += Math.sin(t * 0.6 + 1.3) * 0.045;
    state.camera.position.lerp(_pos, 1 - Math.exp(-4 * delta));
    _curLook.lerp(_look, 1 - Math.exp(-4 * delta));
    state.camera.lookAt(_curLook);
    // Speed-roll: lean the horizon with scroll velocity (cinematic, subtle).
    if (!reduceMotion.current) {
      const target = THREE.MathUtils.clamp(-scrollFX.velocity * 0.0011, -0.028, 0.028);
      roll.current = THREE.MathUtils.damp(roll.current, target, 4, delta);
      state.camera.rotateZ(roll.current);
    }

    // Sync to store (guarded — avoids re-render storms).
    const { setScrollProgress, setActiveSection, activeSection } = useStore.getState();
    setScrollProgress(offset);
    const next = sectionForOffset(offset);
    if (next !== lastSection.current && next !== activeSection) {
      lastSection.current = next;
      setActiveSection(next);
    } else if (next !== lastSection.current) {
      lastSection.current = next;
    }
  });

  return (
    <group>
      <Hero3D />
      <DishShowcase3D />
      <TableBooking3D />
      <Menu3D />
      {/* Shared shadow catcher (kept subtle — sections add their own contact shadows) */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
    </group>
  );
}

const PAGE_COPY = {
  hero: {
    badge: 'Michelin Guide 2025 · ★ 4.9 from 2,400+ guests',
    title: 'hero',
    body: 'Fire, seasonality, and ceremony — an eight-course tasting journey forty-two floors above the city.',
  },
  story: {
    badge: 'The Degustation · Courses 01–08',
    title: 'A Story in Eight Courses',
    body: 'Each signature arrives with its sourcing, sensory profile, and sommelier pairing. Keep scrolling to taste through them.',
  },
  booking: {
    badge: 'Reservations · Live Floorplan',
    title: 'Choose Your Table',
    body: 'Bronze tables are available tonight — tap one to begin your reservation. Grey tables are already spoken for.',
  },
  menu: {
    badge: 'The Archive · 18 Dishes',
    title: 'The Menu',
    body: 'Drag any dish to inspect it in 360°. Filter by craving below, then add courses to your tasting flight.',
  },
  visit: {
    badge: 'Visit Us',
    title: 'Find Your Evening',
    body: 'Level 42, Garden Tower · Tue–Sun, 6 PM – 11 PM. Hours, contact, and newsletter below.',
  },
};

/**
 * 2D overlay pages inside the ScrollControls scroll container.
 * NOTE: sections are pointer-events-none so 3D table clicks and dish
 * dragging reach the canvas. Step 5 interactive elements must opt back in
 * with `pointer-events-auto` on the specific button / card.
 */
export function ScrollPages() {
  return (
    <Scroll html style={{ width: '100%' }}>
      {SECTIONS.map((id, i) => {
        const copy = PAGE_COPY[id];
        return (
          <section
            key={id}
            id={`section-${id}`}
            className="pointer-events-none flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
            style={{ minHeight: '100vh' }}
          >
            <div className="pointer-events-none max-w-2xl">
              <p className="animate-drift mb-3 inline-block rounded-full bg-surface-container px-4 py-1 text-xs uppercase tracking-widest text-primary">
                {`0${i + 1} — ${copy.badge}`}
              </p>
              <KineticTitle className="font-display text-5xl tracking-tight text-on-surface">
                {id === 'hero' ? (
                  <>
                    AURA <span className="italic font-light text-primary">Dine</span>
                  </>
                ) : (
                  copy.title
                )}
              </KineticTitle>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">{copy.body}</p>
              {id === 'hero' && (
                <div className="pointer-events-auto mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => scrollToSection('booking')}
                    data-cursor="RESERVE"
                    className="w-full rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-on-primary shadow-[0_0_28px_rgba(255,190,128,0.45)] transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                  >
                    Book a Table
                  </button>
                  <button
                    onClick={() => scrollToSection('menu')}
                    data-cursor="VIEW DISH"
                    className="w-full rounded-full bg-surface-container-high/70 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-on-surface backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                  >
                    Explore Menu
                  </button>
                </div>
              )}
              {id === 'booking' && (
                <div className="pointer-events-auto mt-6">
                  <button
                    onClick={() => scrollToSection('menu')}
                    className="rounded-full bg-surface-container-high/70 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface backdrop-blur-xl transition-transform hover:scale-105"
                  >
                    Not tonight? Browse the menu
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </Scroll>
  );
}

export default ScrollRig;
