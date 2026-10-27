import React from 'react';
import {clamp, ease, hash} from '../../fx';
import {font, mono} from '../theme';
import {Cue, Scene} from '../paper';
import {Annot, Cam2, ContactShadow, Flight, Ground, Layer, Roll, Sticker, Typed, camAt, hand, pop, ramp, swing} from '../props';

// late-night-emo: "为什么越到深夜越 emo" (user, 2026-10-25: about a minute; the first word must be 你; the opening example
// must be something everyone has seen; content is ours). No material (case C): everything is drawn here. Facts and sources:
// inputs/late-night-emo/idea.md (Yoo et al. 2007, Current Biology; the "Mind After Midnight" hypothesis, Tubbs et al. 2022).
// Storyboard: tutorials/late-night-emo.storyboard.md.
// - Hook: the post everyone has seen — sent at 02:13, deleted at 08:00. The card is the object carried through: its
//   timestamp keeps running in the science scenes, it slides into a 草稿箱 drawer, and the film ends on it at 08:00.
// - Light is the subject (lemo hd-2d's two temperatures): at night one cold ambient and one practical — the phone screen;
//   in the morning the room fills with warm window light. The ground flips on 八点删 / 删的时候 / 睡一觉.
// - Colours made up from the subject's world (no material): night room #111A33, screen #CFE3FF, morning #EAF3FC, sun
//   #FFC94A; red only for an empty battery.
// - Characters act (经验.md, v3: "the robot only floats"): the person types, cries, sits up and hides their face, sleeps.
// Stage 900 × 1080 (frame "full"); the ground and header are each scene's backdrop (1080 × 1920).

const P = {night: '#111A33', nightFar: '#1C2750', deep: '#0A1024', screen: '#CFE3FF', cool: '#8EC1FF', morning: '#EAF3FC', sun: '#FFC94A',
  ink: '#0B1022', card: '#FFFFFF', muted: '#7A86A8', red: '#F0525A', white: '#FFFFFF'};
const STROKE = 6;

/** Mix two #rrggbb colours (k 0 → a, 1 → b). */
const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), t = clamp(k);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

/* ---------- shared pieces ---------- */

/** Ground + header: `k` 0 → 1 from night to morning (底色就是情绪). */
const backdrop = (k: (f: number, cue: Cue) => number, horizon?: number, label?: string, a = P.night, b = P.morning): Scene['backdrop'] => {
  const B: NonNullable<Scene['backdrop']> = ({f, cue}) => {
    const m = k(f, cue);
    return <>
      <Ground a={a} b={b} k={m} t={f / 30} light={m > 0.5 ? 'rgba(255,236,190,0.7)' : 'rgba(140,180,255,0.10)'} horizon={horizon} grain={0.35 + 0.25 * m} />
      <div style={{position: 'absolute', left: 72, right: 72, top: 92, display: 'flex', justifyContent: 'space-between', fontFamily: font, fontWeight: 700,
        fontSize: 28, color: m > 0.5 ? 'rgba(11,16,34,0.5)' : 'rgba(255,255,255,0.5)', letterSpacing: 1}}>
        <span>深夜心理</span><span style={{fontWeight: 500, fontSize: 24}}>{label ?? ''}</span>
      </div>
    </>;
  };
  return B;
};
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const In: React.FC<{f: number; at: number; d?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, d = 10, dy = 40, style, children}) => {
  const p = pop(f, at, d);
  if (p < -0.5) return null;
  return <div style={{opacity: clamp(p * 2), transform: `translateY(${(1 - Math.max(0, p)) * dy}px)`, ...style}}>{children}</div>;
};
const stage = (cam: Cam2, far: React.ReactNode, mid: React.ReactNode, near?: React.ReactNode) => <>
  <Layer cam={cam} depth={0.35}>{far}</Layer>
  <Layer cam={cam} depth={1}>{mid}</Layer>
  {near && <Layer cam={cam} depth={1.6} blur={7}>{near}</Layer>}
</>;
/** Camera shake after `at` (an impact), decaying. */
const shake = (f: number, at: number, amp = 14) => (f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.3));

/** Far layer: the window (night sky with moon and stars → morning sky with sun), a shelf line on the wall. */
const Window: React.FC<{f: number; k: number; x?: number; y?: number; w?: number; h?: number; moon?: number; sun?: number}> = ({f, k, x = 560, y = 60, w = 300, h = 380, moon = 1, sun}) => {
  const s = sun ?? k;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', border: `10px solid ${mix('#28335E', '#FFFFFF', k)}`, boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      background: `linear-gradient(180deg, ${mix('#070C22', '#9ED3FF', k)} 0, ${mix('#1D2A5E', '#FFE7A8', k)} 100%)`}}>
      {Array.from({length: 14}, (_, i) => <div key={i} style={{position: 'absolute', left: hash(i) * w, top: hash(i + 7) * h * 0.7, width: 4, height: 4, borderRadius: 2, background: '#fff',
        opacity: (1 - k) * (0.4 + 0.6 * Math.abs(Math.sin(f / 14 + i)))}} />)}
      {/* moon */}
      <div style={{position: 'absolute', left: w * 0.55, top: 50 + (1 - moon) * h, width: 76, height: 76, borderRadius: 38, background: '#F4F1DE', opacity: (1 - k) * moon,
        boxShadow: '0 0 40px 10px rgba(244,241,222,0.35)'}}><div style={{position: 'absolute', left: 22, top: -8, width: 70, height: 70, borderRadius: 35, background: mix('#0A1130', '#9ED3FF', k)}} /></div>
      {/* sun */}
      <div style={{position: 'absolute', left: w * 0.24, top: h * 0.62 - s * h * 0.42, width: 110, height: 110, borderRadius: 55, background: P.sun, opacity: s,
        boxShadow: '0 0 60px 26px rgba(255,201,74,0.55)'}} />
      <div style={{position: 'absolute', left: w / 2 - 5, top: 0, bottom: 0, width: 10, background: mix('#28335E', '#FFFFFF', k)}} />
      <div style={{position: 'absolute', top: h / 2 - 5, left: 0, right: 0, height: 10, background: mix('#28335E', '#FFFFFF', k)}} />
    </div>
  </div>;
};
/** Morning light falling from the window onto the wall and bed: a warm parallelogram, k = how much. */
const Sunbeam: React.FC<{k: number}> = ({k}) => k <= 0.01 ? null : (
  <svg width={900} height={1080} style={{position: 'absolute', inset: 0, opacity: k, mixBlendMode: 'screen'}}>
    <defs><linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE9A8" stopOpacity="0.85" /><stop offset="1" stopColor="#FFC94A" stopOpacity="0" /></linearGradient></defs>
    <path d="M560 80 L860 80 L520 1000 L60 1000 Z" fill="url(#beam)" opacity={0.55} />
  </svg>
);

type Pose = 'lie' | 'sit' | 'sleep' | 'side';
type Eyes = 'soft' | 'sad' | 'wide' | 'closed' | 'open';
/**
 * The person (our drawing; nobody in particular): in bed, lit by the phone at night (cold glow on the face, the ceiling)
 * or by the window in the morning (k). (x, y) is the centre of the bed's floor line; s scales the 600 × 420 drawing.
 * Acting: `type` (thumb taps), `tear` 0 → 1 (a tear runs down), `sweat`, `palm` 0 → 1 (a hand goes over the eyes).
 */
