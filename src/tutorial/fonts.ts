// Fonts shipped with the repo (public/fonts, OFL, subset to GB2312 + ASCII), so a render looks the same on any machine:
// 思源黑体 (variable) as the fallback for the system copy in every caption and headline,
// 思源宋体 Black / Bold for big display lines (the heavy Song look of the 梵高 explainer, docs/video-craft/学习/xian-梵高做片法.md),
// 霞鹜文楷 for handwritten margin notes (the account's annotation hand, docs/video-craft/账号风格.md); Barlow Condensed and
// IBM Plex Mono for the news-package numerals and datelines (lemo caption-news / news-package). Characters outside
// the subset fall back to the system 思源黑体. Loaded once for every composition by src/Root.tsx.
import {continueRender, delayRender, staticFile} from 'remotion';
import {font} from './theme';

export const serif = `"RW Serif", "Noto Serif CJK SC", "Source Han Serif SC", ${font}`;
export const hand = `"RW Hand", "LXGW WenKai", ${font}`;
/** Condensed display numerals and names (Barlow Condensed 600 / 800, OFL; latin only, CJK falls through to 思源黑体). */
export const cond = `"RW Cond", ${font}`;
/** Datelines, sources, axis labels (IBM Plex Mono 500, OFL). */
export const plex = `"RW Plex", "DejaVu Sans Mono", monospace`;
/** Keynote numerals and Latin names (Inter Display 600, OFL; lemo dark-keynote §4). CJK falls through to 思源黑体. */
export const inter = `"RW Inter", ${font}`;
/** Keynote labels, filenames and status text (JetBrains Mono 500; lemo dark-keynote §4). */
export const jet = `"RW Jet", "RW Plex", monospace`;

const FACES: [string, string, string][] = [
  ['RW Sans', 'fonts/NotoSansSC-VF.otf', '100 900'], // fallback for the system 思源黑体 (theme.ts `font`)
  ['RW Serif', 'fonts/NotoSerifSC-Black.otf', '900'],
  ['RW Serif', 'fonts/NotoSerifSC-Bold.otf', '700'],
  ['RW Hand', 'fonts/LXGWWenKai-Medium.ttf', '500'],
  ['RW Cond', 'fonts/BarlowCondensed-800.woff2', '800'],
  ['RW Cond', 'fonts/BarlowCondensed-600.woff2', '600'],
  ['RW Plex', 'fonts/IBMPlexMono-500.woff2', '500'],
  ['RW Inter', 'fonts/InterDisplay-SemiBold.otf', '600'],
  ['RW Jet', 'fonts/JetBrainsMono-Medium.ttf', '500'],
];

if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const handle = delayRender('Loading repo fonts');
  Promise.all(FACES.map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, {weight});
    await face.load();
    document.fonts.add(face);
  })).catch((e) => console.error(`font load failed: ${e}`)).finally(() => continueRender(handle));
}
