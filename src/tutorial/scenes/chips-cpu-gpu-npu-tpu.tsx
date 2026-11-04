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
const Tag: React.FC<{text: string; y?: number; o?: number}> = ({text, y = 300, o = 1}) => (
  <div style={{position: 'absolute', left: 64, top: y, opacity: o * 0.8, fontFamily: jet, fontSize: 32, color: INK, letterSpacing: 1, border: `2px solid ${INK}55`, padding: '4px 14px', background: 'rgba(12,13,16,0.55)', whiteSpace: 'nowrap'}}>{text}</div>
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

/* ---------- shared bits ---------- */

const ease3 = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const ramp = (f: number, a: number, d = 20) => ease3((f - a) / d);
/** Thin glowing overlay boxes on a die (one per block), lit in turn: the "this part is working" light. */
const Glow: React.FC<{blocks: [number, number, number, number][]; w: number; d: number; y: number; lit: (i: number) => number; color?: string; x?: number; z?: number}> = ({blocks, w, d, y, lit, color = GOLD, x = 0, z = 0}) => {
  const mats = React.useMemo(() => blocks.map(() => new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: 0, transparent: true, opacity: 0})), [blocks, color]);
  return <group position={[x, y, z]}>{blocks.map(([bx, by, bw, bh], i) => {
    const v = clamp(lit(i));
    mats[i].emissiveIntensity = 1.3 * v; mats[i].opacity = 0.75 * v;
    return <mesh key={i} material={mats[i]} position={[(bx + bw / 2 - 0.5) * w, 0.006, (by + bh / 2 - 0.5) * d]}><boxGeometry args={[bw * w * 0.96, 0.01, bh * d * 0.96]} /></mesh>;
  })}</group>;
};
const sfx = (list: [number, string, number][]) => () => list.map(([at, kind, gain]) => ({at, kind, gain}));

/* ---------- 1 hook: same model, CPU ≈6 tokens/s vs GPU ≈200 ---------- */

const HOOK_KEYS: CamKey3[] = [
  {f: 0, pos: [0, 15, 13], target: [0, 0, 0.4], fov: 30},
  {f: 155, pos: [1.1, 14.2, 12.4], target: [0, 0, 0.4], fov: 30},
];
const HookArt: React.FC<{f: number}> = ({f}) => <>
  <group position={[1.2, 0, -3.4]}><CPUPackage /><Tokens f={f} rate={6} x={0} y0={0.4} spread={1.2} color={INK} /></group>
  <group position={[0.6, 0, 2.6]} scale={0.78}><GPUPackage f={f} /><Tokens f={f} rate={200} x={0} y0={0.5} spread={2.6} color={GOLD} size={0.13} /></group>
  <ContactShadow3 r={8} a={0.6} />
</>;
const Hook = make(({f, cue}) => {
  const a = cue('a', 48), b = cue('b', 99);
  return <Stage3D f={f} keys={HOOK_KEYS} overlay={() => <>
    <Tag text="同一个 80 亿参数模型 · 估算的理论上限" y={250} />
    <Big x={64} y={330} v="≈6" unit="字/秒" size={140} o={0.55 + 0.45 * ramp(f, a - 6, 8)} />
    <div style={{position: 'absolute', left: 70, top: 480, fontFamily: font, fontWeight: 700, fontSize: 44, color: INK, opacity: 0.85}}>CPU + 电脑内存</div>
    <div style={{transformOrigin: '64px 900px', transform: `scale(${1 + 0.12 * Math.max(0, 1 - Math.abs(f - b - 4) / 8)})`}}>
      <Big x={64} y={830} v="≈200" unit="字/秒" c={GOLD} size={140} o={0.55 + 0.45 * ramp(f, b - 6, 8)} />
    </div>
    <div style={{position: 'absolute', left: 70, top: 980, fontFamily: font, fontWeight: 700, fontSize: 44, color: INK, opacity: 0.85}}>GPU + HBM</div>
  </>}><HookArt f={f} /></Stage3D>;
}, (cue) => [{at: 0, kind: 'fs-impact-deep', gain: 0.12}, {at: cue('a', 48), kind: 'tick', gain: 0.08}, {at: cue('b', 99), kind: 'whoosh-short', gain: 0.1}]);

/* ---------- 2 cpu: the lid lifts, 8 big cores light up in turn, the shared cache ---------- */

