import React from 'react';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {jet} from '../fonts';
import {Scene} from '../paper';

// openssh-musl-auth-bypass-ai, made on the template lemo/ascii-crt (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/ascii-crt/STYLE.md; picked by prompt-library/选用指南.md §〇: a terminal / developer-tool story).
// OpenSSH 10.6p2 (2026-11-05): a critical password-authentication bypass on some Linux systems using musl libc with PAM
// disabled (Alpine is the maintainer's example); fixed within a day because AI agents can rediscover bugs within hours.
// Inputs: inputs/openssh-musl-auth-bypass-ai/ (materials.md, sources.md, REVIEW-DOUYIN.md). Storyboard:
// tutorials/openssh-musl-auth-bypass-ai.storyboard.md.
// - The whole film is one amber phosphor terminal: official texts typed out verbatim with their source as the path, the
//   scope drawn as a logic circuit in box-drawing characters that the documented defaults (sshd_config(5)) switch on, the
//   self-check typed as commands. The reasoning is the picture (user, 2026-11-05: "nothing about them that makes it obvious
//   they were made by you").
// - Review: official scope only; never "a musl bug"; no exploit detail; no AI report counts; "within hours" is the
//   maintainer's "sometimes"; no "all Docker"; no CVE; the self-check as the review words it, keys first.
// - Template kept: one phosphor (amber), glow, scanlines, warm-black glass, vignette, ~1 % flicker; characters on a mono
//   grid; typing as editing; the cursor as suspense; font size as the camera; clear-screen redraws as cuts; the LOG line as
//   subtitles. The second colour (alarm red) appears once: when the circuit's output reads 命中.

const AMB = '#FFB547', HI = '#FFE2A8', DIM = '#8A5A1E', RED = '#FF5A4E', GLASS = '#0D0905';
const glow = (c = AMB) => `0 0 6px ${c}CC, 0 0 18px ${c}66, 0 0 40px ${c}22`;
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/** The tube: warm-black glass, scanlines, vignette, faint flicker; children are the screen's characters. */
const CRT: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => (
  <div style={{position: 'absolute', inset: 0, background: GLASS, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.985 + 0.015 * Math.sin(f * 1.7)}}>{children}</div>
    <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0.28) 3px, rgba(0,0,0,0.28) 5px)', pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 62% at 50% 45%, rgba(255,181,71,0.05) 0%, transparent 60%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 14, borderRadius: 46, boxShadow: 'inset 0 0 0 2px rgba(255,181,71,0.06), inset 0 0 80px rgba(0,0,0,0.8)', pointerEvents: 'none'}} />
  </div>
);

