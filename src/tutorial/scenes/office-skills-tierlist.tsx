import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, jet} from '../fonts';
import {Scene} from '../paper';
import {BEAT, Banner, Bean, Burst, CREAM, Card, Dots, INK, Judge, Rays, Shelf, Stripes, TIERS, Telop, hit, hop, pop, punch, rowFeet, rowTop, typed} from '../gameshow';

// office-skills-tierlist, made on the template lemo/game-show (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/game-show/STYLE.md): flat vector, ink outlines, hard shadows, bean contestants, judgement words, all on a
// 120 BPM grid (BEAT = 15 frames). 9:16: the stage is a five-row tier shelf (the post's own tier colours), y 330–1330; the
// telop caption plate sits under it (look.captions "telop"). Inputs: inputs/office-skills-tierlist/ (idea.md).
// Personal information (user, 2026-11-19): no handle, name or avatar of the post's author, no GitHub owner usernames — only
// project names (and companies). The ranking is the author's own ("原帖 · 纯主观"); star counts as of 2026-11-17 per the post.

const NAVY = '#26264A', NAVY2 = '#2F2F5C';
const T = Object.fromEntries(TIERS.map((t) => [t.id, t.color])) as Record<string, string>;
const OFFICIAL = '#D97757';
const IMG = (n: string) => staticFile(`images/office-skills-tierlist/${n}`);

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};
/** Stage wrapper: the set, a frame punch on the given hits, and the small source line. */
const Stage: React.FC<{f: number; set: React.ReactNode; hits?: number[]; src?: boolean; children: React.ReactNode}> = ({f, set, hits = [], src = true, children}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: NAVY}}>
    {set}
    <div style={{position: 'absolute', inset: 0, transform: `scale(${punch(f, hits)})`, transformOrigin: '50% 45%'}}>{children}</div>
    {src && <div style={{position: 'absolute', left: 44, top: 1342, fontFamily: font, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.78)'}}>原帖 · 纯主观排名 · 星数截至 2026-11-17</div>}
  </div>
);
/** A name label on a shelf row, right of the bean. */
const RowLabel: React.FC<{x: number; row: number; text: string; sub?: string; f?: number; at?: number}> = ({x, row, text, sub, f = 99, at = -99}) => {
  if (f < at) return null;
  const p = pop(f, at, 6);
  return <div style={{position: 'absolute', left: x, top: rowTop(row) + (sub ? 44 : 62), transform: `scale(${p})`, transformOrigin: '0 50%'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap', lineHeight: 1.2}}>{text}</div>
    {sub && <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: '#4A4F5C', whiteSpace: 'nowrap', marginTop: 4}}>{sub}</div>}
  </div>;
};

/* ---------- 1 hook: 0★ in 顶级, 848★ falls through to 拉完了 ---------- */

const HOOK_FALL = 14;
/** Feet y of the falling 848★ bean: hovers above the shelf, then falls (ease-in) to the 拉完了 row, landing at a + 12. */
const fallY = (f: number, a: number) => {
  const y0 = 318, y1 = rowFeet(4) + 8, land = a + 12;
  if (f < land - HOOK_FALL) return y0 + hop(f, 10);
  return f >= land ? y1 : y0 + (y1 - y0) * ease.inCubic(clamp(1 - (land - f) / HOOK_FALL));
};
const Hook = make(({f, cue}) => {
  const a = cue('a', 42), land = a + 12;
  const y848 = fallY(f, a);
  const falling = f >= land - HOOK_FALL && f < land;
  // row-top crossings while falling: a plop each (sfx below uses the same formula)
  return <Stage f={f} set={<Dots f={f} a={NAVY} dot="rgba(255,255,255,0.07)" />} hits={[0, land]}>
    <Banner f={f} at={-10} tag="办公 SKILL · 39 个" title="从夯到拉" color={T.top} />
    <Shelf f={f} />
    {/* 0★ — call-notes-to-actions, already in 顶级 */}
    <Bean x={330} y={rowFeet(1) + 8 + hop(f, 14)} scale={0.78} color="#8ED1FC" mark={{kind: 'ball', color: '#FFD23F'}} squash={hit(f, 0) * 0.8} mouth={f % 30 < 12} arms={f < 20 ? 'up' : 'down'}
      score="0★" scoreSize={46} />
    <RowLabel x={440} row={1} text="call-notes-to-actions" sub="会议纪要 · <100 行" />
    <Judge f={f} at={-10} text="顶级！" x={690} y={rowTop(1) - 34} size={100} fill={T.top} rot={-7} />
    {/* 848★ — claude-office-skills, falls through the rows */}
    <Bean x={falling || f >= land ? 330 : 690} y={y848} scale={0.78} color="#FF8FB1" mark={{kind: 'ball', color: '#8ED1FC'}} squash={hit(f, land)} mouth={f < land + 20} arms={f < land ? 'up' : 'down'}
      score="848★" scoreSize={46} scoreColor="#fff" rot={f < land ? Math.sin(f / 3) * 6 : 0} />
    {falling && <div style={{position: 'absolute', left: 300, top: y848 - 260, width: 60, height: 120, borderLeft: `6px solid ${INK}`, borderRight: `6px solid ${INK}`, opacity: 0.5}} />}
    <Burst f={f} at={land} x={330} y={rowFeet(4) - 40} r={80} color="#C3CAD9" />
    <RowLabel x={440} row={4} text="claude-office-skills" sub="Word · 848★" f={f} at={land + 3} />
    <Judge f={f} at={land + 2} text="拉完了！" x={690} y={rowTop(4) - 30} size={100} fill="#C3CAD9" rot={6} />
  </Stage>;
}, (cue) => {
  const a = cue('a', 42), land = a + 12;
  const cross = [1, 2, 3].map((i) => land - Math.round(HOOK_FALL * (1 - Math.sqrt((rowTop(i) - 318) / (rowFeet(4) - 318)))));
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: 2, kind: 'stamp', gain: 0.07}, ...cross.map((at) => ({at, kind: 'tick', gain: 0.06})), {at: land, kind: 'thud', gain: 0.1}, {at: land + 2, kind: 'stamp', gain: 0.08}];
});

