import React from 'react';
import * as THREE from 'three';
import {clamp} from '../../fx';
import {font} from '../theme';
import {cond, jet} from '../fonts';
import {Scene} from '../paper';
import {CamKey3, ContactShadow3, Dim3, Label3, MAT, Stage3D, useDieTexture} from '../three-kit';

// chips-cpu-gpu-npu-tpu (user, 2026-11-04: "a science-based video explaining what CPUs, GPUs, NPUs, and TPUs are. Then,
// explain why large models require GPUs and why their prices are increasing" + "a 3D feature that allows for a detailed,
// three-dimensional analysis and explanation"). Template lemo/teardown in our own 3D kit (src/tutorial/three-kit.tsx).
// Inputs: inputs/chips-cpu-gpu-npu-tpu/ (idea.md, sources.md). Storyboard: tutorials/chips-cpu-gpu-npu-tpu.storyboard.md.
// Geometry: models from published figures only (H100: 132 SMs × 128 FP32 cores = 16,896; 80 GB HBM3, 3.35 TB/s; TPU MXU
// 128 × 128 MACs), everything else is a schematic and says so on screen (示意). No logos on any part.

const GOLD = '#E0B84D', INK = '#F1EFE9';
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};
const Tag: React.FC<{text: string; y?: number}> = ({text, y = 300}) => (
  <div style={{position: 'absolute', left: 64, top: y, fontFamily: jet, fontSize: 26, color: INK, opacity: 0.7, letterSpacing: 2, border: `2px solid ${INK}55`, padding: '4px 12px'}}>{text}</div>
);
const Big: React.FC<{x: number; y: number; v: string; unit: string; c?: string; size?: number; o?: number}> = ({x, y, v, unit, c = INK, size = 150, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, whiteSpace: 'nowrap', textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>
    <span style={{fontFamily: cond, fontWeight: 800, fontSize: size, color: c, lineHeight: 1}}>{v}</span>
    <span style={{fontFamily: font, fontWeight: 700, fontSize: size * 0.3, color: INK, marginLeft: 10}}>{unit}</span>
  </div>
);

/* ---------- parts ---------- */

// H100-class die floorplan (schematic): 132 SM blocks in a grid around a central L2 band, HBM PHYs on the long edges.
const SM_BLOCKS: [number, number, number, number, string][] = (() => {
  const out: [number, number, number, number, string][] = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 11; c++) {
    const y = 0.08 + r * 0.071 + (r >= 6 ? 0.03 : 0);
    out.push([0.08 + c * 0.077, y, 0.068, 0.06, r % 2 ? '#3B4A66' : '#43547A']);
  }
  out.push([0.08, 0.505, 0.84, 0.022, '#7A6A3C']);                // L2 cache band
  out.push([0.02, 0.08, 0.04, 0.86, '#555A66'], [0.94, 0.08, 0.04, 0.86, '#555A66']); // memory PHYs
  return out;
})();
// CPU die (schematic): a few big cores, each mostly control and cache, and a large shared cache.
const CPU_BLOCKS: [number, number, number, number, string][] = (() => {
  const out: [number, number, number, number, string][] = [];
  for (let i = 0; i < 8; i++) {
    const x = 0.06 + (i % 4) * 0.225, y = i < 4 ? 0.06 : 0.62;
    out.push([x, y, 0.2, 0.32, '#8A5A3C'], [x + 0.02, y + 0.03, 0.16, 0.1, '#B07A4E'], [x + 0.02, y + 0.17, 0.07, 0.12, '#6E4A33'], [x + 0.11, y + 0.17, 0.07, 0.12, '#6E4A33']);
  }
  out.push([0.06, 0.41, 0.88, 0.18, '#7A6A3C']);                  // shared L3
  return out;
})();