type Style = 'dim' | 'norm' | 'bold' | 'inv' | 'red' | 'hi';
/** One terminal line: typed from `at` at `cps` characters per frame; `marks` light words inside it. */
type Ln = {t: string; at: number; cps?: number; st?: Style; size?: number; marks?: {w: string; st: Style; at?: number}[]; gap?: number};
const colOf = (st: Style) => (st === 'dim' ? DIM : st === 'red' ? RED : st === 'hi' || st === 'bold' ? HI : AMB);
const Span: React.FC<{text: string; st: Style; size: number}> = ({text, st, size}) => {
  if (st === 'inv') return <span style={{background: AMB, color: GLASS, boxShadow: glow(), padding: '0 4px'}}>{text}</span>;
  if (st === 'red') return <span style={{background: RED, color: GLASS, boxShadow: glow(RED), padding: '0 6px'}}>{text}</span>;
  return <span style={{color: colOf(st), fontWeight: st === 'bold' ? 800 : 500, textShadow: glow(colOf(st)), fontSize: size}}>{text}</span>;
};
/** A block of typed lines from `y`; the cursor sits after the last character typed. */
const Term: React.FC<{f: number; lines: Ln[]; x?: number; y?: number; size?: number; cursor?: boolean}> = ({f, lines, x = 64, y = 300, size = 48, cursor = true}) => {
  let cur: {i: number} | null = null;
  const rows = lines.map((l, i) => {
    const sz = l.size ?? size, n = Math.max(0, Math.min(l.t.length, Math.floor((f - l.at) * (l.cps ?? 2.2))));
    if (f >= l.at) cur = {i};
    const shown = [...l.t].slice(0, n).join('');
    // split the shown text by marks that have switched on
    let parts: {s: string; st: Style}[] = [{s: shown, st: l.st ?? 'norm'}];
    for (const m of l.marks ?? []) {
      if (f < (m.at ?? -99)) continue;
      parts = parts.flatMap((p) => {
        if (p.st !== (l.st ?? 'norm') || !p.s.includes(m.w)) return [p];
        const [a, ...rest] = p.s.split(m.w);
        return [{s: a, st: p.st}, {s: m.w, st: m.st}, {s: rest.join(m.w), st: p.st}];
      });
    }
    return {i, sz, n, full: n >= l.t.length, parts, gap: l.gap ?? 0.35, started: f >= l.at};
  });
  const blink = Math.floor(f / 8) % 2 === 0;
  return <div style={{position: 'absolute', left: x, top: y, right: 40}}>
    {rows.map((r) => <div key={r.i} style={{fontFamily: `${jet}, ${font}`, fontSize: r.sz, lineHeight: 1.3, minHeight: r.sz * 1.3, marginBottom: r.sz * r.gap, whiteSpace: 'pre-wrap', wordBreak: 'normal', overflowWrap: 'anywhere'}}>
      {r.started && r.parts.map((p, j) => <Span key={j} text={p.s} st={p.st} size={r.sz} />)}
      {cursor && cur && (cur as {i: number}).i === r.i && blink && <span style={{display: 'inline-block', width: r.sz * 0.55, height: r.sz * 0.95, background: AMB, boxShadow: glow(), verticalAlign: '-0.15em', marginLeft: 2}} />}
    </div>)}
  </div>;
};
/** The status line at the top of the tube (a dim, inverse header). */
const Status: React.FC<{text: string; right?: string}> = ({text, right = 'tty1'}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 210, display: 'flex', justifyContent: 'space-between', fontFamily: jet, fontSize: 30, color: GLASS, background: DIM, padding: '4px 16px'}}>
    <span>{text}</span><span>{right}</span>
  </div>
);
const push = (f: number, at: number, d = 18) => ease.inOutCubic(clamp((f - at) / d));

/* ---------- 1 hook: the maintainer's words, typed ---------- */

const Hook = make(({f, cue}) => {
  const a = cue('a', 118), b = cue('b', 146);
  const zoom = 1 + 0.05 * push(f, b + 20, 24);
  return <CRT f={f}>
    <Status text="hachyderm.io/@damienmiller · 11-05 09:03 UTC" />
    <Term f={f} y={300} cursor={false} lines={[
      {t: ' CRITICAL  OpenSSH 10.6p2 ', at: -99, st: 'inv', size: 50, gap: 0.5},
      {t: 'If you operate a Linux system that uses musl libc without PAM', at: -99, cps: 99, st: 'dim', size: 50,
        marks: [{w: 'musl libc', st: 'hi', at: 30}, {w: 'without PAM', st: 'hi', at: 70}]},
      {t: '(Alpine Linux is one example)', at: -99, cps: 99, st: 'dim', size: 50, marks: [{w: 'Alpine Linux', st: 'inv', at: a}]},
    ]} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: '64px 1000px', transform: `scale(${zoom})`}}>
      <Term f={f} y={760} cursor={f >= b} lines={[
        {t: 'then stop reading and set', at: -99, cps: 99, st: f >= b ? 'norm' : 'dim', size: 56},
        {t: 'PasswordAuthentication=no', at: -99, cps: 99, st: f >= b ? 'bold' : 'dim', size: 58, marks: [{w: 'PasswordAuthentication=no', st: 'inv', at: b + 10}]},
        {t: 'or disable SSH … IMMEDIATELY.', at: -99, cps: 99, st: f >= b ? 'norm' : 'dim', size: 56, marks: [{w: 'IMMEDIATELY.', st: 'bold', at: b + 18}]},
      ]} />
    </div>
  </CRT>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.06}, {at: cue('a', 118), kind: 'tick', gain: 0.07}, {at: cue('b', 146) + 10, kind: 'thud', gain: 0.1}]);

/* ---------- 2 what: the release note, and one day ---------- */

