# src/components — reusable motion components

Learned from [mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) (MIT, © 2026 Vincentwei1021). This repo borrows the approach and the numbers only. The code here is new and written for this repo (rationale: [docs/style-guide.md](../../docs/style-guide.md) §十二).

Every component is a pure function of the scene frame `f` (30 fps; the `f` that scene components receive), so any frame renders on its own. Times like `at` are scene frames; take them from the narration cues: `const p = {a: cue('a', 36)}`.

```tsx
import {KineticTitle, BurstCallout, LockOn, ScrambleText, CountUp, StickerSlap, CameraRig, DrawPath, GrowBars, curve} from '../../components';
```

Shared rules:

- **Text that informs lands on its word; reactions land 2–3 frames after it.** `KineticTitle`, `CountUp`, `GrowBars` and `LockOn` use the cue frame as is. `BurstCallout` has `lag = 3` built in.
- **Data never overshoots.** Bars and counters use `curve.data` (ease-out). Overshoot is only for things that carry no value (cards, icons, titles).
- **At most one loud move at a time.** A burst, a lock-on and a sticker slap on the same frame read as noise. Stagger them 4–8 frames apart.
- **Running subtitles stay still.** They are drawn by `TutorialVideo`. Do not wrap them in `KineticTitle`.

---

## curves.ts

| Export | What it is | Use for |
| --- | --- | --- |
| `cubicBezier(x1, y1, x2, y2)` | CSS cubic-bezier as a 0..1 → 0..1 function | writing a motion spec with exact curves |
| `curve.overshoot` | `(0.34, 1.56, 0.64, 1)` | cards, icons, UI popping in |
| `curve.flung` | `(0.22, 1, 0.36, 1)` | things thrown or flung, quick slide-ins |
| `curve.morph` | `(0.7, 0, 0.3, 1)` | shape changes, camera flights |
| `curve.draw` | `(0.65, 0, 0.35, 1)` | lines drawing on |
| `curve.snap` | expo-out | lock-on, snaps |
| `curve.data` | cubic ease-out, no overshoot | bars, counters |
| `popScale(f, at)` | spring 0 → 1.15 (frame 5) → 1 (≈ frame 8) | any pop-in |
| `popOut(f, at)` | swell to 1.12, then gone in 5 frames | pop-out exits |
| `holdWiggle(f, landed, phase)` | `{deg, dy, s}` slow tilt / bob / breath, faded in after landing | keeping a held title or callout alive |
| `wobble(f, contact)` | damped cosine after a contact | sticker or stamp settle |

```tsx
const k = curve.overshoot(clamp((f - p.a) / 10));   // 10-frame overshoot entrance
const s = popScale(f, p.a);                          // spring pop
```

## KineticTitle

A headline whose characters pop in one by one: 2-frame stagger, a small drop and tilt, then a slow wiggle while it holds.

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at` | — | `at` can be negative so frame 0 already shows a landed title (the hook rule) |
| `text`, `size`, `color` | —, 88, `#fff` | ≥ 80 px for titles (讲解动画规则 §一) |
| `stagger` | 2 | frames between characters; 3–4 for long titles |
| `drop`, `tilt` | 36, 8 | px fall and ° rotate-in, alternating sign |
| `wiggle` | 1.2 | hold wiggle in degrees. Use 0 for serious topics or when the title sits next to text being read |
| `outAt` | — | frame to pop the title out |
| `look` | `"clean"` | `"clean"`: fill + one keyline. `"hanazi"`: fill + thick `inner` stroke + `outer` stroke + hard shadow (综艺花字) |
| `stroke` / `inner` / `outer` / `strokeWidth` | navy / white / navy / auto | keyline for clean; the two rings for hanazi |

```tsx
<KineticTitle f={f} at={-6} text="装个AI工具包" size={96} />                     {/* hook title, landed by frame ~8 */}
<KineticTitle f={f} at={p.b} text="被偷了" look="hanazi" color={RED} outer="#5a0d16" wiggle={0} />
```

Use for the hook title, section titles and one emotional keyword per scene. Don't use it for running subtitles, or for more than one hanazi word on screen at a time.

## BurstCallout

爆炸框: a jagged starburst with one short word, slammed in with a spring and a flash of speed lines. The outline redraws every `boil` frames (line boil on decoration only).

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at`, `lag` | —, —, 3 | lands `lag` frames after the cue it reacts to |
| `text`, `size` | —, 76 | 2–5 characters; it must be readable at 360 px wide |
| `w`, `h` | 440, 260 | the burst body; the box is 1.7× for the rays |
| `fill`, `ink`, `edge` | red, white, navy | `edge` is the burst rim and the text keyline |
| `spikes`, `spike`, `seed` | 13, 0.28, 1 | shape |
| `rays`, `boil`, `deg` | true, 4, −6 | speed-line flash (10 frames), boil period, base tilt |

Centred on its own box, so place it with `style={{left: cx, top: cy}}` inside a positioned parent.

```tsx
<BurstCallout f={f} at={p.b} text="被偷了？" style={{left: 700, top: 560}} />
```

Use it once per scene, for the warning or the surprising number. Don't use it for neutral facts; it is the loudest element in the kit.

## LockOn

HUD lock-on: four corner brackets close from 1.4× onto a target box with a snap, blink twice, then hold. An optional mono tag appears once locked.

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at` | — | `at` = the word that names the target |
| `x`, `y`, `w`, `h` | — | target box in the parent's coordinates |
| `color`, `len`, `thick`, `pad` | amber, 44, 8, 14 | |
| `from`, `dur` | 1.4, 8 | start scale, frames to close |
| `label` | — | e.g. `"已锁定"`. It is decoration: the fact must also be in the narration or a ≥ 40 px label |
| `until` | — | frame to let go (6-frame fade) |

