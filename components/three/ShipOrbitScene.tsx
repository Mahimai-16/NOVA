"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const NAVY = 0x101d2e;
const DEEP = 0x071321;
const BLUE = 0x2855d9;
const BRIGHT = 0x1677f8;
const GOLD = 0xf5b942;

const PANEL_W = 3.2; // 4:5, matches the portrait placeholder
const PANEL_H = 4;
const BASE_TOP = 0.22;
const ORBIT_R = 2.4;
const WATER_Y = 0.07;

/* ---------- Placeholder artwork (drawn to a canvas → texture) ---------- */
function placeholderTexture() {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 1000;
  const g = c.getContext("2d")!;
  const bg = g.createRadialGradient(400, 360, 40, 400, 420, 700);
  bg.addColorStop(0, "#1d3f8f");
  bg.addColorStop(0.55, "#12264a");
  bg.addColorStop(1, "#0a1628");
  g.fillStyle = bg;
  g.fillRect(0, 0, 800, 1000);

  // dashed frame
  g.setLineDash([22, 16]);
  g.lineWidth = 5;
  g.strokeStyle = "rgba(255,255,255,0.28)";
  g.beginPath();
  g.roundRect(48, 48, 704, 904, 36);
  g.stroke();
  g.setLineDash([]);

  // avatar silhouette
  g.fillStyle = "rgba(255,255,255,0.10)";
  g.beginPath();
  g.arc(400, 380, 110, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(400, 690, 210, 150, 0, Math.PI, 0);
  g.fill();

  // "add photo" badge
  g.fillStyle = "#2855D9";
  g.beginPath();
  g.arc(480, 455, 38, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#fff";
  g.lineWidth = 7;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(480, 435);
  g.lineTo(480, 475);
  g.moveTo(460, 455);
  g.lineTo(500, 455);
  g.stroke();

  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.font = "600 52px Inter, 'Segoe UI', system-ui, sans-serif";
  g.fillText("Founder photo", 400, 820);
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.font = "400 28px Inter, 'Segoe UI', system-ui, sans-serif";
  g.fillText("Portrait placeholder", 400, 868);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ---------- Low-poly container ship (bow points to +X) ---------- */
function buildShip() {
  const ship = new THREE.Group();
  const L = 0.95;
  const B = 0.2;

  const hullShape = (inset = 0) => {
    const s = new THREE.Shape();
    const hw = B / 2 - inset;
    s.moveTo(-L / 2 + inset, -hw);
    s.lineTo(L * 0.28, -hw);
    s.quadraticCurveTo(L * 0.46, -hw * 0.75, L / 2 - inset, 0);
    s.quadraticCurveTo(L * 0.46, hw * 0.75, L * 0.28, hw);
    s.lineTo(-L / 2 + inset, hw);
    s.quadraticCurveTo(-L / 2 - 0.03 + inset, 0, -L / 2 + inset, -hw);
    return s;
  };
  const extrude = (shape: THREE.Shape, depth: number) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
    geo.rotateX(-Math.PI / 2); // extrude upward (+Y)
    return geo;
  };

  const red = new THREE.MeshStandardMaterial({ color: 0xb8352c, roughness: 0.6 });
  const hullMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.45, metalness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f5f9, roughness: 0.5 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x3b4656, roughness: 0.8 });

  const lower = new THREE.Mesh(extrude(hullShape(0.004), 0.05), red);
  lower.position.y = -0.03;
  const upper = new THREE.Mesh(extrude(hullShape(), 0.08), hullMat);
  upper.position.y = 0.02;
  const deck = new THREE.Mesh(extrude(hullShape(0.012), 0.004), deckMat);
  deck.position.y = 0.1;
  ship.add(lower, upper, deck);

  // Container stacks
  const palette = [BLUE, GOLD, 0xc0392b, 0x527bae, 0x1f8a70, 0xe8eef5, BRIGHT];
  const cGeo = new THREE.BoxGeometry(0.075, 0.045, 0.052);
  const mats = palette.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.15 }));
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 7; i++) {
    const x = -0.21 + i * 0.078;
    const tiers = i === 6 ? 1 : 2 + Math.round(rand());
    for (let row = -1; row <= 1; row++) {
      for (let t = 0; t < tiers; t++) {
        const box = new THREE.Mesh(cGeo, mats[Math.floor(rand() * mats.length)]);
        box.position.set(x, 0.126 + t * 0.047, row * 0.055);
        box.castShadow = true;
        ship.add(box);
      }
    }
  }

  // Bridge / superstructure at stern
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 0.17), white);
  bridge.position.set(-0.36, 0.185, 0);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.21), white);
  wing.position.set(-0.335, 0.265, 0);
  const windows = new THREE.Mesh(
    new THREE.BoxGeometry(0.004, 0.018, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x0b1729, emissive: 0x7db4ff, emissiveIntensity: 0.9 }),
  );
  windows.position.set(-0.308, 0.245, 0);
  const funnel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.06), hullMat);
  funnel.position.set(-0.41, 0.3, 0);
  const funnelBand = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.015, 0.062), new THREE.MeshStandardMaterial({ color: GOLD }));
  funnelBand.position.set(-0.41, 0.315, 0);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12), white);
  mast.position.set(0.36, 0.16, 0);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe3a3 }));
  lamp.position.set(0.36, 0.225, 0);
  ship.add(bridge, wing, windows, funnel, funnelBand, mast, lamp);

  ship.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  return ship;
}