const Me: React.FC<{f: number; x: number; y: number; s?: number; pose?: Pose; eyes?: Eyes; k?: number; phone?: number; tear?: number; sweat?: number; palm?: number; type?: number; turn?: number}> = ({
  f, x, y, s = 1, pose = 'lie', eyes = 'soft', k = 0, phone = 1, tear = 0, sweat = 0, palm = 0, type = -1, turn = 0,
}) => {
  const id = React.useId().replace(/:/g, '');
  const skin = mix('#AEB9DA', '#F3C7A6', k), hair = mix('#151B33', '#3A2A24', k), blanket = mix('#2D3E7C', '#8DB6EA', k), blanketD = mix('#1B2656', '#5E8CCB', k);
  const sheet = mix('#3B4775', '#FFFFFF', k), wood = mix('#2A2F4F', '#C98F5A', k), woodD = mix('#1A1E36', '#9A6A3F', k), pj = mix('#4A5A99', '#F29B8E', k);
  const breathe = Math.sin(f / 22) * 3;
  const blink = (f % 110) > 104;
  const tap = type >= 0 && f >= type ? Math.max(0, Math.sin((f - type) * 1.1)) * 6 : 0;
  // head position by pose
  const head = pose === 'sit' ? {x: 170, y: 120} : pose === 'side' ? {x: 150, y: 262} : {x: 146, y: 262};
  const eye = (cx: number, cy: number) => {
    if (eyes === 'closed' || blink) return <path d={`M${cx - 9} ${cy} Q${cx} ${cy + 7} ${cx + 9} ${cy}`} fill="none" stroke={P.ink} strokeWidth={5} strokeLinecap="round" />;
    if (eyes === 'wide') return <><circle cx={cx} cy={cy} r={11} fill="#fff" stroke={P.ink} strokeWidth={4} /><circle cx={cx} cy={cy} r={4.5} fill={P.ink} /></>;
    if (eyes === 'sad') return <><ellipse cx={cx} cy={cy + 2} rx={6.5} ry={8} fill={P.ink} /><path d={`M${cx - 11} ${cy - 13} L${cx + 7} ${cy - 18}`} stroke={P.ink} strokeWidth={4} strokeLinecap="round" transform={cx < head.x ? '' : `scale(-1 1) translate(${-2 * cx} 0)`} />
      <circle cx={cx + 2} cy={cy - 1} r={2.4} fill="#fff" /></>;
    return <><ellipse cx={cx} cy={cy} rx={6.5} ry={eyes === 'open' ? 9 : 7.5} fill={P.ink} /><circle cx={cx + 2} cy={cy - 3} r={2.4} fill="#fff" /></>;
  };
  const ex = head.x - 18, ex2 = head.x + 20, ey = head.y - 2 + (pose === 'sit' ? 0 : -6) * turn;
  const glowO = phone * (1 - k);
  return <>
    <ContactShadow x={x} y={y + 4} w={560 * s} o={0.3} />
    <div style={{position: 'absolute', left: x - 300 * s, top: y - 420 * s, width: 600 * s, height: 420 * s}}>
      <svg width={600 * s} height={420 * s} viewBox="0 0 600 420" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id={`bl${id}`} x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.25" /></linearGradient>
          <radialGradient id={`sk${id}`} cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#fff" stopOpacity="0.45" /><stop offset="0.6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.18" /></radialGradient>
          <radialGradient id={`gw${id}`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={P.screen} stopOpacity="0.9" /><stop offset="0.4" stopColor={P.cool} stopOpacity="0.35" /><stop offset="1" stopColor={P.cool} stopOpacity="0" /></radialGradient>
        </defs>
        {/* bed: headboard, legs, mattress front, sheet */}
        <rect x={14} y={150} width={44} height={262} rx={12} fill={wood} stroke={P.ink} strokeWidth={STROKE} />
        <rect x={548} y={300} width={36} height={112} rx={10} fill={wood} stroke={P.ink} strokeWidth={STROKE} />
        <rect x={40} y={330} width={540} height={60} rx={14} fill={woodD} stroke={P.ink} strokeWidth={STROKE} />
        <rect x={44} y={300} width={530} height={44} rx={16} fill={sheet} stroke={P.ink} strokeWidth={STROKE} />
        {/* pillow */}
        <ellipse cx={128} cy={300} rx={86} ry={32} fill={mix('#56628F', '#FFFFFF', k)} stroke={P.ink} strokeWidth={STROKE} />
        {pose === 'sit' && <>
          {/* torso in pyjamas, then the head above it */}
          <path d={`M110 ${312} Q104 214 168 196 Q232 214 226 312 Z`} fill={pj} stroke={P.ink} strokeWidth={STROKE} strokeLinejoin="round" />
          <path d={`M110 312 Q104 214 168 196 Q232 214 226 312 Z`} fill={`url(#bl${id})`} />
        </>}
        {/* head */}
        <g transform={`translate(0 ${pose === 'sit' ? breathe * 0.5 : 0})`}>
          <circle cx={head.x} cy={head.y} r={54} fill={skin} stroke={P.ink} strokeWidth={STROKE} />
          <circle cx={head.x} cy={head.y} r={52} fill={`url(#sk${id})`} />
          <path d={`M${head.x - 54} ${head.y - 4} Q${head.x - 58} ${head.y - 66} ${head.x + 4} ${head.y - 58} Q${head.x + 46} ${head.y - 60} ${head.x + 54} ${head.y - 14} Q${head.x + 26} ${head.y - 40} ${head.x - 10} ${head.y - 30} Q${head.x - 36} ${head.y - 24} ${head.x - 54} ${head.y - 4} Z`}
            fill={hair} stroke={P.ink} strokeWidth={STROKE} strokeLinejoin="round" />
          {eye(ex, ey)}{eye(ex2, ey - 2)}
          <ellipse cx={head.x - 30} cy={head.y + 18} rx={9} ry={6} fill="#FF9AA2" opacity={0.35 + 0.25 * k} />
          <ellipse cx={head.x + 34} cy={head.y + 16} rx={9} ry={6} fill="#FF9AA2" opacity={0.35 + 0.25 * k} />
          <path d={eyes === 'wide' ? `M${head.x - 6} ${head.y + 26} Q${head.x + 2} ${head.y + 20} ${head.x + 10} ${head.y + 26}` : eyes === 'sad' ? `M${head.x - 8} ${head.y + 30} Q${head.x + 2} ${head.y + 22} ${head.x + 12} ${head.y + 30}` : `M${head.x - 8} ${head.y + 24} Q${head.x + 2} ${head.y + 30} ${head.x + 12} ${head.y + 24}`}
            fill="none" stroke={P.ink} strokeWidth={4.5} strokeLinecap="round" />
          {tear > 0 && <path d={`M${ex + 4} ${ey + 12 + tear * 34} q-7 10 0 16 q7 -6 0 -16Z`} fill={P.cool} stroke={P.ink} strokeWidth={2.5} opacity={clamp(tear * 4) * (1 - clamp((tear - 0.9) * 10))} />}
          {sweat > 0 && <path d={`M${head.x + 56} ${head.y - 40 + sweat * 10} q-9 14 0 22 q9 -8 0 -22Z`} fill="#9FD3FF" stroke={P.ink} strokeWidth={3} opacity={clamp(sweat * 3)} />}
        </g>
        {/* blanket */}
        {pose === 'sit'
          ? <><path d={`M90 318 Q160 270 300 284 Q450 270 572 300 L572 344 L90 344 Z`} fill={blanket} stroke={P.ink} strokeWidth={STROKE} strokeLinejoin="round" />
            <path d="M90 318 Q160 270 300 284 Q450 270 572 300 L572 344 L90 344 Z" fill={`url(#bl${id})`} /></>
          : <><path d={`M${pose === 'sleep' ? 150 : 186} ${pose === 'sleep' ? 262 : 290} Q${300} ${222 + breathe} ${420} ${246 + breathe * 0.6} Q${520} ${260} ${572} ${296} L572 344 L${pose === 'sleep' ? 120 : 176} 344 Q${pose === 'sleep' ? 112 : 170} 300 ${pose === 'sleep' ? 150 : 186} ${pose === 'sleep' ? 262 : 290} Z`}
              fill={blanket} stroke={P.ink} strokeWidth={STROKE} strokeLinejoin="round" />
            <path d={`M${pose === 'sleep' ? 150 : 186} ${pose === 'sleep' ? 262 : 290} Q300 ${222 + breathe} 420 ${246 + breathe * 0.6} Q520 260 572 296 L572 344 L${pose === 'sleep' ? 120 : 176} 344 Z`} fill={`url(#bl${id})`} />
            {[260, 340, 430].map((cx, i) => <path key={i} d={`M${cx} ${262 + i * 4} q20 18 6 52`} fill="none" stroke={blanketD} strokeWidth={5} strokeLinecap="round" />)}</>}
        {/* arm + phone (lying, awake) */}
        {(pose === 'lie' || pose === 'side') && phone > 0 && <g>
          <path d={`M236 270 Q232 ${210 - tap * 0.3} 232 ${186 - tap * 0.3}`} fill="none" stroke={pj} strokeWidth={30} strokeLinecap="round" />
          <path d={`M236 270 Q232 ${210 - tap * 0.3} 232 ${186 - tap * 0.3}`} fill="none" stroke={P.ink} strokeWidth={30 + STROKE * 2} strokeLinecap="round" opacity={0} />
          <g transform={`translate(204 ${108 - tap * 0.3}) rotate(-14)`}>
            <rect x={0} y={0} width={56} height={96} rx={12} fill="#1A2036" stroke={P.ink} strokeWidth={5} />
            <rect x={5} y={6} width={46} height={84} rx={8} fill={mix('#2A3460', '#3A4A7A', k)} />
          </g>
          <circle cx={226} cy={184 - tap * 0.4} r={16} fill={skin} stroke={P.ink} strokeWidth={4.5} />
        </g>}
        {/* the hand over the eyes (morning, embarrassed) */}
        {pose === 'sit' && palm > 0 && <g opacity={clamp(palm * 2)} transform={`translate(${(1 - palm) * 40} ${(1 - palm) * 80})`}>
          <path d={`M212 230 Q236 190 ${head.x + 14} ${head.y + 2}`} fill="none" stroke={pj} strokeWidth={28} strokeLinecap="round" />
          <ellipse cx={head.x + 6} cy={head.y - 2} rx={34} ry={22} fill={skin} stroke={P.ink} strokeWidth={4.5} transform={`rotate(-12 ${head.x + 6} ${head.y - 2})`} />
        </g>}
        {/* phone glow: the practical light, on the face and up the wall */}
        {glowO > 0.01 && (pose === 'lie' || pose === 'side') && <circle cx={220} cy={180} r={190} fill={`url(#gw${id})`} opacity={glowO * (0.75 + 0.05 * Math.sin(f / 6))} style={{mixBlendMode: 'screen'}} />}
      </svg>
    </div>
  </>;
};

/** The post card (our generic card, no platform's UI): avatar, 我, a big timestamp, one line of text. */
const Post: React.FC<{f: number; x: number; y: number; w?: number; time: string; flipAt?: number; time2?: string; text: string; typeStart?: number; sentAt?: number; crumple?: number; rot?: number; buttons?: number; sendLit?: number; dim?: number}> = ({
  f, x, y, w = 700, time, flipAt, time2, text, typeStart = -999, sentAt, crumple = 0, rot = -2, buttons = 0, sendLit = 0, dim = 0,
}) => {
  const flipped = flipAt !== undefined && f >= flipAt;
  const sq = flipAt !== undefined ? 1 - 0.8 * Math.max(0, 1 - Math.abs(f - flipAt) / 4) : 1;
  const sent = sentAt !== undefined ? pop(f, sentAt, 8) : -1;
  const heart = sentAt !== undefined && f >= sentAt;
  const c = clamp(crumple);
  return <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot + c * 260}deg) scale(${(1 - 0.82 * c) * (sent > 0 ? 1 + 0.04 * Math.sin(Math.PI * clamp(sent)) : 1)})`,
    transformOrigin: '50% 50%', filter: dim ? `brightness(${1 - 0.4 * dim})` : undefined}}>
    <div style={{background: `linear-gradient(180deg, ${P.card} 0, #EEF3FF 100%)`, border: `6px solid ${P.ink}`, borderRadius: 30 + c * 200, padding: '30px 36px 26px',
      boxShadow: `0 10px 0 ${P.ink}, 0 30px 50px rgba(0,0,0,0.35)`, position: 'relative', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 78, height: 78, borderRadius: 20, background: 'linear-gradient(145deg, #9DB8FF 0, #4D63B8 100%)', border: `4px solid ${P.ink}`}} />
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 42, color: P.ink}}>我</div>
        <div style={{flex: 1}} />
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 84, color: flipped ? '#C98A10' : '#3550B0', letterSpacing: -2, transform: `scaleY(${sq})`, lineHeight: 1}}>{flipped ? time2 : time}</div>
      </div>
      <div style={{marginTop: 22, minHeight: 66}}>
        {typeStart > -900 ? <Typed f={f} start={typeStart} text={text} cps={20} size={48} color={P.ink} weight={800} /> : <span style={{fontFamily: font, fontWeight: 800, fontSize: 48, color: P.ink}}>{text}</span>}
      </div>
      <div style={{marginTop: 16, display: 'flex', gap: 30, alignItems: 'center', fontFamily: font, fontSize: 32, color: P.muted}}>
        <svg width={44} height={40} viewBox="0 0 44 40"><path d="M22 36 C-6 18 6 -4 22 10 C38 -4 50 18 22 36Z" fill={heart ? '#FF6B81' : 'none'} stroke={heart ? P.ink : P.muted} strokeWidth={4} /></svg>
        <span>{heart ? '已发送' : '发表'}</span>
      </div>
      {buttons > 0 && <div style={{marginTop: 22, display: 'flex', gap: 24, opacity: clamp(buttons * 2), transform: `translateY(${(1 - clamp(buttons)) * 20}px)`}}>
        {['删除', '发送'].map((b, i) => <div key={b} style={{flex: 1, textAlign: 'center', padding: '18px 0', borderRadius: 20, border: `5px solid ${P.ink}`, fontFamily: font, fontWeight: 900, fontSize: 46,
          background: i === 1 ? mix('#FFFFFF', P.sun, sendLit) : '#FFFFFF', color: P.ink, boxShadow: i === 1 && sendLit > 0 ? `0 0 ${30 * sendLit}px rgba(255,201,74,0.9)` : `0 6px 0 ${P.ink}`}}>{b}</div>)}
      </div>}
      {c > 0 && <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(${30 + c * 90}deg, rgba(0,0,0,0.0) 0 40px, rgba(0,0,0,${0.12 * c}) 40px 46px)`}} />}
    </div>
  </div>;
};
/** A small time chip (the card's timestamp, alone). */
const TimeChip: React.FC<{t: string; light?: boolean; size?: number}> = ({t, light = false, size = 72}) => (
  <div style={{display: 'inline-block', fontFamily: mono, fontWeight: 800, fontSize: size, color: light ? P.ink : P.screen, padding: `${size * 0.12}px ${size * 0.32}px`, borderRadius: size * 0.3,
    background: light ? 'rgba(255,255,255,0.85)' : 'rgba(207,227,255,0.10)', border: `4px solid ${light ? P.ink : 'rgba(207,227,255,0.5)'}`, letterSpacing: -1}}>{t}</div>
);
const hm = (minutes: number) => {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const TEXT = '有些话，只能说给自己听。';

/* ---------- 1 hook: sent at 02:13, deleted at 08:00 ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 77)});
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const k = ramp(f, p.b - 2, p.b + 10);
  const sit = f >= p.b + 2;
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 1.0}, 1], [0, {z: 1.06, y: 600}, p.b], [p.b, {z: 0.96, y: 540}, 14]]);
  // the crumpled card flies into the bin
  const c = ramp(f, p.b + 6, p.b + 18), fly = ramp(f, p.b + 14, p.b + 30);
  return <>
    {stage(cam, <><Window f={f} k={k} x={600} y={300} w={260} h={330} /></>, <>
      <Sunbeam k={k} />
      <Me f={f} x={430} y={1060} s={1.45} pose={sit ? 'sit' : 'lie'} eyes={sit ? 'wide' : 'sad'} k={k} phone={sit ? 0 : 1} type={p.a - 6} palm={sit ? ramp(f, p.b + 6, p.b + 16) : 0} sweat={sit ? ramp(f, p.b + 10, p.b + 20) : 0} />
      {/* the bin */}
      <div style={{position: 'absolute', left: 760, top: 920, opacity: ramp(f, p.b + 6, p.b + 14)}}>
        <svg width={120} height={150} viewBox="0 0 120 150"><path d="M10 20 H110 L98 146 H22 Z" fill={mix('#3B4775', '#B9C8DD', k)} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={2} y={8} width={116} height={18} rx={8} fill={mix('#56628F', '#DCE6F2', k)} stroke={P.ink} strokeWidth={6} /></svg>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${fly * 560}px, ${fly * 700 - Math.sin(Math.PI * fly) * 260}px)`, opacity: 1 - ramp(f, p.b + 30, p.b + 33)}}>
        <Post f={f} x={40} y={40} w={820} time="02:13" flipAt={p.b - 2} time2="08:00" text={TEXT} typeStart={-60} sentAt={p.a} crumple={c} />
      </div>
    </>)}
    {f < hookPlan(cue).b - 2 && <Sticker x={720} y={620} p={pop(f, p.a, 9)} rot={6} size={44} bg={P.cool} color={P.ink}>已发送</Sticker>}
  </>;
};
Hook.backdrop = backdrop((f, cue) => ramp(f, hookPlan(cue).b - 2, hookPlan(cue).b + 10), 960);
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 0, kind: 'fs-watch-tick', gain: 0.08}, {at: p.a, kind: 'tap', gain: 0.14}, {at: p.a + 2, kind: 'pop', gain: 0.1}, {at: p.b - 2, kind: 'chime', gain: 0.12},
    {at: p.b + 8, kind: 'paper', gain: 0.14}, {at: p.b + 30, kind: 'thud', gain: 0.08}];
};