const CORE_RECTS: [number, number, number, number][] = Array.from({length: 8}, (_, i) => [0.06 + (i % 4) * 0.225, i < 4 ? 0.06 : 0.62, 0.2, 0.32]);
const CPU_KEYS: CamKey3[] = [
  {f: 0, pos: [3.5, 9, 9], target: [0, 0.2, 0], fov: 30},
  {f: 60, pos: [1.6, 6.2, 5.6], target: [0, 0.2, 0.1], fov: 30},
  {f: 135, pos: [0.9, 5.6, 4.6], target: [0, 0.2, 0.1], fov: 30},
];
const Cpu = make(({f, cue}) => {
  const a = cue('a', 30), b = cue('b', 65);
  const lid = ramp(f, 2, 26);
  const lidMat = React.useMemo(() => new THREE.MeshPhysicalMaterial({color: '#B9BCC2', metalness: 1, roughness: 0.32}), []);
  return <Stage3D f={f} keys={CPU_KEYS} shiftY={-60} overlay={(cam) => <>
    <Label3 cam={cam} at={[-0.55, 0.22, -0.4]} p={ramp(f, a, 18)} colX={70} dy={-330} idx="01" name="大核 × 8（示意）" spec="每个核自带控制和缓存" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[0.3, 0.22, 0]} p={ramp(f, b, 18)} colX={1010} dy={300} idx="02" name="共享缓存" spec="给几个核轮流用" accent={GOLD} size={42} />
    <Tag text="CPU · 结构示意" y={1250} />
  </>}>
    <CPUPackage />
    <Glow blocks={CORE_RECTS} w={1.7} d={1.3} y={0.21} lit={(i) => (f - a - i * 3) / 6} color={GOLD} />
    <mesh material={lidMat} position={[0, 0.3 + lid * 2.2, -lid * 0.8]} rotation={[-lid * 0.5, 0, 0]}><boxGeometry args={[2.2, 0.12, 2.2]} /></mesh>
    <ContactShadow3 r={4} a={0.6} />
  </Stage3D>;
}, sfx([[2, 'whoosh-short', 0.08], [30, 'tick', 0.07], [65, 'tick', 0.07]]));

/* ---------- 3 gpu: 132 SMs × 128 cores; one instruction lights them all at once ---------- */

const GPU_KEYS: CamKey3[] = [
  {f: 0, pos: [6, 12, 14], target: [0, 0.3, 0.2], fov: 30},
  {f: 175, pos: [3.4, 9.6, 10.2], target: [0, 0.3, 0.2], fov: 30},
];
const Gpu = make(({f, cue}) => {
  const a = cue('a', 46), b = cue('b', 107);
  const flash = Math.max(0, 1 - Math.abs(f - b - 6) / 14);
  return <Stage3D f={f} keys={GPU_KEYS} shiftY={-80} overlay={(cam) => <>
    <Label3 cam={cam} at={[-0.6, 0.29, -0.9]} p={ramp(f, 4, 18)} colX={70} dy={-300} idx="01" name="SM 计算单元 × 132" spec="每个 128 个核心" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-1.3, 0.3, 1.75]} b={[1.3, 0.3, 1.75]} p={ramp(f, a, 22)} off={46} text="132 × 128 = 16,896 个核心" accent={GOLD} size={36} />
    <Label3 cam={cam} at={[1.85, 0.3, 1.1]} p={ramp(f, b + 14, 18)} colX={1010} dy={260} idx="02" name="同一条指令" spec="同时算一大片数" accent={GOLD} size={42} />
    <Tag text="H100 级 GPU · 示意模型 · 数字来自 NVIDIA" y={1250} />
  </>}>
    <GPUPackage f={f} glow={0.15 + 1.4 * flash} />
    <ContactShadow3 r={5} a={0.7} />
  </Stage3D>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: cue('a', 46), kind: 'fs-paper-slide', gain: 0.06}, {at: cue('b', 107) + 6, kind: 'chime', gain: 0.1}]);

/* ---------- 4 npu: a phone / PC SoC; the NPU block lifts out and glows ---------- */

