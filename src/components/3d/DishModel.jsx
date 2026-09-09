'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * Procedural stand-in for a dish, keyed by the catalogue `shape`.
 * Doubles as the Suspense fallback while a .glb streams in AND as the
 * error-boundary fallback when the asset is missing / fails to parse —
 * so scenes render identically with or without real assets.
 */
export function ProceduralDish({ shape = 'sphere', accent = '#ffbe80' }) {
  switch (shape) {
    case 'sashimi':
      return (
        <group>
          {[-0.35, 0, 0.35].map((x, i) => (
            <mesh key={i} position={[x, 0.32 + (i % 2) * 0.06, 0]} rotation={[0.2, 0.4, 0.15]} castShadow>
              <boxGeometry args={[0.5, 0.16, 0.7]} />
              <meshStandardMaterial color={accent} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#e8f0c0" roughness={0.3} />
          </mesh>
        </group>
      );
    case 'knot':
      return (
        <mesh position={[0, 0.42, 0]} castShadow>
          <torusKnotGeometry args={[0.34, 0.13, 96, 16]} />
          <meshStandardMaterial color={accent} roughness={0.45} />
        </mesh>
      );
    case 'glass':
      return (
        <group>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.62, 24, 1, true]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.05} transmission={0.6} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.29, 0.24, 0.4, 24]} />
            <meshStandardMaterial color={accent} roughness={0.2} emissive={accent} emissiveIntensity={0.25} />
          </mesh>
        </group>
      );
    case 'box':
      // Hero / wagyu composition: seared block + gloss + truffle pearls.
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.35, 0.5, 0.95]} />
            <meshStandardMaterial color="#7a3520" roughness={0.55} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.64, 0]}>
            <boxGeometry args={[1.2, 0.04, 0.82]} />
            <meshStandardMaterial color="#a34d28" roughness={0.15} metalness={0.3} />
          </mesh>
          {[
            [-0.35, 0.72, 0.15],
            [0.1, 0.73, -0.18],
            [0.42, 0.71, 0.2],
            [-0.05, 0.74, 0.3],
          ].map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <sphereGeometry args={[0.09, 20, 20]} />
              <meshStandardMaterial color={accent} roughness={0.25} metalness={0.4} />
            </mesh>
          ))}
        </group>
      );
    default:
      // sphere (burrata / cacao / yuzu)
      return (
        <group>
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial color="#3a2415" roughness={0.25} metalness={0.55} />
          </mesh>
          <mesh position={[0.28, 0.72, 0.15]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={accent} roughness={0.25} metalness={0.5} />
          </mesh>
        </group>
      );
  }
}

/**
 * Suspending inner loader. Normalizes any GLB to `targetSize` (longest
 * dimension) and grounds it on y=0 so assets of arbitrary scale/orientation
 * sit correctly on plates. The scene is cloned per instance because the
 * useGLTF cache is shared — without this, two dishes using the same URL
 * would fight over one Object3D parent.
 */
function GltfDish({ url, targetSize = 1 }) {
  const { scene } = useGLTF(url);

  const clone = useMemo(() => scene.clone(true), [scene]);

  const { k, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return {
      k: targetSize / maxDim,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    };
  }, [clone, targetSize]);

  useEffect(() => {
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [clone]);

  return (
    <group scale={k}>
      <group position={offset}>
        <primitive object={clone} />
      </group>
    </group>
  );
}

/**
 * DishModel — the single entry point for dish rendering.
 *
 * - `modelUrl` set + asset present → real .glb (Draco + Meshopt handled by
 *   drei's bundled decoders), normalized + grounded, shadows enabled.
 * - Loading → Suspense fallback (procedural dish, same footprint).
 * - `modelUrl` missing/404/corrupt → per-instance error boundary catches the
 *   suspense throw and renders the procedural dish. The rest of the canvas
 *   is unaffected.
 *
 * Asset convention: Draco-compressed .glb (<2 MB each) at
 * `public/models/<dish-id>.glb`, served as `/models/<dish-id>.glb`.
 * Webpack-imported urls (`import url from '@/models/x.glb`) work too —
 * anything useGLTF accepts is fine.
 */
export function DishModel({ modelUrl, shape = 'sphere', accent = '#ffbe80', targetSize = 1, ...props }) {
  const fallback = <ProceduralDish shape={shape} accent={accent} />;

  if (!modelUrl) return <group {...props}>{fallback}</group>;

  return (
    <group {...props}>
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GltfDish url={modelUrl} targetSize={targetSize} />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}

/**
 * Warm the cache for known-good urls (call once assets actually exist —
 * preloading a missing file only produces a rejected fetch).
 * e.g. useEffect(() => { preloadDishModels(['/models/wagyu.glb']) }, [])
 */
export function preloadDishModels(urls = []) {
  urls.filter(Boolean).forEach((url) => {
    try {
      const p = useGLTF.preload(url);
      // Swallow rejections for not-yet-authored assets.
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* ignore */
    }
  });
}

export default DishModel;
