import React, {useLayoutEffect, useRef} from 'react';
import {font} from '../theme';
import {inter, jet} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';
import {Iso, Tri, back, clamp, cutLine, eio, eo, hatch, haloText, lerp, ring, seg} from '../iso-engine';

// net-six-protocols, made on the template lemo/iso-infographic (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-
// opuscar/3961ddb/styles/iso-infographic/STYLE.md; its MIT engine is ported verbatim in src/tutorial/iso-engine.js).
// The story: one sentence, 「开灯」, travels from a phone to a lamp across a floating isometric island, and each of the six
// protocols is one station on that road — DNS asks the way (over UDP: thrown, unconfirmed, re-asked when lost), IP labels
// every packet and routers pass it hop by hop (TTL 64 → 63 → 62), IP drops packets without knowing, so TCP shakes hands
// three times, numbers the packets and resends the lost one, HTTP carries the actual request (POST, 200 OK), MQTT pushes
// it from the broker down the lamp's always-open subscription, the lamp lights; then the packet is cut open: HTTP inside
// TCP inside IP. Facts: inputs/net-six-protocols/idea.md (RFC 768 / 791 / 1035 / 9110 / 9293, OASIS MQTT 5.0, Linux
// ip-sysctl). Storyboard: tutorials/net-six-protocols.storyboard.md.
// - What the template gives: true isometric (30° axes, no perspective, no outlines on solids, three tones per face), a
//   diorama floating on a pale ground with a dot lattice and a visible section at its edge, infographic furniture in the
//   world (label pins grown dot → leader → rule → text, dashed routes, cut lines, hatched section faces, tracking rings),
//   lines lead and things follow, solids arrive by motion never by alpha, squash on landing, focus + context (everything
//   greys except the subject), a log-interpolated zoom, the subtitle as a map label with a cube legend chip.
// - Customised (模板改造): every protocol keeps the colour Wireshark's default colouring rules give it (TCP #E7E6FF, UDP
//   #DAEEFF, HTTP #E4FFC7, Routing #FFF3D6 for IP and routers, SYN/FIN #A0A0A0 for the handshake, RST #A40000 only for a
//   lost packet, text #12272E, ground #ECF0EB) — the pale value is the top face, the same hue deepened gives the sides;
//   DNS and MQTT have no default rule, so DNS takes the file's unused ICMP swatch #FCE0FF and MQTT the plum of mqtt.org;
//   the tracked subject is the sentence itself (a yellow #FFFC9C bubble that ends as the lamp's light); the caption's
//   legend chip takes the colour of the protocol on stage; type is Inter Display + 思源黑体 + JetBrains Mono.

/* ---------- palette ---------- */
const K = {ground: '#ECF0EB', ink: '#12272E', dim: '#6B7A7E', paper: '#FAFBF8', red: '#A40000', yellow: '#FFFC9C', syn: '#A0A0A0'};
export const PROTO: Record<'IP' | 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'MQTT', Tri> = {
  IP: ['#FFF3D6', '#EBCF95', '#C9A762'],
  TCP: ['#E7E6FF', '#A9A5F0', '#7C77D8'],
  UDP: ['#DAEEFF', '#8FC4F0', '#5E9BD0'],
  DNS: ['#FCE0FF', '#EAA6F0', '#C477CF'],
  HTTP: ['#E4FFC7', '#A9DC78', '#79B04A'],
  MQTT: ['#E6C3E2', '#A0559A', '#6E2C69'],
};
export const CHIP = {hook: '#FFFC9C', dns: PROTO.DNS[1], udp: PROTO.UDP[1], ip: PROTO.IP[1], tcp: PROTO.TCP[1], http: PROTO.HTTP[1], mqtt: PROTO.MQTT[1], stack: PROTO.IP[1], end: '#FFFC9C'};
const BOARD: Tri = ['#F7F9F5', '#D3DCD5', '#AEBBB3'];
const STRATA: Tri = ['#DCE3DD', '#B9C5BD', '#8E9D95'];
const GRAPH: Tri = ['#5A6B71', '#33444A', '#1E2C31'];
const SHADE: Tri = ['#F4F1E8', '#D9D3C4', '#ADA593'];
const BULB_OFF: Tri = ['#E9E7DF', '#C9C6BB', '#9F9C92'];
const BULB_ON: Tri = ['#FFFEE0', '#FFFC9C', '#F2DE5A'];
const CN = font;

/* ---------- world layout: (u, v) → (x, y); u runs up the screen (far = negative), v across ---------- */
const Wd = (u: number, v: number): [number, number] => [(u + v) / 2, (u - v) / 2];
const ST = {phone: Wd(16, -6), dns: Wd(12, 8), r1: Wd(7, 4), r2: Wd(2, -5), r3: Wd(-3, 5), cloud: Wd(-8, -6), broker: Wd(-14, 6), lamp: Wd(-21, -6)};
/** The island's footprint, an elongated hexagon: its pointed ends are world-axis edges, so they show the iso faces. */
const FOOT = ([[-32, 0], [-20, 12], [12, 12], [24, 0], [12, -12], [-20, -12]] as [number, number][]).map(([u, v]) => Wd(u, v));
type St = keyof typeof ST;
const ROUTE: [number, number][] = [ST.phone, ST.r1, ST.r2, ST.r3, ST.cloud, ST.broker, ST.lamp];
const ROUTE_CLOUD = ROUTE.slice(0, 5);

/** Point at fraction t along a polyline. */
const along = (pts: [number, number][], t: number): [number, number] => {
  const L: number[] = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let r = clamp(t) * tot;
  for (let i = 1; i < pts.length; i++) {
    if (r <= L[i - 1] || i === pts.length - 1) { const f = clamp(r / L[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; }
    r -= L[i - 1];
  }
  return pts[pts.length - 1];
};
/** The first fraction t of a polyline. */
const partial = (pts: [number, number][], t: number): [number, number][] => {
  if (t >= 1) return pts;
  const out: [number, number][] = [pts[0]];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let r = clamp(t) * tot;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (r <= l) { const f = r / l; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); return out; }
    out.push(pts[i]); r -= l;
  }
  return out;
};

/* ---------- camera: keys {at, u, v, z, k}; eased between keys, zoom interpolated in log space ---------- */
type CK = {at: number; u: number; v: number; z?: number; k: number; d?: number};
const camAt = (keys: CK[], f: number) => {
  let a = keys[0], b = keys[0], t = 0;
  for (let i = 0; i < keys.length; i++) {
    if (f >= keys[i].at) { a = keys[i]; b = keys[i + 1] ?? keys[i]; }
  }
  if (b !== a) t = eio(clamp((f - a.at) / (b.d ?? (b.at - a.at))));
  if (b !== a && f < b.at - (b.d ?? (b.at - a.at))) t = 0;
  const u = lerp(a.u, b.u, t), v = lerp(a.v, b.v, t), z = lerp(a.z ?? 0, b.z ?? 0, t);
  const k = Math.exp(lerp(Math.log(a.k), Math.log(b.k), t));
  const [x, y] = Wd(u, v);
  return {x, y, z, k};
};

/* ---------- canvas ---------- */
const IsoCanvas: React.FC<{draw: (g: CanvasRenderingContext2D, iso: Iso) => void}> = ({draw}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = K.ground;
    g.fillRect(0, 0, W, 1920);
    draw(g, new Iso(g, W, 1920));
  });
  return <canvas ref={ref} width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920}} />;
};

/* ---------- infographic parts (screen space, our fonts, ≥ 34 px) ---------- */
const HALO = 'rgba(236,240,235,0.94)';
const HALO_CSS = '0 0 6px #ECF0EB, 0 0 6px #ECF0EB, 0 0 10px #ECF0EB';
const txt = (g: CanvasRenderingContext2D, s: string, x: number, y: number, o: {size?: number; weight?: number; fam?: string; color?: string; align?: CanvasTextAlign; halo?: boolean; track?: number} = {}) =>
  haloText(g, s, x, y, {font: `${o.weight ?? 800} ${o.size ?? 36}px ${o.fam ?? CN}`, color: o.color ?? K.ink, align: o.align ?? 'left', haloColor: HALO, hw: 10, halo: o.halo, track: o.track});