const SOC_BLOCKS: [number, number, number, number, string][] = [
  [0.06, 0.06, 0.4, 0.4, '#8A5A3C'],   // CPU cluster
  [0.52, 0.06, 0.42, 0.4, '#43547A'],  // GPU
  [0.06, 0.52, 0.4, 0.42, '#2A2D35'],  // NPU slot (the block itself lifts out)
  [0.52, 0.52, 0.2, 0.42, '#555A66'],  // ISP / media
  [0.74, 0.52, 0.2, 0.42, '#3E4450'],  // memory controller
];
const NPU_KEYS: CamKey3[] = [
  {f: 0, pos: [-4, 9.5, 9], target: [0, 0.3, 0.1], fov: 30},
  {f: 178, pos: [-2.8, 8.2, 7.6], target: [-0.2, 0.4, 0.2], fov: 30},
];
const NpuGrid: React.FC<{f: number; at: number}> = ({f, at}) => {
  const base = React.useMemo(() => new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.3, roughness: 0.45}), []);
  const lit = React.useMemo(() => new THREE.MeshStandardMaterial({color: '#2B3040', emissive: GOLD, emissiveIntensity: 1.2}), []);
  const n = 6, s = 0.15, out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const on = f > at && Math.floor((f - at) / 3 + i + j) % 4 === 0;
    out.push(<mesh key={`${i}${j}`} material={on ? lit : base} position={[(j - n / 2 + 0.5) * s, 0.05, (i - n / 2 + 0.5) * s]}><boxGeometry args={[s * 0.8, 0.06, s * 0.8]} /></mesh>);
  }
  return <>{out}</>;
};
const Npu = make(({f, cue}) => {
  const a = cue('a', 54), b = cue('b', 88);
  const up = ramp(f, a - 10, 24) * 0.55;
  const m = React.useMemo(() => ({sub: MAT.substrate(), npu: new THREE.MeshPhysicalMaterial({color: '#20232B', metalness: 0.5, roughness: 0.3, clearcoat: 0.8})}), []);
  const w = 2.4, d = 2.4;
  return <Stage3D f={f} keys={NPU_KEYS} shiftY={-60} overlay={(cam) => <>
    <Tag text="示意 · 手机 / 电脑里的一颗 SoC 芯片" y={250} />
    <Label3 cam={cam} at={[-0.25 * w + 0.1, 0.25, -0.25 * d]} p={ramp(f, 6, 18)} colX={70} dy={-40} idx="01" name="CPU" spec="几个大核" accent={GOLD} size={40} />
    <Label3 cam={cam} at={[0.23 * w, 0.25, -0.25 * d]} p={ramp(f, 14, 18)} colX={1010} dy={-200} idx="02" name="GPU" spec="小核方阵" accent={GOLD} size={40} />
    <Label3 cam={cam} at={[-0.24 * w, 0.2 + up, 0.23 * d]} p={ramp(f, a + 4, 18)} colX={1010} dy={330} idx="03" name="NPU · 只做乘加" spec="省电" accent={GOLD} size={46} />
    {f > b && <div style={{position: 'absolute', left: 64, top: 300, opacity: ramp(f, b, 10), whiteSpace: 'nowrap', textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: GOLD}}>≥ 40 TOPS</span>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK}}>每秒 40 万亿次 · 微软 Copilot+ PC 的要求</div>
    </div>}
  </>}>
    <Slab w={3.4} d={3.4} h={0.14} y={0} mat={m.sub} />
    <Die w={w} d={d} y={0.14} blocks={SOC_BLOCKS} />
    <group position={[-0.25 * w + 0.01, 0.21 + up, 0.23 * d]}>
      <mesh material={m.npu} position={[0, 0.03, 0]}><boxGeometry args={[0.4 * w, 0.06, 0.42 * d]} /></mesh>
      <NpuGrid f={f} at={a} />
    </group>
    <ContactShadow3 r={4.5} a={0.6} />
  </Stage3D>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.08}, {at: cue('a', 54) - 10, kind: 'whoosh', gain: 0.07}, {at: cue('b', 88), kind: 'thud', gain: 0.1}]);

/* ---------- 5 tpu: a 128×128 systolic array (shown 12×12), the wavefront marching through ---------- */

