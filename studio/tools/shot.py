"""확인용 정지화면: python tools/shot.py drugs/<약> part t1 t2 ... -> build/shots/<part>_<t>.jpg (t는 최종 시각)"""
import sys,os,json,asyncio
from common import *
from playwright.async_api import async_playwright
d,cfg=load_drug(sys.argv[1]);part=sys.argv[2];ts=[float(x) for x in sys.argv[3:]]
sc={P['part']:P['scene'] for P in cfg['parts']}[part];os.makedirs(os.path.join(d,'build','shots'),exist_ok=True)
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch();pg=await b.new_page(viewport={'width':1920,'height':1080})
        await pg.goto('file://'+os.path.join(d,'scenes',sc));await pg.wait_for_timeout(500)
        for t in ts:
            await pg.evaluate(f'render({t})');await pg.screenshot(path=os.path.join(d,'build','shots',f'{part}_{t}.jpg'),type='jpeg',quality=80)
        await b.close()
asyncio.run(main())