/** Label pin: dot → vertical leader → horizontal rule → title (+ value), revealed by a ∈ [0, 1]. */
const npin = (iso: Iso, x: number, y: number, z: number, o: {title: string; value?: string; dir?: number; up?: number; len?: number; a?: number; ts?: number; vs?: number; vfam?: string; vcolor?: string; dot?: string}) => {
  const g = iso.g, a = o.a ?? 1;
  if (a <= 0) return;
  const [ax, ay] = iso.P(x, y, z), up = o.up ?? 120, dir = o.dir ?? 1, len = o.len ?? 46;
  const s1 = eo(seg(a, 0, 0.18)), s2 = eo(seg(a, 0.12, 0.42)), s3 = eo(seg(a, 0.36, 0.55)), s4 = seg(a, 0.45, 1);
  g.save();
  g.strokeStyle = K.ink; g.lineWidth = 3; g.lineCap = 'round';
  if (s2 > 0) { g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, ay - up * s2); if (s3 > 0) g.lineTo(ax + dir * len * s3, ay - up); g.stroke(); }
  const R = 9 * back(s1, 2.2);
  g.beginPath(); g.arc(ax, ay, Math.max(0, R), 0, Math.PI * 2); g.fillStyle = K.paper; g.fill(); g.stroke();
  g.beginPath(); g.arc(ax, ay, Math.max(0, R * 0.45), 0, Math.PI * 2); g.fillStyle = o.dot ?? K.ink; g.fill();
  if (s4 > 0) {
    const tx = ax + dir * (len + 14), ty = ay - up;
    g.save(); g.beginPath();
    const wv = 900 * eo(s4);
    if (dir > 0) g.rect(tx - 6, ty - 90, wv, 220); else g.rect(tx + 6 - wv, ty - 90, wv, 220);
    g.clip();
    const al = dir > 0 ? 'left' : 'right';
    txt(g, o.title, tx, ty - 12, {size: o.ts ?? 36, align: al});
    if (o.value) txt(g, o.value, tx, ty + (o.vs ?? 50) + 4, {size: o.vs ?? 50, weight: o.vfam ? 500 : 600, fam: o.vfam ?? inter, color: o.vcolor ?? K.ink, align: al});
    g.restore();
  }
  g.restore();
};