const TPU_N = 12;
const TPU_KEYS: CamKey3[] = [
  {f: 0, pos: [-9, 15, 15], target: [0, 0, 0.3], fov: 30},
  {f: 198, pos: [-7.2, 13.4, 13], target: [0, 0, 0.3], fov: 30},
];
const Tpu = make(({f, cue}) => {
  const a = cue('a', 59), b = cue('b', 142);
  const run = f >= b - 4, step = (f - (b - 4)) / 4;
  const cells = React.useMemo(() => {
    const base = new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.3, roughness: 0.45, clearcoat: 0.3});
    const lit = Array.from({length: 6}, (_, i) => new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.3, roughness: 0.45, emissive: new THREE.Color(GOLD), emissiveIntensity: 1.4 * Math.pow(1 - i / 6, 1.6)}));
    return {base, lit};
  }, []);
  const dataMat = React.useMemo(() => new THREE.MeshStandardMaterial({color: INK, emissive: INK, emissiveIntensity: 0.8}), []);
  const s = 0.5, out: React.ReactNode[] = [];
  for (let i = 0; i < TPU_N; i++) for (let j = 0; j < TPU_N; j++) {
    const rise = ramp(f, (i + j) * 0.9, 12);                // the array rises in a wave from one corner
    const d = run ? step - (i + j) : -1, k = Math.floor(d % 8);
    const m = d >= 0 && k >= 0 && k < 6 ? cells.lit[k] : cells.base;
    out.push(<mesh key={`${i}-${j}`} material={m} position={[(j - TPU_N / 2 + 0.5) * s, -0.4 + 0.4 * rise + (d >= 0 && k === 0 ? 0.04 : 0), (i - TPU_N / 2 + 0.5) * s]}><boxGeometry args={[s * 0.82, 0.14, s * 0.82]} /></mesh>);
  }
  if (run) for (let i = 0; i < TPU_N; i++) {
    const x = (-TPU_N / 2 - 1.2 + (((step - i) % 8) + 8) % 8 * 0.15) * s;
    out.push(<mesh key={`in${i}`} material={dataMat} position={[x, 0.18, (i - TPU_N / 2 + 0.5) * s]}><boxGeometry args={[0.16, 0.16, 0.16]} /></mesh>);
  }
  return <Stage3D f={f} keys={TPU_KEYS} shiftY={-60} overlay={(cam) => <>
    <Tag text="Google TPU 的矩阵单元（MXU）· 脉动阵列" y={250} />
    <Label3 cam={cam} at={[0, 0.1, 0]} p={ramp(f, a + 8, 18)} colX={1010} dy={-560} idx="01" name="每格一个乘加器" spec="权重提前装好" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-TPU_N / 2 * s, 0.1, TPU_N / 2 * s + 0.3]} b={[TPU_N / 2 * s, 0.1, TPU_N / 2 * s + 0.3]} p={ramp(f, a, 22)} off={30} text="示意 12 格 · 实际 128 × 128" accent={GOLD} size={34} />
    <Label3 cam={cam} at={[(-TPU_N / 2 - 1) * s, 0.2, 0]} p={ramp(f, b, 18)} colX={70} dy={-420} idx="02" name="数据从左边流进来" spec="一拍走一格" accent={GOLD} size={42} />
  </>}>
    {out}
    <ContactShadow3 r={5} a={0.6} />
  </Stage3D>;
}, (cue) => [{at: 0, kind: 'whoosh', gain: 0.07}, {at: cue('a', 59), kind: 'fs-paper-slide', gain: 0.06}, ...Array.from({length: 12}, (_, i) => ({at: cue('b', 142) + i * 4, kind: 'tick', gain: 0.05}))]);

/* ---------- 6 math: a weight matrix, an input vector sweeping across it, a token out ---------- */

const MATH_KEYS: CamKey3[] = [
  {f: 0, pos: [5, 11, 12], target: [0, 0, 0], fov: 30},
  {f: 148, pos: [3.6, 9.6, 10.6], target: [0, 0, 0], fov: 30},
];
const MathScene = make(({f, cue}) => {
  const a = cue('a', 61), b = cue('b', 84);
  const n = 10, s = 0.42;
  const mats = React.useMemo(() => ({w: new THREE.MeshPhysicalMaterial({color: '#4A4F5C', metalness: 0.7, roughness: 0.3}),
    lit: new THREE.MeshStandardMaterial({color: '#4A4F5C', emissive: GOLD, emissiveIntensity: 1.1}),
    v: new THREE.MeshStandardMaterial({color: INK, emissive: INK, emissiveIntensity: 0.6}),
    tok: new THREE.MeshStandardMaterial({color: GOLD, emissive: GOLD, emissiveIntensity: 1.3})}), []);
  const sweep = (f - a) / ((b + 10 - a) / n);                 // the vector moves column by column
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const on = f > a && j <= sweep && j > sweep - 2.5;
    const done = f > b + 10;
    out.push(<mesh key={`${i}${j}`} material={on || (done && (i + j + Math.floor(f / 3)) % 7 === 0) ? mats.lit : mats.w} position={[(j - n / 2 + 0.5) * s, 0, (i - n / 2 + 0.5) * s]}><boxGeometry args={[s * 0.86, 0.1, s * 0.86]} /></mesh>);
  }
  const vx = f < a ? (-n / 2 - 1) * s : Math.min(n / 2 + 1, -n / 2 - 1 + Math.max(0, sweep) + 1) * s;
  for (let i = 0; i < n; i++) out.push(<mesh key={`v${i}`} material={mats.v} position={[vx, 0.2, (i - n / 2 + 0.5) * s]}><boxGeometry args={[0.14, 0.14, 0.14]} /></mesh>);
  const tok = ramp(f, b + 10, 16);
  if (tok > 0) out.push(<mesh key="tok" material={mats.tok} position={[(n / 2 + 1.2) * s, 0.3 + tok * 1.2, 0]} rotation={[tok, tok * 2, 0]}><boxGeometry args={[0.3, 0.3, 0.3]} /></mesh>);
  return <Stage3D f={f} keys={MATH_KEYS} shiftY={-60} overlay={(cam) => <>
    <Label3 cam={cam} at={[0, 0.06, -n / 2 * s + 0.2]} p={ramp(f, 6, 18)} colX={1010} dy={-380} idx="01" name="权重矩阵" spec="80 亿个参数（示意 10 × 10）" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[vx, 0.2, (n / 2 - 0.5) * s]} p={ramp(f, 20, 18)} colX={70} dy={260} idx="02" name="输入" spec="上一个字" accent={GOLD} size={42} />
    {f > b && <div style={{position: 'absolute', left: 64, top: 1040, opacity: ramp(f, b, 10), whiteSpace: 'nowrap', textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 110, color: GOLD}}>≈160 亿次</span>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK}}>每个字 ≈ 2 × 参数量 次运算</div>
    </div>}
  </>}>
    {out}
    <ContactShadow3 r={4} a={0.6} />
  </Stage3D>;
}, (cue) => [{at: 0, kind: 'thud', gain: 0.08}, {at: cue('a', 61), kind: 'whoosh', gain: 0.07}, {at: cue('b', 84) + 10, kind: 'chime', gain: 0.1}]);