const Die: React.FC<{w: number; d: number; h?: number; y: number; blocks: [number, number, number, number, string][]; x?: number; z?: number; glow?: number}> = ({w, d, h = 0.07, y, blocks, x = 0, z = 0, glow = 0}) => {
  const tex = useDieTexture(blocks, 1024, 48);
  const mats = React.useMemo(() => {
    const side = MAT.silicon();
    const top = new THREE.MeshPhysicalMaterial({map: tex, metalness: 0.35, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08, emissive: new THREE.Color('#E0B84D'), emissiveMap: tex, emissiveIntensity: 0});
    return [side, side, top, side, side, side];
  }, [tex]);
  (mats[2] as THREE.MeshPhysicalMaterial).emissiveIntensity = glow * 0.6;
  return <mesh position={[x, y + h / 2, z]} material={mats}><boxGeometry args={[w, h, d]} /></mesh>;
};
const Slab: React.FC<{w: number; d: number; h: number; y: number; x?: number; z?: number; mat: THREE.Material}> = ({w, d, h, y, x = 0, z = 0, mat}) => (
  <mesh position={[x, y + h / 2, z]} material={mat}><boxGeometry args={[w, h, d]} /></mesh>
);
/** One HBM stack: a base (logic) die and `n` DRAM dies; `lift` spreads the layers apart. */
const HBMStack: React.FC<{x: number; z: number; y: number; n?: number; lift?: number; w?: number; d?: number}> = ({x, z, y, n = 8, lift = 0, w = 1.1, d = 0.95}) => {
  const m = React.useMemo(() => ({base: MAT.interposer(), dram: MAT.silicon(), edge: MAT.gold()}), []);
  const t = 0.012;
  return <group position={[x, y, z]}>
    <Slab w={w} d={d} h={t * 1.6} y={0} mat={m.base} />
    {Array.from({length: n}, (_, i) => <group key={i} position={[0, t * 1.6 + i * (t + 0.003) + lift * (i + 1), 0]}>
      <Slab w={w * 0.98} d={d * 0.98} h={t} y={0} mat={m.dram} />
      <Slab w={w * 0.985} d={0.02} h={t * 0.5} y={t * 0.25} z={d * 0.49} mat={m.edge} />
    </group>)}
  </group>;
};
/** H100-class package (schematic): substrate, interposer, GPU die, six HBM sites. `ex` 0..1 explodes it. */
const GPUPackage: React.FC<{f: number; ex?: number; glow?: number; x?: number}> = ({ex = 0, glow = 0, x = 0}) => {
  const m = React.useMemo(() => ({sub: MAT.substrate(), int: MAT.interposer()}), []);
  const g = ex * 0.6;
  return <group position={[x, 0, 0]}>
    <Slab w={6} d={5} h={0.14} y={0} mat={m.sub} />
    <Slab w={4.5} d={3.6} h={0.06} y={0.14 + g * 0.5} mat={m.int} />
    <Die w={2.6} d={3.1} y={0.2 + g * 1.4} blocks={SM_BLOCKS} glow={glow} />
    {[-1, 1].flatMap((s) => [-1.1, 0, 1.1].map((z) => <HBMStack key={`${s}${z}`} x={s * 1.85} z={z} y={0.2 + g * 1.4} lift={ex * 0.02} />))}
  </group>;
};
const CPUPackage: React.FC<{x?: number; glow?: number}> = ({x = 0, glow = 0}) => {
  const m = React.useMemo(() => ({sub: MAT.substrate()}), []);
  return <group position={[x, 0, 0]}>
    <Slab w={3} d={3} h={0.14} y={0} mat={m.sub} />
    <Die w={1.7} d={1.3} y={0.14} blocks={CPU_BLOCKS} glow={glow} />
  </group>;
};
/** Tokens leaving a chip: small glowing cubes rising at `rate` per second (deterministic). */
const Tokens: React.FC<{f: number; rate: number; x: number; y0: number; spread: number; color: string; size?: number}> = ({f, rate, x, y0, spread, color, size = 0.12}) => {
  const mat = React.useMemo(() => new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: 1.2, roughness: 0.4}), [color]);
  const life = 45, perFrame = rate / 30, n = Math.min(400, Math.ceil(life * perFrame) + 1), out: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const born = Math.floor(f * perFrame) - k;            // token index
    const age = f - born / perFrame;
    if (age < 0 || age > life) continue;
    const h = Math.sin(born * 12.9898) * 43758.5453, r = h - Math.floor(h), r2 = (h * 7.13) - Math.floor(h * 7.13);
    out.push(<mesh key={born} material={mat} position={[x + (r - 0.5) * spread, y0 + age * 0.06, (r2 - 0.5) * spread * 0.6]} rotation={[age * 0.05, age * 0.08, 0]}>
      <boxGeometry args={[size, size, size]} /></mesh>);
  }
  return <>{out}</>;
};

