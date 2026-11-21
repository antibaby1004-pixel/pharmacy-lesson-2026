"""한국어 음성 합성 (Microsoft 신경망 음성, edge-tts). 사용: python tts.py VOICE "문장" out.mp3 [rate] [pitch]"""
import sys,os,asyncio
try:
    import certifi
    for b in (os.path.expanduser('~/.ccr/ca-bundle.crt'),'/root/.ccr/ca-bundle.crt'):
        if os.path.exists(b): certifi.where=lambda b=b: b; break
except ImportError: pass
import edge_tts
async def synth(voice,text,out,rate='+0%',pitch='+0Hz'):
    await edge_tts.Communicate(text,voice,rate=rate,pitch=pitch).save(out)
def say(voice,text,out,rate='+0%',pitch='+0Hz'): asyncio.run(synth(voice,text,out,rate,pitch))
if __name__=='__main__': say(*sys.argv[1:])
