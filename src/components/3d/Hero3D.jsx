'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { DISHES } from '@/data/menu';
import { DishModel } from './DishModel';

const COUNT = 14;
const PALETTE = ['#ffbe80', '#f5bc7c', '#e6a15c', '#7a9b5a', '#b3402e'];

// Data-driven hero dish — DishModel renders `/models/wagyu.glb` when present,
// otherwise the matching procedural 'box' composition.
const HERO_DISH = DISHES.find((d) => d.id === 'wagyu') ?? DISHES[0];

/**
 * Section 1 — hero signature dish. A dark ceramic plate with a wagyu block,
 * truffle pearls and sauce ring, orbited by 14 floating ingredients that
 * disperse outward + upward as the user scrolls into the next section.
 * Visible roughly for scroll offset [0, 0.32].
 */
export function Hero3D() {
  const scroll = useScroll();
  const group = useRef();
  const dish = useRef();
  const ringA = useRef();
  const ringB = useRef();
  const itemRefs = useRef([]);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        // Deterministic golden-angle shell distribution.
        const t = (i / COUNT) * Math.PI * 2 + 0.6;
        const y = 0.9 + ((i * 37) % 100) / 100 * 1.8;
        return {
          dir: new THREE.Vector3(Math.cos(t), 0, Math.sin(t)),
          y,
          rise: 1.2 + ((i * 53) % 100) / 100 * 2.2,
          spin: 0.4 + ((i * 29) % 100) / 100 * 1.4,
          scale: 0.07 + ((i * 41) % 100) / 100 * 0.09,
          color: PALETTE[i % PALETTE.length],
          kind: i % 4, // 0 sphere · 1 cone (herb) · 2 box (spice) · 3 torus (ring)
        };
      }),
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const raw = scroll.range(0, 1 / 5);
    const k = raw * raw * (3 - 2 * raw); // smoothstep dispersal 0→1

    group.current.visible = scroll.visible(0, 1.6 / 5);
    group.current.position.y = -k * 2.6;

    if (dish.current) dish.current.rotation.y += delta * (0.55 * (1 - k) + 0.05);
    if (ringA.current) ringA.current.rotation.z += delta * 0.12;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.18;

    for (let i = 0; i < COUNT; i++) {
      const m = itemRefs.current[i];
      if (!m) continue;
      const s = seeds[i];
      const r = 2.1 + k * 3.4;
      m.position.set(s.dir.x * r, s.y + k * s.rise, s.dir.z * r);
      m.rotation.x += delta * s.spin;
      m.rotation.y += delta * s.spin * 0.7;
      const sc = s.scale * (1 - k * 0.35);
      m.scale.setScalar(Math.max(sc, 0.001));
    }
  });

  return (
    <group ref={group}>
      <group ref={dish}>
        {/* Ceramic plate + gold rim */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.7, 1.25, 0.16, 48]} />
          <meshStandardMaterial color="#1c1b1b" roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.52, 0.035, 12, 72]} />
          <meshStandardMaterial color="#ffbe80" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Signature dish — real GLB when authored, procedural fallback otherwise */}
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.35}>
          <DishModel
            modelUrl={HERO_DISH.modelUrl}
            shape={HERO_DISH.shape}
            accent={HERO_DISH.accent}
            targetSize={1.35}
            position={[0, 0.1, 0]}
          />
        </Float>
        {/* Sauce ring */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.15, 48]} />
          <meshStandardMaterial color="#5a2c14" roughness={0.35} side={THREE.DoubleSide} />
        </mesh>

        {/* Floating ingredients */}
        {seeds.map((s, i) => (
          <mesh
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            position={[s.dir.x * 2.1, s.y, s.dir.z * 2.1]}
            castShadow
          >
            {s.kind === 0 && <sphereGeometry args={[1, 14, 14]} />}
            {s.kind === 1 && <coneGeometry args={[0.8, 1.8, 8]} />}
            {s.kind === 2 && <boxGeometry args={[1.2, 1.2, 1.2]} />}
            {s.kind === 3 && <torusGeometry args={[0.9, 0.32, 8, 20]} />}
            <meshStandardMaterial color={s.color} roughness={0.5} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Reticle rings (Degine HUD motif) */}
      <mesh ref={ringA} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.1, 0.012, 8, 96]} />
        <meshBasicMaterial color="#ffbe80" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringB} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.55, 0.01, 8, 80]} />
        <meshBasicMaterial color="#f5bc7c" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

export default Hero3D;