/* ---------- 2 feel: both are true — at night, and in the morning ---------- */

const feelPlan = (cue: Cue) => ({a: cue('a', 55), b: cue('b', 108), c: cue('c', 132)});
const Feel: Scene = ({f, cue, dur}) => {
  const p = feelPlan(cue);
  // the split: night fills the stage, then the morning half slides in from the right on 删的时候
  const split = 900 - 450 * ease.outCubic(ramp(f, p.a - 4, p.a + 10));
  const sweep = ramp(f, p.b, p.c + 24);
  const ang = -90 + (2 + 13 / 60) * 30 + sweep * (8 - 2.22) * 30;
  // a slow push over the whole split, so the second half of the scene keeps moving
  return <div style={{position: 'absolute', inset: 0, transformOrigin: '450px 560px', transform: `scale(${1 + 0.08 * ease.inOutCubic(ramp(f, 0, dur))})`}}>
    {/* night half */}
    <div style={{position: 'absolute', left: -60, top: -200, width: 60 + split, height: 1500, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 60, top: 200, width: 900, height: 1080}}>
        <Window f={f} k={0} x={40} y={80} w={220} h={280} />
        <div style={{transform: `scale(${1 - 0.15 * ramp(f, p.a - 4, p.a + 10)})`, transformOrigin: '220px 800px'}}>
          <Me f={f} x={300} y={900} s={1.25} pose="side" eyes="sad" tear={ramp(f, 4, 50)} />
        </div>
        <Abs x={30} y={440}><TimeChip t="02:13" /></Abs>
      </div>
    </div>
    {/* morning half */}
    <div style={{position: 'absolute', left: split, top: -200, width: 1080, height: 1500, overflow: 'hidden', background: P.morning}}>
      <div style={{position: 'absolute', left: 60 - split, top: 200, width: 900, height: 1080}}>
        <div style={{position: 'absolute', left: 450, top: 0, width: 600, height: 1080, background: 'radial-gradient(ellipse at 70% 20%, rgba(255,233,168,0.9), transparent 70%)'}} />
        <Window f={f} k={1} x={640} y={80} w={220} h={280} />
        <div style={{transform: 'scale(0.85)', transformOrigin: '680px 800px'}}>
          <Me f={f} x={680} y={900} s={1.25} pose="sit" eyes="wide" k={1} phone={0} sweat={ramp(f, p.a + 6, p.a + 18)} />
        </div>
        <Abs x={700} y={440}><TimeChip t="08:00" light /></Abs>
      </div>
    </div>
    {/* the seam becomes a clock hand sweeping 02:13 → 08:00 */}
    <div style={{position: 'absolute', left: split - 4, top: -200, width: 8, height: 1500, background: P.ink, opacity: split < 899 ? 1 : 0}} />
    {f >= p.b - 6 && <div style={{position: 'absolute', left: split - 110, top: 520, width: 220, height: 220, opacity: ramp(f, p.b - 6, p.b + 4), transform: `scale(${Math.max(0.01, pop(f, p.b - 6, 10))})`}}>
      <svg width={220} height={220} viewBox="-110 -110 220 220">
        <circle r={100} fill="#fff" stroke={P.ink} strokeWidth={8} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-86} x2={0} y2={-74} stroke={P.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={0} y2={-58} stroke={P.ink} strokeWidth={10} strokeLinecap="round" transform={`rotate(${ang + 90})`} />
        <line x1={0} y1={0} x2={0} y2={-80} stroke="#3550B0" strokeWidth={6} strokeLinecap="round" transform={`rotate(${(sweep * 5.78 * 360 + 78) % 360})`} />
        <circle r={10} fill={P.ink} />
      </svg>
    </div>}
  </div>;
};
Feel.backdrop = backdrop(() => 0, 960);
Feel.sfx = (cue) => {
  const p = feelPlan(cue);
  return [{at: 6, kind: 'fs-heartbeat', gain: 0.08}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.1}, {at: p.b - 6, kind: 'pop', gain: 0.08}, {at: p.b + 4, kind: 'fs-watch-tick', gain: 0.1}];
};