/** A speech bubble with 「开灯」 (the tracked subject), anchored at a world point; s = pop (0..1+). */
const bubble = (iso: Iso, x: number, y: number, z: number, s: number, label = '开灯', scale = 1) => {
  if (s <= 0) return;
  const g = iso.g, [sx, sy] = iso.P(x, y, z), sc = scale * s;
  g.save(); g.translate(sx, sy); g.scale(sc, sc * (1 + 0.18 * (1 - Math.min(1, s)))); // squash on arrival
  const w = 190, h = 104;
  g.beginPath();
  g.roundRect(-w / 2, -h - 26, w, h, 26);
  g.moveTo(-16, -27); g.lineTo(0, 0); g.lineTo(18, -27);
  g.fillStyle = K.yellow; g.fill();
  g.lineWidth = 4; g.strokeStyle = K.ink; g.stroke();
  g.fillStyle = K.ink; g.font = `900 60px ${CN}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, 0, -h / 2 - 24);
  g.restore();
};

/* ---------- stations ---------- */
type WorldOpt = {keep?: St[] | 'all'; desat?: number; lamp?: number; drawer?: number; leds?: number; t?: number; route?: number; link?: number; hideRouteFrom?: number};
const keepOn = (iso: Iso, o: WorldOpt, s: St) => { iso.keep = o.keep === 'all' || (o.keep ?? []).includes(s); };

const phone = (iso: Iso, [x, y]: [number, number], glow = 0) => {
  iso.box(x - 0.25, y - 1.05, 0, 0.5, 2.1, 3.6, GRAPH, {decal: (I: Iso) => {
    const X = x + 0.25 + 0.001;
    I.poly([[X, y - 0.85, 0.45], [X, y + 0.85, 0.45], [X, y + 0.85, 3.25], [X, y - 0.85, 3.25]].map((p) => I.P(p[0], p[1], p[2])), glow > 0 ? '#E9F6FF' : '#BFD7E2');
    I.poly([[X, y - 0.25, 0.18], [X, y + 0.25, 0.18], [X, y + 0.25, 0.3], [X, y - 0.25, 0.3]].map((p) => I.P(p[0], p[1], p[2])), '#9FB3BB');
  }});
};
const lamp = (iso: Iso, [x, y]: [number, number], on: number) => {
  iso.push(x, y, 0, 0, 1.3); x = 0; y = 0;
  if (on > 0) { // the pool of light on the island (a ground decal), grows with the switch
    const pts: number[][] = [];
    const r = 4.6 * eo(on);
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    iso.flat(pts, 0.01, '#FFF9B0', {a: 0.85});
  }
  iso.cyl(x, y, 0, 1.0, 0.32, GRAPH, {n: 28});
  iso.box(x - 0.13, y - 0.13, 0.32, 0.26, 0.26, 3.0, GRAPH);
  iso.sphere(x, y, 3.05, 0.55, on > 0.5 ? BULB_ON : BULB_OFF, {bias: 0.3});
  iso.cone(x, y, 3.2, 1.55, 1.35, on > 0.5 ? ['#FFFDE6', '#F6EFC0', '#D9CF95'] : SHADE, {n: 28, bias: 0.6});
  iso.pop();
};
const router = (iso: Iso, [x, y]: [number, number], led = 0) => {
  iso.box(x - 0.6, y - 0.95, 0.75, 0.14, 0.14, 1.3, GRAPH);
  iso.box(x - 0.95, y - 0.6, 0.75, 0.14, 0.14, 1.3, GRAPH);
  iso.box(x - 1, y - 1, 0, 2, 2, 0.8, PROTO.IP, {decal: (I: Iso) => {
    for (let i = 0; i < 3; i++) {
      const yy = y - 0.6 + i * 0.45, on = led > 0 && Math.floor(led * 6 + i) % 2 === 0;
      I.poly([[x + 1.001, yy, 0.35], [x + 1.001, yy + 0.22, 0.35], [x + 1.001, yy + 0.22, 0.5], [x + 1.001, yy, 0.5]].map((p) => I.P(p[0], p[1], p[2])), on ? '#79B04A' : '#8E7A52');
    }
  }});
};
const dnsBox = (iso: Iso, [x, y]: [number, number], drawer = 0) => {
  iso.box(x - 1.1, y - 1.1, 0, 2.2, 2.2, 3.2, PROTO.DNS, {decal: (I: Iso) => {
    for (let i = 0; i < 3; i++) {
      const z = 0.5 + i * 0.95;
      I.line3([[x + 1.1, y - 0.85, z + 0.62], [x + 1.1, y + 0.85, z + 0.62]], '#8E4B97', 3, {now: true});
      I.poly([[x + 1.101, y - 0.25, z + 0.28], [x + 1.101, y + 0.25, z + 0.28], [x + 1.101, y + 0.25, z + 0.38], [x + 1.101, y - 0.25, z + 0.38]].map((p) => I.P(p[0], p[1], p[2])), '#8E4B97');
    }
  }});
  if (drawer > 0.02) iso.box(x - 0.3 + drawer * 1.5, y - 0.85, 2.38, 1.4, 1.7, 0.6, PROTO.DNS, {bias: 2});
};
const cloudBox = (iso: Iso, [x, y]: [number, number], led = 0) => {
  iso.box(x - 1.2, y - 1.2, 0, 2.4, 2.4, 3.4, GRAPH, {decal: (I: Iso) => {
    for (let i = 0; i < 4; i++) {
      const z = 0.55 + i * 0.7;
      I.poly([[x - 0.95, y + 1.201, z], [x + 0.95, y + 1.201, z], [x + 0.95, y + 1.201, z + 0.32], [x - 0.95, y + 1.201, z + 0.32]].map((p) => I.P(p[0], p[1], p[2])), '#26363C');
      const on = Math.floor(led * 5 + i * 1.7) % 3 !== 0;
      I.poly([[x + 0.55, y + 1.202, z + 0.08], [x + 0.75, y + 1.202, z + 0.08], [x + 0.75, y + 1.202, z + 0.24], [x + 0.55, y + 1.202, z + 0.24]].map((p) => I.P(p[0], p[1], p[2])), on ? PROTO.HTTP[1] : '#3D5056');
    }
  }});
};
const broker = (iso: Iso, [x, y]: [number, number]) => {
  iso.cyl(x, y, 0, 1.25, 2.3, PROTO.MQTT, {n: 30});
  iso.cyl(x, y, 2.3, 0.7, 0.6, PROTO.MQTT, {n: 24});
  iso.cyl(x, y, 2.9, 0.12, 1.2, GRAPH, {n: 10});
};

/** The island: shadow, dot lattice, the board with its section, the route, the stations. */
const world = (g: CanvasRenderingContext2D, iso: Iso, o: WorldOpt = {}) => {
  // dot lattice on the ground plane under the island
  g.save(); g.fillStyle = 'rgba(18,39,46,0.13)';
  for (let a = -40; a <= 40; a += 2) for (let b = -40; b <= 40; b += 2) {
    const [sx, sy] = iso.P(a, b, -5);
    if (sx > -10 && sx < W + 10 && sy > -10 && sy < 1930) { g.beginPath(); g.arc(sx, sy, Math.max(1.4, iso.cam.k * 0.06), 0, Math.PI * 2); g.fill(); }
  }
  g.restore();
  const foot = FOOT;
  g.save(); g.filter = `blur(${Math.round(iso.cam.k * 0.9)}px)`; g.fillStyle = 'rgba(18,39,46,0.16)';
  g.beginPath(); foot.forEach((p, i) => { const [sx, sy] = iso.P(p[0] + 1.2, p[1] + 1.2, -5); if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.closePath(); g.fill(); g.restore();
  iso.desat = o.desat ?? 0;
  iso.keep = true; // the island itself is neutral: never greyed further
  iso.prism(foot, -1.7, 1.1, STRATA, {cull: false});
  iso.prism(foot, -0.6, 0.6, BOARD, {cull: false});
  iso.flush();
  // cable strata on the two near section faces (the hexagon's pointed bottom end), ink dashes
  const sec = (a: [number, number], b: [number, number], z: number) => iso.line3([[a[0], a[1], z], [b[0], b[1], z]], '#7F8E88', Math.max(2, iso.cam.k * 0.07), {now: true, dash: [iso.cam.k * 0.5, iso.cam.k * 0.35]});
  for (const z of [-0.95, -1.35]) { sec(foot[1], foot[2], z); sec(foot[2], foot[3], z); sec(foot[3], foot[4], z); }
  // station plates: pale, dashed ink outline (template §3: stations that must be found in a wide shot)
  iso.keep = false;
  const plate = (c: [number, number], r: number, col: string) => {
    iso.flat([[c[0] - r, c[1] - r], [c[0] + r, c[1] - r], [c[0] + r, c[1] + r], [c[0] - r, c[1] + r]], 0.005, col, {a: 0.55});
    iso.line3([[c[0] - r, c[1] - r, 0.01], [c[0] + r, c[1] - r, 0.01], [c[0] + r, c[1] + r, 0.01], [c[0] - r, c[1] + r, 0.01], [c[0] - r, c[1] - r, 0.01]], '#12272E', 2, {now: true, dash: [6, 6], a: 0.35});
  };
  const plates: [St, number, string][] = [['phone', 1.9, '#FFFC9C'], ['dns', 2.0, PROTO.DNS[0]], ['r1', 1.7, PROTO.IP[0]], ['r2', 1.7, PROTO.IP[0]], ['r3', 1.7, PROTO.IP[0]], ['cloud', 2.1, PROTO.HTTP[0]], ['broker', 2.0, PROTO.MQTT[0]], ['lamp', 1.9, '#FFFC9C']];
  for (const [n, r, c] of plates) { keepOn(iso, o, n); plate(ST[n], r, c); }
  iso.flush();
  // the route: dashed ink on the board, drawn ahead of whatever travels it
  iso.keep = false;
  const rt = partial(ROUTE, o.route ?? 1);
  if (rt.length > 1) iso.line3(rt.map((p) => [p[0], p[1], 0.02]), K.ink, Math.max(3, iso.cam.k * 0.09), {now: true, dash: [iso.cam.k * 0.38, iso.cam.k * 0.3], a: 0.55});
  if ((o.route ?? 1) >= 0.05) iso.line3([[...ST.phone, 0.02], [...ST.dns, 0.02]], K.ink, Math.max(3, iso.cam.k * 0.09), {now: true, dash: [iso.cam.k * 0.38, iso.cam.k * 0.3], a: 0.4});
  keepOn(iso, o, 'phone'); phone(iso, ST.phone, 1);
  keepOn(iso, o, 'dns'); dnsBox(iso, ST.dns, o.drawer ?? 0);
  keepOn(iso, o, 'r1'); router(iso, ST.r1, o.leds ?? 0);
  keepOn(iso, o, 'r2'); router(iso, ST.r2, (o.leds ?? 0) + 0.3);
  keepOn(iso, o, 'r3'); router(iso, ST.r3, (o.leds ?? 0) + 0.6);
  keepOn(iso, o, 'cloud'); cloudBox(iso, ST.cloud, o.leds ?? 0);
  keepOn(iso, o, 'broker'); broker(iso, ST.broker);
  keepOn(iso, o, 'lamp'); lamp(iso, ST.lamp, o.lamp ?? 0);
  iso.keep = false;
};

/** A packet: a small box in its protocol's tones, optional number on its top. */
const packet = (iso: Iso, x: number, y: number, z: number, t3: Tri, s = 0.9, keep = true, label?: string) => {
  const k0 = iso.keep; iso.keep = keep;
  iso.box(x - s / 2, y - s / 2, z, s, s, s, t3, {bias: 1.5, decal: label ? (I: Iso) => {
    const [sx, sy] = I.P(x, y, z + s);
    I.g.save(); I.g.fillStyle = K.ink; I.g.font = `600 ${Math.round(I.cam.k * s * 0.62)}px ${inter}`; I.g.textAlign = 'center'; I.g.textBaseline = 'middle';
    I.g.setTransform(0.866, -0.5, 0.866, 0.5, sx, sy); I.g.fillText(label, 0, 0); I.g.restore();
  } : undefined});
  iso.keep = k0;
};

/* ---------- HTML overlays ---------- */
const Corner: React.FC<{left: string; right?: string}> = ({left, right = '示意'}) => <>
  <div style={{position: 'absolute', left: 64, top: 96, fontFamily: jet, fontWeight: 500, fontSize: 28, color: K.dim, letterSpacing: 1, textShadow: HALO_CSS}}>{left}</div>
  <div style={{position: 'absolute', right: 160, top: 96, fontFamily: CN, fontWeight: 700, fontSize: 28, color: K.dim, textShadow: HALO_CSS}}>{right}</div>
</>;
const Chip: React.FC<{c: Tri; size?: number}> = ({c, size = 44}) => <svg width={size} height={size * 1.1} viewBox="-23 -25 46 50">
  <polygon points="0,-21 20,-10 0,1 -20,-10" fill={c[0]} />
  <polygon points="-20,-10 0,1 0,23 -20,12" fill={c[1]} />
  <polygon points="20,-10 0,1 0,23 20,12" fill={c[2]} />
</svg>;
const ORDER: (keyof typeof PROTO)[] = ['IP', 'TCP', 'UDP', 'DNS', 'HTTP', 'MQTT'];
/** The legend: six cubes in one row, each hops (back-ease) at `hop + i * 3` frames. */
const Legend: React.FC<{f: number; hop: number; top: number}> = ({f, hop, top}) => <div style={{position: 'absolute', left: 56, top, width: 900, display: 'flex', justifyContent: 'space-between'}}>
  {ORDER.map((p, i) => {
    const h = f >= hop + i * 3 ? Math.sin(clamp((f - hop - i * 3) / 9) * Math.PI) : 0;
    return <div key={p} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `translateY(${-h * 22}px)`}}>
      <Chip c={PROTO[p]} size={50} />
      <span style={{fontFamily: jet, fontWeight: 500, fontSize: 40, color: K.ink}}>{p}</span>
    </div>;
  })}
</div>;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* ---------- 1 hook: the whole island, a giant 6, the legend; the bubble pops, the route draws to the dark lamp ---------- */
const HOOK_CAM: CK[] = [{at: 0, u: -4, v: 0, z: 2.6, k: 30}, {at: 150, u: -4, v: 0, z: 2.6, k: 31.5, d: 150}];
const hookPlan = (cue: Cue) => ({a: cue('a', 36), b: cue('b', 62)});
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(HOOK_CAM, f);
      world(g, iso, {route: 0.25 + 0.75 * eio(clamp((f - 4) / (p.b + 20 - 4))), leds: f / 30});
      iso.flush();
      bubble(iso, ST.phone[0], ST.phone[1], 3.9, 1 + 0.12 * Math.sin(clamp((f - 8) / 10) * Math.PI)); // on screen at frame 0; one squash pulse on 「开灯」
    }} />
    <div style={{position: 'absolute', left: 52, top: 140, display: 'flex', alignItems: 'baseline', gap: 18}}>
      <span style={{fontFamily: inter, fontWeight: 600, fontSize: 220, lineHeight: 0.9, color: K.ink, letterSpacing: -6}}>6</span>
      <span style={{fontFamily: CN, fontWeight: 900, fontSize: 96, color: K.ink}}>种协议</span>
    </div>
    <Legend f={f} hop={p.b} top={352} />
    <Corner left="ONE SENTENCE · 6 PROTOCOLS" />
  </>;
}, (cue) => {
  const p = hookPlan(cue);
  return [{at: 2, kind: 'pop', gain: 0.12}, ...[0, 1, 2, 3, 4, 5].map((i) => ({at: p.b + i * 3, kind: 'tick', gain: 0.07}))];
});

/* ---------- 5 tcp: a packet falls off (IP doesn't know), handshake, numbered packets, #3 lost and resent ---------- */
const tcpCam = (p: {c: number}): CK[] => [{at: 0, u: 3, v: 1, z: -1, k: 36}, {at: 40, u: 3, v: 1.5, z: -1, k: 38, d: 30}, {at: p.c - 4, u: -3.5, v: -1, z: 0.5, k: 60, d: 18}];
const tcpPlan = (cue: Cue) => ({a: cue('a', 40), b: cue('b', 62), c: cue('c', 92), d: cue('d', 124)});
const SLOT = (i: number): [number, number] => Wd(-5.6, -2.6 + i * 1.6); // receiver tray beside the cloud
const Tcp = make(({f, cue}) => {
  const p = tcpPlan(cue);
  const dark = f < p.a ? eo(clamp((f - 8) / 8)) * (1 - eo(clamp((f - p.a + 6) / 8))) : 0;
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(tcpCam(p), f);
      world(g, iso, {keep: ['phone', 'cloud'], desat: 0.85, leds: f / 30, route: 1});
      // receiver tray: four slots beside the cloud server
      iso.keep = true;
      for (let i = 0; i < 4 && f >= p.c - 22; i++) {
        const [sx, sy] = SLOT(i);
        iso.flat([[sx - 0.55, sy - 0.55], [sx + 0.55, sy - 0.55], [sx + 0.55, sy + 0.55], [sx - 0.55, sy + 0.55]], 0.03, '#C9C4F5', {a: 0.9 * eo(clamp((f - p.c + 22) / 8))});
      }
      iso.keep = false;
      // the lost IP box (before 「所以要TCP」): falls through the route and is gone
      if (f < p.a) {
        const t = clamp((f - 2) / 16);
        const [x, y] = along(ROUTE_CLOUD, 0.42);
        if (t < 1) packet(iso, x + t * 1.5, y - t * 0.4, 0.1 - t * t * 4, PROTO.IP, 1.0);
      }
      iso.flush();
      // the handshake: three arcs between phone and cloud, bowed out to the right, SYN → SYN-ACK ← ACK →
      const arcs: [string, number][] = [['SYN', p.b - 18], ['SYN-ACK', p.b - 6], ['ACK', p.b + 6]];
      const bow = (i: number) => 6.5 + i * 3.2;
      const arcPt = (i: number, q: number): number[] => {
        const fwd = i !== 1, t = fwd ? q : 1 - q, [mu, mv] = [lerp(16, -8, t), lerp(-6, -6, t)];
        const [x, y] = Wd(mu, mv + Math.sin(t * Math.PI) * bow(i));
        return [x, y, 1.6 + Math.sin(t * Math.PI) * 2.2];
      };
      arcs.forEach(([name, at], i) => {
        const t = eio(clamp((f - at) / 12));
        if (t <= 0) return;
        const gone = eio(clamp((f - p.c + 14) / 12));
        if (gone >= 1) return;
        const pts: number[][] = [];
        for (let s2 = Math.ceil(30 * gone); s2 <= 30 * t; s2++) pts.push(arcPt(i, s2 / 30));
        iso.keep = true; iso.line3(pts, K.syn, 8, {now: true}); iso.keep = false;
        const head = arcPt(i, t), prev = arcPt(i, Math.max(0, t - 0.04));
        const [hx, hy] = iso.P(head[0], head[1], head[2]), [px, py] = iso.P(prev[0], prev[1], prev[2]);
        const ang = Math.atan2(hy - py, hx - px);
        g.save(); g.translate(hx, hy); g.rotate(ang); g.fillStyle = '#7E7E7E'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-12, -11); g.lineTo(-12, 11); g.closePath(); g.fill(); g.restore();
        if (f >= at + 6 && gone < 0.3) { const m = arcPt(i, 0.5), [sx, sy] = iso.P(m[0], m[1], m[2]); txt(g, name, sx + 16, sy + 14, {size: 42, fam: jet, weight: 500}); }
      });
      // numbered packets 1–4 along the route; #3 lost at c+10, resent from d
      for (let i = 0; i < 4; i++) {
        const start = p.c - 22 + i * 7;
        const tt = clamp((f - start) / 34);
        if (f < start) continue;
        const [sx, sy] = SLOT(i);
        if (i === 2) {
          const lostAt = start + 18;
          if (f < lostAt) { const [x, y] = along(ROUTE_CLOUD, tt); packet(iso, x, y, 0.15, PROTO.TCP, 1.15, true, '3'); }
          else if (f < lostAt + 10) { const q = (f - lostAt) / 10, [x, y] = along(ROUTE_CLOUD, clamp((lostAt - start) / 34)); packet(iso, x, y, 0.15 - q * 2.5, ['#F78787', '#C43A3A', K.red], 1.15 * (1 - q * 0.6), true, '3'); }
          if (f >= p.d) {
            const r = clamp((f - p.d) / 26);
            if (r < 1) { const [x, y] = along(ROUTE_CLOUD, r); packet(iso, x, y, 0.15, PROTO.TCP, 1.15, true, '3'); }
            else packet(iso, sx, sy, 0.05 + 0.4 * (1 - eo(clamp((f - p.d - 26) / 6))), PROTO.TCP, 1.15, true, '3');
          }
          continue;
        }
        if (tt < 1) { const [x, y] = along(ROUTE_CLOUD, tt); packet(iso, x, y, 0.15, PROTO.TCP, 1.15, true, String(i + 1)); }
        else { const land = clamp((f - start - 34) / 6); const [x0, y0] = ST.cloud; packet(iso, lerp(x0, sx, eo(land)), lerp(y0, sy, eo(land)), 0.05 + Math.sin(land * Math.PI) * 0.8, PROTO.TCP, 1.15, true, String(i + 1)); }
      }
      iso.flush();
      // empty slot 3: red dashed ring until the resend lands; then the label
      const [s3x, s3y] = SLOT(2), [rx, ry] = iso.P(s3x, s3y, 0.05);
      if (f >= p.c + 6 && f < p.d + 32) ring(g, rx, ry, iso.cam.k * 0.9, clamp((f - p.c - 6) / 8), f / 30, null, {color: K.red, lw: 4});
      if (f >= p.d + 4) txt(g, '3 号重发', rx + 80, ry + 70, {size: 48, color: K.ink});
      // lost IP box: red flash ring + label
      if (f >= 6 && f < p.a + 10) {
        const [x, y] = along(ROUTE_CLOUD, 0.42), [qx, qy] = iso.P(x + 1.2, y - 0.3, 0);
        ring(g, qx, qy, 70, clamp((f - 6) / 6) * (1 - clamp((f - p.a) / 10)), f / 30, null, {color: K.red, lw: 5});
        txt(g, '丢了 = 不知道', qx - 40, qy - 100, {size: 48, color: K.red, align: 'center'});
      }
      if (dark > 0) { g.fillStyle = `rgba(18,39,46,${0.28 * dark})`; g.fillRect(0, 0, W, 1920); }
    }} />
    <Corner left="TCP · 编号 · 确认 · 重传" />
  </>;
}, (cue) => {
  const p = tcpPlan(cue);
  return [{at: 6, kind: 'thud', gain: 0.1}, {at: p.b - 18, kind: 'tick', gain: 0.08}, {at: p.b - 6, kind: 'tick', gain: 0.08}, {at: p.b + 6, kind: 'tick', gain: 0.08},
    {at: p.c - 4, kind: 'block', gain: 0.07}, {at: p.d + 26, kind: 'pop', gain: 0.1}];
});

/* ---------- 8 stack (signature): the packet cut open — IP ⊃ TCP ⊃ HTTP ⊃ 「开灯」 ---------- */
type Shell = {w: number; d: number; h: number; t3: Tri; open: number; label?: string};
/** An open box: back walls + floor first, then `inside`, then front walls and lid sliding away along their normals. */
const shell = (iso: Iso, x: number, y: number, z: number, s: Shell, inside: () => void) => {
  const {w, d, h, t3, open} = s, th = 0.16, X = x + w, Y = y + d, Z = z + h;
  iso.box(x, y, z, w, d, th, t3);
  iso.box(x, y, z, th, d, h, t3);
  iso.box(x, y, z, w, th, h, t3);
  iso.flush();
  if (open > 0.35) { // hatched section rims on the cut walls
    const g = iso.g, a = clamp((open - 0.35) / 0.3);
    if (a > 0.5) {
      hatch(g, [[x, y, Z], [x + th, y, Z], [x + th, Y, Z], [x, Y, Z]].map((p) => iso.P(p[0], p[1], p[2])), {fill: t3[0], sp: 6});
      hatch(g, [[x, y, Z], [X, y, Z], [X, y + th, Z], [x, y + th, Z]].map((p) => iso.P(p[0], p[1], p[2])), {fill: t3[0], sp: 6});
    }
  }
  inside();
  iso.flush();
  const o = eo(open);
  if (o < 1) {
    iso.box(X - th + o * 9, y, z, th, d, h, t3, {cull: false});
    iso.box(x, Y - th + o * 9, z, w, th, h, t3, {cull: false, decal: s.label ? (I: Iso) => I.text3Now(s.label ?? '', x + 0.5, Y + o * 9 + 0.01, z + h * 0.42, {plane: 'xz', size: 0.72, font: jet, weight: 500, tri: [K.ink, K.ink, K.ink]}) : undefined});
    iso.box(x, y, Z - th + o * 12, w, d, th, t3, {cull: false});
    iso.flush();
  }
};
const STACK_CAM: CK[] = [{at: 0, u: -2, v: 0, z: -3, k: 36}, {at: 22, u: 0, v: 0.8, z: 7.2, k: 62, d: 22}, {at: 170, u: 0, v: 0.8, z: 7.0, k: 70, d: 148}];
const stackPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 84)});
const Stack = make(({f, cue}) => {
  const p = stackPlan(cue);
  const cut = clamp((f - 16) / 10);
  const oIP = clamp((f - p.a + 10) / 14), oTCP = clamp((f - p.a + 2) / 14), oHTTP = clamp((f - p.b + 4) / 12);
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(STACK_CAM, f);
      world(g, iso, {desat: 0.7, lamp: 1, leds: f / 30});
      iso.flush();
      const grow = eio(clamp((f - 2) / 22)), S = lerp(0.14, 1, grow);
      // a flat backdrop behind the hero (template §9: world detail behind a close-up turns into giant shapes)
      g.fillStyle = `rgba(236,240,235,${0.9 * grow})`; g.fillRect(0, 0, W, 1920);
      g.save(); g.fillStyle = `rgba(18,39,46,${0.12 * grow})`;
      for (let yy = 30; yy < 1920; yy += 44) for (let xx = (yy / 44) % 2 ? 22 : 0; xx < W; xx += 44) { g.beginPath(); g.arc(xx, yy, 2, 0, Math.PI * 2); g.fill(); }
      g.restore();
      const [cx, cy] = [0, 0], baseZ = lerp(0.2, 4.6, grow);
      iso.push(cx, cy, baseZ, 0, S);
      iso.keep = true;
      shell(iso, -3.2, -3.2, 0, {w: 6.4, d: 6.4, h: 4.4, t3: PROTO.IP, open: oIP, label: '→ 203.0.113.8'}, () => {
        shell(iso, -2.3, -2.3, 0.16, {w: 4.6, d: 4.6, h: 3.2, t3: PROTO.TCP, open: oTCP, label: 'SEQ 3'}, () => {
          // the HTTP letter: a green envelope lying in the box, its text on the top face
          iso.box(-1.6, -1.2, 0.32, 3.2, 2.4, 0.45, PROTO.HTTP);
          iso.flush();
          if (oHTTP > 0) iso.text3('POST /light', -1.35, 1.0, 0.78, {plane: 'xy', size: 0.42, font: jet, weight: 500, tri: [K.ink, K.ink, K.ink]});
          iso.flush();
        });
      });
      iso.keep = false;
      iso.pop();
      // the cut line along the outer box's near corner, before the skins slide
      if (cut > 0 && oIP < 0.2) {
        const P = (x: number, y: number, z: number) => iso.P(cx + x * S, cy + y * S, baseZ + z * S);
        cutLine(g, [P(3.2, -3.2, 4.6), P(3.2, 3.2, 4.6), P(-3.2, 3.2, 4.6)], cut, {lw: 4});
      }
      // the sentence, innermost
      const [bx, by] = [cx, cy];
      bubble(iso, bx, by, baseZ + (1.4 + 0.25 * Math.sin(f / 9)) * S, back(clamp((f - p.b) / 9), 2.2), '开灯', 1.15);
      // pins: IP · 地址, TCP · 编号 补发, HTTP · 真正的话
      npin(iso, cx - 3.2 * S, cy - 3.2 * S, baseZ + 4.4 * S, {title: 'IP', value: '地址', dir: -1, up: 90, len: 60, a: clamp((f - p.a + 2) / 18), ts: 46, vs: 44, vfam: CN, dot: PROTO.IP[2]});
      npin(iso, cx + 2.3 * S, cy - 2.3 * S, baseZ + 3.3 * S, {title: 'TCP', value: '编号 · 补发', dir: 1, up: 150, len: 30, a: clamp((f - p.a - 8) / 18), ts: 46, vs: 44, vfam: CN, dot: PROTO.TCP[2]});
      npin(iso, cx - 1.0 * S, cy + 1.2 * S, baseZ + 0.8 * S, {title: 'HTTP', value: '真正的话', dir: -1, up: -70, len: 70, a: clamp((f - p.b) / 18), ts: 46, vs: 44, vfam: CN, dot: PROTO.HTTP[2]});
    }} />
    {/* the rest of the legend, placed in its layer */}
    <div style={{position: 'absolute', left: 64, top: 1300, width: 860, display: 'flex', flexDirection: 'column', gap: 14, opacity: f >= p.b + 10 ? 1 : 0,
      transform: `translateY(${(1 - eo(clamp((f - p.b - 10) / 8))) * 24}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Chip c={PROTO.UDP} size={40} /><span style={{fontFamily: jet, fontSize: 40, color: K.ink}}>UDP</span><span style={{fontFamily: CN, fontWeight: 800, fontSize: 40, color: K.ink}}>和 TCP 同一层 · DNS 走它</span></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Chip c={PROTO.MQTT} size={40} /><span style={{fontFamily: jet, fontSize: 40, color: K.ink}}>MQTT</span><span style={{fontFamily: CN, fontWeight: 800, fontSize: 40, color: K.ink}}>和 HTTP 同一层 · 跑在 TCP 上</span></div>
    </div>
    <Corner left="CUTAWAY · 一层套一层" />
  </>;
}, (cue) => {
  const p = stackPlan(cue);
  return [{at: 16, kind: 'tick', gain: 0.08}, {at: p.a - 10, kind: 'whoosh-short', gain: 0.07}, {at: p.a - 2, kind: 'whoosh-short', gain: 0.07}, {at: p.b, kind: 'pop', gain: 0.1}];
});

