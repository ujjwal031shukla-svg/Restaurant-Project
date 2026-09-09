'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { DISHES, SHOWCASE_IDS } from '@/data/menu';
import { DishModel } from './DishModel';
import { DishPhoto } from './DishPhoto';

const SLOTS = [
  { pos: [-3.4, 0.7, 0], rot: 0.5 },
  { pos: [0, 0.7, -0.7], rot: 0 },
  { pos: [3.4, 0.7, 0], rot: -0.5 },
];

/**
 * Section 2 — storytelling journey. Three signature dishes on an arc; scroll
 * focus (offset ≈ [0.2, 0.6]) scales up + warms the active dish while the
 * others recede. 2D text callouts are rendered by the overlay layer (Step 5)
 * reading the same scroll progress — the 3D side exposes focus via dish scale.
 */
export function DishShowcase3D() {
  const scroll = useScroll();
  const group = useRef();
  const slots = useRef([]);
  const spot = useRef();
  const spotTarget = useRef();
  const pulseRing = useRef();
  const pulse = useRef({ t: 0, idx: 0 });

  const dishes = useMemo(
    () => SHOWCASE_IDS.map((id) => DISHES.find((d) => d.id === id)).filter(Boolean),
    []
  );

  // Spotlight aims at an Object3D we glide between slots (lights can't
  // directly target lerped coordinates without one).
  useEffect(() => {
    if (spot.current && spotTarget.current) spot.current.target = spotTarget.current;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Visibility ends at 0.48 so the tall photo cards are fully gone before
    // the top-down booking camera settles (their frames read as streaks
    // from above during crossfade).
    group.current.visible = scroll.visible(0.8 / 5, 1.6 / 5);

    const t = THREE.MathUtils.clamp(scroll.range(1 / 5, 2 / 5), 0, 1);
    const focus = Math.min(dishes.length - 1, Math.floor(t * dishes.length));
    const damp = 1 - Math.exp(-5 * delta);

    // Focus-change pulse ring.
    if (focus !== pulse.current.idx) pulse.current = { t: 1, idx: focus };
    pulse.current.t = Math.max(0, pulse.current.t - delta * 1.4);

    // Gallery spotlight swings to the focused slot + flares on change.
    if (spotTarget.current) {
      spotTarget.current.position.x = THREE.MathUtils.lerp(
        spotTarget.current.position.x,
        SLOTS[focus].pos[0],
        damp
      );
    }
    if (spot.current) {
      spot.current.intensity = 55 + pulse.current.t * 90 + Math.sin(state.clock.elapsedTime * 2.2) * 6;
    }
    if (pulseRing.current) {
      const k = pulse.current.t;
      pulseRing.current.position.x = SLOTS[pulse.current.idx].pos[0];
      pulseRing.current.scale.setScalar(1 + (1 - k) * 0.9);
      pulseRing.current.material.opacity = k * 0.55;
      pulseRing.current.visible = k > 0.01;
    }

    slots.current.forEach((g, i) => {
      if (!g) return;
      const active = i === focus;
      const target = active ? 1.18 : 0.82;
      const s = THREE.MathUtils.lerp(g.scale.x, target, damp);
      g.scale.setScalar(s);
      g.position.y = THREE.MathUtils.lerp(g.position.y, SLOTS[i].pos[1] + (active ? 0.15 : 0), damp);
      g.rotation.y += delta * (active ? 0.5 : 0.18);
    });
  });

  return (
    <group ref={group}>
      {/* Gallery spot: warm museum beam tracking the focused dish. */}
      <spotLight
        ref={spot}
        position={[0, 6.5, 2.5]}
        angle={0.45}
        penumbra={0.7}
        intensity={55}
        distance={16}
        color="#ffe0b3"
      />
      <object3D ref={spotTarget} position={[SLOTS[0].pos[0], 0.7, 0]} />
      {/* Expanding pulse ring on each focus change. */}
      <mesh ref={pulseRing} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.35, 1.45, 48]} />
        <meshBasicMaterial color="#ffbe80" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Tight contact shadows ride with the dishes. Without these, the only
          grounding is the global catcher 1.3 units below — from the elevated
          story camera its long-throw shadows land up-screen of the plates and
          read as floating dark blobs. */}
      <ContactShadows
        position={[0, 0.5, -0.2]}
        scale={11}
        far={1.5}
        blur={2.4}
        opacity={0.65}
        resolution={256}
        color="#000000"
        frames={Infinity}
      />
      {dishes.map((dish, i) => (
        <group
          key={dish.id}
          ref={(el) => {
            slots.current[i] = el;
          }}
          position={SLOTS[i].pos}
          rotation={[0, SLOTS[i].rot, 0]}
        >
          <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.4}>
            {/* Plate */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <cylinderGeometry args={[1.05, 0.8, 0.12, 40]} />
              <meshStandardMaterial color="#201f1f" roughness={0.4} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.92, 0.025, 10, 64]} />
              <meshStandardMaterial color={dish.accent} roughness={0.3} metalness={0.6} />
            </mesh>
            <DishModel
              modelUrl={dish.modelUrl}
              shape={dish.shape}
              accent={dish.accent}
              targetSize={1.0}
              position={[0, 0.08, 0]}
            />
            {/* Real food photography on a tilted card above the plate.
                Kept compact so cards don't dominate neighboring sections
                during scroll crossfades. */}
            <DishPhoto
              photo={dish.photo}
              width={1.32}
              height={0.88}
              accent={dish.accent}
              position={[0, 1.5, -0.35]}
              rotation={[-0.28, 0, 0]}
            />
          </Float>
        </group>
      ))}
    </group>
  );
}

export default DishShowcase3D;
