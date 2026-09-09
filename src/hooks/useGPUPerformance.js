import { useEffect, useMemo, useState } from 'react';

function detectInitial() {
  // SSR-safe defaults (assume high, correct on mount).
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, isLowEnd: false, cores: 8, memoryGB: 8 };
  }

  const ua = navigator.userAgent || '';
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const coarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 768;
  const isMobile = mobileUA || (coarsePointer && smallScreen);

  const cores = navigator.hardwareConcurrency ?? 8;
  // deviceMemory is Chrome-only (GB); undefined elsewhere.
  const memoryGB = navigator.deviceMemory ?? 8;

  // Low-end: few cores, little RAM, or any mobile with constrained hardware.
  const isLowEnd =
    cores <= 4 || memoryGB <= 4 || (isMobile && (cores <= 6 || memoryGB <= 6));

  return { isMobile, isLowEnd, cores, memoryGB };
}

/**
 * GPU-aware quality tiers for the R3F canvas.
 * - high:   dpr up to 2, shadows on, full texture resolution
 * - medium: dpr up to 1.5, shadows on (low map), reduced textures
 * - low:    dpr locked to 1, shadows off, minimal textures/lights
 */
export function useGPUPerformance() {
  const [flags, setFlags] = useState(detectInitial);

  useEffect(() => {
    setFlags(detectInitial());

    const onResize = () => setFlags(detectInitial());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useMemo(() => {
    const { isMobile, isLowEnd, cores, memoryGB } = flags;

    let tier = 'high';
    if (isLowEnd) tier = 'low';
    else if (isMobile || cores <= 6 || memoryGB <= 6) tier = 'medium';

    switch (tier) {
      case 'low':
        return {
          tier,
          isMobile,
          isLowEnd: true,
          dpr: [1, 1],
          shadows: false,
          shadowMapSize: 512,
          antialias: false,
          textureScale: 0.5,
          useEnvironment: false,
        };
      case 'medium':
        return {
          tier,
          isMobile,
          isLowEnd: false,
          dpr: [1, 1.5],
          shadows: true,
          shadowMapSize: 1024,
          antialias: true,
          textureScale: 0.75,
          useEnvironment: true,
        };
      default:
        return {
          tier,
          isMobile,
          isLowEnd: false,
          dpr: [1, 2],
          shadows: true,
          shadowMapSize: 2048,
          antialias: true,
          textureScale: 1,
          useEnvironment: true,
        };
    }
  }, [flags]);
}

export default useGPUPerformance;