/* ---------- 3 turn: the duty sign flips from 理智 to 情绪 ---------- */

const turnPlan = (cue: Cue) => ({a: cue('a', 31), b: cue('b', 66)});
const DutySign: React.FC<{f: number; x: number; y: number; flipAt: number}> = ({f, x, y, flipAt}) => {
  const fl = ramp(f, flipAt - 6, flipAt + 6), side = fl > 0.5;
  const sx = Math.abs(Math.cos(fl * Math.PI));
  const rot = swing(f, -8, 8) + swing(f, flipAt + 4, 14);
  return <div style={{position: 'absolute', left: x, top: y, transformOrigin: '0 0', transform: `rotate(${rot}deg)`}}>
    <svg width={4} height={4} style={{position: 'absolute', overflow: 'visible'}}><path d="M-120 0 L0 -90 L120 0" fill="none" stroke={P.screen} strokeWidth={6} strokeLinecap="round" /></svg>
    <div style={{position: 'absolute', left: -170, top: -10, width: 340, transform: `scaleX(${Math.max(0.04, sx)})`, background: side ? '#FFE3E7' : '#E6F0FF', border: `7px solid ${P.ink}`, borderRadius: 26,
      padding: '18px 0 22px', textAlign: 'center', boxShadow: `0 10px 0 ${P.ink}, 0 26px 40px rgba(0,0,0,0.4)`}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 34, color: P.muted}}>今晚值班</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 108, lineHeight: 1.1, color: side ? '#D9364A' : '#3550B0'}}>{side ? '情绪' : '理智'}</div>
    </div>
  </div>;
};
const Turn: Scene = ({f, cue}) => {
  const p = turnPlan(cue);
  const cam = camAt(f, [[-1, {x: 360, y: 640, z: 1.05}, 1], [0, {z: 1.14}, p.b + 10], [p.b, {z: 1.2, y: 620}, 12]]);
  return <>
    {stage(cam, <Window f={f} k={0} x={560} y={100} w={300} h={380} moon={ramp(f, p.a - 10, p.a + 20)} />, <>
      <Me f={f} x={480} y={1180} s={1.8} pose="lie" eyes={f >= p.b ? 'sad' : 'open'} phone={1} />
      <DutySign f={f} x={330} y={320} flipAt={p.b} />
    </>)}
  </>;
};
Turn.backdrop = backdrop(() => 0, 1000);
Turn.sfx = (cue) => {
  const p = turnPlan(cue);
  return [{at: 0, kind: 'tick', gain: 0.08}, {at: p.a, kind: 'fs-wind-click', gain: 0.06}, {at: p.b - 6, kind: 'whoosh-short', gain: 0.1}, {at: p.b + 2, kind: 'tick', gain: 0.14}];
};

/* ---------- 4 brake: the gas pedal (杏仁核) and the brake (前额叶); the brake's battery runs down ---------- */

