"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 9000;
const MOUSE_RADIUS = 1.5;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

// Two brand tones (same pair as the wordmark's gradient) interpolated per
// particle, instead of the original's random full-spectrum HSL — reads as
// "light woven through the indigo panel" rather than a rainbow.
const COLOR_A = new THREE.Color("#c7d2fe");
const COLOR_B = new THREE.Color("#ffffff");

/**
 * Adapted from a vendored WovenCanvas (components/ui/woven-light-hero.tsx)
 * for actual use as the auth panel's background rather than a full-page
 * hero: sized to its own container (ResizeObserver) instead of the window,
 * brand-toned instead of rainbow, and reduced-motion renders one static
 * frame instead of mounting the continuous rotation/mouse-physics loop.
 *
 * The biggest change is the simulation step itself — the original allocates
 * five `new THREE.Vector3()` per particle per frame (450k+ objects/frame at
 * 50,000 particles), which is a real GC-thrashing hot-loop bug, not a style
 * choice. Rewritten as plain-number math directly on the typed arrays: same
 * physics, zero per-frame allocation. Particle count is also cut from
 * 50,000 to 9,000 — this panel is roughly half a viewport wide, not a
 * full-bleed hero, so the same visual density needs far fewer points.
 */
export function WovenBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(10, 10); // start off-canvas — no phantom pull at origin
    const timer = new THREE.Timer();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    const geometry = new THREE.BufferGeometry();
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);
    const knotPositions = torusKnot.attributes.position;

    const tmpColor = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const vertexIndex = i % knotPositions.count;
      const x = knotPositions.getX(vertexIndex);
      const y = knotPositions.getY(vertexIndex);
      const z = knotPositions.getZ(vertexIndex);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      tmpColor.copy(COLOR_A).lerp(COLOR_B, Math.random());
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    torusKnot.dispose();

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    // Big enough to fill most of the panel — biased up and to the right so
    // the densest part of the weave still clears the headline/highlights
    // text below it, but the shape itself now dominates the space instead
    // of reading as a small accent.
    points.position.set(0.5, 0.6, -2);
    points.scale.setScalar(1.7);
    scene.add(points);
    renderer.render(scene, camera);

    if (prefersReducedMotion) {
      // One static frame — no continuous rotation, no mouse-follow physics.
      return () => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      timer.update();
      const elapsedTime = timer.getElapsed();

      // Particle positions are local to the Points mesh, which is no
      // longer centered on the scene origin (see points.position.set above)
      // — convert the mouse's world-space target into that same local
      // space, or the interaction radius ends up testing against the
      // wrong location entirely.
      const mouseX = mouse.x * 3 - points.position.x;
      const mouseY = mouse.y * 3 - points.position.y;
      const mouseZLocal = -points.position.z;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const px = positions[ix];
        const py = positions[iy];
        const pz = positions[iz];

        let vx = velocities[ix];
        let vy = velocities[iy];
        let vz = velocities[iz];

        const dx = px - mouseX;
        const dy = py - mouseY;
        const dz = pz - mouseZLocal;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < MOUSE_RADIUS_SQ && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const force = ((MOUSE_RADIUS - dist) * 0.01) / dist;
          vx += dx * force;
          vy += dy * force;
          vz += dz * force;
        }

        // Return toward the original torus-knot position, then damp.
        vx = (vx + (originalPositions[ix] - px) * 0.001) * 0.95;
        vy = (vy + (originalPositions[iy] - py) * 0.001) * 0.95;
        vz = (vz + (originalPositions[iz] - pz) * 0.001) * 0.95;

        positions[ix] = px + vx;
        positions[iy] = py + vy;
        positions[iz] = pz + vz;
        velocities[ix] = vx;
        velocities[iy] = vy;
        velocities[iz] = vz;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = elapsedTime * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      timer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
