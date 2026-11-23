"""3단계: 장면 HTML을 30fps·1920×1080으로 찍고 최종 음성을 붙여 build/parts/part<part>.mp4를 만든다.
사용: python tools/render.py drugs/<약> [part ...]   (part를 안 주면 전부)
필요: Google Chrome(또는 Chromium), playwright, ffmpeg"""
import sys,os,json,math,asyncio,subprocess,shutil
from common import *
from playwright.async_api import async_playwright
FPS=30
d,cfg=load_drug(sys.argv[1]);F=json.load(open(os.path.join(d,'build','final.json')))
want=sys.argv[2:] or [P['part'] for P in cfg['parts']];os.makedirs(os.path.join(d,'build','parts'),exist_ok=True)
chrome=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
async def one(b,P):
    p=P['part'];D=F[p]['dur'];N=math.ceil(D*FPS);out=os.path.join(d,'build','parts',f'part{p}.mp4')
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-i','-','-i',os.path.join(d,'build',f'f_{p}.wav'),'-map','0:v','-map','1:a','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','24000','-af','apad','-t',f'{D:.3f}','-movflags','+faststart',out],stdin=subprocess.PIPE)
    ctx=await b.new_context(viewport={'width':1920,'height':1080},device_scale_factor=1);pg=await ctx.new_page()
    await pg.goto('file://'+os.path.join(d,'scenes',P['scene']));await pg.wait_for_timeout(600)
    for i in range(N):
        await pg.evaluate(f'render({min(i/FPS,D-0.001)})');ff.stdin.write(await pg.screenshot(type='jpeg',quality=93))
    await ctx.close();ff.stdin.close();ff.wait();print(p,'done',N,flush=True)
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=chrome) if chrome else await pw.chromium.launch()
        for P in cfg['parts']:
            if P['part'] in want: await one(b,P)
        await b.close()
asyncio.run(main())
