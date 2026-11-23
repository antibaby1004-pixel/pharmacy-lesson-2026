"""1단계(새 음성): narration.json의 문장을 무료 한국어 신경망 음성으로 문장마다 합성해
build/n_<part>.wav(내레이션), build/map.json(새 시각↔원본 시각 대응표·문장 자막)을 만든다.
장면 그림은 원본 시각 기준으로 짜여 있으므로, 대응표로 새 음성에 자동으로 맞춰진다.
사용: python tools/narrate.py drugs/<약>   (문장 mp3는 voice/에 캐시 — 문구를 바꾸면 그 문장만 다시 합성)"""
import sys,os,json,hashlib,numpy as np
from common import *
sys.path.insert(0,os.path.dirname(__file__));import tts
d,cfg=load_drug(sys.argv[1]);N=json.load(open(os.path.join(d,'narration.json')))
V=N['voices'];GAP=N.get('gap',0.35);LEAD=N.get('lead',0.15);TAIL=N.get('tail',0.45)
os.makedirs(os.path.join(d,'voice'),exist_ok=True)
def synth(vk,say):
    v=V[vk];h=hashlib.md5(f"{v['voice']}|{v['rate']}|{v['pitch']}|{say}".encode()).hexdigest()[:10]
    f=os.path.join(d,'voice',f'n{vk}_{h}.mp3')
    if not os.path.exists(f): tts.say(v['voice'],say,f,v['rate'],v['pitch'])
    a=read_audio(f);idx=np.where(np.abs(a)>40)[0]   # v23: 말끝·첫소리가 잘리지 않게 여유 있게 자름(예전 250 기준은 앞 70ms·끝 110ms를 잘라 뚝뚝 끊겼음)
    a=a[max(0,idx[0]-int(0.02*SR)):idx[-1]+int(0.06*SR)] if len(idx) else a
    a=a*v.get('gain',1.0);pk=np.abs(a).max() or 1
    return fade(a*(0.89*32767/pk))          # 문장마다 피크를 같게 맞춰 목소리 간 음량 차이를 줄임
out={};vd={P['part']:P.get('video_dur') for P in cfg['parts']}
for p,sents in N['parts'].items():
    pieces=[np.zeros(int(LEAD*SR),np.float32)];t=LEAD;knots=[[0.0,0.0]];cues=[];lo=0.0
    for i,s in enumerate(sents):
        a=synth(s['v'],s['say']);du=len(a)/SR
        o0=max(s['old'][0],lo);o1=max(s['old'][1],o0+0.05)
        knots.append([round(t,4),round(o0,4)]);knots.append([round(t+du,4),round(o1,4)]);lo=o1
        cues.append({'start':round(t,3),'end':round(t+du+0.2,3),'text':s['text'],'v':s['v']})
        pieces.append(a);t+=du
        g=GAP if i<len(sents)-1 else TAIL;pieces.append(np.zeros(int(g*SR),np.float32));t+=g
    oend=max(vd.get(p) or lo+TAIL,lo+0.05);knots.append([round(t,4),round(oend,4)])
    write_wav(os.path.join(d,'build',f'n_{p}.wav'),np.concatenate(pieces))
    out[p]={'old':oend,'new':round(t,3),'dur':round(t,3),'knots':knots,'cues':cues}
    print(p,'old',round(oend,2),'-> new',round(t,2),'s',len(sents),'sentences')
json.dump(out,open(os.path.join(d,'build','map.json'),'w'),ensure_ascii=False,indent=1)
