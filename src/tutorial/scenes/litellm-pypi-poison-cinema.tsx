import React from 'react';
import {clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, Cmd, DIM, Dot, FAINT, GOLD, HAIR, Headline, INK, Marker, Pool, RED, Reveal, Root, Surface, Terminal, display, font, leave, mono, rise} from '../cinema';

// litellm-pypi-poison, remade in the cinema look (2026-10-22) to fix "cluttered, looks cheap": same narration, same
// facts, same cues as litellm-pypi-poison.tsx. Per scene: one headline that states the point, one hero on one surface,
// gold as the only accent and red only for "poisoned / stolen". No tags, chips, grids or per-element "示意" labels —
// the one disclaimer lives in the top bar (tutorial.credit). Keys on screen are fake and masked.

const KEYS = [{n: 'DeepSeek Key', tail: '3f9a', fresh: 'c204'}, {n: '豆包 Key', tail: 'b71c', fresh: '9e5d'}, {n: 'Kimi Key', tail: '08de', fresh: 'a6f1'}];
const red = (s: string) => <span style={{color: RED}}>{s}</span>;
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
/** A soft red band behind a row that has just been hit (rows are position: relative). */
const Band: React.FC<{k: number}> = ({k}) => (k > 0 ? <div style={{position: 'absolute', left: -40, right: -40, top: 0, bottom: 0,
  background: `linear-gradient(90deg, rgba(255,107,91,${0.16 * k}), rgba(255,107,91,${0.04 * k}))`, transform: `scaleX(${k})`, transformOrigin: '0 50%'}} /> : null);
const masked = (tail: string) => <>sk-<span style={{letterSpacing: 2, opacity: 0.55}}>••••••</span>{tail}</>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

/** A fake, masked key on a surface; fixed height so the three line up whatever the script. */
const KeyCard: React.FC<{name: string; tail: string; accent?: string}> = ({name, tail, accent}) => (
  <Surface pad="0 22px 0 28px" accent={accent} style={{height: 136, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
    <div style={{fontFamily: display, fontWeight: 800, fontSize: 32, lineHeight: '42px', color: INK, whiteSpace: 'nowrap'}}>{name}</div>
    <div style={{fontFamily: mono, fontWeight: 700, fontSize: 28, lineHeight: '38px', color: DIM, marginTop: 6, whiteSpace: 'nowrap'}}>{masked(tail)}</div>
  </Surface>
);

/* ---------- 1 hook: the install, your keys, gone ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 59), b: cue('b', 111)});
const LOG = ['Collecting litellm', 'Downloading litellm-1.107.0', 'Successfully installed'];
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={560} />
    <Abs y={0}><Headline f={f} at={-24} lines={['装个AI工具包', <>API Key {red('被偷了')}</>]} size={104} /></Abs>
    <Abs y={300}>
      <Terminal size={44}>
        <Cmd f={f} at={-30} text="pip install litellm" />
        {LOG.map((l, i) => f >= 6 + i * 10 && <div key={l} style={{color: i === 2 ? INK : FAINT}}>{l}</div>)}
      </Terminal>
    </Abs>
    {KEYS.map((k, i) => {
      const lit = rise(f, p.a + i * 4, 12);
      const go = ease.inCubic(clamp((f - p.b - i * 4) / 16));
      return <Abs key={k.n} x={i * 306} y={800} w={282} style={{opacity: rise(f, 18 + i * 4) * (1 - go), transform: `translate(${go * 420}px, ${-go * 260}px) rotate(${-go * 10}deg)`,
        filter: go > 0 ? `blur(${go * 10}px)` : undefined}}>
        <KeyCard name={k.n} tail={k.tail} accent={go > 0 ? RED : lit > 0 ? GOLD : undefined} />
      </Abs>;
    })}
    {/* where the keys were: empty dashed slots — the loss is shown, the caption says it */}
    {KEYS.map((k, i) => <Abs key={`slot-${k.n}`} x={i * 306} y={800} w={282} h={136} style={{opacity: rise(f, p.b + 10, 14), borderRadius: 26,
      border: `3px dashed ${RED}`, background: 'rgba(255,107,91,0.06)'}} />)}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 6, kind: 'tick', gain: 0.08}, {at: p.a, kind: 'tap', gain: 0.12}, {at: p.b, kind: 'whoosh', gain: 0.14}];
};

