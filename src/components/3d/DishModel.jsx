'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { checkModelAvailable } from '@/lib/checkModel';

// ---------------------------------------------------------------------------
// Asset convention — where real models live.
//
//   Drop Draco-compressed .glb files (<2 MB each) into:
//     public/models/<dish-id>.glb      (served at runtime as /models/<dish-id>.glb)
//
//   e.g.  public/models/wagyu.glb  →  modelUrl '/models/wagyu.glb'
//
// DishModel NEVER calls useGLTF for a url that hasn't passed the existence
// gate (see @/lib/checkModel). In production, urls absent from the
// build-time manifest resolve 'missing' with ZERO fetches — browsers log
// every failed fetch as a console 404 that JS cannot suppress, so missing
// models are simply never requested: no 404 lines, no suspense rejections,
// no error overlay. The procedural fallback renders instead. (In dev, one
// cached HEAD per unknown url keeps mid-session asset drops working.)
// ---------------------------------------------------------------------------

const warned = new Set();

// Dev-only hint, deliberately console.debug (hidden unless Verbose logging
// is on) so the console stays clean. Production never logs (see guard).
function warnMissing(url) {
  if (process.env.NODE_ENV === 'production' || warned.has(url)) return;
  warned.add(url);
  // eslint-disable-next-line no-console
  console.debug(
    `[DishModel] "${url}" not in the model manifest — procedural fallback. ` +
      `Drop the file into "public/models/" and restart dev (or rebuild).`
  );
}

