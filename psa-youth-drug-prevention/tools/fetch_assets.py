"""Search, verify and download stock media for the PSA from Mixkit (the reachable free-licence source).

Pexels and Pixabay were tried first (see output/README.md): their sites answer 403 to automated requests and their
APIs need keys this environment does not have, so this tool uses Mixkit and records why.

Only items Mixkit marks with its *Free* licence are accepted (commercial + personal use, no attribution required);
items under the *Restricted* licence (personal, non-commercial only) are rejected automatically.

  python tools/fetch_assets.py search video "pills" "doctor" ...   -> work/candidates.json (+ thumbs/)
  python tools/fetch_assets.py get video <id> [<id> ...]           -> assets/video/mixkit-<id>.mp4 (+ assets/manifest.json)
  python tools/fetch_assets.py search music "cinematic"            -> music candidates
  python tools/fetch_assets.py get music <id>                      -> assets/music/mixkit-<id>.mp3
  python tools/fetch_assets.py search sfx "heartbeat"
  python tools/fetch_assets.py get sfx <id>
"""
import datetime
import html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (school PSA asset fetcher)"}
KIND = {
    "video": ("free-stock-video", "videoFree", "videoRestricted"),
    "music": ("free-stock-music", "musicFree", None),
    "sfx": ("free-sound-effects", "sfxFree", None),
}


def http(url, method="GET"):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers=UA, method=method)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, (r.read() if method == "GET" else b"")
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return e.code, b""
        except Exception:
            pass
        time.sleep(2 ** attempt)
    return 0, b""


def search_audio(kind, terms, out):
    """Music and SFX listings carry a schema.org ItemList (name, artist, duration, mp3 url, licence) — read that."""
    for term in terms:
        slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
        url = f"https://mixkit.co/free-stock-music/{slug}/" if "/" in term else (
            f"https://mixkit.co/free-stock-music/tag/{slug}/" if kind == "music" else f"https://mixkit.co/free-sound-effects/{slug}/")
        if "/" in term:
            url = f"https://mixkit.co/free-stock-music/{term.strip('/')}/"
        code, body = http(url)
        page = body.decode("utf8", "ignore")
        found = 0
        for blob in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, flags=re.S):
            try:
                data = json.loads(blob)
            except ValueError:
                continue
            for node in data.get("@graph", []):
                for el in node.get("itemListElement", []) if node.get("@type") == "ItemList" else []:
                    mp3 = el.get("url", "")
                    m = re.search(r"/(?:music|sfx)/(\d+)/", mp3)
                    if not m:
                        continue
                    item_id = m.group(1)
                    lic = el.get("license", "")
                    meta = {"kind": kind, "id": item_id, "page": url, "title": el.get("name", ""), "artist": el.get("byArtist", ""),
                            "license": "musicFree" if lic.endswith("#musicFree") else "sfxFree" if lic.endswith("#sfxFree") else lic or "unknown",
                            "duration": el.get("duration", ""), "audio": mp3, "terms": [term]}
                    out.setdefault(f"{kind}:{item_id}", meta)
                    found += 1
                    print(f"  {item_id:>6} {meta['license']:<10} {meta['duration']:<9} {meta['title']} — {meta['artist']}")
        print(f"{term}: {found} items (HTTP {code})")