const brakePlan = (cue: Cue) => ({a: cue('a', 58), b: cue('b', 105), c: cue('c', 127)});
/** A pedal on a floor plate: lit top, a front face for thickness, a soft shadow. `press` 0 → 1 pushes it down. */
const Pedal: React.FC<{x: number; y: number; w: number; h: number; color: string; press?: number; sag?: number; drop: number}> = ({x, y, w, h, color, press = 0, sag = 0, drop}) => {
  const d = clamp(drop), fall = (1 - ease.outCubic(d)) * -500;
  const tilt = -18 + 30 * press + 24 * sag;
  return <div style={{position: 'absolute', left: x, top: y + fall, opacity: clamp(d * 3)}}>
    <ContactShadow x={0} y={10} w={w * 1.3} o={0.45} />
    <div style={{position: 'absolute', left: -w * 0.65, top: -20, width: w * 1.3, height: 34, borderRadius: 14, background: '#2A3253', border: `5px solid ${P.ink}`}} />
    <div style={{position: 'absolute', left: -w / 2, top: -h - 10 + press * 40, width: w, height: h, transformOrigin: '50% 100%', transform: `perspective(900px) rotateX(${tilt}deg) scaleY(${1 - 0.25 * sag})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(160deg, rgba(255,255,255,0.45) 0, rgba(255,255,255,0) 40%, rgba(0,0,0,0.3) 100%), ${color}`,
        border: `6px solid ${P.ink}`, boxShadow: `0 14px 0 ${mix('#000000', color.startsWith('#') ? color : '#888888', 0.5)}, 0 30px 30px rgba(0,0,0,0.35)`}}>
        {Array.from({length: Math.floor(h / 46)}, (_, i) => <div key={i} style={{position: 'absolute', left: 18, right: 18, top: 24 + i * 46, height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.22)'}} />)}
      </div>
    </div>
  </div>;
};
const Battery: React.FC<{level: number; w?: number; red?: boolean}> = ({level, w = 220, red = false}) => {
  const h = w * 0.48, cells = 5;
  return <svg width={w + 20} height={h} viewBox={`0 0 ${w + 20} ${h}`} style={{overflow: 'visible', display: 'block'}}>
    <rect x={3} y={3} width={w - 6} height={h - 6} rx={18} fill="#0F1630" stroke={red ? P.red : P.screen} strokeWidth={7} />
    <rect x={w} y={h * 0.3} width={14} height={h * 0.4} rx={5} fill={red ? P.red : P.screen} />
    {Array.from({length: cells}, (_, i) => {
      const on = level * cells > i + 0.01;
      return <rect key={i} x={14 + i * ((w - 28) / cells)} y={14} width={(w - 28) / cells - 8} height={h - 28} rx={7} fill={red ? P.red : '#7CE0A8'} opacity={on ? 1 : 0.08} />;
    })}
  </svg>;
};
const Brake: Scene = ({f, cue}) => {
  const p = brakePlan(cue);
  const night = ramp(f, p.b - 4, p.c);
  const level = f < p.b ? 1 : f < p.c ? 1 - 0.8 * night : 0.2 - 0.2 * ramp(f, p.c, p.c + 8);
  const red = f >= p.c - 2;
  const sag = ramp(f, p.c + 4, p.c + 12), press = ramp(f, p.c + 10, p.c + 16);
  const cam0 = camAt(f, [[-1, {x: 300, y: 600, z: 1.1}, 1], [p.a - 8, {x: 450, y: 600, z: 1.0}, 18], [p.b - 4, {x: 560, y: 560, z: 1.12}, 20], [p.c + 10, {z: 1.05}, 8]]);
  const cam = {...cam0, x: cam0.x + shake(f, p.c + 14, 16), y: cam0.y + shake(f, p.c + 14, 10) * 0.6};
  return <>
    {stage(cam, <>
      {[[100, 140, 380], [760, 120, 300], [520, 520, 460]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', background: P.nightFar, opacity: 0.6}} />)}
    </>, <>
      <Pedal x={250} y={880} w={150} h={360} color={'#E46A7A'} press={press} drop={ramp(f, -8, 4)} />
      <Pedal x={620} y={880} w={260} h={230} color={'#6F8BE0'} sag={sag} drop={ramp(f, p.a - 6, p.a + 4)} />
      <Abs x={520} y={520 - 500 * (1 - ease.outCubic(ramp(f, p.a - 6, p.a + 4))) + sag * 60} style={{transform: `rotate(${sag * 10}deg)`, opacity: ramp(f, p.a - 6, p.a)}}><Battery level={level} red={red} /></Abs>
      <Abs x={140} y={890}><In f={f} at={4}><div style={{fontFamily: font, fontWeight: 900, fontSize: 58, color: '#FFB3BD'}}>杏仁核</div><div style={{fontFamily: hand, fontSize: 40, color: P.screen}}>油门</div></In></Abs>
      <Abs x={540} y={890}><In f={f} at={p.a + 2}><div style={{fontFamily: font, fontWeight: 900, fontSize: 58, color: '#B7C7FF'}}>前额叶</div><div style={{fontFamily: hand, fontSize: 40, color: P.screen}}>刹车</div></In></Abs>
    </>)}
    <Abs x={0} y={40} w={900} style={{textAlign: 'center', opacity: ramp(f, p.b - 8, p.b)}}><TimeChip t={hm(18 * 60 + 8 * 60 * night)} size={84} /></Abs>
  </>;
};
Brake.backdrop = backdrop(() => 0, 1080, '比喻：前额叶管住情绪反应');
Brake.sfx = (cue) => {
  const p = brakePlan(cue);
  const ticks = [0, 1, 2, 3].map((i) => ({at: Math.round(p.b + ((p.c - p.b) * i) / 4), kind: 'tick', gain: 0.09}));
  return [{at: 4, kind: 'thud', gain: 0.14}, {at: p.a + 4, kind: 'thud', gain: 0.14}, ...ticks, {at: p.c, kind: 'block', gain: 0.1}, {at: p.c + 14, kind: 'fs-impact-deep', gain: 0.16}];
};

/* ---------- 5 almond: after a night without sleep, the amygdala reacts 60 % more ---------- */

const almondPlan = (cue: Cue) => ({a: cue('a', 45), b: cue('b', 82), c: cue('c', 126)});
/** An almond (杏仁 — the amygdala's namesake), lit from the top left, with its grooves. */
const Almond: React.FC<{w: number; glow?: number}> = ({w, glow = 0}) => (
  <svg width={w} height={w * 1.35} viewBox="0 0 200 270" style={{overflow: 'visible', display: 'block'}}>
    <defs><radialGradient id={`al${w}`} cx="36%" cy="30%" r="80%"><stop offset="0" stopColor="#F2C08E" /><stop offset="0.55" stopColor="#C98B55" /><stop offset="1" stopColor="#7C4A26" /></radialGradient></defs>
    {glow > 0 && <ellipse cx={100} cy={140} rx={140} ry={170} fill="#FF7A8A" opacity={0.25 * glow} style={{filter: 'blur(18px)'}} />}
    <path d="M100 6 C40 60 14 140 30 200 C44 250 156 250 170 200 C186 140 160 60 100 6Z" fill={`url(#al${w})`} stroke={P.ink} strokeWidth={7} />
    {[[70, 70, 56, 200], [100, 40, 100, 230], [130, 70, 144, 200]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (i - 1) * 14} ${(y1 + y2) / 2} ${x2} ${y2}`} fill="none" stroke="#8A5530" strokeWidth={4} strokeLinecap="round" opacity={0.6} />)}
    <ellipse cx={70} cy={80} rx={14} ry={30} fill="#fff" opacity={0.35} transform="rotate(20 70 80)" />
  </svg>
);
const Almonds: Scene = ({f, cue}) => {
  const p = almondPlan(cue);
  const grow = 1 + 0.6 * ease.outCubic(ramp(f, p.b + 6, p.c));
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.12}, 1], [0, {z: 1.2}, p.b], [p.b, {x: 400, y: 560, z: 0.98}, 16]]);
  return <>
    {stage(cam, <div style={{position: 'absolute', left: 150, top: 100, width: 600, height: 900, background: 'radial-gradient(ellipse at 50% 40%, rgba(207,227,255,0.22), transparent 65%)'}} />, <>
      {/* the spotlight on the floor */}
      <div style={{position: 'absolute', left: 280, top: 840, width: 440, height: 90, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(207,227,255,0.35), transparent 70%)'}} />
      <ContactShadow x={510} y={880} w={260 * grow} o={0.5} />
      <div style={{position: 'absolute', left: 510, top: 880, transform: `translate(-50%, -100%) scale(${grow})`, transformOrigin: '50% 100%'}}><Almond w={220} glow={ramp(f, p.b, p.c)} /></div>
      {/* the rested one, for comparison */}
      <div style={{position: 'absolute', left: 160, top: 880, transform: `translate(-50%, -100%) scale(${Math.max(0, pop(f, p.b - 2, 10))})`, transformOrigin: '50% 100%'}}><Almond w={220} /></div>
      {f >= p.b && <ContactShadow x={160} y={880} w={240} o={0.45} />}
      <Abs x={60} y={900}><In f={f} at={p.b + 2}><div style={{fontFamily: hand, fontSize: 44, color: P.screen}}>睡够的人</div></In></Abs>
      <Abs x={420} y={900}><In f={f} at={p.b + 6}><div style={{fontFamily: hand, fontSize: 44, color: '#FFB3BD'}}>一夜没睡</div></In></Abs>
      {/* the ruler between the two tops */}
      {f >= p.b + 8 && <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={300} y1={880 - 297} x2={720} y2={880 - 297} stroke={P.screen} strokeWidth={4} strokeDasharray="10 12" opacity={ramp(f, p.b + 8, p.b + 14)} />
        <line x1={300} y1={880 - 297 * grow} x2={720} y2={880 - 297 * grow} stroke="#FFB3BD" strokeWidth={4} strokeDasharray="10 12" opacity={ramp(f, p.b + 8, p.b + 14)} />
      </svg>}
      <Abs x={560} y={140}><In f={f} at={p.c - 26}><Roll f={f} start={p.c - 26} land={p.c} to={60} prefix="+" unit="%" size={170} color="#FFB3BD" /></In></Abs>
    </>, <>
      {/* gloomy pictures flying past in front of it: a storm cloud, a crack */}
      <Flight f={f} start={p.a} n={4} every={8} dur={30} a={[-200, 380]} b={[1100, 300]} lift={0.1} spin={14} render={(i) => (
        <div style={{width: 200, height: 150, borderRadius: 16, background: i % 2 ? '#30364A' : '#262C40', border: `6px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={110} height={90} viewBox="0 0 110 90">{i % 2
            ? <path d="M20 10 L50 44 L36 50 L70 84 M60 10 L76 34" fill="none" stroke="#9AA4C2" strokeWidth={6} strokeLinecap="round" />
            : <><path d="M20 50 Q10 26 36 26 Q44 6 66 16 Q92 12 90 40 Q104 52 84 60 H28 Q14 60 20 50Z" fill="#5A6380" /><path d="M54 60 L44 80 L58 76 L50 90" fill="none" stroke="#FFD43B" strokeWidth={5} /></>}</svg>
        </div>)} />
    </>)}
    <Sticker x={250} y={40} p={pop(f, -10, 9)} rot={-4} size={38} bg={P.screen} color={P.ink}>一夜未睡的实验</Sticker>
    <Abs x={40} y={100} style={{opacity: 0.7}}><div style={{fontFamily: mono, fontSize: 26, color: P.screen}}>Yoo 等 2007 · Current Biology</div></Abs>
  </>;
};
Almonds.backdrop = backdrop(() => 0, 1080, '脑成像实验');
Almonds.sfx = (cue) => {
  const p = almondPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a, kind: 'whoosh', gain: 0.08}, {at: p.b - 2, kind: 'pop', gain: 0.1}, {at: p.b + 8, kind: 'fs-heartbeat', gain: 0.1}, {at: p.c, kind: 'stamp', gain: 0.14}];
};