const What = make(({f, cue}) => {
  const a = cue('a', 50), b = cue('b', 87);
  return <CRT f={f}>
    <Status text="openssh.com/releasenotes.html#10.6p2" />
    <Term f={f} y={300} lines={[
      {t: 'Security', at: 0, cps: 3, st: 'bold', gap: 0.2},
      {t: ' * sshd(8): avoid password authentication bypass … that affects some Linux systems when built and run with PAM support disabled.', at: 2, cps: 3.4,
        marks: [{w: 'password authentication bypass', st: 'inv', at: 18}]},
    ]} />
    <Term f={f} y={880} size={52} lines={[
      {t: '2026-11-04  得知问题', at: a - 4, cps: 2.2, gap: 0.05, marks: [{w: '得知问题', st: 'hi'}]},
      {t: '"we learned of the problem yesterday"', at: a + 2, cps: 3, st: 'dim', size: 36, gap: 0.5},
      {t: '2026-11-05  10.6p2 发布', at: b - 4, cps: 2.2, marks: [{w: '10.6p2 发布', st: 'inv', at: b + 6}]},
    ]} />
  </CRT>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.05}, {at: cue('a', 50), kind: 'tick', gain: 0.07}, {at: cue('b', 87) + 6, kind: 'tap', gain: 0.09}]);

/* ---------- 3 ai: why so fast — AI agents, within hours ---------- */

const Ai = make(({f, cue}) => {
  const a = cue('a', 24), b = cue('b', 110);
  return <CRT f={f}>
    <Status text="hachyderm.io/@damienmiller" right="OpenSSH 维护者" />
    <Term f={f} y={320} size={72} cursor={f < a} lines={[{t: '为什么这么急？', at: -6, cps: 1.2, st: 'bold'}]} />
    <Term f={f} y={500} lines={[
      {t: 'we have recently observed multiple cases of rapid bug rediscovery by AI agents, sometimes within hours', at: a - 2, cps: 3.2,
        marks: [{w: 'AI agents', st: 'hi', at: a + 20}, {w: 'within hours', st: 'inv', at: a + 30}]},
    ]} />
    <Term f={f} y={960} lines={[
      {t: 'long embargo periods … primarily benefits attackers.', at: b - 6, cps: 2.8, size: 52, marks: [{w: 'primarily benefits attackers.', st: 'bold'}]},
    ]} />
  </CRT>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.05}, {at: cue('a', 24) + 30, kind: 'tick', gain: 0.08}, {at: cue('b', 110), kind: 'tick', gain: 0.07}]);

/* ---------- 4 notes: many reports come from AI; more frequent releases ---------- */

const Notes = make(({f, cue}) => {
  const a = cue('a', 66);
  return <CRT f={f}>
    <Status text="openssh.com/releasenotes.html#10.6p2" />
    <Term f={f} y={300} lines={[
      {t: 'Recently the OpenSSH team have received a large number of security bug reports, many of which are findings from AI models or made with AI assistance.', at: -4, cps: 3.4,
        marks: [{w: 'a large number of security bug reports', st: 'hi', at: 20}, {w: 'findings from AI models', st: 'inv', at: a - 6}]},
      {t: '… the OpenSSH team will, for now, be making more frequent releases', at: a + 6, cps: 3, marks: [{w: 'more frequent releases', st: 'bold'}]},
    ]} />
    <Term f={f} y={1150} size={40} cursor={false} lines={[{t: '# 官方没有给出具体数量', at: a + 20, cps: 3, st: 'dim'}]} />
  </CRT>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.05}, {at: cue('a', 66) - 6, kind: 'tick', gain: 0.08}]);

/* ---------- 5–6 the circuit: four switches into an AND gate; the defaults switch two of them ---------- */

