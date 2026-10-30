"""Import a Douyin creator-centre export (作品数据 .xlsx) and match each post to a film in this repo.

Usage:
  python scripts/stats/douyin-export.py <export.xlsx> [--since=2026-10-18] [--out=docs/video-craft/数据/2026-10-26.md]

For every post since `--since` it prints one row: the film id it matched (by title, against douyin/<id>/README.md,
tutorials/<id>.json and the storyboard's 标题 lines), film length (from tutorials/<id>.timeline.json), views, 2 s bounce,
5 s retention, completion, average watch time and the share of the film that was watched, likes / shares / saves / follows,
and the first narration sentence. Films that only exist on an unmerged branch (`origin/*`, run `git fetch` first) are
matched too and marked †; posts set to 自见 (private) are marked 🔒 and their zero views are not counted. Then a few flags the method cares about (docs/video-craft/数据复盘-2026-10-26.md):
a first line that opens with a date or "this video", average watch < 8 s, 2 s bounce > 45 %.
The export itself stays out of the repo (it holds the whole account's history); only the table is written.
Needs openpyxl (preinstalled in the cloud image).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent.parent
BRANCH = {}  # film id -> remote ref, for films that are not in the working tree


def git(*a):
    r = subprocess.run(['git', '-C', str(ROOT), *a], capture_output=True, text=True, encoding='utf-8')
    return r.stdout if r.returncode == 0 else ''


def branch_films():
    for ref in git('for-each-ref', 'refs/remotes/origin', '--format=%(refname:short)').split():
        for name in git('ls-tree', '--name-only', f'{ref}:douyin').split('\n'):
            if name and not (ROOT / 'douyin' / name).is_dir() and name not in BRANCH:
                BRANCH[name] = ref


def read(rel, fid):
    p = ROOT / rel
    if p.exists():
        return p.read_text(encoding='utf-8-sig')
    if fid in BRANCH:
        return git('show', f'{BRANCH[fid]}:{rel}').lstrip('\ufeff') or None
    return None


def bigrams(s):
    s = re.sub(r'[\s#“”"「」，,。：:？?！!、（）()\[\]|·]+', '', s.lower())
    return {s[i:i + 2] for i in range(len(s) - 1)} or {s}


def titles_of(fid):
    out = []
    txt = read(f'douyin/{fid}/README.md', fid)
    if txt:
        out += re.findall(r'\*\*标题\*\*[：:]\s*(.+)', txt)
        out += re.findall(r'^#\s+(.+)$', txt, re.M)[:1]
    cfg = read(f'tutorials/{fid}.json', fid)
    if cfg:
        c = json.loads(cfg)
        out += [c.get('title', ''), c.get('subtitle', '')]
        if c.get('scenes'):
            out.append(c['scenes'][0].get('narration', ''))
    sb = read(f'tutorials/{fid}.storyboard.md', fid)
    if sb:
        out += re.findall(r'标题·抖音[：:]\s*(.+)', sb)
    return [t for t in out if t]


def first_line(fid):
    cfg = read(f'tutorials/{fid}.json', fid)
    if not cfg:
        return ''
    c = json.loads(cfg)
    n = c['scenes'][0]['narration'] if c.get('scenes') else ''
    n = re.sub(r'\{[^}]*\}', '', n)
    n = re.sub(r'\[([^|\]]*)\|[^\]]*\]', r'\1', n)
    return re.split(r'[。？！?!]', n)[0]


def length_of(fid):
    tl = read(f'tutorials/{fid}.timeline.json', fid)
    if not tl:
        return None
    t = json.loads(tl)
    return t['totalFrames'] / t['fps']


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(1)
    since = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--since=')), '2026-10-18')
    out = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--out=')), None)
    ws = openpyxl.load_workbook(args[0], data_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    head = [str(h) for h in rows[0]]
    col = {h: i for i, h in enumerate(head)}
    branch_films()
    films = sorted([p.name for p in (ROOT / 'douyin').iterdir() if p.is_dir()] + list(BRANCH))
    index = [(fid, [bigrams(t) for t in titles_of(fid)]) for fid in films]

    lines = ['| 发布 | 片子（匹配度） | 片长 | 播放 | 2s 跳出 | 5s 留存 | 完播 | 平均看 | 看了片长的 | 赞 / 享 / 藏 / 评 / 粉 | 主页访问 | 第一句口播 |', '|' + '---|' * 12]
    flags = []
    for r in rows[1:]:
        when = str(r[col['发布时间']])[:16]
        if when[:10] < since:
            continue
        name = str(r[col['作品名称']])
        title = re.split(r'[#\n]', name)[0].strip()
        # the export's 作品名称 is "title description #tags"; try the whole head and, when long enough, the part before
        # the first space (the posted title alone)
        heads = [bigrams(title[:40])]
        seg = title.split(' ')[0]
        if len(seg) >= 6:
            heads.append(bigrams(seg))
        best, score = '?', 0.0
        for fid, tset in index:
            for t in tset:
                for tb in heads:
                    s = len(tb & t) / max(1, min(len(tb), len(t)))
                    if s > score:
                        best, score = fid, s
        fid = best if score >= 0.45 else '?'
        m = {k: num(r[col[k]]) if k in col else None for k in ['播放量', '完播率', '5s完播率', '2s跳出率', '平均播放时长', '点赞量', '分享量', '收藏量', '评论量', '粉丝增量', '主页访问量']}
        private = '审核状态' in col and r[col['审核状态']] == '自见'
        sec = length_of(fid) if fid != '?' else None
        watched = f"{m['平均播放时长'] / sec * 100:.0f} %" if sec and m['平均播放时长'] else '—'
        fl = first_line(fid) if fid != '?' else ''
        label = (f"{fid}{'†' if fid in BRANCH else ''}（{score:.2f}）" if fid != '?' else f'?（{title[:18]}）') + (' 🔒' if private else '')
        pct = lambda v: f'{v * 100:.1f} %' if v is not None else '—'
        lines.append(f"| {when[5:10]} | {label} | {f'{sec:.0f} s' if sec else '—'} | {'自见' if private else f"{int(m['播放量'] or 0):,}"} | {pct(m['2s跳出率'])} | {pct(m['5s完播率'])} | {pct(m['完播率'])} | "
                     f"{m['平均播放时长'] or 0:.1f} s | {watched} | {int(m['点赞量'] or 0)} / {int(m['分享量'] or 0)} / {int(m['收藏量'] or 0)} / {int(m['评论量'] or 0)} / {int(m['粉丝增量'] or 0)} | {int(m['主页访问量'] or 0)} | {fl} |")
        who = fid if fid != '?' else title[:18]
        if fl and re.match(r'^(\d{1,2}月\d{1,2}日|20\d\d年|今天|大家好|hello|你现在看的这条)', fl, re.I):
            flags.append(f'{who}：第一句以日期 / 问候 / “这条视频”开头')
        if (m['2s跳出率'] or 0) > 0.45:
            flags.append(f"{who}：2 秒跳出 {pct(m['2s跳出率'])}——看第 0 帧和第一句")
        if (m['平均播放时长'] or 99) < 8:
            flags.append(f"{who}：平均只看 {m['平均播放时长']:.1f} 秒——结论有没有在前 8 秒说完？")
    text = '\n'.join(lines) + ('\n\n提醒：\n' + '\n'.join(f'- {f}' for f in flags) if flags else '') + '\n'
    print(text)
    if out:
        p = ROOT / out
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(f'# 抖音后台数据（{since} 起，导入于 {Path(args[0]).name}）\n\n由 `scripts/stats/douyin-export.py` 生成；匹配度 < 0.45 的标“?”，手动核对；† = 片子只在未合并的分支上，🔒 = 自见（没公开）。\n\n' + text, encoding='utf-8')
        print(f'wrote {out}')


if __name__ == '__main__':
    main()