/* ---------- 6 clock: a 24-hour dial; good mood bottoms out between 1 and 4 a.m. (hypothesis) ---------- */

const clockPlan = (cue: Cue) => ({a: cue('a', 59), b: cue('b', 94), c: cue('c', 149)});
const R = 330, CX = 450, CY = 560;
/** Good mood around the clock (a sketch of the hypothesis' shape, not data): high in the morning, lowest at 1–4. */
const moodAt = (h: number) => {
  const d = Math.min(Math.abs(h - 2.5), 24 - Math.abs(h - 2.5));
  return 0.6 + 0.32 * Math.cos(((h - 10) / 24) * Math.PI * 2) - 0.45 * Math.exp(-(d * d) / 2.5);
};
const pt = (h: number, r: number): [number, number] => {
  const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
};
const Clock: Scene = ({f, cue}) => {
  const p = clockPlan(cue);
  const draw = ramp(f, 4, p.a + 20);
  const hh = 22 + 6 * ease.inOutCubic(ramp(f, p.a - 10, p.b - 6)); // 22:00 → 04:00 (28)
  const low = ramp(f, p.b - 4, p.b + 8);
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 0.96}, 1], [0, {z: 1.02}, p.a], [p.a, {x: 520, y: 380, z: 1.22}, 24], [p.c - 6, {x: 540, y: 340, z: 1.36}, 20]]);
  const path: string[] = [];
  const steps = Math.floor(96 * draw);
  for (let i = 0; i <= steps; i++) {
    const h = 6 + (i / 96) * 24;
    const [x, y] = pt(h, R * (0.3 + 0.62 * moodAt(h % 24)));
    path.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const [lx, ly] = pt(2.5, R * (0.3 + 0.62 * moodAt(2.5)));
  const arcPath = (h1: number, h2: number, r: number) => {
    const [x1, y1] = pt(h1, r), [x2, y2] = pt(h2, r);
    return `M${CX} ${CY} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };
  return <>
    {stage(cam, <></>, <>
      <ContactShadow x={CX} y={CY + R + 40} w={2 * R} o={0.4} />
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs><radialGradient id="dial" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#2B3A74" /><stop offset="1" stopColor="#141C3C" /></radialGradient></defs>
        <circle cx={CX} cy={CY + 16} r={R + 30} fill="#060A1A" />
        <circle cx={CX} cy={CY} r={R + 30} fill="url(#dial)" stroke={P.ink} strokeWidth={8} />
        {/* day half lighter */}
        <path d={arcPath(6, 18, R + 22)} fill="#FFE9A8" opacity={0.10} />
        {/* 1–4 a.m. sector deepens */}
        <path d={arcPath(1, 4, R + 22)} fill="#05081A" opacity={0.85 * ramp(f, p.a, p.a + 14)} />
        <path d={arcPath(1, 4, R + 22)} fill="none" stroke={P.cool} strokeWidth={5} opacity={ramp(f, p.a, p.a + 14)} />
        {Array.from({length: 24}, (_, i) => {
          const [x1, y1] = pt(i, R + 18), [x2, y2] = pt(i, R + (i % 6 ? 6 : -6));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.screen} strokeWidth={i % 6 ? 3 : 6} strokeLinecap="round" opacity={0.7} />;
        })}
        {[0, 6, 12, 18].map((h) => {
          const [x, y] = pt(h, R - 46);
          return <text key={h} x={x} y={y + 16} textAnchor="middle" fontFamily={mono} fontWeight={800} fontSize={44} fill={P.screen}>{h}</text>;
        })}
        <path d={path.join(' ')} fill="none" stroke="#FFD86B" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        {/* the hand */}
        {(() => { const [hx, hy] = pt(hh % 24, R - 10); return <line x1={CX} y1={CY} x2={hx} y2={hy} stroke={P.white} strokeWidth={10} strokeLinecap="round" />; })()}
        <circle cx={CX} cy={CY} r={18} fill={P.white} stroke={P.ink} strokeWidth={5} />
        {low > 0 && <><circle cx={lx} cy={ly} r={18 + 30 * (1 - low)} fill="#FFD86B" opacity={low} /><circle cx={lx} cy={ly} r={34} fill="none" stroke="#FFD86B" strokeWidth={4} opacity={low * 0.6} /></>}
      </svg>
      <Abs x={lx + 40} y={ly - 40}><In f={f} at={p.b + 2}><div style={{fontFamily: hand, fontSize: 52, color: '#FFD86B'}}>一天最低</div></In></Abs>
      <Abs x={CX + 70} y={CY - R - 130}><In f={f} at={p.a + 2}><TimeChip t="1:00–4:00" size={60} /></In></Abs>
      {/* dark clouds rise out of the low point */}
      {[0, 1, 2].map((i) => {
        const q = pop(f, p.c + i * 6, 12);
        if (q < -0.5) return null;
        return <div key={i} style={{position: 'absolute', left: lx - 60 + (i - 1) * 90, top: ly - 120 - i * 40 - 30 * ramp(f, p.c, p.c + 60), transform: `scale(${Math.max(0, q)})`, opacity: clamp(q * 2)}}>
          <svg width={140} height={90} viewBox="0 0 110 70"><path d="M20 50 Q8 26 34 26 Q42 6 64 14 Q92 10 90 38 Q104 50 84 60 H26 Q12 60 20 50Z" fill="#4A5272" stroke={P.ink} strokeWidth={5} /></svg>
        </div>;
      })}
    </>)}
    <Sticker x={250} y={40} p={pop(f, -10, 9)} rot={-4} size={38} bg="#FFD86B" color={P.ink}>假说 · Tubbs 等 2022</Sticker>
  </>;
};
Clock.backdrop = backdrop(() => 0, undefined, '曲线为示意，非实测数据', P.night, P.deep);
Clock.sfx = (cue) => {
  const p = clockPlan(cue);
  return [{at: 2, kind: 'fs-watch-tick', gain: 0.1}, {at: p.a, kind: 'whoosh-short', gain: 0.08}, {at: p.b, kind: 'chime', gain: 0.06}, {at: p.c, kind: 'fs-wind-click', gain: 0.08}];
};

/* ---------- 7 cave: night was dangerous; those who expected the worst lived (researchers' guess) ---------- */

const cavePlan = (cue: Cue) => ({a: cue('a', 23), b: cue('b', 84), c: cue('c', 128)});
const Fire: React.FC<{f: number; x: number; y: number; s?: number}> = ({f, x, y, s = 1}) => {
  const fl = 1 + 0.08 * Math.sin(f / 2.3) + 0.05 * Math.sin(f / 1.4 + 1);
  return <div style={{position: 'absolute', left: x - 70 * s, top: y - 150 * s, width: 140 * s, height: 160 * s}}>
    <svg width={140 * s} height={160 * s} viewBox="0 0 140 160" style={{overflow: 'visible'}}>
      <path d="M20 150 L120 130 M24 130 L118 152" stroke="#5A3A22" strokeWidth={16} strokeLinecap="round" />
      <g transform={`translate(70 140) scale(${fl} ${fl * (1 + 0.06 * Math.sin(f / 1.7))}) translate(-70 -140)`}>
        <path d="M70 10 C100 50 116 80 106 110 C100 134 40 134 34 110 C26 84 50 70 56 40 C62 58 66 60 70 10Z" fill="#FF9A3C" stroke={P.ink} strokeWidth={5} />
        <path d="M70 60 C86 80 92 96 86 112 C80 126 60 126 54 112 C50 98 62 90 70 60Z" fill="#FFE07A" />
      </g>
    </svg>
  </div>;
};
const Ancestor: React.FC<{f: number; x: number; y: number; s?: number; look?: number; torch?: number}> = ({f, x, y, s = 1, look = 0, torch = 0}) => {
  const turnX = 1 - 2 * clamp(look);
  return <div style={{position: 'absolute', left: x - 70 * s, top: y - 220 * s, width: 140 * s, height: 220 * s, transform: `scaleX(${Math.abs(turnX) < 0.1 ? 0.1 * Math.sign(turnX || 1) : turnX})`}}>
    <svg width={140 * s} height={220 * s} viewBox="0 0 140 220" style={{overflow: 'visible'}}>
      <path d="M36 216 Q30 130 70 112 Q110 130 104 216 Z" fill="#8A5A3A" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={70} cy={78} r={40} fill="#D9A27A" stroke={P.ink} strokeWidth={6} />
      <path d="M30 70 Q34 26 72 30 Q112 30 110 72 Q92 50 70 52 Q44 52 30 70Z" fill="#2A1A12" stroke={P.ink} strokeWidth={5} />
      <ellipse cx={86} cy={80} rx={6} ry={look > 0.5 ? 9 : 7} fill={P.ink} />
      {torch > 0 && <g transform={`rotate(${-30 + 40 * (1 - torch)} 100 150)`}><line x1={100} y1={150} x2={150} y2={60} stroke="#5A3A22" strokeWidth={12} strokeLinecap="round" />
        <path d="M150 20 C170 44 172 60 160 72 C150 80 136 76 136 62 C136 48 148 44 150 20Z" fill="#FFB84A" stroke={P.ink} strokeWidth={4} transform={`scale(${1 + 0.1 * Math.sin(f / 2)})`} style={{transformOrigin: '150px 60px'}} /></g>}
    </svg>
  </div>;
};
const Cave: Scene = ({f, cue}) => {
  const p = cavePlan(cue);
  const torch = ramp(f, p.b + 4, p.b + 14);
  const glowR = 380 + 260 * torch;
  const eyesBack = ramp(f, p.c - 4, p.c + 14);
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.25}, 1], [0, {z: 1.0}, 30], [p.b, {x: 420, y: 640, z: 1.12}, 18]]);
  return <>
    {stage(cam, <>
      {/* far hills and trees in the dark */}
      <svg width={900} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M-200 700 Q100 520 300 620 Q520 480 760 600 Q900 540 1100 640 L1100 1200 L-200 1200Z" fill="#0D1530" />
        {[60, 180, 700, 830].map((x, i) => <path key={i} d={`M${x} ${760} L${x - 50} ${760} L${x} ${560 - i * 10} L${x + 50} 760Z`} fill="#0A1028" />)}
      </svg>
    </>, <>
      {/* the light of the fire on the ground */}
      <div style={{position: 'absolute', left: 430 - glowR, top: 860 - glowR * 0.6, width: glowR * 2, height: glowR * 1.2, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,170,80,0.45), rgba(255,140,60,0.12) 50%, transparent 72%)'}} />
      {/* bushes with eyes */}
      {[[90, 760], [780, 740], [660, 640], [190, 620]].map(([x, y], i) => {
        const on = ramp(f, p.a + i * 8, p.a + i * 8 + 8) * (1 - eyesBack), blink = (f + i * 17) % 70 > 66;
        return <div key={i} style={{position: 'absolute', left: x - 110, top: y - 70}}>
          <svg width={220} height={140} viewBox="0 0 220 140"><path d="M10 130 Q0 60 60 54 Q80 6 130 24 Q200 20 206 90 Q218 128 190 132Z" fill="#0B1A26" stroke="#04070F" strokeWidth={5} />
            {on > 0 && !blink && <><ellipse cx={86} cy={80 + eyesBack * 10} rx={10} ry={6} fill="#FFE45C" opacity={on} /><ellipse cx={124} cy={80 + eyesBack * 10} rx={10} ry={6} fill="#FFE45C" opacity={on} /></>}</svg>
        </div>;
      })}
      <Fire f={f} x={330} y={900} s={2.0} />
      <ContactShadow x={600} y={900} w={220} o={0.5} />
      <Ancestor f={f} x={600} y={900} s={2.1} look={ramp(f, p.b - 6, p.b + 4)} torch={torch} />
      <Abs x={540} y={380}><In f={f} at={p.c + 6}><div style={{fontFamily: hand, fontSize: 72, color: '#FFE07A'}}>✓ 活下来了</div></In></Abs>
    </>)}
    <Sticker x={220} y={40} p={pop(f, -10, 9)} rot={-4} size={38} bg="#FFB84A" color={P.ink}>研究者推测</Sticker>
  </>;
};
Cave.backdrop = backdrop(() => 0, 1100, 'Tubbs 等 2022', P.deep, P.deep);
Cave.sfx = (cue) => {
  const p = cavePlan(cue);
  return [{at: 0, kind: 'fs-wind-click', gain: 0.06}, {at: p.a + 4, kind: 'tick', gain: 0.06}, {at: p.b - 4, kind: 'whoosh-short', gain: 0.1}, {at: p.b + 10, kind: 'fs-impact-deep', gain: 0.08}, {at: p.c + 6, kind: 'chime', gain: 0.06}];
};

/* ---------- 8 quiet: no messages, no to-dos; the day's leftovers come back in a queue ---------- */

const quietPlan = (cue: Cue) => ({a: cue('a', 43), b: cue('b', 88), c: cue('c', 125)});
const NOTES = ['那句话说重了吗', '方案又没过', '他为什么不回'];
const Quiet: Scene = ({f, cue}) => {
  const p = quietPlan(cue);
  const cam = camAt(f, [[-1, {x: 450, y: 600, z: 1.0}, 1], [0, {z: 1.04}, p.b], [p.b, {x: 420, y: 520, z: 0.94}, 20]]);
  const bubbles = [['消息', '99+'], ['待办', '3'], ['群聊', '@你']];
  return <>
    {stage(cam, <Window f={f} k={0} x={600} y={120} w={260} h={330} />, <>
      <Me f={f} x={430} y={1080} s={1.45} pose="lie" eyes="open" phone={0} />
      {/* the phone face down on the blanket */}
      <div style={{position: 'absolute', left: 560, top: 800, width: 120, height: 66, borderRadius: 14, background: '#1A2036', border: `5px solid ${P.ink}`, transform: 'rotate(-8deg)'}} />
      {bubbles.map(([t, n], i) => {
        const at = p.a + i * 9, q = 1 - ramp(f, at, at + 6);
        if (q <= 0) return null;
        return <div key={t} style={{position: 'absolute', left: 30 + i * 280, top: 280 + (i % 2) * 110, transform: `scale(${q * (1 + 0.2 * Math.sin(Math.PI * (1 - q)))})`, opacity: q}}>
          <div style={{background: '#FFFFFF', border: `5px solid ${P.ink}`, borderRadius: 28, padding: '14px 26px', fontFamily: font, fontWeight: 900, fontSize: 56, color: P.ink, whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${P.ink}`}}>
            {t} <span style={{color: '#fff', background: P.red, borderRadius: 20, padding: '0 12px', fontSize: 34}}>{n}</span></div>
        </div>;
      })}
      {NOTES.map((t, i) => {
        const at = p.b + i * 8, q = pop(f, at, 12);
        if (q < -0.5) return null;
        // float in the dark, then queue up and fly to the head (stage ~ (300, 720))
        const go = ramp(f, p.c + i * 10, p.c + 24 + i * 10);
        const x0 = 20 + i * 290, y0 = 200 + (i % 2) * 170 + Math.sin(f / 16 + i) * 10;
        const x1 = 40 + i * 290, y1 = 120;
        const x = x0 + (x1 - x0) * ramp(f, p.c - 10, p.c), y = y0 + (y1 - y0) * ramp(f, p.c - 10, p.c);
        const tx = x + (240 - x) * go, ty = y + (700 - y) * go;
        return <div key={t} style={{position: 'absolute', left: tx, top: ty, transform: `rotate(${(i - 1) * 5}deg) scale(${Math.max(0, q) * (1 - 0.7 * go)})`, opacity: clamp(q * 2) * (1 - ramp(f, p.c + 20 + i * 10, p.c + 26 + i * 10))}}>
          <div style={{width: 280, padding: '26px 20px', background: '#FFE98A', border: `5px solid ${P.ink}`, boxShadow: '0 16px 30px rgba(0,0,0,0.45)', fontFamily: hand, fontSize: 52, color: P.ink, lineHeight: 1.25}}>{t}</div>
        </div>;
      })}
    </>)}
  </>;
};
Quiet.backdrop = backdrop(() => 0, 960, '', P.night, P.deep);
Quiet.sfx = (cue) => {
  const p = quietPlan(cue);
  return [{at: 0, kind: 'fs-watch-tick', gain: 0.06}, ...[0, 1, 2].map((i) => ({at: p.a + i * 9, kind: 'pop', gain: 0.1})), ...[0, 1, 2].map((i) => ({at: p.b + i * 8, kind: 'paper', gain: 0.07})),
    {at: p.c, kind: 'whoosh', gain: 0.08}];
};