/* ---------- style frame A · the hook: same model, CPU ≈6 tokens/s vs GPU ≈200 ---------- */

const HOOK_KEYS: CamKey3[] = [
  {f: 0, pos: [0, 15, 13], target: [0, 0, 0.4], fov: 30},
  {f: 150, pos: [0.8, 14.4, 12.6], target: [0, 0, 0.4], fov: 30},
];
const Hook = make(({f}) => <Stage3D f={f} keys={HOOK_KEYS} overlay={() => <>
  <Big x={64} y={330} v="≈6" unit="字/秒" size={140} />
  <div style={{position: 'absolute', left: 70, top: 480, fontFamily: font, fontWeight: 700, fontSize: 44, color: INK, opacity: 0.85}}>CPU + 电脑内存</div>
  <Big x={64} y={860} v="≈200" unit="字/秒" c={GOLD} size={140} />
  <div style={{position: 'absolute', left: 70, top: 1010, fontFamily: font, fontWeight: 700, fontSize: 44, color: INK, opacity: 0.85}}>GPU + HBM</div>
  <Tag text="同一个 80 亿参数模型 · 估算的理论上限" y={250} />
</>}>
  <group position={[1.2, 0, -3.4]}><CPUPackage /><Tokens f={f} rate={6} x={0} y0={0.4} spread={1.2} color={INK} /></group>
  <group position={[0.6, 0, 2.6]} scale={0.78}><GPUPackage f={f} /><Tokens f={f} rate={200} x={0} y0={0.5} spread={2.6} color={GOLD} size={0.13} /></group>
  <ContactShadow3 r={8} a={0.6} />
</Stage3D>);

/* ---------- style frame B · the GPU die: 132 SMs × 128 cores ---------- */

const GPU_KEYS: CamKey3[] = [
  {f: 0, pos: [6, 12, 14], target: [0, 0.3, 0.2], fov: 30},
  {f: 120, pos: [3.6, 10, 10.5], target: [0, 0.3, 0.2], fov: 30},
];
const Gpu = make(({f}) => {
  const lab = clamp((f - 30) / 24), lab2 = clamp((f - 60) / 24), dim = clamp((f - 80) / 24);
  return <Stage3D f={f} keys={GPU_KEYS} shiftY={-80} overlay={(cam) => <>
    <Label3 cam={cam} at={[-0.6, 0.29, -0.9]} p={lab} colX={70} dy={-300} idx="01" name="SM 计算单元 × 132" spec="每个 128 个核心" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[1.85, 0.3, 1.1]} p={lab2} colX={1010} dy={260} idx="02" name="HBM 显存" spec="80 GB · 3.35 TB/s" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-1.3, 0.3, 1.75]} b={[1.3, 0.3, 1.75]} p={dim} off={46} text="132 × 128 = 16,896 个核心" accent={GOLD} size={36} />
    <Tag text="H100 级 GPU · 示意模型 · 数字来自 NVIDIA" y={1250} />
  </>}>
    <GPUPackage f={f} glow={0.25 + 0.25 * Math.sin(f / 6)} />
    <ContactShadow3 r={5} a={0.7} />
  </Stage3D>;
});

