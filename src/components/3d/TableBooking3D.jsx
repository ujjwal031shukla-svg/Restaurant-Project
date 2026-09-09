'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { TABLES, useStore } from '@/store/useStore';
import { RisingSparks } from './Particles';

function radiusFor(seats, vip) {
  if (vip || seats >= 6) return 0.95;
  if (seats >= 4) return 0.72;
  return 0.55;
}

function Table({ table }) {
  const selectedTableId = useStore((s) => s.selectedTableId);
  const openBooking = useStore((s) => s.openBooking);
  const [hovered, setHovered] = useState(false);
  const ring = useRef();
  const lift = useRef();
  const candle = useRef();
  const r = radiusFor(table.seats, table.vip);
  const reserved = table.status === 'reserved';
  const selected = selectedTableId === table.id;
  // Phase seed from table position so candles flicker out of sync.
  const phase = table.x * 1.7 + table.z * 2.3;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ring.current && selected) {
      const s = 1 + Math.sin(t * 2.4) * 0.06;
      ring.current.scale.set(s, s, 1);
    }
    // Candle flame flicker (emissive only — no extra lights per table).
    if (candle.current) {
      candle.current.material.emissiveIntensity =
        1.5 + Math.sin(t * 9 + phase) * 0.35 + Math.sin(t * 23 + phase * 2) * 0.2;
    }
    // Hover lift — the table rises to meet the cursor.
    if (lift.current && !reserved) {
      const target = hovered || selected ? 0.14 : 0;
      lift.current.position.y = THREE.MathUtils.lerp(
        lift.current.position.y,
        target,
        1 - Math.exp(-8 * delta)
      );
    }
  });

  const topColor = reserved ? '#353534' : selected ? '#ffbe80' : hovered ? '#f5bc7c' : '#67400a';

  return (
    <group position={[table.x, 0, table.z]}>
      {/* Lift group — rises on hover/selection (ring + floor marker stay put). */}
      <group ref={lift}>
      {/* Table top */}
      <mesh
        position={[0, 0.75, 0]}
        castShadow
        onPointerOver={(e) => {
          if (reserved) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          if (reserved) return;
          e.stopPropagation();
          openBooking(table.id);
        }}
      >
        <cylinderGeometry args={[r, r * 0.92, 0.12, 28]} />
        <meshStandardMaterial
          color={topColor}
          roughness={reserved ? 0.9 : 0.5}
          metalness={selected ? 0.35 : 0.1}
          emissive={selected ? '#ffbe80' : hovered && !reserved ? '#f5bc7c' : '#000000'}
          emissiveIntensity={selected ? 0.45 : hovered && !reserved ? 0.22 : 0}
        />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.72, 12]} />
        <meshStandardMaterial color={reserved ? '#2a2a2a' : '#3a2c1c'} roughness={0.8} />
      </mesh>
      {/* Chairs */}
      {Array.from({ length: table.seats }).map((_, i) => {
        const a = (i / table.seats) * Math.PI * 2 + (table.seats % 2 ? 0.3 : 0);
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.5), 0.42, Math.sin(a) * (r + 0.5)]} castShadow>
            <boxGeometry args={[0.42, 0.5, 0.42]} />
            <meshStandardMaterial color={reserved ? '#2a2a2a' : '#524439'} roughness={0.85} />
          </mesh>
        );
      })}
      {/* Candle glow — flickers via emissive (see useFrame above). */}
      {!reserved && (
        <mesh ref={candle} position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color="#3a2a1a"
            emissive={selected ? '#ffdcbf' : '#ffb066'}
            emissiveIntensity={1.5}
            roughness={0.4}
          />
        </mesh>
      )}
      </group>
      {/* Selection ring */}
      {(selected || (hovered && !reserved)) && (
        <mesh ref={ring} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r + 0.28, r + 0.36, 40]} />
          <meshBasicMaterial
            color={selected ? '#ffbe80' : '#f5bc7c'}
            transparent
            opacity={selected ? 0.9 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {table.vip && !reserved && (
        <mesh position={[0, 1.25, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshStandardMaterial color="#ffdcc0" emissive="#eaa05b" emissiveIntensity={0.7} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Section 3 — isometric dining floor. Tables color by status
 * (bronze available / grey reserved / gold selected), hover highlights,
 * click opens the booking drawer via the Zustand store.
 * Visible roughly for scroll offset [0.36, 0.64].
 */
export function TableBooking3D() {
  const scroll = useScroll();
  const group = useRef();

  useFrame(() => {
    if (!group.current) return;
    group.current.visible = scroll.visible(1.8 / 5, 1.6 / 5);
  });

  return (
    <group ref={group} position={[0, 0, 0.4]}>
      {/* Blueprint floor + grid (architectural motif from Degine) */}
      <mesh position={[0, -0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.5, 7.5]} />
        <meshStandardMaterial color="#1c1b1b" roughness={0.95} />
      </mesh>
      <Grid
        position={[0, 0.01, 0.6]}
        args={[9.5, 7.5]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#353534"
        sectionSize={1.8}
        sectionThickness={1}
        sectionColor="#524439"
        fadeDistance={16}
        fadeStrength={1.2}
      />
      {/* Warm zone light */}
      <pointLight position={[0, 3.4, 0.6]} intensity={12} distance={12} color="#ffdcbf" />
      {/* Drifting dust motes in the candlelight */}
      <RisingSparks count={60} radius={4.4} yBase={0.2} yTop={3.4} color="#e8c88f" size={0.04} opacity={0.6} rise={0.18} sway={0.3} />
      {TABLES.map((t) => (
        <Table key={t.id} table={t} />
      ))}
    </group>
  );
}

export default TableBooking3D;