/* ---------- 2 the package: LiteLLM 1.107.0, poisoned ---------- */

const poisonPlan = (cue: Cue) => ({a: cue('a', 107), b: cue('b', 149)});
const Poison: Scene = ({f, dur, cue}) => {
  const p = poisonPlan(cue);
  const turn = rise(f, p.b - 2, 10);
  return <Root f={f} dur={dur}>
    <Pool x={300} y={420} o={0.12} />
    <Abs y={40}><Reveal f={f} at={-10} dy={16}><Big size={36} c={DIM} w={600} style={{fontFamily: font, letterSpacing: 4}}>开源库</Big></Reveal></Abs>
    <Abs y={100}><Reveal f={f} at={-6}><Big size={168} w={800} style={{letterSpacing: -3}}>LiteLLM</Big></Reveal></Abs>
    <Abs y={300}><Reveal f={f} at={14}>
      <Big size={220} w={800} c={turn > 0 ? RED : GOLD} style={{letterSpacing: -6, fontVariantNumeric: 'tabular-nums'}}>1.107.0</Big>
    </Reveal></Abs>
    {/* "很多人都在用": a field of users fills in while it's said, then turns red row by row on "木马" */}
    <Abs y={600} h={200}>
      {Array.from({length: 36}, (_, i) => {
        const col = i % 12, row = Math.floor(i / 12);
        const k = rise(f, 30 + (col + row * 3) * 2.5, 12), bad = rise(f, p.b - 2 + col * 1.5 + row * 3, 10);
        return <div key={i} style={{position: 'absolute', left: col * 75, top: row * 66, width: 44, height: 44, borderRadius: 22, opacity: k,
          transform: `scale(${0.6 + 0.4 * k})`, background: bad > 0 ? `rgba(255,107,91,${0.35 + 0.55 * bad})` : 'rgba(255,255,255,0.16)'}} />;
      })}
    </Abs>
    <Abs y={830}><Reveal f={f} at={p.b}>
      <Big size={104} c={INK}><Marker p={rise(f, p.b + 8, 14)} color={RED}>被塞了木马</Marker></Big>
    </Reveal></Abs>
    <Abs y={980}><Reveal f={f} at={p.b + 18} dy={12}><Big size={40} c={FAINT} w={500} style={{fontFamily: font}}>10月21日 · 官方仓库已下架</Big></Reveal></Abs>
  </Root>;
};
Poison.sfx = (cue) => {
  const p = poisonPlan(cue);
  return [{at: 14, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'thud', gain: 0.14}];
};

/* ---------- 3 it runs whenever Python starts, imported or not ---------- */

const autoPlan = (cue: Cue) => ({a: cue('a', 35), b: cue('b', 89), c: cue('c', 134)});
const RUNS = ['你的脚本', 'pip', '编辑器插件'];
const Auto: Scene = ({f, dur, cue}) => {
  const p = autoPlan(cue);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={640} o={0.12} />
    <Abs y={0}><Reveal f={f} at={-10} dy={16}><Big size={36} c={DIM} w={600} style={{fontFamily: font, letterSpacing: 4}}>最阴的是</Big></Reveal></Abs>
    <Abs y={56}><Headline f={f} at={p.a - 6} lines={['没用它', <>也会{red('中招')}</>]} size={104} /></Abs>
    <Abs y={430}><Reveal f={f} at={p.a + 6}>
      <Surface pad="34px 40px">
        <div style={{fontFamily: mono, fontWeight: 700, fontSize: 40, color: f >= p.c ? RED : FAINT, marginBottom: 18}}>Python 一启动{f >= p.c ? ' → 先跑它' : ''}</div>
        {RUNS.map((r, i) => <div key={r} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 26, padding: '16px 0', borderTop: i ? `1.5px solid ${HAIR}` : undefined}}>
          <Band k={rise(f, p.b + 6 + i * 8, 12)} />
          <Dot f={f} at={p.b + 6 + i * 8} />
          <span style={{fontFamily: display, fontWeight: 800, fontSize: 60, color: f >= p.b + 6 + i * 8 ? INK : DIM}}>{r}</span>
        </div>)}
      </Surface>
    </Reveal></Abs>
  </Root>;
};
Auto.sfx = (cue) => {
  const p = autoPlan(cue);
  return [...RUNS.map((_, i) => ({at: p.b + 6 + i * 8, kind: 'tick', gain: 0.08})), {at: p.c, kind: 'thud', gain: 0.12}];
};