const ROWS = ['Linux         ', 'libc = musl   ', 'UsePAM = no   ', 'PasswdAuth=yes'];
/** The circuit in box-drawing characters; `on[i]` lights switch i; `out` = null (unknown) | 'hit'. */
const Circuit: React.FC<{f: number; on: boolean[]; out: 'none' | 'q' | 'hit'; y: number; hitAt?: number; src?: string[]}> = ({f, on, out, y, hitAt = 0, src = []}) => {
  const tees = ['─┐', '─┤', '─┼─[ AND ]─▶ ', '─┘'];
  const sz = 44;
  return <div style={{position: 'absolute', left: 64, top: y, fontFamily: `${jet}, ${font}`, fontSize: sz, lineHeight: 1.45, whiteSpace: 'pre'}}>
    {ROWS.map((r, i) => <div key={i}>
      <span style={{color: on[i] ? HI : DIM, textShadow: glow(on[i] ? HI : DIM)}}>{r}</span>
      <span style={{color: on[i] ? HI : DIM, textShadow: glow(on[i] ? HI : DIM)}}>{on[i] ? '[■]' : '[ ]'}</span>
      <span style={{color: AMB, textShadow: glow()}}>{tees[i]}</span>
      {i === 2 && (out === 'hit' ? <span style={{background: RED, color: GLASS, padding: '0 10px', boxShadow: `${glow(RED)}, 0 0 ${40 * Math.max(0, 1 - (f - hitAt) / 20)}px ${RED}`}}>命中</span>
        : out === 'q' ? <span style={{color: Math.floor(f / 8) % 2 ? AMB : DIM, textShadow: glow()}}>?</span> : null)}
      {src[i] && <span style={{fontSize: 34, color: HI, marginLeft: 0}}>{src[i]}</span>}
    </div>)}
  </div>;
};
const Gate = make(({f, cue}) => {
  const a = cue('a', 38), b = cue('b', 103);
  const on = [f >= a, f >= a + 9, f >= a + 18, f >= b];
  return <CRT f={f}>
    <Status text="影响范围 · release notes + 维护者" />
    <Term f={f} y={320} size={46} cursor={false} lines={[{t: '# 四个开关，同时成立才是风险组合', at: 2, cps: 3, st: 'dim'}]} />
    <Circuit f={f} y={560} on={on} out="q" />
    <Term f={f} y={1000} size={38} cursor={false} lines={[{t: '# 编译带 PAM、但运行时 UsePAM no，也算', at: b + 10, cps: 3, st: 'dim'}]} />
  </CRT>;
}, (cue) => [{at: 0, kind: 'tick', gain: 0.05}, ...[0, 9, 18].map((d) => ({at: cue('a', 38) + d, kind: 'tick', gain: 0.08})), {at: cue('b', 103), kind: 'tick', gain: 0.09}]);

const Defaults = make(({f, cue}) => {
  const a = cue('a', 35), b = cue('b', 69);
  const hitAt = b + 12;
  return <CRT f={f}>
    <Status text="man7.org · sshd_config(5)" />
    <Term f={f} y={300} size={46} cursor={f < hitAt} lines={[
      {t: 'UsePAM … The default is no.', at: a - 12, cps: 2.6, marks: [{w: 'The default is no.', st: 'inv', at: a}]},
      {t: 'PasswordAuthentication … The default is yes.', at: b - 14, cps: 3, marks: [{w: 'The default is yes.', st: 'inv', at: b}]},
    ]} />
    <Circuit f={f} y={640} on={[true, true, f >= a + 4, f >= b + 4]} out={f >= hitAt ? 'hit' : 'q'} hitAt={hitAt} src={['', '', '', f >= b + 4 ? '  ← 两个默认值' : '']} />
    <Term f={f} y={1060} size={34} cursor={false} lines={[{t: '# 按 OpenSSH 上游默认值推演；发行版可能改过，以实际生效值为准', at: hitAt + 8, cps: 4, st: 'dim'}]} />
  </CRT>;
}, (cue) => [{at: cue('a', 35), kind: 'tick', gain: 0.08}, {at: cue('b', 69), kind: 'tick', gain: 0.08}, {at: cue('b', 69) + 12, kind: 'fs-impact-deep', gain: 0.15}]);

/* ---------- 7 safe: who is not affected ---------- */

const Safe = make(({f, cue}) => {
  const a = cue('a', 88);
  const ok = (i: number) => f >= a + i * 5;
  const row = (t: string, i: number) => ({t: `${ok(i) ? '✓' : ' '} ${t}`, at: 4 + i * 22, cps: 2.4, st: (ok(i) ? 'hi' : 'norm') as Style});
  return <CRT f={f}>
    <Status text="hachyderm.io/@damienmiller · 不受影响" />
    <Term f={f} y={360} size={60} lines={[row('Linux + glibc', 0), row('非 Linux 系统', 1), row('用 PAM 验证密码的 Linux', 2)]} />
    <Term f={f} y={860} size={72} cursor={false} lines={[{t: '都不受影响', at: a, cps: 1.5, st: 'bold'}]} />
  </CRT>;
}, (cue) => [0, 1, 2].map((i) => ({at: cue('a', 88) + i * 5, kind: 'tick', gain: 0.08})));