export default function ShipOrbitScene({ photo, onReady }: { photo?: string; onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the 2D placeholder stays visible.
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap was removed in recent three.js
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const world = new THREE.Group();
    scene.add(world);

    /* Lights */
    scene.add(new THREE.HemisphereLight(0xbfd6ff, DEEP, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3.5, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0005;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.PointLight(BRIGHT, 14, 12);
    rim.position.set(-3, 2.6, -2.5);
    scene.add(rim);
    const warm = new THREE.PointLight(GOLD, 5, 8);
    warm.position.set(2.8, 0.8, 2.2);
    scene.add(warm);

    /* Pedestal (3D base) */
    const pedestal = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.3, metalness: 0.65 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, BASE_TOP - 0.02, 96), baseMat);
    plinth.position.y = (BASE_TOP - 0.02) / 2;
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.55, 0.02, 96),
      new THREE.MeshStandardMaterial({ color: 0x1b2d48, roughness: 0.25, metalness: 0.5 }),
    );
    top.position.y = BASE_TOP - 0.01;
    top.receiveShadow = true;
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.555, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: BRIGHT }),
    );
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = BASE_TOP;
    const goldLine = new THREE.Mesh(
      new THREE.TorusGeometry(1.64, 0.006, 8, 160),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.8 }),
    );
    goldLine.rotation.x = Math.PI / 2;
    goldLine.position.y = 0.07;
    pedestal.add(plinth, top, glowRing, goldLine);
    world.add(pedestal);

    /* Water ring the ship sails on */
    const water = new THREE.Mesh(
      new THREE.RingGeometry(1.95, 2.85, 128),
      new THREE.MeshStandardMaterial({ color: 0x0f2c5c, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = WATER_Y - 0.005;
    water.receiveShadow = true;
    world.add(water);
    const lane = new THREE.Mesh(
      new THREE.RingGeometry(ORBIT_R - 0.004, ORBIT_R + 0.004, 160),
      new THREE.MeshBasicMaterial({ color: 0x5fa2ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.y = WATER_Y;
    world.add(lane);

    /* Portrait panel (3D placeholder) */
    const panel = new THREE.Group();
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(PANEL_W + 0.14, PANEL_H + 0.14, 0.12, 6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x15233a, roughness: 0.25, metalness: 0.8 }),
    );
    frame.castShadow = true;
    const placeholder = placeholderTexture();
    const faceMat = new THREE.MeshStandardMaterial({ map: placeholder, roughness: 0.55, metalness: 0 });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), faceMat);
    face.position.z = 0.062;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.6 }));
    back.position.z = -0.062;
    back.rotation.y = Math.PI;
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(PANEL_W + 0.15, 0.012, 0.125),
      new THREE.MeshBasicMaterial({ color: GOLD }),
    );
    edge.position.y = -(PANEL_H + 0.14) / 2;
    panel.add(frame, face, back, edge);
    const stand = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.12, 0.42, 4, 0.04), baseMat);
    stand.position.y = BASE_TOP + 0.06;
    stand.castShadow = true;
    stand.receiveShadow = true;
    panel.position.y = BASE_TOP + 0.12 + (PANEL_H + 0.14) / 2;
    world.add(panel, stand);

    let photoTex: THREE.Texture | null = null;
    if (photo) {
      new THREE.TextureLoader().load(photo, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        // cover-fit 4:5
        const img = t.image as HTMLImageElement;
        const imgAspect = img.width / img.height;
        const target = PANEL_W / PANEL_H;
        if (imgAspect > target) {
          t.repeat.set(target / imgAspect, 1);
          t.offset.set((1 - t.repeat.x) / 2, 0);
        } else {
          t.repeat.set(1, imgAspect / target);
          t.offset.set(0, (1 - t.repeat.y) / 2);
        }
        photoTex = t;
        faceMat.map = t;
        faceMat.needsUpdate = true;
      });
    }

    /* Ship + wake */
    const ship = buildShip();
    ship.scale.setScalar(1.45);
    world.add(ship);
    const wakeMat = new THREE.MeshBasicMaterial({ color: 0xcfe3ff, transparent: true, depthWrite: false });
    const wake = Array.from({ length: 14 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.05 + i * 0.006, 16), wakeMat.clone());
      m.rotation.x = -Math.PI / 2;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - i / 14);
      world.add(m);
      return m;
    });

    /* Layout: fit the whole stage into the container at any aspect ratio */
    const fit = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      // Vertically centre the whole stage (water ring → top of the frame) in the canvas
      const stageTop = BASE_TOP + 0.12 + PANEL_H + 0.14;
      // The front of the water ring projects below y=0 in perspective; include it so nothing is cropped
      const visualBottom = -0.95;
      const halfSpan = (stageTop - visualBottom) / 2;
      // Small downward look offset lifts the whole stage slightly above dead centre
      const centerY = visualBottom + halfSpan + 0.12;
      const dist = Math.max(3.1 / Math.tan(hHalf), (halfSpan + 0.95) / Math.tan(vHalf));
      camera.position.set(0, centerY + dist * 0.12, dist);
      camera.lookAt(0, centerY, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    /* Pointer tilt */
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tilt.ty = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      tilt.tx = ((e.clientY - r.top) / r.height - 0.5) * 0.12;
    };
    const onLeave = () => {
      tilt.tx = 0;
      tilt.ty = 0;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    /* Animation loop (paused while off-screen) */
    const clock = new THREE.Timer(); // THREE.Clock is deprecated
    let angle = 0.6; // start front-right
    const place = (t: number, time: number) => {
      const x = Math.cos(t) * ORBIT_R;
      const z = Math.sin(t) * ORBIT_R;
      ship.position.set(x, WATER_Y + 0.03 + Math.sin(time * 2.2) * 0.012, z);
      ship.rotation.set(Math.sin(time * 1.7) * 0.03, -t - Math.PI / 2, Math.sin(time * 1.3) * 0.02);
      wake.forEach((m, i) => {
        const a = t - 0.06 - i * 0.045;
        m.position.set(Math.cos(a) * ORBIT_R, WATER_Y + 0.002, Math.sin(a) * ORBIT_R);
      });
    };

    let raf = 0;
    let visible = false;
    let readyFired = false;
    const frameFn = () => {
      clock.update();
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsed();
      if (!reduced) {
        angle += dt * 0.42; // ~15s per lap
        panel.rotation.y = Math.sin(time * 0.4) * 0.06;
        glowRing.material.color.setHSL(0.6, 0.95, 0.5 + Math.sin(time * 2) * 0.08);
      }
      tilt.x += (tilt.tx - tilt.x) * 0.06;
      tilt.y += (tilt.ty - tilt.y) * 0.06;
      world.rotation.set(tilt.x, tilt.y, 0);
      place(angle, time);
      renderer.render(scene, camera);
      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
      if (visible && !reduced) raf = requestAnimationFrame(frameFn);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        clock.update(); // skip the time spent off-screen
        raf = requestAnimationFrame(frameFn);
      }
    });
    io.observe(host);
    frameFn(); // first frame immediately (also the only frame with reduced motion)
    if (reduced) host.addEventListener("pointermove", () => requestAnimationFrame(frameFn));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
      placeholder.dispose();
      photoTex?.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [photo, onReady]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