/* ---------- shared: a paper card billboard (a name or an address), a flying arc between two stations ---------- */
const card = (iso: Iso, x: number, y: number, z: number, text: string, s = 1, o: {bg?: string; size?: number; sub?: string} = {}) => {
  if (s <= 0) return;
  const g = iso.g, [sx, sy] = iso.P(x, y, z), size = o.size ?? 44;
  g.save(); g.translate(sx, sy); g.scale(s, s);
  g.font = `500 ${size}px ${jet}`;
  const w = g.measureText(text).width + 44, h = size + (o.sub ? 72 : 34);
  g.beginPath(); g.roundRect(-w / 2, -h, w, h, 12);
  g.fillStyle = o.bg ?? K.paper; g.fill(); g.lineWidth = 4; g.strokeStyle = K.ink; g.stroke();
  g.fillStyle = K.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.sub) { g.font = `800 30px ${CN}`; g.fillStyle = K.dim; g.fillText(o.sub, 0, -h + 30); g.font = `500 ${size}px ${jet}`; g.fillStyle = K.ink; g.fillText(text, 0, -h / 2 + 18); }
  else g.fillText(text, 0, -h / 2);
  g.restore();
};
const arcBetween = (a: [number, number], b: [number, number], t: number, h = 4, z0 = 0.5): [number, number, number] =>
  [lerp(a[0], b[0], t), lerp(a[1], b[1], t), z0 + Math.sin(clamp(t) * Math.PI) * h];