/* ---------- 4 what it takes ---------- */

const stealPlan = (cue: Cue) => ({a: cue('a', 70), b: cue('b', 89), c: cue('c', 113), d: cue('d', 155)});
const Icon: React.FC<{k: string; c: string}> = ({k, c}) => (
  <svg width={84} height={84} viewBox="-65 -65 130 130" style={{flex: 'none'}}>
    <g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
      {k === 'key' && <><circle cx={-22} cy={0} r={22} /><path d="M0 0 H48 M34 0 V16 M46 0 V12" /></>}
      {k === 'cloud' && <path d="M-44 26 A26 26 0 0 1 -38 -22 A34 34 0 0 1 24 -30 A28 28 0 0 1 44 26 Z" />}
      {k === 'browser' && <><rect x={-48} y={-38} width={96} height={76} rx={10} /><path d="M-48 -14 H48" /><path d="M-10 10 H10 M-10 22 H10" /></>}
      {k === 'chip' && <><rect x={-32} y={-32} width={64} height={64} rx={8} />{[-16, 0, 16].map((v) => <path key={v} d={`M${v} -32 V-48 M${v} 32 V48 M-32 ${v} H-48 M32 ${v} H48`} />)}</>}
    </g>
  </svg>
);
const LOOT = [{k: 'key', t: 'SSH 密钥'}, {k: 'cloud', t: '云账号'}, {k: 'browser', t: '浏览器密码'}, {k: 'chip', t: '大模型 Key'}];
const Steal: Scene = ({f, dur, cue}) => {
  const p = stealPlan(cue);
  const ats = [8, p.a, p.a + 12, p.c];
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.1} />
    <Abs y={0}><Headline f={f} at={-10} lines={['它会翻走']} size={104} /></Abs>
    <Abs y={210}><Reveal f={f} at={0}>
      <Surface pad="14px 40px">
        {LOOT.map((l, i) => {
          const on = f >= ats[i];
          const go = ease.inCubic(clamp((f - p.d - i * 3) / 14));
          const k = rise(f, ats[i] - 6, 14);
          return <div key={l.t} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 34, padding: '26px 0', borderTop: i ? `1.5px solid ${HAIR}` : undefined,
            opacity: k * (1 - go), transform: `translate(${go * 300}px, ${(1 - k) * 30}px)`, filter: go > 0 ? `blur(${go * 8}px)` : k < 0.98 ? `blur(${(1 - k) * 8}px)` : undefined}}>
            <Band k={rise(f, ats[i], 12)} />
            <span style={{position: 'relative', display: 'flex'}}><Icon k={l.k} c={on ? RED : 'rgba(255,255,255,0.35)'} /></span>
            <span style={{position: 'relative', fontFamily: display, fontWeight: 800, fontSize: 68, color: on ? INK : FAINT, whiteSpace: 'nowrap'}}>{l.t}</span>
            <span style={{position: 'relative', marginLeft: 'auto'}}><Dot f={f} at={ats[i]} /></span>
          </div>;
        })}
      </Surface>
    </Reveal></Abs>
  </Root>;
};
Steal.sfx = (cue) => {
  const p = stealPlan(cue);
  return [{at: 8, kind: 'tick', gain: 0.08}, {at: p.a, kind: 'tick', gain: 0.08}, {at: p.a + 12, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08},
    {at: p.d, kind: 'whoosh', gain: 0.14}];
};

/* ---------- 5 step 1: check the version ---------- */