/* ---------- 4 pptmaster: swallow a doc, spit a native PPTX ---------- */

const PptMaster = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 70), win = b + 40;
  const docY = f < a ? -400 : a + 10 > f ? 260 + (900 - 260) * ease.inCubic(clamp((f - a) / 10)) : 2000;
  const card = pop(f, b, 8);
  const tags = ['原生形状', '切换动画', '数据图表'];
  return <Stage f={f} set={<Stripes f={f} a="#C8431F" b="#D45530" />} hits={[a + 10, b, win]}>
    <Banner f={f} tag="ROUND 1 · PPT" title="PPT Master" color={T.top} />
    {/* floor band */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1240, height: 120, background: '#8E2C12', borderTop: `8px solid ${INK}`}} />
    {/* the doc falling into its mouth */}
    {f >= a && f < a + 10 && <Card x={150} y={docY - 1000} w={150} h={190} fill="#fff" r={10} sh={8} ow={6} rot={-8}>
      <div style={{position: 'absolute', left: 16, top: 16, background: '#185ABD', color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 26, padding: '0 8px', borderRadius: 6}}>.docx</div>
      {[70, 100, 130, 160].map((y) => <div key={y} style={{position: 'absolute', left: 16, right: 16, top: y, height: 8, background: '#C9CCD6', borderRadius: 4}} />)}
    </Card>}
    {/* the PPTX card it spits out: the repo's own example image */}
    {f >= b && <Card x={60} y={300 + (1 - card) * 300} w={950} h={600} fill="#1B1D2B" r={30} sh={14} rot={2 - 2 * card} scale={0.6 + 0.4 * card} origin="20% 100%">
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#C8431F', borderBottom: `6px solid ${INK}`, display: 'flex', alignItems: 'center', paddingLeft: 22, gap: 14}}>
        <span style={{background: '#fff', color: '#C8431F', fontFamily: font, fontWeight: 900, fontSize: 34, padding: '0 12px', borderRadius: 8}}>.pptx</span>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: '#fff'}}>原生 · 可编辑</span>
      </div>
      <Img src={IMG('pptmaster-breakfast.jpg')} style={{position: 'absolute', left: 0, top: 64, width: 934, height: 520, objectFit: 'cover'}} />
      <div style={{position: 'absolute', right: 14, bottom: 10, background: 'rgba(17,24,32,0.82)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '2px 10px', borderRadius: 6}}>仓库官方效果图｜案例展示</div>
    </Card>}
    {tags.map((t, i) => {
      const at = b + 10 + i * BEAT;
      if (f < at) return null;
      return <Card key={t} x={330 + i * 200} y={940} w={186} h={78} fill={CREAM} r={18} sh={8} ow={6} rot={[-3, 2, -2][i]} scale={pop(f, at, 6)}>
        <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 38, color: INK, lineHeight: '66px'}}>{t}</div>
      </Card>;
    })}
    <Bean x={190} y={1250 + hop(f, 18)} scale={1.05} color="#FFD23F" mark={{kind: 'badge', text: 'P', color: '#C8431F'}} squash={hit(f, a + 10) + hit(f, b) * 0.6} mouth={f >= a - 4 && f < a + 14 || f >= b - 2 && f < b + 8}
      arms={f >= win ? 'up' : 'down'} score="77,509★" scoreSize={40} tag="PPT Master" tagSize={38} />
    <Judge f={f} at={win} text="夯爆了！" x={640} y={1150} size={124} fill="#FFD23F" rot={-6} />
    <Burst f={f} at={win} x={640} y={1150} r={120} />
  </Stage>;
}, (cue) => [{at: cue('a', 40) + 10, kind: 'pop', gain: 0.08}, {at: cue('b', 70), kind: 'whoosh-short', gain: 0.07},
  ...[0, 1, 2].map((i) => ({at: cue('b', 70) + 10 + i * BEAT, kind: 'tick', gain: 0.06})), {at: cue('b', 70) + 40, kind: 'stamp', gain: 0.09}]);