/* ---------- 7 move: the turn — the 16 GB of weights travel from memory into the chip, once per token ---------- */

const MOVE_KEYS: CamKey3[] = [
  {f: 0, pos: [0.6, 15, 12.5], target: [0, 0, 0.4], fov: 32},
  {f: 164, pos: [1.2, 14.2, 11.8], target: [0, 0, 0.4], fov: 32},
];
const Move = make(({f, cue}) => {
  const a = cue('a', 63), b = cue('b', 86);
  const m = React.useMemo(() => ({sub: MAT.substrate(), slab: new THREE.MeshPhysicalMaterial({color: GOLD, metalness: 0.9, roughness: 0.3, emissive: GOLD, emissiveIntensity: 0.25})}), []);
  const trip = 38, t = f < a ? 0 : ((f - a) % trip) / trip, z = 3.2 - ease3(t / 0.8) * 6.4;
  const vis = f >= a && t < 0.85 ? 1 : 0;
  const reads = f < a ? 0 : Math.floor((f - a) / trip) + 1;
  return <Stage3D f={f} keys={MOVE_KEYS} ground={['#25272D', '#08090B']} overlay={(cam) => <>
    <Label3 cam={cam} at={[1.1, 0.1, 3.4]} p={ramp(f, 8, 18)} colX={1010} dy={160} idx="01" name="内存" spec="放着整个模型" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[0.6, 0.25, -3.4]} p={ramp(f, 16, 18)} colX={1010} dy={-160} idx="02" name="芯片" spec="算完就要下一份" accent={GOLD} size={42} />
    {f >= a && <div style={{position: 'absolute', left: 300, top: 820, whiteSpace: 'nowrap', opacity: ramp(f, a, 8), textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: GOLD}}>16 GB</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK, marginLeft: 14}}>权重 · 80 亿 × 2 字节</span>
    </div>}
    {f >= b && <div style={{position: 'absolute', left: 300, top: 970, fontFamily: font, fontWeight: 700, fontSize: 46, color: INK, opacity: ramp(f, b, 8)}}>
      每出一个字 · 读一遍 <span style={{fontFamily: jet, color: GOLD, marginLeft: 10}}>×{reads}</span></div>}
  </>}>
    <Slab w={3.2} d={1.2} h={0.12} y={0} z={3.4} mat={m.sub} />
    {[-1.1, -0.37, 0.37, 1.1].map((x) => <Slab key={x} w={0.55} d={0.7} h={0.08} y={0.12} x={x} z={3.4} mat={MAT.silicon()} />)}
    <group position={[0, 0, -3.4]} scale={0.5}><GPUPackage f={f} glow={vis ? 0 : 0.6} /></group>
    {vis > 0 && <mesh material={m.slab} position={[0, 0.25 + Math.sin(t * Math.PI) * 0.4, z]}><boxGeometry args={[1.6, 0.16, 0.9]} /></mesh>}
    <ContactShadow3 r={5} a={0.5} />
  </Stage3D>;
}, (cue) => [{at: cue('a', 63), kind: 'whoosh', gain: 0.08}, {at: cue('a', 63) + 38, kind: 'whoosh', gain: 0.06}, {at: cue('a', 63) + 76, kind: 'whoosh', gain: 0.06}]);

/* ---------- 8 bus (climax): 128 lanes vs 5,120 lanes at the same scale; bandwidth ≈35× ---------- */

/**
 * A ribbon of n copper traces at true density. At this scale the traces are finer than a pixel, so the ribbon is one
 * plane with a striped, mip-mapped texture (n stripes; no moiré), and packets run on a sample of the lanes.
 */