/* ---------- style frame C · TPU: a 128×128 systolic array (shown 12×12), data marching through ---------- */

const TPU_N = 12;
const TPU_KEYS: CamKey3[] = [
  {f: 0, pos: [-9, 15, 15], target: [0, 0, 0.3], fov: 30},
  {f: 120, pos: [-7.6, 14, 13.6], target: [0, 0, 0.3], fov: 30},
];
const Tpu = make(({f}) => {
  const step = f / 4;                                     // one cell per 4 frames
  const cells = React.useMemo(() => {
    const base = new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.3, roughness: 0.45, clearcoat: 0.3});
    const lit = Array.from({length: 6}, (_, i) => new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.3, roughness: 0.45, emissive: new THREE.Color(GOLD), emissiveIntensity: 1.4 * Math.pow(1 - i / 6, 1.6)}));
    return {base, lit};
  }, []);
  const s = 0.5, out: React.ReactNode[] = [];
  for (let i = 0; i < TPU_N; i++) for (let j = 0; j < TPU_N; j++) {
    const d = step - (i + j);                             // the wavefront: cell (i, j) fires i + j steps after the first
    const k = Math.floor(d % 8);
    const m = d >= 0 && k >= 0 && k < 6 ? cells.lit[k] : cells.base;
    out.push(<mesh key={`${i}-${j}`} material={m} position={[(j - TPU_N / 2 + 0.5) * s, d >= 0 && k === 0 ? 0.04 : 0, (i - TPU_N / 2 + 0.5) * s]}><boxGeometry args={[s * 0.82, 0.14, s * 0.82]} /></mesh>);
  }
  // data cubes entering from the left edge (skewed by row) and partial sums leaving at the bottom edge
  const dataMat = React.useMemo(() => new THREE.MeshStandardMaterial({color: INK, emissive: INK, emissiveIntensity: 0.8}), []);
  for (let i = 0; i < TPU_N; i++) {
    const x = (-TPU_N / 2 - 1.2 + ((step - i) % 8) * 0.15) * s;
    out.push(<mesh key={`in${i}`} material={dataMat} position={[x, 0.18, (i - TPU_N / 2 + 0.5) * s]}><boxGeometry args={[0.16, 0.16, 0.16]} /></mesh>);
  }
  return <Stage3D f={f} keys={TPU_KEYS} shiftY={-60} overlay={(cam) => <>
    <Label3 cam={cam} at={[(-TPU_N / 2 - 1) * s, 0.2, 0]} p={clamp((f - 20) / 24)} colX={70} dy={-420} idx="01" name="数据从左边流进来" spec="一拍走一格" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[0, 0.1, 0]} p={clamp((f - 45) / 24)} colX={1010} dy={-560} idx="02" name="每格一个乘加器" spec="权重提前装好" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-TPU_N / 2 * s, 0.1, TPU_N / 2 * s + 0.3]} b={[TPU_N / 2 * s, 0.1, TPU_N / 2 * s + 0.3]} p={clamp((f - 70) / 24)} off={30} text="示意 12 格 · 实际 128 × 128" accent={GOLD} size={34} />
    <Tag text="Google TPU 的矩阵单元（MXU）· 脉动阵列" y={1250} />
  </>}>
    {out}
    <ContactShadow3 r={5} a={0.6} />
  </Stage3D>;
});

/* ---------- style frame D · the memory bus: 128 lanes vs 5,120 lanes, same scale ---------- */

const BUS_KEYS: CamKey3[] = [
  {f: 0, pos: [3, 9, 13], target: [0.4, 0, -0.5], fov: 30},
  {f: 120, pos: [2.2, 8.4, 12.2], target: [0.4, 0, -0.5], fov: 30},
];
/**
 * A ribbon of n copper traces at true density. At this scale the traces are finer than a pixel, so the ribbon is one
 * plane with a striped, mip-mapped texture (n stripes; no moiré), and packets run on a sample of the lanes.
 */