/* ---------- 8 twist: five official beans, one shared board (the signature) ---------- */

const OFF = [
  {tag: 'pptx', mark: 'P', c: '#C8431F'}, {tag: 'docx', mark: 'W', c: '#185ABD'}, {tag: 'xlsx', mark: 'X', c: '#107C41'},
  {tag: 'pdf', mark: 'PDF', c: '#A4262C'}, {tag: 'canvas', mark: '画', c: '#D7A520'},
];
const XS = [130, 295, 460, 625, 790];
const roll = (f: number, at: number, n: number) => Math.round(n * ease.outCubic(clamp((f - at) / 12)));
const Twist = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 80);
  const merge = ease.inOutCubic(clamp((f - b - 6) / 10));
  return <Stage f={f} set={<Stripes f={f} a={NAVY} b={NAVY2} speed={0.3} />} hits={[b, b + 16]}>
    <Banner f={f} tag="原帖提醒" title="先看清星数" color="#6F7F98" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1190, height: 170, background: '#1C1C3A', borderTop: `8px solid ${INK}`}} />
    {OFF.map((o, i) => {
      const at = a + i * 5;
      const n = roll(f, at, 195868);
      return <Bean key={o.tag} x={XS[i]} y={1200 + hop(f, 10, i % 2 ? 0.5 : 0)} scale={0.86} color={OFFICIAL} mark={{kind: 'badge', text: o.mark, color: o.c}}
        squash={hit(f, b) * 0.7} mouth={f >= b && f < b + 12} arms={f >= b && f < b + 20 ? 'up' : 'down'} look={-0.4 + i * 0.2}
        score={merge < 0.5 ? `${f < at ? 0 : n.toLocaleString('en-US')}★` : undefined} scoreSize={28} tag={o.tag} tagSize={30} />;
    })}
    {/* the ink frame binding the five boards, then the merged board */}
    {f >= b && merge < 1 && <div style={{position: 'absolute', left: 50, top: 880, width: 840, height: 92, border: `8px solid ${INK}`, borderRadius: 20, background: 'rgba(255,214,63,0.18)',
      transform: `scaleX(${pop(f, b, 6)})`, transformOrigin: '50% 50%'}} />}
    {merge > 0 && <Card x={130 + (1 - merge) * 80} y={470 + (1 - merge) * 420} w={680} h={340} fill={INK} r={34} sh={14} scale={0.4 + 0.6 * merge}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 28, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontSize: 150, color: '#FFD23F', lineHeight: 1}}>195,868★</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: jet, fontSize: 40, color: '#fff'}}>anthropics/skills</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color: '#C9CCE0'}}>单个 skill 没有自己的星</div>
    </Card>}
    {f >= b && <div style={{position: 'absolute', left: 640, top: 420, transform: `rotate(12deg) scale(${pop(f, b, 6)})`}}>
      <Card x={0} y={0} w={240} h={130} fill={T.hang} r={20} sh={10}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Telop text="整仓" size={84} anchor="middle" sw={16} /></div>
      </Card>
    </div>}
    <Burst f={f} at={b} x={760} y={485} r={110} />
  </Stage>;
}, (cue) => [...OFF.map((_, i) => ({at: cue('a', 40) + i * 5, kind: 'tick', gain: 0.05})), {at: cue('b', 80), kind: 'stamp', gain: 0.1}, {at: cue('b', 80) + 6, kind: 'whoosh-short', gain: 0.06}]);