/* ---------- 2 dns: the phone only knows a name; the cabinet trades it for a number ---------- */
const DNS_CAM: CK[] = [{at: 0, u: -4, v: 0, z: 2.6, k: 31}, {at: 18, u: 14.2, v: 1, z: -0.4, k: 66, d: 18}, {at: 160, u: 13.4, v: 0.4, z: -0.8, k: 76, d: 140}];
const dnsPlan = (cue: Cue) => ({a: cue('a', 26), b: cue('b', 67)});
const Dns = make(({f, cue}) => {
  const p = dnsPlan(cue);
  const fly = clamp((f - p.b) / 14), drawer = eo(clamp((f - p.b - 8) / 10)) * (1 - eo(clamp((f - p.b - 40) / 10))), back2 = clamp((f - p.b - 24) / 16);
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(DNS_CAM, f);
      world(g, iso, {keep: ['phone', 'dns'], desat: eo(clamp(f / 14)) * 0.85, drawer, leds: f / 30});
      iso.flush();
      const D = ST.dns, P: [number, number] = [lerp(ST.phone[0], D[0], 0.3), lerp(ST.phone[1], D[1], 0.3)];
      if (f < p.b) card(iso, P[0], P[1], 4.2, 'api.example.com', back(clamp((f - p.a + 6) / 9), 2), {sub: '名字'});
      else if (fly < 1) { const [x, y, z] = arcBetween(P, D, eio(fly), 3, 4.2); card(iso, x, y, z, 'api.example.com', 1 - 0.4 * fly, {sub: '名字'}); }
      if (back2 > 0) { const [x, y, z] = back2 < 1 ? arcBetween(D, P, eio(back2), 3, 4.2) : [P[0], P[1], 4.2]; card(iso, x, y, z, '203.0.113.8', back2 < 1 ? 0.7 + 0.3 * back2 : 1 + 0.08 * Math.sin(clamp((f - p.b - 40) / 8) * Math.PI), {bg: PROTO.DNS[0], sub: '门牌号'}); }
      npin(iso, D[0] - 1.1, D[1] - 1.1, 3.2, {title: 'DNS', value: '端口 53', dir: -1, up: 300, len: 40, a: clamp((f - p.b) / 18), ts: 48, vs: 40, vfam: CN, dot: PROTO.DNS[2]});
    }} />
    <Corner left="DNS · 名字 → 地址" />
  </>;
}, (cue) => {
  const p = dnsPlan(cue);
  return [{at: 2, kind: 'whoosh-short', gain: 0.06}, {at: p.a - 4, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'fs-paper-slide', gain: 0.08}, {at: p.b + 8, kind: 'clack', gain: 0.09}, {at: p.b + 40, kind: 'pop', gain: 0.1}];
});