/* ---------- 8–9 check and act: the self-check, typed ---------- */

const CHECK = (a: number, b: number): Ln[] => [
  {t: '# ① 跑 sshd 的系统是不是 musl（如 Alpine）', at: a - 4, cps: 3, st: 'dim', size: 40, gap: 0.1},
  {t: '$ cat /etc/os-release', at: a + 6, cps: 2, gap: 0.6},
  {t: '# ② 实际生效的两项', at: b - 4, cps: 3, st: 'dim', size: 40, gap: 0.1},
  {t: "$ sshd -T | grep -Ei 'usepam|passwordauthentication'", at: b + 4, cps: 2.6, gap: 0.1, marks: [{w: 'sshd -T', st: 'inv', at: b + 30}]},
  {t: '# usepam no + passwordauthentication yes → 命中组合', at: b + 40, cps: 3, st: 'hi', size: 40},
];
const Check = make(({f, cue}) => {
  const a = cue('a', 20), b = cue('b', 88);
  return <CRT f={f}>
    <Status text="自查 · 不需要任何外部工具" right="$" />
    <Term f={f} y={320} size={46} lines={CHECK(a, b)} />
  </CRT>;
}, (cue) => [{at: cue('a', 20) + 6, kind: 'tick', gain: 0.07}, {at: cue('b', 88) + 4, kind: 'tick', gain: 0.07}]);

const Act = make(({f, cue}) => {
  const a = cue('a', 81), b = cue('b', 113);
  return <CRT f={f}>
    <Status text="自查 · ③ 处置" right="$" />
    <Term f={f} y={300} size={34} cursor={false} lines={CHECK(-999, -999).map((l) => ({...l, st: 'dim' as Style, marks: []}))} />
    <Term f={f} y={720} size={40} lines={[
      {t: '# ③ 命中：先关密码登录，或暂停 SSH', at: 0, cps: 3, st: 'dim', size: 40, gap: 0.1},
      {t: 'PasswordAuthentication no', at: 10, cps: 2, st: 'bold', size: 48, marks: [{w: 'PasswordAuthentication no', st: 'inv', at: 40}], gap: 0.5},
      {t: '# 先确认密钥 / 控制台能登录，别把自己锁在外面', at: a - 4, cps: 3.2, st: 'hi', size: 40, gap: 0.3},
      {t: '# 再按发行版渠道升级 → OpenSSH 10.6p2', at: b - 4, cps: 3, size: 42, gap: 0.1, marks: [{w: 'OpenSSH 10.6p2', st: 'inv', at: b + 14}]},
      {t: '# Alpine：截图时只有 edge 已到 10.6_p2-r0', at: b + 16, cps: 4, st: 'dim', size: 34},
    ]} />
  </CRT>;
}, (cue) => [{at: 10, kind: 'tick', gain: 0.07}, {at: 40, kind: 'tap', gain: 0.08}, {at: cue('a', 81), kind: 'tick', gain: 0.06}, {at: cue('b', 113) + 14, kind: 'tick', gain: 0.08}]);

/** Cover anchor (880 × 800): the maintainer's line on the tube. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: GLASS}}>
  <div style={{position: 'absolute', left: -40, top: -260, width: 1080, height: 1300}}>
    <CRT f={0}><Term f={400} y={300} cursor={false} lines={[
      {t: ' CRITICAL  OpenSSH 10.6p2 ', at: -99, st: 'inv', size: 46, gap: 0.6},
      {t: 'stop reading and set', at: -99, size: 50},
      {t: 'PasswordAuthentication=no', at: -99, st: 'inv', size: 56},
      {t: 'IMMEDIATELY.', at: -99, st: 'bold', size: 56},
    ]} /></CRT>
  </div>
</div>;

export const opensshMuslScenes: Record<string, Scene> = {
  'ssh.hook': Hook, 'ssh.what': What, 'ssh.ai': Ai, 'ssh.notes': Notes, 'ssh.gate': Gate, 'ssh.defaults': Defaults, 'ssh.safe': Safe, 'ssh.check': Check, 'ssh.act': Act, 'ssh.cover': Cover,
};
