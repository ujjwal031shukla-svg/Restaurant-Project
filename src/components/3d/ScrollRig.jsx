'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Scroll, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
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
    const t = state.clock.elapsedTime;
    _pos.x += Math.sin(t * 0.45) * 0.06;
    _pos.y += Math.sin(t * 0.6 + 1.3) * 0.045;
    state.camera.position.lerp(_pos, 1 - Math.exp(-4 * delta));
    _curLook.lerp(_look, 1 - Math.exp(-4 * delta));
    state.camera.lookAt(_curLook);

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
    badge: 'Seasonal Autumn Allocation',
    title: 'hero',
    body: 'Scroll to fly the camera — hero → story → booking → menu.',
  },
  story: {
    badge: 'Courses 01–08 · Degustation',
    title: 'story',
    body: 'Margherita → Smash Burger → BBQ Platter. The gold-ringed plate is in focus.',
  },
  booking: {
    badge: 'Level 42 · Live floorplan',
    title: 'booking',
    body: 'Click a bronze table to open its reservation card. Grey tables are reserved.',
  },
  menu: {
    badge: 'Degustation Archive',
    title: 'menu',
    body: 'Drag the dish to spin it 360°. Filters live in the overlay (Step 5).',
  },
  visit: {
    badge: 'Find us',
    title: 'visit',
    body: 'Hours, map and footer arrive with the Step 5 overlays.',
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
              <h2 className="font-display text-4xl capitalize tracking-tight text-on-surface">
                {id === 'hero' ? (
                  <>
                    Tentative <span className="italic font-light text-primary">Heaven</span>
                  </>
                ) : (
                  copy.title
                )}
              </h2>
              <p className="mt-3 text-sm text-on-surface-variant">{copy.body}</p>
            </div>
          </section>
        );
      })}
    </Scroll>
  );
}

export default ScrollRig;