def search(kind, terms):
    base = KIND[kind][0]
    out = json.loads((ROOT / "work/candidates.json").read_text()) if (ROOT / "work/candidates.json").exists() else {}
    if kind != "video":
        search_audio(kind, terms, out)
        (ROOT / "work/candidates.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
        return
    for term in terms:
        slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
        code, body = http(f"https://mixkit.co/{base}/{slug}/")
        page = body.decode("utf8", "ignore")
        links = []
        for href in re.findall(rf'href="(/{base}/[a-z0-9-]+-(\d+)/)"', page):
            if href not in links:
                links.append(href)
        print(f"{term}: {len(links)} items (HTTP {code})")
        for href, item_id in links[:24]:
            key = f"{kind}:{item_id}"
            if key in out:
                out[key]["terms"] = sorted(set(out[key]["terms"] + [term]))
                continue
            meta = item(kind, href, item_id)
            meta["terms"] = [term]
            out[key] = meta
            print(f"  {item_id:>6} {meta['license']:<16} {meta.get('duration', ''):<9} {meta['title']}")
    (ROOT / "work").mkdir(exist_ok=True)
    (ROOT / "work/candidates.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))


def item(kind, href, item_id):
    url = f"https://mixkit.co{href}"
    _, body = http(url)
    page = body.decode("utf8", "ignore")
    lic = re.search(r'data-license="([a-zA-Z]+)"', page)
    title = re.search(r"<title>([^<]+)", page)
    dur = re.search(r'"duration":"PT(\d+)M(\d+)S"', page)
    meta = {"kind": kind, "id": item_id, "page": url, "title": html.unescape(title.group(1).split(" - ")[0].strip()) if title else "",
            "license": lic.group(1) if lic else "unknown", "duration": f"{int(dur.group(1)) * 60 + int(dur.group(2))}s" if dur else ""}
    if kind == "video":
        thumb = f"https://assets.mixkit.co/videos/{item_id}/{item_id}-thumb-720-0.jpg"
        code, img = http(thumb)
        if code == 200:
            (ROOT / "assets/thumbs").mkdir(parents=True, exist_ok=True)
            (ROOT / f"assets/thumbs/{item_id}.jpg").write_bytes(img)
        meta["thumb"] = thumb
    else:
        audio = re.search(r'https://assets\.mixkit\.co/[^"\' ]+\.mp3', page)
        meta["audio"] = audio.group(0) if audio else ""
    return meta


def get(kind, ids):
    cands_path = ROOT / "work/candidates.json"
    cands = json.loads(cands_path.read_text()) if cands_path.exists() else {}
    manifest_path = ROOT / "assets/manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    # re-downloading something already in the manifest needs no search first
    known = {f"{m['kind']}:{m['id']}": m for m in manifest.values()}
    for item_id in ids:
        meta = cands.get(f"{kind}:{item_id}") or known.get(f"{kind}:{item_id}")
        if not meta:
            print(f"{item_id}: not in candidates — search first"); continue
        if meta["license"] != KIND[kind][1]:
            print(f"{item_id}: licence '{meta['license']}' is not Mixkit's Free licence — skipped"); continue
        if kind == "video":
            # prefer 4K (cropping 16:9 to 9:16 keeps full 1920 px height), then 1080p
            for res in ("2160", "1080"):
                url = f"https://assets.mixkit.co/videos/{item_id}/{item_id}-{res}.mp4"
                code, data = http(url)
                if code == 200 and data:
                    dest = ROOT / f"assets/video/mixkit-{item_id}.mp4"
                    dest.write_bytes(data)
                    break
            else:
                print(f"{item_id}: no 1080p/4K download available — skipped"); continue
        else:
            url = meta.get("audio")
            code, data = http(url) if url else (0, b"")
            if code != 200:
                print(f"{item_id}: audio download failed"); continue
            dest = ROOT / f"assets/{kind}/mixkit-{item_id}.mp3"
            dest.write_bytes(data)
        manifest[dest.name] = {**meta, "download_url": url, "file": str(dest.relative_to(ROOT)),
                               "downloaded": datetime.date.today().isoformat(),
                               "license_name": {"videoFree": "Mixkit Stock Video Free License", "musicFree": "Mixkit Stock Music Free License",
                                                "sfxFree": "Mixkit Sound Effects Free License"}[meta["license"]]}
        print(f"saved {dest.relative_to(ROOT)} ({len(data) / 1e6:.1f} MB)")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    cmd, kind, *rest = sys.argv[1:]
    {"search": search, "get": get}[cmd](kind, rest)