const Lanes: React.FC<{f: number; n: number; x0: number; width: number; color: string; speed: number; packets?: number; on?: number}> = ({f, n, x0, width, color, speed, packets = 64, on = 1}) => {
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
  const m = Math.round(Math.min(packets, n) * on), out: React.ReactNode[] = [];
  for (let i = 0; i < m; i++) {
    const h = Math.sin(i * 12.9898 + n) * 43758.5453, ph = h - Math.floor(h);
    const z = 4 - (((f * speed) / 30 + ph) % 1) * 8;           // memory (near) → chip (far)
    out.push(<mesh key={i} material={pmat} position={[x0 + ((i + 0.5) / Math.max(1, m)) * width, 0.04, z]}><boxGeometry args={[Math.max(0.03, (width / Math.max(1, packets)) * 0.5), 0.04, 0.22]} /></mesh>);
  }
  return <>
    <mesh material={mat} position={[x0 + width / 2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 8]} /></mesh>
    {out}
  </>;
};
const BUS_KEYS: CamKey3[] = [
  {f: 0, pos: [-1.6, 7.4, 9.4], target: [-1.6, 0, 0], fov: 30},
  {f: 45, pos: [1.2, 8.6, 12], target: [0.2, 0, -0.4], fov: 30},
  {f: 149, pos: [2, 8.2, 11.4], target: [0.4, 0, -0.5], fov: 30},
];
const Bus = make(({f, cue}) => {
  const a = cue('a', 48), b = cue('b', 97);
  const busMats = React.useMemo(() => ({die: MAT.silicon(), ddr: MAT.substrate()}), []);
  return <Stage3D f={f} keys={BUS_KEYS} shiftY={-40} overlay={(cam) => <>
    <Tag text="同一比例 · 双通道 DDR5-6000 vs H100" y={250} />
    <Label3 cam={cam} at={[-2.25, 0.05, 2]} p={ramp(f, 4, 18)} colX={70} dy={200} idx="01" name="电脑内存 · 128 根线" spec="≈96 GB/s" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[1.6, 0.05, 0.6]} p={ramp(f, a, 18)} colX={1010} dy={-200} idx="02" name="HBM · 5,120 根线" spec="3,350 GB/s" accent={GOLD} size={42} />
    <Dim3 cam={cam} a={[-1.2, 0.05, -2.2]} b={[2.8, 0.05, -2.2]} p={ramp(f, b, 16)} off={0} text="带宽 ≈35×" accent={GOLD} size={56} />
    {f >= b && <div style={{position: 'absolute', left: 64, top: 320, opacity: ramp(f, b + 6, 10), transformOrigin: '0 50%', transform: `scale(${1 + 0.15 * Math.max(0, 1 - (f - b - 6) / 8)})`,
      whiteSpace: 'nowrap', textShadow: '0 4px 24px rgba(0,0,0,0.8)'}}><span style={{fontFamily: cond, fontWeight: 800, fontSize: 170, color: GOLD}}>≈35×</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 48, color: INK, marginLeft: 14}}>带宽</span></div>}
  </>}>
    <Lanes f={f} n={128} x0={-2.3} width={0.1} color={INK} speed={0.45} packets={4} />
    <Lanes f={f} n={5120} x0={-1.2} width={4} color={GOLD} speed={0.45} packets={96} on={ramp(f, a - 6, 14)} />
    <Slab w={0.7} d={0.7} h={0.12} x={-2.25} z={-4.4} y={0} mat={busMats.die} />
    <Slab w={0.5} d={0.9} h={0.08} x={-2.25} z={4.5} y={0} mat={busMats.ddr} />
    <Slab w={4.4} d={1.2} h={0.12} x={0.8} z={-4.6} y={0} mat={busMats.die} />
    {[0, 1, 2, 3, 4].map((k) => <HBMStack key={k} x={-0.8 + k * 0.8} z={4.6} y={0} w={0.7} d={0.7} />)}
    <ContactShadow3 r={6} a={0.5} />
  </Stage3D>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.07}, {at: cue('a', 48), kind: 'whoosh', gain: 0.09}, {at: cue('b', 97), kind: 'fs-impact-deep', gain: 0.15}]);

/* ---------- 9 hbm: a 16-high stack lifts layer by layer; same capacity ≈3× the wafer ---------- */