/* ---------- 12 end: the report card with the two install lines ---------- */

const ROWS: [string, string, string][] = [
  ['PPT', '#C8431F', 'PPT Master · 官方 pptx · guizang'],
  ['Word', '#185ABD', '官方 docx · 公文写作 skill'],
  ['Excel', '#107C41', '官方 xlsx · 三表财务模型'],
  ['PDF', '#A4262C', '官方 pdf'],
  ['会议 · 待办', '#6B4FBB', 'knowledge-work-plugins'],
];
const CMD = ['/plugin marketplace add', 'anthropics/skills', '/plugin install', 'document-skills@anthropic-agent-skills'];
const End = make(({f, cue}) => {
  const a = cue('a', 30);
  const up = ease.outBack(clamp(f / 10), 1.2);
  return <Stage f={f} set={<Rays f={f} a={NAVY} b={NAVY2} cy={700} />} hits={[0, a]} src={false}>
    <Card x={40} y={320 + (1 - up) * 900} w={1000} h={1020} fill={CREAM} r={36} sh={14}>
      <div style={{position: 'absolute', left: 44, top: 26}}><Telop text="办公 Skill 成绩单" size={70} fill={INK} stroke={CREAM} sw={2} /></div>
      <div style={{position: 'absolute', left: 50, top: 118, fontFamily: font, fontWeight: 700, fontSize: 26, color: '#6F7F98'}}>各类「夯爆了」· 原帖纯主观 · 星数截至 11-17</div>
      {ROWS.map(([cat, c, names], i) => {
        const at = 6 + i * 4;
        return <div key={cat} style={{position: 'absolute', left: 40, top: 172 + i * 78, display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${pop(f, at, 5)})`, transformOrigin: '0 50%'}}>
          <span style={{width: 196, textAlign: 'center', background: c, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 34, padding: '2px 0 4px', borderRadius: 14, border: `5px solid ${INK}`}}>{cat}</span>
          <span style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: INK, whiteSpace: 'nowrap'}}>{names}</span>
        </div>;
      })}
      {/* the install lines: Claude Code, two commands */}
      <div style={{position: 'absolute', left: 24, right: 24, top: 580, height: 410, background: INK, borderRadius: 24, padding: '22px 22px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 34, color: '#FFD23F', marginBottom: 10}}>官方四件套 · Claude Code 里输入：</div>
        {[0, 1].map((k) => {
          const at = a + k * 40;
          return <div key={k} style={{marginBottom: 18}}>
            <div style={{fontFamily: jet, fontSize: 38, color: '#fff', lineHeight: 1.3, minHeight: 49}}>{typed(CMD[k * 2], f, at, 0.5)}</div>
            <div style={{fontFamily: jet, fontSize: 38, color: '#8ED1FC', lineHeight: 1.3, minHeight: 49}}>{typed(CMD[k * 2 + 1], f, at + CMD[k * 2].length * 0.5, 0.5)}</div>
          </div>;
        })}
      </div>
    </Card>
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, ...[0, 1, 2, 3, 4].map((i) => ({at: 6 + i * 4, kind: 'pop', gain: 0.04})), {at: cue('a', 30), kind: 'tick', gain: 0.05}]);

/* ---------- cover anchor: the hook after the landing ---------- */

const HookBack = Hook.backdrop!;
const Cover = make(({f}) => <HookBack f={f + 80} dur={150} cue={(_n, fb) => fb ?? 0} />);

export const OFFICE_SKILLS_SCENES: Record<string, Scene> = {
  'ost.hook': Hook, 'ost.pptmaster': PptMaster, 'ost.twist': Twist, 'ost.end': End, 'ost.cover': Cover,
};