/** React hook around checkModelAvailable: 'checking' | 'ready' | 'missing'. */
export function useAvailableModel(url) {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    let alive = true;
    setStatus('checking');
    checkModelAvailable(url).then((s) => {
      if (!alive) return;
      if (s === 'missing') warnMissing(url);
      setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, [url]);
  return status;
}

/**
 * Slow Y-axis turntable so every placeholder stays dynamic, independent of
 * whatever motion the parent scene (slot focus, Float, scroll) applies.
 */
function Spin({ speed = 0.45, children }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Procedural stand-in for a dish, keyed by the catalogue `shape`.
 * Renders while a .glb streams in (Suspense fallback), when no url is set,
 * when the file is missing (existence gate), AND when a present file fails
 * to parse (error-boundary fallback) — one consistent look either way.
 *
 * Every shape uses glossy metallic-leaning materials with an emissive lift
 * so placeholders read as intentional and polished on the dark stage —
 * never near-black, never flat.
 */
export function ProceduralDish({ shape = 'sphere', accent = '#ffbe80' }) {
  return (
    <Spin>
      <DishShape shape={shape} accent={accent} />
    </Spin>
  );
}

function DishShape({ shape, accent }) {
  switch (shape) {
    case 'sashimi':
      // Thick glossy cuts, raised proud of the plate + emissive lift.
      return (
        <group>
          {[-0.38, 0, 0.38].map((x, i) => (
            <mesh key={i} position={[x, 0.42 + (i % 2) * 0.07, 0]} rotation={[0.15, 0.45, 0.12]} castShadow>
              <boxGeometry args={[0.52, 0.3, 0.72]} />
              <meshStandardMaterial
                color={accent}
                roughness={0.22}
                metalness={0.35}
                emissive={accent}
                emissiveIntensity={0.28}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.3, 0.42]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#e8f0c0" roughness={0.25} emissive="#9aa86a" emissiveIntensity={0.3} />
          </mesh>
          {/* Sashimi bed */}
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[0.72, 0.78, 0.12, 28]} />
            <meshStandardMaterial color="#2e3a2c" roughness={0.7} />
          </mesh>
        </group>
      );
    case 'knot':
      return (
        <mesh position={[0, 0.42, 0]} castShadow>
          <torusKnotGeometry args={[0.34, 0.13, 96, 16]} />
          <meshStandardMaterial
            color={accent}
            roughness={0.3}
            metalness={0.45}
            emissive={accent}
            emissiveIntensity={0.25}
          />
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
            <meshStandardMaterial color={accent} roughness={0.2} emissive={accent} emissiveIntensity={0.35} />
          </mesh>
        </group>
      );
    case 'box':
      // Hero / wagyu composition: seared block + gloss + truffle pearls.
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.35, 0.5, 0.95]} />
            <meshStandardMaterial
              color="#7a3520"
              roughness={0.4}
              metalness={0.15}
              emissive="#3a1508"
              emissiveIntensity={0.18}
            />
          </mesh>
          <mesh position={[0, 0.64, 0]}>
            <boxGeometry args={[1.2, 0.04, 0.82]} />
            <meshStandardMaterial color="#a34d28" roughness={0.15} metalness={0.45} />
          </mesh>
          {[
            [-0.35, 0.72, 0.15],
            [0.1, 0.73, -0.18],
            [0.42, 0.71, 0.2],
            [-0.05, 0.74, 0.3],
          ].map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <sphereGeometry args={[0.09, 20, 20]} />
              <meshStandardMaterial
                color={accent}
                roughness={0.2}
                metalness={0.55}
                emissive={accent}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      );
    default:
      // sphere (burrata / cacao / yuzu) — bronze-gold metallic orb + gold cap.
      return (
        <group>
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial
              color="#9a6530"
              roughness={0.26}
              metalness={0.85}
              emissive={accent}
              emissiveIntensity={0.35}
            />
          </mesh>
          <mesh position={[0.1, 0.86, 0.08]} rotation={[0.3, 0, -0.2]}>
            <sphereGeometry args={[0.16, 20, 20]} />
            <meshStandardMaterial
              color={accent}
              roughness={0.2}
              metalness={0.7}
              emissive={accent}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      );
  }
}

/**
 * Suspending inner loader — only ever mounted AFTER the existence gate
 * passes, so in practice this suspends on slow networks, not on 404s.
 * Normalizes any GLB to `targetSize` (longest dimension) and grounds it on
 * y=0. The scene is cloned per instance because the useGLTF cache is shared
 * — without this, two dishes using the same URL would fight over one
 * Object3D parent. (Draco + Meshopt are handled by drei's bundled decoders.)
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
 * Load path for a configured url:
 *   1. existence gate (HEAD, cached) → missing? render procedural, done.
 *      No useGLTF call, no suspense rejection, no error overlay.
 *   2. present? mount GltfDish under Suspense (procedural shown mid-load)
 *      inside a per-instance ErrorBoundary (corrupt file → procedural).
 */
export function DishModel({ modelUrl, shape = 'sphere', accent = '#ffbe80', targetSize = 1, fallbackScale = 1, ...props }) {
  const status = useAvailableModel(modelUrl);
  // Explicit origin + scale on the fallback wrapper so the placeholder always
  // sits at the group anchor, directly in the camera path. NOTE: keep
  // fallbackScale at 1 — verified prominent on screenshots; 1.5 overflows
  // the showcase plates (2.0-wide food on a 2.1 plate).
  const fallback = (
    <group position={[0, 0, 0]} scale={fallbackScale}>
      <ProceduralDish shape={shape} accent={accent} />
    </group>
  );

  if (status !== 'ready') return <group {...props}>{fallback}</group>;

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
 * Warm the GLTF cache — but ONLY for urls already confirmed present, so a
 * missing file can never trigger a preload rejection. Resolves when every
 * check settles; safe to fire-and-forget from a mount effect once assets
 * actually exist in public/models/.
 */
export function preloadDishModels(urls = []) {
  urls
    .filter(Boolean)
    .forEach((url) =>
      checkModelAvailable(url).then((status) => {
        if (status !== 'ready') return;
        try {
          const p = useGLTF.preload(url);
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {
          /* loader setup failed — on-demand load will fall back gracefully */
        }
      })
    );
}

export default DishModel;
