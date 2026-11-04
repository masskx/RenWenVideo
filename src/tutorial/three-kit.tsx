import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {clamp} from '../fx';
import {font} from './theme';
import {jet} from './fonts';

// The 3D kit (user, 2026-11-04: "I would like to have a 3D feature that allows for a detailed, three-dimensional analysis
// and explanation"). Built on three.js through @remotion/three, following lemo/teardown's system (docs/video-craft/
// prompt-library/vendor/lemomo-ai__lemo-opuscar/3961ddb/styles/teardown/STYLE.md): physically based materials, a studio
// rig (warm key, cool rim that follows the camera, soft top, a room environment for reflections), a dark graphite sweep
// with the floor visible only as a soft contact shadow, a camera path keyed in the object's own coordinates and
// interpolated without overshoot, and labels / dimension lines projected from 3D points every frame (screen-space DOM on
// top of the canvas). Everything is a function of the frame: deterministic, renderable frame by frame.
// Render with --gl=swangle in the cloud container (SwiftShader); scripts/render-tutorial.mjs passes it for 3D films.
// Docs: docs/video-craft/3D.md.

export const W3 = 1080, H3 = 1920;

/* ---------- camera: keys in object coordinates, monotone cubic per component ---------- */

export type CamKey3 = {f: number; pos: [number, number, number]; target: [number, number, number]; fov?: number};
/** Monotone (Fritsch–Carlson) cubic through (xs, ys) at x: never overshoots, so a held key really holds. */
const monotone = (xs: number[], ys: number[], x: number) => {
  const n = xs.length;
  if (n === 1 || x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const d = xs.slice(1).map((xi, i) => (ys[i + 1] - ys[i]) / (xi - xs[i]));
  const m = ys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  let k = 0;
  while (x > xs[k + 1]) k++;
  const h = xs[k + 1] - xs[k], t = (x - xs[k]) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * h * m[k + 1];
};
export const camAt3 = (keys: CamKey3[], f: number) => {
  const xs = keys.map((k) => k.f);
  const c = (sel: (k: CamKey3) => number) => monotone(xs, keys.map(sel), f);
  return {pos: [c((k) => k.pos[0]), c((k) => k.pos[1]), c((k) => k.pos[2])] as [number, number, number],
    target: [c((k) => k.target[0]), c((k) => k.target[1]), c((k) => k.target[2])] as [number, number, number], fov: c((k) => k.fov ?? 30)};
};
/** A THREE camera for a pose (also used outside the canvas to project label anchors). `shiftY` moves the subject up/down in frame (px). */
export const makeCam = (pose: ReturnType<typeof camAt3>, shiftY = 0) => {
  const cam = new THREE.PerspectiveCamera(pose.fov, W3 / H3, 0.01, 500);
  cam.position.set(...pose.pos);
  cam.lookAt(new THREE.Vector3(...pose.target));
  if (shiftY) cam.setViewOffset(W3, H3, 0, -shiftY, W3, H3);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  return cam;
};
/** 3D point → screen px (and whether it is in front of the camera). */
export const project = (cam: THREE.PerspectiveCamera, p: [number, number, number]) => {
  const v = new THREE.Vector3(...p).project(cam);
  return {x: (v.x * 0.5 + 0.5) * W3, y: (-v.y * 0.5 + 0.5) * H3, ok: v.z < 1};
};

/** Puts the canvas camera exactly where the pose says (same maths as `makeCam`, so labels stay on their parts). */
const CamRig: React.FC<{pose: ReturnType<typeof camAt3>; shiftY: number}> = ({pose, shiftY}) => {
  const {camera, scene, gl} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = pose.fov; cam.aspect = W3 / H3; cam.near = 0.01; cam.far = 500;
  cam.position.set(...pose.pos);
  cam.lookAt(new THREE.Vector3(...pose.target));
  if (shiftY) cam.setViewOffset(W3, H3, 0, -shiftY, W3, H3); else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  // studio reflections: a room environment, prefiltered once per canvas
  const env = React.useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return t;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.45;   // reflections without washing the colours out
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  return null;
};

/** Studio rig: warm key from above front, cool rim behind the subject that follows the camera, soft top. */
const Rig: React.FC<{pose: ReturnType<typeof camAt3>; rim?: string; key?: number}> = ({pose, rim = '#9FC4FF', key = 2.4}) => {
  const [cx, , cz] = pose.pos, [tx, ty, tz] = pose.target;
  const bx = tx - (cx - tx) * 1.2, bz = tz - (cz - tz) * 1.2;   // behind the subject, opposite the camera
  return <>
    <ambientLight intensity={0.18} />
    <directionalLight position={[3, 7, 5]} intensity={key} color="#FFE9D2" />
    <directionalLight position={[bx, ty + 3, bz]} intensity={1.6} color={rim} />
    <directionalLight position={[0, 10, 0]} intensity={0.5} color="#FFFFFF" />
  </>;
};

/** Soft contact shadow on the invisible floor: a radial alpha disc (cheap; no shadow maps under SwiftShader). */
export const ContactShadow3: React.FC<{y?: number; r?: number; a?: number; at?: [number, number]}> = ({y = 0, r = 3, a = 0.55, at = [0, 0]}) => {
  const tex = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.55, 'rgba(0,0,0,0.45)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[at[0], y, at[1]]}>
    <planeGeometry args={[r * 2, r * 2]} />
    <meshBasicMaterial map={tex} transparent opacity={a} depthWrite={false} />
  </mesh>;
};

/**
 * A 3D stage filling the frame: graphite sweep behind (or `ground`), the canvas with the camera pose and rig, then the
 * screen-space `overlay` (labels, dimension lines) drawn with the same camera, so anchors stay on the parts.
 */
export const Stage3D: React.FC<{f: number; keys: CamKey3[]; shiftY?: number; ground?: [string, string]; rim?: string; children: React.ReactNode;
  overlay?: (cam: THREE.PerspectiveCamera) => React.ReactNode}> = ({f, keys, shiftY = 0, ground = ['#3A3D44', '#0C0D10'], rim, children, overlay}) => {
  const pose = camAt3(keys, f);
  const cam = makeCam(pose, shiftY);
  return <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${ground[0]} 0%, ${ground[1]} 78%)`}}>
    <ThreeCanvas width={W3} height={H3} style={{position: 'absolute', inset: 0}} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}>
      <CamRig pose={pose} shiftY={shiftY} />
      <Rig pose={pose} rim={rim} />
      {children}
    </ThreeCanvas>
    {overlay?.(cam)}
  </div>;
};

/* ---------- screen-space annotations anchored to 3D points (teardown §2, §4) ---------- */

const ease3 = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
/**
 * A teardown label: an anchor dot on the part, a leader that grows to a column at `colX`, then index (accent) + name +
 * one spec line. `p` 0..1 draws it in; `side` picks the column edge the text aligns to.
 */
export const Label3: React.FC<{cam: THREE.PerspectiveCamera; at: [number, number, number]; p: number; colX: number; dy?: number; idx: string; name: string; spec?: string;
  accent: string; ink?: string; size?: number}> = ({cam, at, p, colX, dy = 0, idx, name, spec, accent, ink = '#F1EFE9', size = 46}) => {
  if (p <= 0) return null;
  const a = project(cam, at);
  if (!a.ok) return null;
  // the leader breaks once (diagonal, then horizontal to the column at colX); the text sits above the horizontal run,
  // aligned to the frame's outer edge on that side, so it never runs off the frame
  const outerLeft = colX < W3 / 2;
  const ex = colX, ey = a.y + dy;
  const lp = ease3(p / 0.55), tp = ease3((p - 0.45) / 0.55);
  const kx = outerLeft ? Math.min(a.x - 40, ex + 340) : Math.max(a.x + 40, ex - 340);
  const pts = [[a.x, a.y], [kx, ey], [ex, ey]];
  const len = Math.hypot(kx - a.x, ey - a.y) + Math.abs(ex - kx);
  return <>
    <svg width={W3} height={H3} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={ink} strokeWidth={3} strokeOpacity={0.9} strokeDasharray={len} strokeDashoffset={len * (1 - lp)} />
      <circle cx={a.x} cy={a.y} r={9 * Math.min(1, p * 4)} fill={accent} stroke="#0C0D10" strokeWidth={3} />
    </svg>
    <div style={{position: 'absolute', bottom: H3 - ey + 8, ...(outerLeft ? {left: ex} : {right: W3 - ex}), textAlign: outerLeft ? 'left' : 'right', opacity: tp,
      transform: `translateY(${(1 - tp) * 10}px)`, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: size, color: ink, lineHeight: 1.1}}>
        <span style={{fontFamily: jet, fontSize: size * 0.62, color: accent, marginRight: 12, verticalAlign: 'middle'}}>{idx}</span>{name}
      </div>
      {spec && <div style={{fontFamily: jet, fontSize: size * 0.66, color: ink, opacity: 0.66, marginTop: 4}}>{spec}</div>}
    </div>
  </>;
};
/** A dimension line drawn in the scene's perspective between two 3D points, ticks at both ends, text on a dark plate. */
export const Dim3: React.FC<{cam: THREE.PerspectiveCamera; a: [number, number, number]; b: [number, number, number]; p: number; text: string; accent: string; size?: number; off?: number}> = ({
  cam, a, b, p, text, accent, size = 40, off = 0,
}) => {
  if (p <= 0) return null;
  const A = project(cam, a), B = project(cam, b);
  const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const ax = A.x + nx * off, ay = A.y + ny * off, bx = B.x + nx * off, by = B.y + ny * off;
  const q = ease3(p), mx = ax + (bx - ax) * q, my = ay + (by - ay) * q;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
  return <>
    <svg width={W3} height={H3} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <line x1={ax} y1={ay} x2={mx} y2={my} stroke={accent} strokeWidth={4} />
      {[[ax, ay], ...(q > 0.98 ? [[bx, by]] : [])].map(([x, y], i) => <line key={i} x1={x - nx * 14} y1={y - ny * 14} x2={x + nx * 14} y2={y + ny * 14} stroke={accent} strokeWidth={4} />)}
    </svg>
    {q > 0.6 && <div style={{position: 'absolute', left: (ax + bx) / 2, top: (ay + by) / 2, transform: `translate(-50%, -50%) rotate(${ang}deg)`, opacity: clamp((q - 0.6) / 0.3),
      background: 'rgba(12,13,16,0.85)', padding: '4px 12px', fontFamily: jet, fontSize: size, color: accent, whiteSpace: 'nowrap'}}>{text}</div>}
  </>;
};

/* ---------- materials and procedural textures for chips ---------- */

export const MAT = {
  silicon: () => new THREE.MeshPhysicalMaterial({color: '#2A2D35', metalness: 0.55, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15}),
  substrate: () => new THREE.MeshPhysicalMaterial({color: '#1E3B2C', metalness: 0.1, roughness: 0.55, clearcoat: 0.4}),
  interposer: () => new THREE.MeshPhysicalMaterial({color: '#7C7F86', metalness: 0.8, roughness: 0.32}),
  copper: () => new THREE.MeshPhysicalMaterial({color: '#C98A4B', metalness: 1, roughness: 0.3}),
  gold: () => new THREE.MeshPhysicalMaterial({color: '#E0B84D', metalness: 1, roughness: 0.28}),
  plastic: (c: string) => new THREE.MeshPhysicalMaterial({color: c, metalness: 0, roughness: 0.6}),
};

/**
 * A die's top face painted as a floorplan (canvas → texture): `blocks` are [x, y, w, h, colour] in 0..1 die units drawn
 * over a dark silicon ground with a fine grid; `glow` blocks get an emissive map so they can light up.
 */
export const useDieTexture = (blocks: [number, number, number, number, string][], ppu = 512, grid = 32) => React.useMemo(() => {
  const c = document.createElement('canvas'); c.width = c.height = ppu;
  const g = c.getContext('2d')!;
  g.fillStyle = '#20232B'; g.fillRect(0, 0, ppu, ppu);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1;
  for (let i = 0; i <= grid; i++) { const v = (i / grid) * ppu; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, ppu); g.moveTo(0, v); g.lineTo(ppu, v); g.stroke(); }
  for (const [x, y, w, h, col] of blocks) {
    g.fillStyle = col; g.fillRect(x * ppu, y * ppu, w * ppu, h * ppu);
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = Math.max(1, ppu / 512); g.strokeRect(x * ppu, y * ppu, w * ppu, h * ppu);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}, [blocks, ppu, grid]);

/** Lift helper for exploded views: layer `i` of `n` rises `gap` × its order, top first, staggered (teardown §5). */
export const explode = (f: number, at: number, i: number, n: number, gap: number, stagger = 4, dur = 22) => {
  const order = n - 1 - i;                          // top layer leaves first
  return ease3((f - at - order * stagger) / dur) * gap * i;
};