/* ---------- 3 udp: thrown, never signed for; one lost, asked again ---------- */
const UDP_CAM: CK[] = [{at: 0, u: 14.2, v: 1, z: -0.4, k: 66}, {at: 30, u: 13.6, v: 1, z: -1.8, k: 58, d: 30}];
const udpPlan = (cue: Cue) => ({a: cue('a', 37), b: cue('b', 71), c: cue('c', 105)});
const Udp = make(({f, cue}) => {
  const p = udpPlan(cue);
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(UDP_CAM, f);
      world(g, iso, {keep: ['phone', 'dns'], desat: 0.85, leds: f / 30});
      const P = ST.phone, D = ST.dns;
      const throwAt = (at: number, lostAt?: number) => {
        const t = clamp((f - at) / 20);
        if (f < at) return;
        if (lostAt !== undefined && t >= lostAt) {
          const q = clamp((f - at - lostAt * 20) / 8);
          if (q < 1) { const [x, y, z] = arcBetween(P, D, lostAt, 4.5, 3.6); packet(iso, x, y, z - q * 2, ['#F78787', '#C43A3A', K.red], 1.1 * (1 - q)); }
          return;
        }
        if (t < 1) { const [x, y, z] = arcBetween(P, D, eio(t), 4.5, 3.6); iso.push(x, y, z, t * 4, 1); packet(iso, 0, 0, 0, PROTO.UDP, 1.1); iso.pop(); }
      };
      throwAt(p.a - 4);
      throwAt(p.c - 6, 0.45);
      throwAt(p.c + 14);
      iso.flush();
      // the throw's path: a dashed arc, drawn ahead (template: nothing moves without a line leading it)
      const lead = clamp((f - p.a + 10) / 10);
      if (lead > 0) { const pts: number[][] = []; for (let i = 0; i <= 24 * lead; i++) pts.push(arcBetween(P, D, i / 24, 4.5, 3.6)); iso.line3(pts, PROTO.UDP[2], 4, {now: true, dash: [14, 12]}); }
      const [lx, ly] = iso.P(...arcBetween(P, D, 0.5, 4.5, 3.6));
      if (f >= p.a - 2) txt(g, 'UDP', lx, ly - 70, {size: 64, fam: jet, weight: 500, align: 'center', color: PROTO.UDP[2]});
      if (f >= p.b) { txt(g, '不握手', lx - 150, ly + 230, {size: 50, align: 'center'}); txt(g, '不确认', lx + 150, ly + 230, {size: 50, align: 'center'}); }
      // no receipt: a crossed-out tick next to the phone
      if (f >= p.b + 6) {
        const [px, py] = iso.P(P[0], P[1], 4.6), a = eo(clamp((f - p.b - 6) / 8));
        g.save(); g.globalAlpha = a; g.strokeStyle = K.dim; g.lineWidth = 8; g.lineCap = 'round';
        g.beginPath(); g.moveTo(px + 60, py - 10); g.lineTo(px + 80, py + 12); g.lineTo(px + 116, py - 30); g.stroke();
        g.strokeStyle = K.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(px + 48, py + 20); g.lineTo(px + 128, py - 40); g.stroke();
        g.restore();
      }
      if (f >= p.c + 3 && f < p.c + 30) { const [x, y, z] = arcBetween(P, D, 0.45, 4.5, 3.6), [rx, ry] = iso.P(x, y, z); ring(g, rx, ry, 70, clamp((f - p.c - 3) / 5) * (1 - clamp((f - p.c - 20) / 10)), f / 30, null, {color: K.red, lw: 5}); }
      if (f >= p.c + 16) { const [x, y, z] = arcBetween(P, D, 0.7, 4.5, 3.6), [rx, ry] = iso.P(x, y, z); txt(g, '再问一次', rx + 40, ry - 60, {size: 48}); }
    }} />
    <Corner left="UDP · 扔出去就不管" />
  </>;
}, (cue) => {
  const p = udpPlan(cue);
  return [{at: p.a - 4, kind: 'whoosh-short', gain: 0.08}, {at: p.a + 16, kind: 'tap', gain: 0.08}, {at: p.c - 6, kind: 'whoosh-short', gain: 0.07}, {at: p.c + 3, kind: 'block', gain: 0.08}, {at: p.c + 14, kind: 'whoosh-short', gain: 0.08}, {at: p.c + 34, kind: 'tap', gain: 0.08}];
});