const Lanes: React.FC<{f: number; n: number; x0: number; width: number; color: string; speed: number; packets?: number}> = ({f, n, x0, width, color, speed, packets = 64}) => {
  const mat = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = Math.min(4096, Math.max(64, n * 2)); c.height = 8;
    const g = c.getContext('2d')!;
    g.fillStyle = '#3A2414'; g.fillRect(0, 0, c.width, 8);
    g.fillStyle = '#D9955A';
    for (let i = 0; i < n; i++) g.fillRect(Math.floor((i / n) * c.width), 0, Math.max(1, (c.width / n) * 0.6), 8);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter;
    return new THREE.MeshPhysicalMaterial({map: t, metalness: 0.9, roughness: 0.35});
  }, [n]);
  const pmat = React.useMemo(() => new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: 1.1}), [color]);
  const m = Math.min(packets, n), out: React.ReactNode[] = [];
  for (let i = 0; i < m; i++) {
    const h = Math.sin(i * 12.9898 + n) * 43758.5453, ph = h - Math.floor(h);
    const z = 4 - (((f * speed) / 30 + ph) % 1) * 8;           // memory (near) → chip (far)
    out.push(<mesh key={i} material={pmat} position={[x0 + ((i + 0.5) / m) * width, 0.04, z]}><boxGeometry args={[Math.max(0.03, (width / m) * 0.5), 0.04, 0.22]} /></mesh>);
  }
  return <>
    <mesh material={mat} position={[x0 + width / 2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 8]} /></mesh>
    {out}
  </>;
};
const Bus = make(({f}) => {
  const busMats = React.useMemo(() => ({die: MAT.silicon(), ddr: MAT.substrate()}), []);
  return <Stage3D f={f} keys={BUS_KEYS} shiftY={-40} overlay={(cam) => <>
    <Label3 cam={cam} at={[-2.25, 0.05, 2]} p={clamp((f - 10) / 24)} colX={70} dy={200} idx="01" name="电脑内存 · 128 根线" spec="≈96 GB/s" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[0.8, 0.05, -1.5]} p={clamp((f - 35) / 24)} colX={1010} dy={-380} idx="02" name="HBM · 5,120 根线" spec="3,350 GB/s" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-1.2, 0.05, 4.3]} b={[2.8, 0.05, 4.3]} p={clamp((f - 60) / 24)} off={40} text="带宽 ≈35×" accent={GOLD} size={52} />
    <Tag text="同一比例 · 双通道 DDR5-6000 vs H100" y={1250} />
  </>}>
    <Lanes f={f} n={128} x0={-2.3} width={0.1} color={INK} speed={0.45} packets={4} />
    <Lanes f={f} n={5120} x0={-1.2} width={4} color={GOLD} speed={0.45} packets={96} />
    {/* the ends: the chip (far) and the memory (near) on each bus */}
    <Slab w={0.7} d={0.7} h={0.12} x={-2.25} z={-4.4} y={0} mat={busMats.die} />
    <Slab w={0.5} d={0.9} h={0.08} x={-2.25} z={4.5} y={0} mat={busMats.ddr} />
    <Slab w={4.4} d={1.2} h={0.12} x={0.8} z={-4.6} y={0} mat={busMats.die} />
    {[0, 1, 2, 3, 4].map((k) => <HBMStack key={k} x={-0.8 + k * 0.8} z={4.6} y={0} w={0.7} d={0.7} />)}
    <ContactShadow3 r={6} a={0.5} />
  </Stage3D>;
});

export const chipsScenes: Record<string, Scene> = {'chip.hook': Hook, 'chip.gpu': Gpu, 'chip.tpu': Tpu, 'chip.bus': Bus};
