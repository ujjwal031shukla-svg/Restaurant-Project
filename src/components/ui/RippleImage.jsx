'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uHover;
  uniform float uReveal;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 cuv = vUv - 0.5;
    cuv.x *= uRes.x / max(uRes.y, 1.0);
    float t = uTime * 0.35;
    float n1 = noise(cuv * 3.0 + t);
    float n2 = noise(cuv * 3.0 - t * 0.7 + 4.7);
    // Hover ripple + a swell mid-reveal; idle stays perfectly still.
    float amp = uHover * 0.045 + uReveal * (1.0 - uReveal) * 0.14;
    vec2 uv = vUv + vec2(n1 - 0.5, n2 - 0.5) * amp;
    vec3 c = texture2D(uTex, uv).rgb;
    // Reveal wipe with a noisy leading edge.
    float edge = uReveal * 1.25 - 0.12 + (n1 - 0.5) * 0.3;
    float a = smoothstep(0.0, 0.08, edge);
    // Gentle vignette + fine grain for the cinematic finish.
    float vig = smoothstep(1.15, 0.35, length(cuv));
    c *= mix(0.72, 1.0, vig);
    c += (hash(vUv * 913.0 + fract(t)) - 0.5) * 0.045;
    gl_FragColor = vec4(c, a);
  }
`;

/**
 * Food photography behind a liquid-distortion GLSL veil: idle-still,
 * ripples on hover, wipes in with a noisy edge on scroll reveal.
 * One tiny dedicated WebGL canvas; falls back to a plain <img> if WebGL
 * is unavailable. Textures honor the global sRGB pipeline.
 */
export function RippleImage({ src, alt = '', className = '' }) {
  const mount = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = mount.current;
    if (!host || !src) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return undefined;
    }
    let raf = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    const uniforms = {
      uTex: { value: null },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uReveal: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };

    const resize = () => {
      const w = Math.max(2, host.clientWidth);
      const h = Math.max(2, host.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    };
    resize();
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    new THREE.TextureLoader().load(
      src,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        uniforms.uTex.value = tex;
        // Scroll reveal: wipe in the first time the card enters view.
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting) {
                gsap.to(uniforms.uReveal, { value: 1, duration: 1.1, ease: 'power3.out' });
                io.disconnect();
              }
            });
          },
          { threshold: 0.25 }
        );
        io.observe(host);
        cleaners.push(() => io.disconnect());
      },
      undefined,
      () => setFailed(true)
    );

    const cleaners = [];
    const onEnter = () => gsap.to(uniforms.uHover, { value: 1, duration: 0.45, ease: 'power2.out' });
    const onLeave = () => gsap.to(uniforms.uHover, { value: 0, duration: 0.7, ease: 'power2.out' });
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    const loop = () => {
      if (disposed) return;
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      cleaners.forEach((fn) => fn());
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      if (uniforms.uTex.value) uniforms.uTex.value.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (failed) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return <div ref={mount} className={className} role="img" aria-label={alt} />;
}

export default RippleImage;
