"""4단계: 장면 MP4를 이어 build/설명영상_1440p.mp4를 만들고, 온라인 플레이어 폴더 build/dist/를 만든다
(자막 시각·장면 길이를 최종 음성에 맞춰 다시 계산, 캐릭터 대사 자막 추가).
사용: python tools/assemble.py drugs/<약>"""
import sys,os,json,re,shutil,subprocess
from common import *
d,cfg=load_drug(sys.argv[1]);F=json.load(open(os.path.join(d,'build','final.json')));B=os.path.join(d,'build')
lst=os.path.join(B,'parts','list.txt');open(lst,'w').write(''.join(f"file 'part{p}.mp4'\n" for p in cfg['order']))
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy',os.path.join(B,'설명영상_1440p.mp4')],check=True)
def fwd(p,o):
    K=F[p]['knots'];tau=None
    for i in range(len(K)-1):
        n0,o0=K[i];n1,o1=K[i+1]
        if o0<=o<=o1: tau=n0+(n1-n0)*(o-o0)/(o1-o0) if o1>o0 else n0;break
    if tau is None: tau=K[-1][0]+(o-K[-1][1])
    return min(F[p]['dur'],tau+sum(x for t,x in F[p]['ins'] if t<tau-1e-6))
src=open(os.path.join(d,'source','captions.js')).read();cap=json.loads(src[src.index('{'):src.rindex('}')+1]);new={}
def shift(p,t): return round(t+sum(x for ti,x in F[p]['ins'] if ti<t-1e-6),3)
for p in F:
    if F[p].get('knots') is None: continue
    if F[p].get('cues'): L=[{'start':shift(p,c['start']),'end':shift(p,c['end']),'text':c['text']} for c in F[p]['cues']]
    elif p in cap: L=[{'start':round(fwd(p,c['start']),3),'end':round(fwd(p,c['end']),3),'text':c['text']} for c in cap[p]]
    else: continue
    L+=[{'start':x['t0'],'end':x['t1'],'text':{'park':'박 선배','haru':'하루','wang':'왕교수','skull':'해골약사','both':'다 함께'}.get(x['who'],x['who'])+': '+x['text'].replace('<br>',' ')} for x in F[p]['dialog']]
    L.sort(key=lambda c:c['start'])
    for i in range(len(L)-1):
        if L[i]['end']>L[i+1]['start']: L[i]['end']=L[i+1]['start']
    new[p]=L
dist=os.path.join(B,'dist');shutil.rmtree(dist,ignore_errors=True);shutil.copytree(os.path.join(STUDIO,'player'),dist)
os.makedirs(os.path.join(dist,'fonts'),exist_ok=True)
for f in os.listdir(os.path.join(STUDIO,'lib')):
    if f.endswith('.woff2'): shutil.copy(os.path.join(STUDIO,'lib',f),os.path.join(dist,'fonts',f))
open(os.path.join(dist,'captions.js'),'w').write('const captions='+json.dumps(new,ensure_ascii=False)+';\nconst DRUG_HL='+json.dumps(cfg.get('highlight',{}),ensure_ascii=False)+';')
# 유튜브 구간 한국어 자막(studio/yt_ko/<영상ID>.txt, '초|문장')
_app=open(os.path.join(d,'source','app.js')).read();_K={}
for _vid in set(re.findall(r"id: ?['\"]([A-Za-z0-9_-]{11})['\"]",_app)):
    _p=os.path.join(STUDIO,'yt_ko',_vid+'.txt')
    if os.path.exists(_p): _K[_vid]=[[float(a),b] for a,b in (l.strip().split('|',1) for l in open(_p,encoding='utf-8') if '|' in l)]
open(os.path.join(dist,'captions.js'),'a').write('\nconst YTKO='+json.dumps(_K,ensure_ascii=False)+';')
shutil.copy(os.path.join(STUDIO,'lib','highlight.js'),dist)
ix=os.path.join(dist,'index.html');DN=json.load(open(os.path.join(STUDIO,'display_names.json'))).get(os.path.basename(os.path.abspath(d)));NM=f'{DN[0]} ({DN[1]})' if DN else cfg.get('name','');h=open(ix).read().replace('{{NAME}}',NM).replace('{{NO}}',str(cfg.get('no','01')).zfill(2));open(ix,'w').write(h)
app=open(os.path.join(d,'source','app.js')).read()
app=re.sub(r"file:('?[\w]+'?),duration:[\d.]+",lambda m:f"file:{m.group(1)},duration:{F[m.group(1).strip(chr(39))]['dur']}" if m.group(1).strip("'") in F else m.group(0),app)
open(os.path.join(dist,'app.js'),'w').write(app)
# 웹용: 1920×1080(lanczos)로 다시 인코딩 — 휴대폰·저사양 PC에서도 끊김 없이, 48 kHz 음성
for p in cfg.get('player_parts',[]):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',os.path.join(B,'parts',f'part{p}.mp4'),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','medium','-crf','22','-tune','animation','-profile:v','high','-level','4.1','-pix_fmt','yuv420p','-g','90','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart',os.path.join(dist,f'part{p}.mp4')],check=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss','3.2','-i',os.path.join(B,'설명영상_1440p.mp4'),'-frames:v','1','-vf','scale=1280:-1',os.path.join(dist,'poster.png')])
print('완성:',os.path.join(B,'설명영상_1440p.mp4'),'/',dist)
