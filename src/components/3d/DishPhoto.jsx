'use client';

import { Suspense, useMemo } from 'react';
import { Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * Real food photography on a gold-framed card inside the 3D scene.
 * Photos are build-time guaranteed (scripts/optimize-photos.mjs), so no
 * existence gate — but Suspense + a per-card error boundary mean a missing
 * or corrupt file degrades to nothing (procedural food stays on the plate),
 * never an error overlay.
 */
function PhotoCard({ src, width = 1.6, height = 1.07, accent = '#ffbe80' }) {
  const tex = useTexture(src);
  const map = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [tex]);

  return (
    <group>
      {/* Gold frame backing */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.04]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.65} />
      </mesh>
      {/* Photo faces front AND back (mirrored pair) so the card reads
          correctly as slots rotate and the camera orbits — never a blank slab. */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={map} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, -0.025]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={map} roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  );
}

/**
 * DishPhoto — photo card for a menu dish. Renders nothing until `photo`
 * exists (dishes without photography keep their procedural look).
 * `billboard` keeps the card camera-facing (hero orbit fan).
 */
export function DishPhoto({ photo, width, height, accent, billboard = false, ...props }) {
  if (!photo) return null;
  const card = (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <PhotoCard src={photo} width={width} height={height} accent={accent} />
      </Suspense>
    </ErrorBoundary>
  );
  return <group {...props}>{billboard ? <Billboard>{card}</Billboard> : card}</group>;
}

export default DishPhoto;