/* ---------- 4 ip: the sentence goes into a box with an address label; routers pass it hop by hop, TTL counting down ---------- */
const IP_ROUTE: [number, number][] = [ST.phone, ST.r1, ST.r2, ST.r3];
const ipPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 89)});
const ipT = (f: number, p: {b: number}, dur: number) => clamp((f - p.b + 16) / (dur - p.b + 6));
const Ip = make(({f, dur, cue}) => {
  const p = ipPlan(cue);
  const t = ipT(f, p, dur);
  const [px, py] = along(IP_ROUTE, eio(t));
  const cam: CK[] = [{at: 0, u: 13.6, v: 1, z: -1.8, k: 58}, {at: 20, u: 15, v: -4, z: 0.5, k: 64, d: 20}];
  const c0 = camAt(cam, f), follow = eo(clamp((f - p.b + 20) / 14));
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = {x: lerp(c0.x, px, follow), y: lerp(c0.y, py, follow), z: lerp(c0.z, 1.6, follow), k: lerp(c0.k, 46, follow)};
      world(g, iso, {keep: ['phone', 'r1', 'r2', 'r3'], desat: 0.85, leds: f / 30});
      // which routers has it passed? each pass: a hop (squash), TTL − 1
      const segs = [0, 1, 2].map((i) => { const d = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]); return d(IP_ROUTE[i], IP_ROUTE[i + 1]); });
      const tot = segs[0] + segs[1] + segs[2], marks = [segs[0] / tot, (segs[0] + segs[1]) / tot, 1];
      const passed = marks.filter((m) => eio(t) >= m - 0.001).length;
      const near = Math.min(...marks.map((m) => Math.abs(eio(t) - m)));
      const hop = Math.max(0, 1 - near * 14) * 1.6;
      const boxIn = back(clamp((f - 8) / 12), 1.8);
      if (boxIn > 0) {
        iso.keep = true;
        iso.push(px, py, 0.1 + hop, 0, Math.max(0.01, boxIn));
        iso.box(-0.9, -0.9, 0, 1.8, 1.8, 1.5, PROTO.IP, {bias: 2});
        iso.pop(); iso.keep = false;
      }
      iso.flush();
      // the bubble drops into the box
      const drop = eio(clamp((f - 2) / 12));
      if (drop < 1) bubble(iso, ST.phone[0], ST.phone[1], lerp(3.9, 1.2, drop), 1 - drop * 0.8);
      const [bx, by] = iso.P(px, py, 1.6 + hop + 0.1);
      if (f >= p.a - 4) card(iso, px, py, 2.0 + hop, '→ 203.0.113.8', back(clamp((f - p.a + 4) / 9), 2), {bg: PROTO.IP[0], size: 40});
      if (f >= p.b - 10) {
        const ttl = 64 - passed;
        txt(g, `TTL ${ttl}`, bx + 120, by + 90, {size: 54, fam: jet, weight: 500, color: passed ? K.ink : K.dim});
      }
      // a small ring on each router as it is passed
      marks.forEach((m, i) => {
        if (eio(t) < m - 0.001) return;
        const r = IP_ROUTE[i + 1], [rx, ry] = iso.P(r[0], r[1], 0.4);
        const since = Math.max(0, eio(t) - m) * 40;
        ring(g, rx, ry, 64, clamp(1 - since / 6), f / 30, null, {color: PROTO.IP[2], lw: 4});
      });
    }} />
    <Corner left="IP · 地址 · 一跳一跳" />
  </>;
}, (cue, dur) => {
  const p = ipPlan(cue);
  return [{at: 8, kind: 'thud', gain: 0.09}, {at: p.a - 4, kind: 'stamp', gain: 0.08}, ...[0.36, 0.7, 0.98].map((m) => ({at: Math.round(p.b - 16 + m * (dur - p.b + 6)), kind: 'tick', gain: 0.08}))];
});

