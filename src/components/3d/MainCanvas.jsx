'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, PerspectiveCamera, ScrollControls } from '@react-three/drei';
import { useGPUPerformance } from '@/hooks/useGPUPerformance';
import { useStore } from '@/store/useStore';
import { ScrollRig, ScrollPages } from './ScrollRig';
import { Preloader } from '@/components/ui/Preloader';
import { Fallback2D } from '@/components/ui/Fallback2D';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function webglAvailable() {
  if (typeof window === 'undefined') return true; // SSR — assume OK, re-check on mount
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Fires once the canvas has composited real frames — the ground truth the
 * Preloader veil waits for. (Asset-progress alone can't drive dismissal:
 * with zero async loads in flight, progress sits at 0 forever.)
 */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 5) useStore.getState().setCanvasReady();
  });
  return null;
}

/**
 * Procedural studio environment — warm key / amber strips / bronze base.
 * Fully local (zero network fetches, unlike `preset="sunset"` which pulls a
 * remote HDR and can leave the whole canvas suspended on a black frame if
 * the CDN is unreachable). Rendered once (frames={1}).
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <group rotation={[-Math.PI / 3, 0, 0]}>
        <Lightformer form="circle" intensity={4} position={[0, 5, -9]} scale={2} color="#ffdcbf" />
        <Lightformer intensity={2} position={[-5, 1, -1]} scale={[20, 0.6]} color="#f5bc7c" />
        <Lightformer intensity={1.5} position={[5, -1, -1]} scale={[20, 0.6]} color="#eaa05b" />
        <Lightformer intensity={0.6} position={[0, -5, 2]} scale={[10, 10]} color="#67400a" />
      </group>
    </Environment>
  );
}

/**
 * Fixed fullscreen 3D rig: perf-aware Canvas + self-sufficient lights +
 * procedural environment + ScrollControls (5 pages) driving the ScrollRig
 * camera. 2D overlays live in <Scroll html> so DOM scroll and camera stay
 * in lockstep.
 *
 * Resilience layers (outermost → innermost):
 * - no WebGL → full 2D fallback experience;
 * - any render crash → ErrorBoundary swaps the canvas for the same fallback;
 * - environment isolated in its own Suspense + null-fallback boundary, so a
 *   lighting failure can never blank the scene (lights alone fully expose it).
 */
export function MainCanvas() {
  const perf = useGPUPerformance();
  const [ok] = useState(webglAvailable);

  if (!ok) {
    return (
      <div className="fixed inset-0 z-0 h-screen w-screen">
        <Fallback2D />
      </div>
    );
  }

  // Explicit non-zero sizing: a collapsed wrapper is the classic "invisible
  // canvas" — fixed inset-0 + h-screen/w-screen guarantees viewport fill.
  return (
    <div className="fixed inset-0 z-0 h-screen w-screen" aria-hidden={false}>
      <ErrorBoundary fallback={<Fallback2D />}>
        <Canvas
          shadows={perf.shadows}
          dpr={perf.dpr}
          gl={{ antialias: perf.antialias, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 1.5, 8], fov: 45, near: 0.1, far: 80 }}
          style={{ width: '100%', height: '100%', background: '#0a0a0a', touchAction: 'pan-y' }}
        >
          {/* Diagnostic backdrop (removable): proves the canvas paints — if
              this color never appears, the canvas element itself is collapsed,
              not the scene. Matches the page bg so it is visually neutral. */}
          <color attach="background" args={['#0a0a0a']} />
          {/* Explicit default camera (ScrollRig takes over per-frame on mount). */}
          <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45} near={0.1} far={80} />

          {/* ReadySignal sits outside Suspense so it commits on first render
              no matter what suspends elsewhere. */}
          <ReadySignal />
          <Suspense fallback={null}>
            {/* Self-sufficient base lighting: scene stays fully exposed even
                with the environment disabled (low-tier devices) or failed. */}
            <ambientLight intensity={1.5} />
            <directionalLight
              position={[4, 7, 4]}
              intensity={1.6}
              color="#ffdcbf"
              castShadow={perf.shadows}
              shadow-mapSize={[perf.shadowMapSize, perf.shadowMapSize]}
            />
            <directionalLight position={[10, 10, 10]} intensity={0.6} color="#fff4e0" />
            <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
            <spotLight position={[-5, 4, -3]} intensity={0.5} color="#f5bc7c" angle={0.5} />

            {perf.useEnvironment && (
              <ErrorBoundary fallback={null}>
                <Suspense fallback={null}>
                  <StudioEnvironment />
                </Suspense>
              </ErrorBoundary>
            )}

            <ScrollControls pages={5} damping={0.25} distance={1}>
              <ScrollRig />
              <ScrollPages />
            </ScrollControls>
          </Suspense>
        </Canvas>
        <Preloader />
      </ErrorBoundary>
    </div>
  );
}

export default MainCanvas;