const s1Plan = (cue: Cue) => ({a: cue('a', 29), b: cue('b', 106)});
const Step1: Scene = ({f, dur, cue}) => {
  const p = s1Plan(cue);
  const out = p.a + 26;
  const hit = rise(f, p.b, 10);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} no={1} total={3} lines={['看版本号']} size={100} /></Abs>
    <Abs y={330}><Reveal f={f} at={p.a - 10}>
      <Terminal size={52}>
        <Cmd f={f} at={p.a} text="pip show litellm" cps={0.9} />
        <div style={{color: FAINT, opacity: f >= out ? 1 : 0}}>Name: litellm</div>
        <div style={{opacity: f >= out + 4 ? 1 : 0, color: hit > 0 ? RED : INK}}>Version: <Marker p={hit} color={RED}><span style={{color: hit > 0.5 ? INK : undefined}}>1.107.0</span></Marker></div>
      </Terminal>
    </Reveal></Abs>
    <Abs y={760}>
      <Reveal f={f} at={p.b + 8}><div style={{display: 'flex', alignItems: 'baseline', gap: 28}}><Big size={84} w={800} c={RED} style={{fontVariantNumeric: 'tabular-nums'}}>1.107.0</Big><Big size={60} c={INK}>中招</Big></div></Reveal>
      <Reveal f={f} at={p.b + 26}><div style={{display: 'flex', alignItems: 'baseline', gap: 28, marginTop: 10}}><Big size={84} w={800} c={DIM} style={{fontVariantNumeric: 'tabular-nums'}}>1.106.2</Big><Big size={60} c={DIM}>干净 {gold('✓')}</Big></div></Reveal>
    </Abs>
  </Root>;
};
Step1.sfx = (cue) => {
  const p = s1Plan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tap', gain: 0.14}];
};

/* ---------- 6 step 2: is cook.pth in site-packages? ---------- */

const s2Plan = (cue: Cue) => ({a: cue('a', 64)});
const TREE = ['litellm/', 'numpy/', 'cook.pth', 'requests/', 'openai/'];
const Step2: Scene = ({f, dur, cue}) => {
  const p = s2Plan(cue);
  const found = rise(f, p.a + 8, 12);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={620} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} no={2} total={3} lines={['找一个文件']} size={100} /></Abs>
    <Abs y={300}><Reveal f={f} at={0}>
      <Surface pad="30px 40px">
        <div style={{fontFamily: mono, fontWeight: 700, fontSize: 52, lineHeight: 1.6, color: INK}}>
          <div style={{color: GOLD}}>site-packages/</div>
          {TREE.map((t, i) => {
            const bad = t === 'cook.pth';
            return <div key={t} style={{position: 'relative', paddingLeft: 44, color: bad && found > 0 ? INK : bad ? DIM : FAINT, opacity: rise(f, 4 + i * 3, 10)}}>
              {bad && found > 0 && <div style={{position: 'absolute', left: 20, right: -20, top: 4, bottom: 4, borderRadius: 12, background: `rgba(255,107,91,${0.28 * found})`}} />}
              <span style={{position: 'relative'}}>{i < TREE.length - 1 ? '├ ' : '└ '}{t}</span>
            </div>;
          })}
        </div>
      </Surface>
    </Reveal></Abs>
    <Abs y={940}><Reveal f={f} at={p.a + 14}><Big size={72} c={RED}>有它，就是中了</Big></Reveal></Abs>
  </Root>;
};
Step2.sfx = (cue) => {
  const p = s2Plan(cue);
  return [{at: 4, kind: 'tick', gain: 0.06}, {at: p.a + 8, kind: 'tap', gain: 0.14}];
};

/* ---------- 7 step 3: reset every key, uninstall, back to 1.106.2 ---------- */