const HBM_KEYS: CamKey3[] = [
  {f: 0, pos: [5.2, 5.4, 8], target: [0.4, 0.5, 0.3], fov: 30},
  {f: 181, pos: [4.4, 5.8, 8.4], target: [0.6, 0.5, 0.4], fov: 30},
];
const Hbm = make(({f, cue}) => {
  const a = cue('a', 70), b = cue('b', 108);
  const m = React.useMemo(() => ({base: MAT.interposer(), dram: MAT.silicon(), gold: MAT.gold(), tile: new THREE.MeshPhysicalMaterial({color: '#2B3040', metalness: 0.4, roughness: 0.4}),
    tileGold: new THREE.MeshStandardMaterial({color: '#3A3220', emissive: GOLD, emissiveIntensity: 0.7})}), []);
  const n = 16, t = 0.03, w = 1.4, d = 1.2;
  const tile = 0.6;
  return <Stage3D f={f} keys={HBM_KEYS} shiftY={-80} overlay={(cam) => <>
    <Tag text="示意 · 参照 SK 海力士 HBM4 16 层" y={250} />
    <Label3 cam={cam} at={[-w / 2, 0.8, 0]} p={ramp(f, 30, 18)} colX={70} dy={-180} idx="01" name="16 层 DRAM 叠起来" spec="竖着打孔（TSV）连通" accent={GOLD} size={42} />
    <Label3 cam={cam} at={[2.4, 0.06, 0.2]} p={ramp(f, a, 18)} colX={1010} dy={-300} idx="02" name="普通内存" spec="同样容量 · 1 份晶圆" accent={GOLD} size={42} />
    {f >= b && <div style={{position: 'absolute', left: 64, top: 1060, whiteSpace: 'nowrap', opacity: ramp(f, b, 10), textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: GOLD}}>≈3×</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK, marginLeft: 14}}>晶圆 · 同样容量（美光）</span>
    </div>}
  </>}>
    <group position={[-0.4, 0, 0]}>
      <Slab w={w} d={d} h={0.05} y={0} mat={m.base} />
      {Array.from({length: n}, (_, i) => {
        const lift = ease3((f - 4 - i * 2.2) / 16) * 0.055 * (i + 1);
        return <group key={i} position={[0, 0.05 + i * (t + 0.004) + lift, 0]}>
          <Slab w={w * 0.98} d={d * 0.98} h={t} y={0} mat={m.dram} />
          <Slab w={w * 0.985} d={0.02} h={t * 0.5} y={t * 0.25} z={d * 0.49} mat={m.gold} />
        </group>;
      })}
      {/* TSV columns: thin gold rods through the stack */}
      {[-0.35, 0, 0.35].map((x) => <mesh key={x} material={m.gold} position={[x, 0.05 + (n * (t + 0.004) + 0.055 * n * ramp(f, 4, 50)) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, n * (t + 0.004) + 0.055 * n * ramp(f, 4, 50), 6]} /></mesh>)}
    </group>
    {/* wafer area at the same capacity: 1 tile for DDR, 3 tiles for HBM */}
    {f >= a - 4 && <mesh material={m.tile} position={[2.4, 0.03 + (1 - ramp(f, a - 4, 12)) * 0.6, 0.2]}><boxGeometry args={[tile, 0.05, tile]} /></mesh>}
    {[0, 1, 2].map((k) => f >= b + k * 4 && <mesh key={k} material={m.tileGold} position={[0.9 + k * (tile + 0.08), 0.03 + (1 - ramp(f, b + k * 4, 10)) * 0.6, 1.4]}><boxGeometry args={[tile, 0.05, tile]} /></mesh>)}
    <ContactShadow3 r={4} a={0.6} />
  </Stage3D>;
}, (cue) => [...Array.from({length: 8}, (_, i) => ({at: 4 + i * 4, kind: 'tick', gain: 0.05})), {at: cue('a', 70), kind: 'tap', gain: 0.08},
  ...[0, 1, 2].map((k) => ({at: cue('b', 108) + k * 4, kind: 'tick', gain: 0.08}))]);

/* ---------- 10 price: GDDR chips taken off a graphics card; the spot price triples ---------- */

const PRICE_KEYS: CamKey3[] = [
  {f: 0, pos: [-3, 8, 9.5], target: [0, 0, 0], fov: 30},
  {f: 140, pos: [-2, 7, 8.4], target: [0, 0.2, 0.2], fov: 30},
];
const Price = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 70);
  const m = React.useMemo(() => ({pcb: MAT.substrate(), gddr: new THREE.MeshPhysicalMaterial({color: '#202228', metalness: 0.3, roughness: 0.4, clearcoat: 0.5})}), []);
  const spots: [number, number][] = [[-1.7, -0.9], [-1.7, 0], [-1.7, 0.9], [1.7, -0.9], [1.7, 0], [1.7, 0.9], [-0.6, -1.5], [0.6, -1.5]];
  const tag = ramp(f, b, 10), flip = clamp((f - b - 10) / 6);
  return <Stage3D f={f} keys={PRICE_KEYS} shiftY={-80} overlay={() => <>
    <Tag text="显卡上的显存颗粒（示意）" y={250} />
    {tag > 0 && <div style={{position: 'absolute', left: 64, top: 1020, whiteSpace: 'nowrap', opacity: tag, textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK}}>GDDR6 现货价 · 据 TrendForce</div>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: INK, opacity: 1 - 0.5 * flip}}>$2.5</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 80, color: INK, margin: '0 18px'}}>→</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: GOLD, display: 'inline-block', transform: `scaleY(${flip})`}}>$7.5</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: INK, marginLeft: 10}}>/GB</span>
    </div>}
  </>}>
    <Slab w={4.6} d={3.6} h={0.1} y={0} mat={m.pcb} />
    <Die w={1.6} d={1.6} y={0.1} blocks={SM_BLOCKS} />
    {spots.map(([x, z], i) => {
      const gone = ease3((f - 4 - i * ((a - 4) / spots.length)) / 14);
      return <mesh key={i} material={m.gddr} position={[x + (x < 0 ? -1 : 1) * gone * 1.2, 0.14 + gone * 1.8, z]} rotation={[0, gone * 0.6, gone * 0.3]}><boxGeometry args={[0.7, 0.08, 0.55]} /></mesh>;
    })}
    <ContactShadow3 r={4.5} a={0.6} />
  </Stage3D>;
}, (cue) => [...Array.from({length: 8}, (_, i) => ({at: 4 + i * 4, kind: 'whoosh-short', gain: 0.04})), {at: cue('b', 70), kind: 'tap', gain: 0.08}, {at: cue('b', 70) + 10, kind: 'thud', gain: 0.12}]);