/* ---------- 9 tired: the light bulb of 想通了 turns out to be a battery at 3 % ---------- */

const tiredPlan = (cue: Cue) => ({a: cue('a', 55), b: cue('b', 87)});
const Bulb: React.FC<{on: number; w?: number}> = ({on, w = 200}) => (
  <svg width={w} height={w * 1.4} viewBox="0 0 200 280" style={{overflow: 'visible', display: 'block'}}>
    {on > 0 && <circle cx={100} cy={100} r={150} fill="#FFE07A" opacity={0.35 * on} style={{filter: 'blur(20px)'}} />}
    <path d="M100 10 C40 10 14 60 24 104 C32 140 64 158 66 196 H134 C136 158 168 140 176 104 C186 60 160 10 100 10Z" fill={mix('#3A4468', '#FFE07A', on)} stroke={P.ink} strokeWidth={8} />
    <path d="M80 196 V140 L100 120 L120 140 V196" fill="none" stroke={P.ink} strokeWidth={6} />
    <rect x={64} y={196} width={72} height={52} rx={10} fill="#9AA4C2" stroke={P.ink} strokeWidth={7} />
    <ellipse cx={66} cy={70} rx={16} ry={30} fill="#fff" opacity={0.4} transform="rotate(25 66 70)" />
  </svg>
);
const Tired: Scene = ({f, cue}) => {
  const p = tiredPlan(cue);
  const flicker = f >= p.a && f < p.b - 6 ? (Math.sin((f - p.a) * 1.7) > 0.2 ? 1 : 0.15) : 1;
  const on = (f < p.b - 6 ? ramp(f, 4, 12) : 0) * flicker;
  const morph = ramp(f, p.b - 6, p.b + 4);
  const cam = camAt(f, [[-1, {x: 420, y: 520, z: 1.1}, 1], [0, {z: 1.2}, p.b], [p.b, {z: 1.24, y: 500}, 10]]);
  return <>
    {stage(cam, <></>, <>
      <Me f={f} x={480} y={1150} s={1.8} pose="lie" eyes={f >= p.b ? 'sad' : 'open'} phone={1 - 0.7 * morph} />
      <div style={{position: 'absolute', left: 230, top: 160, transform: `scale(${(1 - morph) * Math.max(0, pop(f, 2, 10))})`, transformOrigin: '100px 280px'}}><Bulb on={on} /></div>
      <div style={{position: 'absolute', left: 200, top: 300, transform: `scale(${Math.max(0, pop(f, p.b - 2, 10)) * 1.15})`, transformOrigin: '120px 50px'}}><Battery level={0.06} red w={260} /></div>
      <Abs x={210} y={440}><In f={f} at={p.b + 4}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 96, color: P.red}}>3%</div></In></Abs>
      {f < p.b - 6 && <Annot x={560} y={230} tx={440} ty={260} f={f} at={14} size={54} color="#FFE07A">想通了</Annot>}
    </>)}
  </>;
};
Tired.backdrop = backdrop((f, cue) => ramp(f, tiredPlan(cue).b - 6, tiredPlan(cue).b + 4), 1000, '', P.night, '#060914');
Tired.sfx = (cue) => {
  const p = tiredPlan(cue);
  return [{at: 6, kind: 'chime', gain: 0.07}, {at: p.a, kind: 'tick', gain: 0.07}, {at: p.a + 6, kind: 'tick', gain: 0.07}, {at: p.b - 4, kind: 'block', gain: 0.12}];
};

