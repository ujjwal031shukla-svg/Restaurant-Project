'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { DISHES, SHOWCASE_IDS } from '@/data/menu';
import { DishModel } from './DishModel';

const SLOTS = [
  { pos: [-4.4, 0.7, 0], rot: 0.5 },
  { pos: [0, 0.7, -0.7], rot: 0 },
  { pos: [4.4, 0.7, 0], rot: -0.5 },
];

// Rising steam wisps — 3 cheap transparent sprites per dish, looped.
function Steam({ offset = 0 }) {
  const refs = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5 + offset;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const ph = (t + i / 3) % 1;
      m.position.y = 0.8 + ph * 1.1;
      m.position.x = Math.sin((t + i) * 2.4) * 0.12;
      m.material.opacity = 0.22 * (1 - ph);
      m.scale.setScalar(0.14 + ph * 0.22);
    });
  });
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color="#e5e2e1" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

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

  const dishes = useMemo(
    () => SHOWCASE_IDS.map((id) => DISHES.find((d) => d.id === id)).filter(Boolean),
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.visible = scroll.visible(0.8 / 5, 2.6 / 5);

    const t = THREE.MathUtils.clamp(scroll.range(1 / 5, 2 / 5), 0, 1);
    const focus = Math.min(dishes.length - 1, Math.floor(t * dishes.length));

    slots.current.forEach((g, i) => {
      if (!g) return;
      const active = i === focus;
      const target = active ? 1.18 : 0.82;
      const s = THREE.MathUtils.lerp(g.scale.x, target, 1 - Math.exp(-5 * delta));
      g.scale.setScalar(s);
      g.position.y = THREE.MathUtils.lerp(g.position.y, SLOTS[i].pos[1] + (active ? 0.15 : 0), 1 - Math.exp(-5 * delta));
      g.rotation.y += delta * (active ? 0.5 : 0.18);
    });
  });

  return (
    <group ref={group}>
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
            <Steam offset={i * 1.7} />
          </Float>
        </group>
      ))}
    </group>
  );
}

export default DishShowcase3D;