/* ---------- 6 http: a green letter, POST /light {"on": true}; the server answers 200 OK ---------- */
const HTTP_CAM: CK[] = [{at: 0, u: -3.5, v: -1, z: 0.5, k: 60}, {at: 18, u: -8.5, v: -3.4, z: 2.4, k: 72, d: 18}];
const httpPlan = (cue: Cue) => ({a: cue('a', 78), b: cue('b', 126)});
const BODY = '{"on": true}';
const Http = make(({f, cue}) => {
  const p = httpPlan(cue);
  const typed = Math.floor(clamp((f - p.a) / 18) * BODY.length);
  const into = eio(clamp((f - p.a - 26) / 12));
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(HTTP_CAM, f);
      world(g, iso, {keep: ['cloud'], desat: 0.85, leds: f / 30});
      iso.flush();
      const [cx, cy] = ST.cloud;
      // the letter: a billboard sheet, unfolds (scaleY) then slides into the server
      const open = back(clamp((f - 10) / 12), 1.6);
      if (open > 0 && into < 1) {
        const [sx0, sy0] = [640, 1010], [sx1, sy1] = iso.P(cx, cy, 2.2);
        const sx = lerp(sx0, sx1, into), sy = lerp(sy0, sy1, into), sc = 1 - 0.85 * into;
        g.save(); g.translate(sx, sy); g.scale(sc, sc * open);
        g.beginPath(); g.roundRect(-250, -150, 500, 300, 16); g.fillStyle = PROTO.HTTP[0]; g.fill(); g.lineWidth = 5; g.strokeStyle = K.ink; g.stroke();
        g.fillStyle = PROTO.HTTP[2]; g.fillRect(-250 + 2.5, -150 + 2.5, 495, 70);
        g.fillStyle = K.ink; g.font = `500 52px ${jet}`; g.textBaseline = 'middle'; g.textAlign = 'left';
        g.fillText('POST /light', -220, -112);
        g.font = `500 56px ${jet}`; g.fillText(BODY.slice(0, typed) + (typed < BODY.length && f >= p.a && Math.floor(f / 8) % 2 ? '▍' : ''), -220, 10);
        g.font = `800 30px ${CN}`; g.fillStyle = K.dim; g.fillText('HTTP 请求', -220, 100);
        g.restore();
      }
      // 200 OK: a plaque that lands on the server top, squash on landing
      if (f >= p.b - 2) {
        const land = clamp((f - p.b + 2) / 8), sq = f < p.b + 6 ? 1 : 1 + 0.18 * Math.sin(clamp((f - p.b - 6) / 6) * Math.PI);
        const [sx, sy] = iso.P(cx, cy, 3.4 + (1 - eo(land)) * 3);
        g.save(); g.translate(sx, sy - 40); g.scale(1 / sq * 1 + (sq - 1) * 0.5, 2 - sq);
        g.beginPath(); g.roundRect(-190, -120, 380, 120, 16); g.fillStyle = PROTO.HTTP[1]; g.fill(); g.lineWidth = 5; g.strokeStyle = K.ink; g.stroke();
        g.fillStyle = K.ink; g.font = `600 84px ${inter}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('200 OK', 0, -58);
        g.restore();
      }
      if (f >= p.b + 30) txt(g, '实际多是 HTTPS（再加一层加密）', 540, 1340, {size: 40, weight: 700, color: K.dim, align: 'center'});
    }} />
    <Corner left="HTTP · 请求 · 200 OK" />
  </>;
}, (cue) => {
  const p = httpPlan(cue);
  return [{at: 10, kind: 'paper', gain: 0.1}, {at: p.a, kind: 'marker', gain: 0.06}, {at: p.a + 26, kind: 'fs-paper-slide', gain: 0.08}, {at: p.b + 6, kind: 'stamp', gain: 0.1}];
});

/* ---------- 7 mqtt: the lamp's subscription is always open; the broker pushes; the lamp lights (climax) ---------- */
const mqttPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 93), c: cue('c', 120)});
const Mqtt = make(({f, cue}) => {
  const p = mqttPlan(cue);
  const on = clamp((f - p.c - 8) / 6), color = eo(clamp((f - p.c - 8) / 14));
  const cam: CK[] = [{at: 0, u: -8.5, v: -3.4, z: 2.4, k: 72}, {at: 18, u: -14.5, v: 0, z: 1.8, k: 50, d: 18}, {at: p.c + 10, u: -6, v: 0, z: 2.2, k: 34, d: 24}];
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(cam, f);
      world(g, iso, {keep: on > 0 ? 'all' : ['broker', 'lamp', 'cloud'], desat: 0.85 * (1 - color), lamp: on, leds: f / 30});
      iso.flush();
      const B = ST.broker, L = ST.lamp, C = ST.cloud;
      // the subscription: an always-open plum link broker ↔ lamp, dashes flowing
      iso.keep = true;
      iso.line3([[B[0], B[1], 3.6], [lerp(B[0], L[0], 0.5), lerp(B[1], L[1], 0.5), 6.4], [L[0], L[1], 5.4]], PROTO.MQTT[1], 7, {now: true, dash: [18, 12], off: -f * 2});
      // publish: cloud → broker (b), push: broker → lamp (c)
      const pub = clamp((f - p.b) / 14), push = clamp((f - p.c + 2) / 10);
      if (pub > 0 && pub < 1) { const [x, y, z] = arcBetween(C, B, eio(pub), 3, 3.4); packet(iso, x, y, z, PROTO.MQTT, 0.8); }
      if (push > 0 && push < 1) { const q = eio(push); const pt = q < 0.5 ? [lerp(B[0], (B[0] + L[0]) / 2, q * 2), lerp(B[1], (B[1] + L[1]) / 2, q * 2), lerp(3.6, 6.4, q * 2)] : [lerp((B[0] + L[0]) / 2, L[0], q * 2 - 1), lerp((B[1] + L[1]) / 2, L[1], q * 2 - 1), lerp(6.4, 5.4, q * 2 - 1)]; packet(iso, pt[0], pt[1], pt[2], PROTO.MQTT, 0.8); }
      iso.keep = false;
      iso.flush();
      // glow around the bulb once on
      const [lx, ly] = iso.P(L[0], L[1], 3.9);
      if (on > 0) {
        const r = iso.cam.k * 9 * eo(on);
        const gr = g.createRadialGradient(lx, ly, 0, lx, ly, r);
        gr.addColorStop(0, 'rgba(255,252,156,0.75)'); gr.addColorStop(1, 'rgba(255,252,156,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2); g.fill();
        ring(g, lx, ly + iso.cam.k * 1.2, iso.cam.k * 4.2, clamp((f - p.c - 10) / 10), f / 30, '灯亮了', {lw: 4, ts: 44, ang: -0.6});
      }
      // flag over the lamp: its topic
      if (f >= p.a - 4 && on <= 0) card(iso, L[0], L[1], 6.8, 'home/light', back(clamp((f - p.a + 4) / 9), 2), {bg: PROTO.MQTT[0], size: 40, sub: '订阅'});
      npin(iso, B[0] + 1.2, B[1] - 1.2, 2.2, {title: 'MQTT Broker', value: '中转站', dir: 1, up: 120, len: 40, a: clamp((f - 8) / 18) * (1 - clamp((f - p.c - 6) / 6)), ts: 44, vs: 40, vfam: CN, dot: PROTO.MQTT[2]});
      if (f >= p.b + 8 && f < p.c + 6) { const [sx, sy] = iso.P(B[0], B[1], 3.6); txt(g, '包头最小 2 字节', sx - 30, sy + 150, {size: 46, align: 'center'}); }
    }} />
    <Corner left="MQTT · 订阅 · 推送" />
  </>;
}, (cue) => {
  const p = mqttPlan(cue);
  return [{at: p.a - 4, kind: 'pop', gain: 0.09}, {at: p.b, kind: 'whoosh-short', gain: 0.07}, {at: p.c - 2, kind: 'whoosh-short', gain: 0.07}, {at: p.c + 8, kind: 'clack', gain: 0.12}, {at: p.c + 9, kind: 'chime', gain: 0.12}];
});

/* ---------- 9 end: back out to the whole island (frame 0's framing), the lamp lit, the 6 returns ---------- */
const endPlan = (cue: Cue) => ({a: cue('a', 25)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const cam: CK[] = [{at: 0, u: 0, v: 0.8, z: 7.2, k: 62}, {at: 24, u: -4, v: 0, z: 2.6, k: 30, d: 24}];
  const back3 = eo(clamp((f - p.a) / 10));
  return <>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(cam, f);
      world(g, iso, {lamp: 1, leds: f / 30});
      iso.flush();
      const [lx, ly] = iso.P(ST.lamp[0], ST.lamp[1], 3.9), r = iso.cam.k * 9;
      const gr = g.createRadialGradient(lx, ly, 0, lx, ly, r);
      gr.addColorStop(0, 'rgba(255,252,156,0.75)'); gr.addColorStop(1, 'rgba(255,252,156,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(lx, ly, r, 0, Math.PI * 2); g.fill();
      bubble(iso, ST.phone[0], ST.phone[1], 3.9, back(clamp((f - p.a - 6) / 9), 2.2));
    }} />
    <div style={{position: 'absolute', left: 52, top: 140, display: 'flex', alignItems: 'baseline', gap: 18, transform: `translateY(${(1 - back3) * -30}px)`, opacity: back3}}>
      <span style={{fontFamily: inter, fontWeight: 600, fontSize: 220, lineHeight: 0.9, color: K.ink, letterSpacing: -6}}>6</span>
      <span style={{fontFamily: CN, fontWeight: 900, fontSize: 96, color: K.ink}}>种协议</span>
    </div>
    {f >= p.a ? <Legend f={f} hop={p.a + 4} top={352} /> : null}
    <Corner left="ONE SENTENCE · 6 PROTOCOLS" />
  </>;
}, (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'whoosh', gain: 0.07}, {at: p.a, kind: 'tick', gain: 0.07}];
});

/** Cover anchor (880 × 800, f = 0): the whole island with the 「开灯」 bubble and the dark lamp. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.ground}}>
  <div style={{position: 'absolute', left: -100 * 0.86, top: -540 * 0.86, width: W, height: 1920, transform: 'scale(0.86)', transformOrigin: '0 0'}}>
    <IsoCanvas draw={(g, iso) => {
      iso.cam = camAt(HOOK_CAM, 0);
      world(g, iso, {route: 1});
      iso.flush();
      bubble(iso, ST.phone[0], ST.phone[1], 3.9, 1.1);
    }} />
  </div>
</div>;

export const netSixProtocolsScenes: Record<string, Scene> = {
  'ns.hook': Hook, 'ns.dns': Dns, 'ns.udp': Udp, 'ns.ip': Ip, 'ns.tcp': Tcp, 'ns.http': Http, 'ns.mqtt': Mqtt, 'ns.stack': Stack, 'ns.end': End, 'ns.cover': Cover,
};
