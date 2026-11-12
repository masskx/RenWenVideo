#!/usr/bin/env python3
import asyncio, json, datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from playwright.async_api import async_playwright

OUT = Path("/workspace/pipeline/episodes/nvidia-huang-resigns/assets/img")
LOG = Path("/workspace/pipeline/episodes/nvidia-huang-resigns/assets/text/screenshot-log.txt")
OUT.mkdir(parents=True, exist_ok=True)

JOBS = [
    ("shot-nvidia-ceo-transition", "https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition", "full"),
    ("shot-nvidia-ir-ceo-transition", "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-CEO-Transition/", "full"),
    ("shot-xinhua-huang-resigns", "https://www.news.cn/20261112/f5d8cdfb75304adaae2e2cebe9d6d68f/c.html", "full"),
    ("shot-cls-2533121", "https://www.cls.cn/detail/2533121", "full"),
    ("shot-chinanews-10731222", "https://www.chinanews.com.cn/gj/2026/11-12/10731222.shtml", "full"),
    ("shot-chinanews-10731212", "https://www.chinanews.com.cn/gj/2026/11-12/10731212.shtml", "full"),
    ("shot-zaobao-9989479", "https://www.zaobao.com.sg/finance/world/story20261112-9989479", "full"),
    ("shot-google-finance-nvda", "https://www.google.com/finance/quote/NVDA:NASDAQ", "full"),
    ("shot-yahoo-finance-nvda", "https://finance.yahoo.com/quote/NVDA/", "viewport"),
    ("shot-ap-huang-resigns", "https://apnews.com/article/nvidia-megaspeed-china-singapore-huang-5403f152a601cf82ce939f1d24fffa0f", "full"),
    ("shot-guardian-resigns", "https://www.theguardian.com/technology/2026/nov/12/nvidia-ceo-jensen-huang-resigns", "full"),
    ("shot-bbc-live", "https://www.bbc.com/news/live/c6zjry11v8w1t", "full"),
    ("shot-axios-huang-out", "https://www.axios.com/2026/11/12/nvidia-jensen-huang-out", "full"),
    ("shot-reuters-search", "https://www.reuters.com/site-search/?query=Nvidia%20Huang%20resigns", "viewport"),
    ("shot-reuters-home-search", "https://www.reuters.com/business/nvidia-ceo-jensen-huang-resigns-2026-11-12/", "viewport"),
    ("shot-edgar-8k-index", "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=8-K&dateb=&owner=include&count=20", "full"),
    ("shot-edgar-8k-filing", "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/0001045810-26-000082-index.htm", "full"),
    ("shot-edgar-8k-item502", "https://www.sec.gov/ix?doc=/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm", "full"),
    ("shot-nvidia-kress-bio", "https://www.nvidia.com/en-us/about-nvidia/governance/management-team/colette-kress/", "full"),
    ("shot-nvidia-jones-bio", "https://www.nvidia.com/en-us/about-nvidia/board-of-directors/harvey-jones/", "full"),
    ("shot-nvidia-executives", "https://nvidianews.nvidia.com/multimedia/corporate/corporate-executives", "full"),
    ("shot-nvidia-news-latest", "https://nvidianews.nvidia.com/", "viewport"),
]

COOKIE_TEXTS = [
    "Accept all", "Accept All", "ACCEPT ALL", "Accept all cookies",
    "Accept", "I agree", "I Accept", "Agree", "Got it",
    "Allow all", "Allow All", "Consent", "Agree and close",
    "Yes, I agree", "Accept cookies", "Accept Cookies",
    "同意", "接受", "同意全部", "接受全部", "关闭",
    "Permitir todas", "Alle akzeptieren", "Tout accepter",
]

async def dismiss_cookies(page):
    # try common buttons, don't fail
    for label in COOKIE_TEXTS:
        try:
            loc = page.get_by_role("button", name=label, exact=False)
            if await loc.count():
                await loc.first.click(timeout=1500)
                await page.wait_for_timeout(400)
                return f"clicked:{label}"
        except Exception:
            pass
        try:
            loc = page.locator(f"button:has-text('{label}'), input[value='{label}'], a:has-text('{label}')")
            if await loc.count():
                await loc.first.click(timeout=1500)
                await page.wait_for_timeout(400)
                return f"clicked-css:{label}"
        except Exception:
            pass
    # OneTrust / common ids
    for sel in ["#onetrust-accept-btn-handler", "#accept-recommended-btn-handler",
                "button[id*='accept']", "button[class*='accept-all']",
                ".fc-cta-consent", "#sp-cc-accept"]:
        try:
            loc = page.locator(sel)
            if await loc.count():
                await loc.first.click(timeout=1500)
                await page.wait_for_timeout(400)
                return f"clicked-sel:{sel}"
        except Exception:
            pass
    return "none"

async def shot_one(browser, name, url, mode, logf):
    tz = ZoneInfo("Asia/Taipei")
    et = ZoneInfo("America/New_York")
    last_err = None
    for attempt in range(3):
        page = await browser.new_page(viewport={"width":1400,"height":900}, device_scale_factor=2)
        try:
            await page.goto(url, timeout=90000, wait_until="domcontentloaded")
            try:
                await page.wait_for_load_state("networkidle", timeout=20000)
            except Exception:
                pass
            await page.wait_for_timeout(2500)
            cookie = await dismiss_cookies(page)
            await page.wait_for_timeout(1200)
            # scroll a bit to lazy-load then back to top
            await page.evaluate("window.scrollTo(0, 400)")
            await page.wait_for_timeout(600)
            await page.evaluate("window.scrollTo(0, 0)")
            await page.wait_for_timeout(800)
            title = await page.title()
            now = datetime.datetime.now(tz)
            now_et = now.astimezone(et)
            vp = OUT / f"{name}.png"
            await page.screenshot(path=str(vp), full_page=False)
            if mode == "full":
                fp = OUT / f"{name}-full.png"
                try:
                    await page.screenshot(path=str(fp), full_page=True)
                except Exception as e:
                    logf.write(f"FULLFAIL {name} {e}\n"); logf.flush()
            size = vp.stat().st_size if vp.exists() else 0
            line = (f"OK {name} bytes={size} title={title!r} attempt={attempt} cookie={cookie} "
                    f"url={page.url} t_taipei={now.strftime('%Y-%m-%d %H:%M:%S %Z')} "
                    f"t_et={now_et.strftime('%Y-%m-%d %H:%M:%S %Z')}\n")
            logf.write(line); logf.flush(); print(line, end="")
            await page.close()
            return True
        except Exception as e:
            last_err = e
            logf.write(f"ERR {name} attempt={attempt} {type(e).__name__}: {e}\n"); logf.flush()
            print(f"ERR {name} attempt={attempt} {e}")
            try:
                await page.close()
            except Exception:
                pass
            await asyncio.sleep(2)
    logf.write(f"FAIL {name} {last_err}\n"); logf.flush()
    return False

async def main():
    with LOG.open("w", encoding="utf-8") as logf:
        logf.write(f"start {datetime.datetime.now(ZoneInfo('Asia/Taipei'))}\n")
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path="/usr/bin/google-chrome",
                args=["--no-sandbox","--disable-dev-shm-usage","--disable-blink-features=AutomationControlled"]
            )
            for name,url,mode in JOBS:
                await shot_one(browser, name, url, mode, logf)
            await browser.close()
        logf.write(f"end {datetime.datetime.now(ZoneInfo('Asia/Taipei'))}\n")

if __name__ == "__main__":
    asyncio.run(main())
