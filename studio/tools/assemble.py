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
for p,cues in cap.items():
    if p not in F: continue
    L=[{'start':round(fwd(p,c['start']),3),'end':round(fwd(p,c['end']),3),'text':c['text']} for c in cues]
    L+=[{'start':x['t0'],'end':x['t1'],'text':('박 선배' if x['who']=='park' else '하루')+': '+x['text'].replace('<br>',' ')} for x in F[p]['dialog']]
    L.sort(key=lambda c:c['start'])
    for i in range(len(L)-1):
        if L[i]['end']>L[i+1]['start']: L[i]['end']=L[i+1]['start']
    new[p]=L
dist=os.path.join(B,'dist');shutil.rmtree(dist,ignore_errors=True);shutil.copytree(os.path.join(STUDIO,'player'),dist)
os.makedirs(os.path.join(dist,'fonts'),exist_ok=True)
for f in os.listdir(os.path.join(STUDIO,'lib')):
    if f.endswith('.woff2'): shutil.copy(os.path.join(STUDIO,'lib',f),os.path.join(dist,'fonts',f))
open(os.path.join(dist,'captions.js'),'w').write('const captions='+json.dumps(new,ensure_ascii=False)+';')
app=open(os.path.join(d,'source','app.js')).read()
app=re.sub(r"file:('?[\w]+'?),duration:[\d.]+",lambda m:f"file:{m.group(1)},duration:{F[m.group(1).strip(chr(39))]['dur']}" if m.group(1).strip("'") in F else m.group(0),app)
open(os.path.join(dist,'app.js'),'w').write(app)
for p in cfg.get('player_parts',[]): shutil.copy(os.path.join(B,'parts',f'part{p}.mp4'),dist)
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss','6','-i',os.path.join(B,'설명영상_1440p.mp4'),'-frames:v','1','-vf','scale=1280:-1',os.path.join(dist,'poster.png')])
print('완성:',os.path.join(B,'설명영상_1440p.mp4'),'/',dist)