/* ---------- 10 draft: into the drawer; sleep; 08:00 ---------- */

const draftPlan = (cue: Cue) => ({a: cue('a', 52), b: cue('b', 86), c: cue('c', 104)});
const Drawer: React.FC<{x: number; y: number; open: number; k: number}> = ({x, y, open, k}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <ContactShadow x={130} y={250} w={300} o={0.35} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 260, height: 250, borderRadius: 18, background: mix('#2A2F4F', '#C98F5A', k), border: `6px solid ${P.ink}`}} />
    <div style={{position: 'absolute', left: 20 - open * 10, top: 100 + open * 30, width: 220 + open * 20, height: 110, borderRadius: 14, background: mix('#3A4068', '#E3AE78', k), border: `6px solid ${P.ink}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, color: mix('#CFE3FF', '#5A3A22', k)}}>草稿箱</div>
  </div>
);
const Draft: Scene = ({f, cue}) => {
  const p = draftPlan(cue);
  const k = ramp(f, p.c - 4, p.c + 14);
  const into = ramp(f, p.a, p.a + 16);
  const open = ramp(f, p.a - 8, p.a) * (1 - ramp(f, p.a + 16, p.a + 22));
  const sleeping = f >= p.b - 4;
  const cam = camAt(f, [[-1, {x: 450, y: 520, z: 1.06}, 1], [p.a - 6, {x: 480, y: 640, z: 1.0}, 14], [p.b - 6, {x: 450, y: 560, z: 0.94}, 18]]);
  return <>
    {stage(cam, <Window f={f} k={k} x={560} y={80} w={300} h={380} moon={1 - ramp(f, p.b, p.c)} sun={ramp(f, p.c - 4, p.c + 18)} />, <>
      <Sunbeam k={k} />
      <Me f={f} x={360} y={1080} s={1.35} pose={sleeping ? 'sleep' : 'lie'} eyes={sleeping ? 'closed' : 'open'} k={k} phone={sleeping ? 0 : 1} />
      <Drawer x={620} y={790} open={open} k={k} />
      {sleeping && !k && [0, 1, 2].map((i) => {
        const t = ((f - p.b + i * 12) % 36) / 36;
        return <div key={i} style={{position: 'absolute', left: 300 + t * 80 + i * 10, top: 640 - t * 140, fontFamily: font, fontWeight: 900, fontSize: 50 + i * 10, color: P.screen, opacity: Math.sin(Math.PI * t)}}>Z</div>;
      })}
      {into < 1 && <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${into * 560}px, ${into * 720}px) scale(${1 - 0.8 * into})`, transformOrigin: '400px 200px', opacity: 1 - ramp(f, p.a + 12, p.a + 16)}}>
        <Post f={f} x={90} y={60} time="02:13" text={TEXT} rot={-2} />
      </div>}
    </>)}
    <Abs x={0} y={30} w={900} style={{textAlign: 'center', opacity: ramp(f, p.c - 2, p.c + 6)}}><TimeChip t="08:00" light size={96} /></Abs>
  </>;
};
Draft.backdrop = backdrop((f, cue) => ramp(f, draftPlan(cue).c - 4, draftPlan(cue).c + 14), 960);
Draft.sfx = (cue) => {
  const p = draftPlan(cue);
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a, kind: 'fs-paper-slide', gain: 0.14}, {at: p.a + 18, kind: 'thud', gain: 0.1}, {at: p.c - 2, kind: 'chime', gain: 0.14}];
};

/* ---------- 11 end: the card in the morning light, 删除 / 发送; 发送 lights, the time reads 08:00 ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 22), b: cue('b', 44)});
const End: Scene = ({f, cue}) => {
  const p = endPlan(cue);
  const up = ease.outCubic(ramp(f, -4, 14));
  const cam = camAt(f, [[-1, {x: 450, y: 560, z: 1.0}, 1], [0, {z: 1.06}, 160]]);
  return <>
    {stage(cam, <Window f={f} k={1} x={560} y={80} w={300} h={380} moon={0} sun={1} />, <>
      <Sunbeam k={1} />
      <Me f={f} x={330} y={1080} s={1.3} pose="sit" eyes="open" k={1} phone={0} />
      <Drawer x={620} y={790} open={1 - ramp(f, 20, 30) * 0} k={1} />
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - up) * 500}px) scale(${0.4 + 0.6 * up})`, transformOrigin: '750px 900px', opacity: clamp(up * 2)}}>
        <Post f={f} x={100} y={120} time="02:13" flipAt={p.b} time2="08:00" text={TEXT} rot={1} buttons={ramp(f, p.a - 4, p.a + 8)} sendLit={ramp(f, p.b, p.b + 10)} />
      </div>
    </>)}
  </>;
};
End.backdrop = backdrop(() => 1, 960);
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: 0, kind: 'fs-paper-slide', gain: 0.1}, {at: p.a - 2, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'chime', gain: 0.12}];
};

/** Cover anchor (880 × 800, rendered at f = 0): the person in bed in the phone's light, the card at 02:13. */
const Cover: Scene = () => <>
  <Me f={0} x={440} y={790} s={1.35} pose="lie" eyes="sad" />
  <Post f={0} x={60} y={0} w={760} time="02:13" text={TEXT} />
</>;

export const lateNightEmoScenes: Record<string, Scene> = {
  'lne.hook': Hook, 'lne.feel': Feel, 'lne.turn': Turn, 'lne.brake': Brake, 'lne.almond': Almonds, 'lne.clock': Clock, 'lne.cave': Cave, 'lne.quiet': Quiet,
  'lne.tired': Tired, 'lne.draft': Draft, 'lne.end': End, 'lne.cover': Cover,
};