/* ---------- 11 end: the four chips side by side (screenshot sheet), then back to frame 0 ---------- */

const END_KEYS: CamKey3[] = [
  {f: 0, pos: [0, 10.5, 8.6], target: [0, 0, -1.4], fov: 30},
  {f: 98, pos: [0, 12, 10], target: [0, 0, -1.4], fov: 30},
];
const End = make(({f}) => {
  const items: [string, string, number, number][] = [['CPU', '几个大核', -1.3, -3.6], ['GPU', '16,896 个小核', 1.3, -3.6], ['NPU', '≥ 40 TOPS · 省电', -1.3, 0.2], ['TPU', '128 × 128 方阵', 1.3, 0.2]];
  const m = React.useMemo(() => ({sub: MAT.substrate(), npu: new THREE.MeshStandardMaterial({color: '#2B3040', emissive: GOLD, emissiveIntensity: 0.5})}), []);
  return <Stage3D f={f} keys={END_KEYS} shiftY={-200} overlay={(cam) => <>
    {items.map(([n, spec, x, z], i) => <Label3 key={n} cam={cam} at={[x, 0.3, z]} p={ramp(f, 2 + i * 3, 12)} colX={i % 2 ? 1010 : 70} dy={i < 2 ? 170 : -120} idx={`0${i + 1}`} name={n} spec={spec} accent={GOLD} size={42} />)}
    <div style={{position: 'absolute', left: 300, top: 1180, fontFamily: font, fontWeight: 700, fontSize: 44, color: INK, opacity: ramp(f, 30, 12), whiteSpace: 'nowrap'}}>
      数据通道：<span style={{color: INK}}>128 根</span> <span style={{opacity: 0.6}}>vs</span> <span style={{color: GOLD}}>5,120 根</span></div>
  </>}>
    <group position={[-1.3, 0, -3.6]} scale={0.6}><CPUPackage /></group>
    <group position={[1.3, 0, -3.6]} scale={0.35}><GPUPackage f={f} /><Tokens f={f} rate={200} x={0} y0={0.5} spread={2.6} color={GOLD} size={0.2} /></group>
    <group position={[-1.3, 0, 0.2]} scale={0.7}><Slab w={2} d={2} h={0.12} y={0} mat={m.sub} /><Die w={1.4} d={1.4} y={0.12} blocks={SOC_BLOCKS} />
      <mesh material={m.npu} position={[-0.35, 0.24, 0.35]}><boxGeometry args={[0.56, 0.06, 0.58]} /></mesh></group>
    <group position={[1.3, 0, 0.2]}>{Array.from({length: 36}, (_, k) => <mesh key={k} material={m.npu} position={[((k % 6) - 2.5) * 0.24, 0.05, (Math.floor(k / 6) - 2.5) * 0.24]}><boxGeometry args={[0.2, 0.08, 0.2]} /></mesh>)}</group>
    <ContactShadow3 r={7} a={0.6} />
  </Stage3D>;
}, () => [{at: 0, kind: 'whoosh', gain: 0.07}, {at: 30, kind: 'chime', gain: 0.08}]);

/** Cover anchor (880 × 800): the two chips and their tokens (the hook frame, framed tighter). */
const COVER_KEYS: CamKey3[] = [{f: 0, pos: [0, 15, 13], target: [0, 0, 0.4], fov: 30}];
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden'}}>
  <div style={{position: 'absolute', left: -100, top: -560, width: 1080, height: 1920}}>
    <Stage3D f={60} keys={COVER_KEYS}><HookArt f={60} /></Stage3D>
  </div>
</div>;

export const chipsScenes: Record<string, Scene> = {
  'chip.hook': Hook, 'chip.cpu': Cpu, 'chip.gpu': Gpu, 'chip.npu': Npu, 'chip.tpu': Tpu, 'chip.math': MathScene, 'chip.move': Move,
  'chip.bus': Bus, 'chip.hbm': Hbm, 'chip.price': Price, 'chip.end': End, 'chip.cover': Cover,
};
