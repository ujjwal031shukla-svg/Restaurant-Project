'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ScrollControls } from '@react-three/drei';
import { useGPUPerformance } from '@/hooks/useGPUPerformance';
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
 * Fixed fullscreen 3D rig: perf-aware Canvas + lights + HDRI environment +
 * ScrollControls (5 pages) driving ScrollRig camera. 2D overlays live in
 * <Scroll html> so DOM scroll and camera stay in lockstep.
 *
 * Resilience: no WebGL → full 2D fallback experience; any render crash →
 * ErrorBoundary swaps the canvas for the same fallback. Preloader veils
 * asset suspense with a progress bar.
 */
export function MainCanvas() {
  const perf = useGPUPerformance();
  const [ok] = useState(webglAvailable);

  if (!ok) {
    return (
      <div className="fixed inset-0 z-0">
        <Fallback2D />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0" aria-hidden={false}>
      <ErrorBoundary fallback={<Fallback2D />}>
        <Canvas
          shadows={perf.shadows}
          dpr={perf.dpr}
          gl={{ antialias: perf.antialias, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 1.5, 8], fov: 45, near: 0.1, far: 80 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[4, 7, 4]}
              intensity={1.6}
              color="#ffdcbf"
              castShadow={perf.shadows}
              shadow-mapSize={[perf.shadowMapSize, perf.shadowMapSize]}
            />
            <spotLight position={[-5, 4, -3]} intensity={0.5} color="#f5bc7c" angle={0.5} />
            {perf.useEnvironment && <Environment preset="sunset" />}

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
