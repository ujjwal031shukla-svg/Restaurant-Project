'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Cheap GPU-friendly rising sparks / dust motes (single THREE.Points draw).
 * Small bright points only — no large soft sprites, so nothing can smudge
 * on the transparent canvas. Loops seamlessly within its volume.
 */
export function RisingSparks({
  count = 80,
  radius = 2.6,
  yBase = -1,
  yTop = 3.2,
  color = '#ffb066',
  size = 0.055,
  opacity = 0.85,
  rise = 0.45,
  sway = 0.15,
}) {
  const ref = useRef();
  // Halve the live particle count on narrow (phone) viewports — same look,
  // half the per-frame attribute writes. Reactive via R3F size (rotation-safe).
  const viewportWidth = useThree((s) => s.size.width);
  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = yBase + Math.random() * (yTop - yBase);
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = rise * (0.6 + Math.random() * 0.8);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, [count, radius, yBase, yTop, rise]);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const active = viewportWidth < 768 ? Math.floor(count / 2) : count;
    pts.geometry.setDrawRange(0, active);
    const attr = pts.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    for (let i = 0; i < active; i++) {      let y = attr.getY(i) + speeds[i] * d;
      if (y > yTop) y = yBase;
      attr.setY(i, y);
      attr.setX(i, attr.getX(i) + Math.sin(t * 0.8 + phases[i]) * sway * d);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

export default RisingSparks;