const s3Plan = (cue: Cue) => ({a: cue('a', 85), b: cue('b', 110)});
const Step3: Scene = ({f, dur, cue}) => {
  const p = s3Plan(cue);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} no={3} total={3} lines={['重置所有 Key']} size={100} /></Abs>
    <Abs y={330}><Reveal f={f} at={0}>
      <Surface pad="10px 40px">
        {KEYS.map((k, i) => {
          const dead = 14 + i * 8, fresh = 40 + i * 8;
          const strike = rise(f, dead, 8), swap = rise(f, fresh, 10);
          return <div key={k.n} style={{display: 'flex', alignItems: 'baseline', gap: 26, padding: '24px 0', borderTop: i ? `1.5px solid ${HAIR}` : undefined}}>
            <span style={{fontFamily: display, fontWeight: 800, fontSize: 50, color: INK, width: 330, whiteSpace: 'nowrap'}}>{k.n}</span>
            <span style={{position: 'relative', fontFamily: mono, fontWeight: 700, fontSize: 40, color: swap > 0 ? INK : DIM, whiteSpace: 'nowrap'}}>
              {masked(swap > 0 ? k.fresh : k.tail)}
              {swap <= 0 && <span style={{position: 'absolute', left: -6, top: '52%', height: 5, width: `${strike * 104}%`, background: RED, borderRadius: 3}} />}
            </span>
            <span style={{marginLeft: 'auto', fontFamily: font, fontWeight: 800, fontSize: 40, color: GOLD, opacity: swap}}>新</span>
          </div>;
        })}
      </Surface>
    </Reveal></Abs>
    <Abs y={800} style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
      <Reveal f={f} at={p.a}><Big size={76} c={DIM}>卸载</Big></Reveal>
      <Reveal f={f} at={p.b - 4}><Big size={76} c={FAINT}>→</Big></Reveal>
      <Reveal f={f} at={p.b}><Big size={76} w={800}>换回 {gold('1.106.2')}</Big></Reveal>
    </Abs>
  </Root>;
};
Step3.sfx = (cue) => {
  const p = s3Plan(cue);
  return [{at: 14, kind: 'tick', gain: 0.08}, {at: 40, kind: 'tap', gain: 0.1}, {at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'chime', gain: 0.1}];
};

/* ---------- 8 end: before you install, look at the version ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 61), b: cue('b', 90)});
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  return <Root f={f} dur={dur}>
    <Pool x={450} y={520} o={0.16} />
    <Abs y={120} style={leave(f, p.a - 8)}><Reveal f={f} at={-8}><Big size={80} c={DIM} style={{textAlign: 'center'}}>开源工具很好用</Big></Reveal></Abs>
    <Abs y={90}><Headline f={f} at={p.a - 8} lines={['但装之前', '多看一眼版本号']} mark={1} size={104} align="center" /></Abs>
    {KEYS.map((k, i) => <Abs key={k.n} x={i * 306} y={820} w={282}><Reveal f={f} at={-6 + i * 4}><KeyCard name={k.n} tail={k.fresh} accent={GOLD} /></Reveal></Abs>)}
    <Abs x={60} y={480} w={780}><Reveal f={f} at={p.b + 6}>
      <Terminal size={54}>
        <Cmd f={f} at={p.b + 8} text="pip show litellm" cps={1.4} />
        <div style={{opacity: f >= p.b + 24 ? 1 : 0}}>Version: 1.106.2 {gold('✓')}</div>
      </Terminal>
    </Reveal></Abs>
  </Root>;
};
End.sfx = (cue) => {
  const p = endPlan(cue);
  return [{at: p.b + 24, kind: 'chime', gain: 0.1}];
};

/* ---------- cover anchor (880 × 800): the install and the three keys ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={360} o={0.18} />
  <Abs x={-10} y={40}>
    <Terminal size={44}>
      <Cmd f={99} at={0} text="pip install litellm" />
      <div style={{color: FAINT}}>Downloading litellm-1.107.0</div>
      <div>Successfully installed</div>
    </Terminal>
  </Abs>
  {KEYS.map((k, i) => <Abs key={k.n} x={-10 + i * 306} y={470} w={282}><KeyCard name={k.n} tail={k.tail} accent={RED} /></Abs>)}
</div>;

export const litellmCinemaScenes: Record<string, Scene> = {
  'llmc.hook': Hook,
  'llmc.poison': Poison,
  'llmc.autorun': Auto,
  'llmc.steal': Steal,
  'llmc.step1': Step1,
  'llmc.step2': Step2,
  'llmc.step3': Step3,
  'llmc.end': End,
  'llmc.cover': Cover,
};
