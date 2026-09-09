'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { DISHES, dishesByCategory } from '@/data/menu';
import { useStore } from '@/store/useStore';

function InspectorDish({ dish }) {
  if (!dish) return null;
  const accent = dish.accent;
  switch (dish.shape) {
    case 'sashimi':
      return (
        <group>
          {[-0.4, 0, 0.4].map((x, i) => (
            <mesh key={i} position={[x, 0.34, 0]} rotation={[0.15, 0.5, 0.1]} castShadow>
              <boxGeometry args={[0.55, 0.18, 0.8]} />
              <meshStandardMaterial color={accent} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0.5, 0.3, 0.3]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#e8f0c0" roughness={0.3} />
          </mesh>
        </group>
      );
    case 'knot':
      return (
        <mesh position={[0, 0.45, 0]} castShadow>
          <torusKnotGeometry args={[0.36, 0.14, 96, 16]} />
          <meshStandardMaterial color={accent} roughness={0.45} />
        </mesh>
      );
    case 'glass':
      return (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.36, 0.3, 0.7, 24, 1, true]} />
            <meshPhysicalMaterial color="#fff" roughness={0.05} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.31, 0.26, 0.44, 24]} />
            <meshStandardMaterial color={accent} roughness={0.2} emissive={accent} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.03, 10, 32]} />
            <meshStandardMaterial color="#e5e2e1" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          {dish.id === 'wagyu' ? (
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[1, 0.42, 0.72]} />
              <meshStandardMaterial color="#7a3520" roughness={0.55} />
            </mesh>
          ) : (
            <mesh position={[0, 0.52, 0]} castShadow>
              <sphereGeometry args={[0.44, 32, 32]} />
              <meshStandardMaterial
                color={dish.category === 'Desserts' && dish.id === 'yuzu' ? '#e8dfae' : '#3a2415'}
                roughness={0.25}
                metalness={0.4}
              />
            </mesh>
          )}
          <mesh position={[0.28, 0.68, 0.15]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={accent} roughness={0.25} metalness={0.5} />
          </mesh>
        </group>
      );
  }
}

/**
 * Section 4 — 360° dish inspector. Drag horizontally on the dish to spin it
 * (auto-rotates when idle); dish + category follow the Zustand store so the
 * 2D filter tabs (Step 5) and the 3D mesh stay in sync.
 * Visible roughly for scroll offset [0.56, 0.96].
 */
export function Menu3D() {
  const scroll = useScroll();
  const menuCategory = useStore((s) => s.menuCategory);
  const selectedDishId = useStore((s) => s.selectedDishId);
  const setSelectedDishId = useStore((s) => s.setSelectedDishId);

  const group = useRef();
  const spinner = useRef();
  const dishWrap = useRef();
  const [dragging, setDragging] = useState(false);
  const vel = useRef(0);
  const lastId = useRef(selectedDishId);
  const pop = useRef(0);

  const filtered = useMemo(() => dishesByCategory(menuCategory), [menuCategory]);
  const dish = useMemo(
    () => DISHES.find((d) => d.id === selectedDishId) ?? filtered[0] ?? DISHES[0],
    [selectedDishId, filtered]
  );

  // Keep selection valid when the category filter changes.
  useEffect(() => {
    if (!filtered.some((d) => d.id === selectedDishId) && filtered[0]) {
      setSelectedDishId(filtered[0].id);
    }
  }, [filtered, selectedDishId, setSelectedDishId]);
  if (dish && lastId.current !== dish.id) {
    lastId.current = dish.id;
    pop.current = 1; // punch-in animation
  }

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.visible = scroll.visible(2.8 / 5, 2 / 5);

    if (spinner.current) {
      if (!dragging) {
        vel.current = THREE.MathUtils.lerp(vel.current, 0.45, 1 - Math.exp(-3 * delta));
        spinner.current.rotation.y += delta * vel.current;
      }
    }
    if (pop.current > 0 && dishWrap.current) {
      pop.current = Math.max(0, pop.current - delta * 2.2);
      const s = 1 + Math.sin(pop.current * Math.PI) * 0.18;
      dishWrap.current.scale.setScalar(s);
    }
    // Gentle pedestal bob for life.
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      {/* Pedestal */}
      <mesh position={[0, -0.35, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.15, 1.35, 0.3, 40]} />
        <meshStandardMaterial color="#201f1f" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.025, 10, 64]} />
        <meshStandardMaterial color={dish?.accent ?? '#ffbe80'} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Plate */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 0.7, 0.1, 40]} />
        <meshStandardMaterial color="#1c1b1b" roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Drag-to-rotate dish */}
      <group
        ref={spinner}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging(true);
          vel.current = 0;
          document.body.style.cursor = 'grabbing';
          e.target.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging || !spinner.current) return;
          const dx = e.movementX ?? 0;
          spinner.current.rotation.y += dx * 0.008;
          vel.current = THREE.MathUtils.clamp(dx * 0.02, -3, 3);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          document.body.style.cursor = 'auto';
          e.target.releasePointerCapture?.(e.pointerId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!dragging) document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          if (!dragging) document.body.style.cursor = 'auto';
        }}
      >
        {/* Fat invisible hit-disc so grabs never miss */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.9, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
          <group ref={dishWrap}>
            <InspectorDish key={dish?.id} dish={dish} />
          </group>
        </Float>
      </group>

      {/* Orbit hint ring */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.5, 0.012, 8, 96]} />
        <meshBasicMaterial color="#ffbe80" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default Menu3D;
