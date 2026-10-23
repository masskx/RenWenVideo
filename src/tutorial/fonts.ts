// Fonts shipped with the repo (public/fonts, OFL, subset to GB2312 + ASCII), so a render looks the same on any machine:
// 思源黑体 (variable) as the fallback for the system copy in every caption and headline,
// 思源宋体 Black / Bold for big display lines (the heavy Song look of the 梵高 explainer, docs/video-craft/学习/xian-梵高做片法.md),
// 霞鹜文楷 for handwritten margin notes (the account's annotation hand, docs/video-craft/账号风格.md). Characters outside
// the subset fall back to the system 思源黑体. Loaded once for every composition by src/Root.tsx.
import {continueRender, delayRender, staticFile} from 'remotion';
import {font} from './theme';

export const serif = `"RW Serif", "Noto Serif CJK SC", "Source Han Serif SC", ${font}`;
export const hand = `"RW Hand", "LXGW WenKai", ${font}`;

const FACES: [string, string, string][] = [
  ['RW Sans', 'fonts/NotoSansSC-VF.otf', '100 900'], // fallback for the system 思源黑体 (theme.ts `font`)
  ['RW Serif', 'fonts/NotoSerifSC-Black.otf', '900'],
  ['RW Serif', 'fonts/NotoSerifSC-Bold.otf', '700'],
  ['RW Hand', 'fonts/LXGWWenKai-Medium.ttf', '500'],
];

if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const handle = delayRender('Loading repo fonts');
  Promise.all(FACES.map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, {weight});
    await face.load();
    document.fonts.add(face);
  })).catch((e) => console.error(`font load failed: ${e}`)).finally(() => continueRender(handle));
}