```tsx
<LockOn f={f} at={p.a} x={0} y={720} w={900} h={140} color={RED} label="已外传" />
```

Use it to point at "this one" in a busy frame (a file in a list, a log line, a cell). Prefer it to an arrow when the target is a box.

## ScrambleText, CountUp, countValue

- `ScrambleText`: each character rolls through random glyphs for `roll` frames (default 4), then settles on the real text, left to right (`stagger` 1). Spaces and punctuation don't roll. `before`: `"text"` | `"hidden"` | `"scrambled"`. Monospace, so the width never jumps.
- `CountUp`: counts from `from` to `to` over `dur` frames (default 24) with an ease-out. It ends exactly on the true value. Supports `decimals`, `prefix`, `suffix` and `group` (1,000).
- `countValue(f, at, to, dur, from)`: the same number as a value, to keep a bar and its label in step.

```tsx
<ScrambleText f={f} at={p.a} text="sk-••••3f9a" style={{fontSize: 34, color: A}} />
<CountUp f={f} at={p.b} to={1107} style={{fontSize: 160, color: A}} />
```

Use a scramble for a value being read, decoded or leaked. Use a count-up for a number the narration says (it must reach the spoken value by the time it is said). Never count to a number that is not in the material.

## StickerSlap

PaperClip-style sticker: a thick outline around a screenshot, card or cut-out, which slaps onto the canvas. It falls from 1.35× with a tilt and a lifted shadow, touches down on `at`, then wobbles and settles.

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at`, `fall` | —, —, 6 | `at` = contact frame (put a `tap` sfx there) |
| `from`, `tilt` | 1.35, 6 | in-air scale and tilt |
| `outline`, `outlineColor` | 8, white | 8–12 px. Use the same outline on every sticker in a video, so screenshots from different sources look like one set |
| `mode` | `"box"` | `"box"`: rounded border for cards and screenshots. `"alpha"`: traces a transparent PNG cut-out |
| `radius`, `shadow` | 18, navy 45 % | |

```tsx
<StickerSlap f={f} at={20}><Img src={staticFile('images/tutorials/<id>/shot.png')} style={{width: 640}} /></StickerSlap>
```

Use for screenshots, product shots and key cards entering a scene. External footage still gets its 「@作者｜案例展示」 label, outside the sticker.

## CameraRig, camAt

One big canvas with one continuous camera: lay every info point out once, in world px, and fly between them instead of cutting.

| Shot field | Notes |
| --- | --- |
| `at` | frame the camera arrives |
| `x`, `y`, `z` | world point at the centre of the view, and zoom |
| `move` | `"fly"`: morph curve, pulls back mid-way in proportion to distance. `"ease"`: in-out reframe. `"cut"`: jump |
| `dur` | travel frames before `at` (fly 18, ease 12 by default) |

Rig props: `f`, `shots`, `w`, `h` (viewport), `drift` (slow push while holding, default 1 %/s, capped at 4 s), and `children` (the world). `camAt(f, shots)` gives `{x, y, z}` for timing sound or blur to the camera.

```tsx
<CameraRig f={f} w={900} h={1080} shots={[
  {at: 0, x: 450, y: 420, z: 1.05},
  {at: p.a, x: 450, y: 1500, z: 1.1, move: 'fly'},
  {at: p.b, x: 450, y: 980, z: 0.62, move: 'ease', dur: 20},
]}>{world}</CameraRig>
```

Use it inside a scene whose points belong together (a pipeline, a before/after, a list that grows). Keep titles and numbers the viewer must read outside the rig. On 9:16, lay the world out vertically: sideways flights push content under the right-hand button column. Scenes that already use `Scene.camera` (the `follow` camera in `TutorialVideo`) shouldn't add a rig on top.

## DrawPath

A line that draws itself, with slow ends. Put it inside an `<svg>`. `pathLength` means no measuring is needed.

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at`, `dur` | —, —, 14 | |
| `d` | — | SVG path data |
| `color`, `width`, `opacity` | amber, 6, 1 | keep one width per video |
| `dashed` | false | dashed routes / planned links (the pattern doesn't crawl while it grows) |

```tsx
<svg width={900} height={800} style={{position: 'absolute', inset: 0}}>
  <DrawPath f={f} at={p.a} d="M120 300 C 300 120, 600 120, 780 300" />
</svg>
```

Use for leader lines from a label to its part, arrows between steps, underlines and routes.

## GrowBars

Horizontal bars that grow to scale one after another, with the value counting up in step.

| Prop | Default | Notes |
| --- | --- | --- |
| `f`, `at`, `stagger`, `dur` | —, —, 4, 18 | |
| `items` | — | `{label, value, color?}[]`. Values come from the material, never estimated |
| `max` | largest value | set it when the scale must start from a known maximum (e.g. 100 分) |
| `width`, `barH`, `gap`, `labelW` | 880, 72, 28, 230 | labels 44 px, values 40 px (≥ 40 px rule) |
| `unit`, `decimals`, `color`, `ink`, `dim` | | |

```tsx
<GrowBars f={f} at={p.a} max={100} unit="分" decimals={1}
  items={[{label: 'Opus 5.5', value: 92.4, color: A}, {label: 'DeepSeek', value: 88.1, color: B}]} />
```

Use for benchmark scores, prices and counts: any comparison of 2–5 numbers the script states. For more than 5 items, show the top 3 and say "前三".
