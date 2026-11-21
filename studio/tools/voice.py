"""2단계: dialog.json의 캐릭터 대사를 합성해 내레이션 문장 사이 쉼에 끼워 넣고,
build/f_<part>.wav(최종 음성), build/final.json, drugs/<약>/timing.js를 만든다.
사용: python tools/voice.py drugs/<약>   (대사 mp3는 voice/ 폴더에 캐시, 문구를 바꾸면 해당 파일을 지우고 다시 실행)"""
import sys,os,json,hashlib,numpy as np
from common import *
sys.path.insert(0,os.path.dirname(__file__));import tts
d,cfg=load_drug(sys.argv[1]);M=json.load(open(os.path.join(d,'build','map.json')));DL=json.load(open(os.path.join(d,'dialog.json')))
V=DL['voices'];os.makedirs(os.path.join(d,'voice'),exist_ok=True)
def line(who,say):
    if who=='both':
        a,b=line('park',say),line('haru',say);n=max(len(a),len(b))
        return np.pad(a,(0,n-len(a)))*0.8+np.pad(b,(0,n-len(b)))*0.8
    v=V[who];h=hashlib.md5(f"{v['voice']}|{v['rate']}|{v['pitch']}|{say}".encode()).hexdigest()[:10]
    f=os.path.join(d,'voice',f'{who}_{h}.mp3')
    if not os.path.exists(f): tts.say(v['voice'],say,f,v['rate'],v['pitch'])
    a=read_audio(f);idx=np.where(np.abs(a)>300)[0]
    a=a[max(0,idx[0]-240):idx[-1]+480] if len(idx) else a
    if say.rstrip().endswith('?'): a=rise(a)          # 의문문은 끝을 올림
    return a*v.get('gain',1.0)
def rise(a,tail=0.55,up=1.45):
    import pyworld as pw
    x=a.astype(np.float64)/32768;f0,t=pw.harvest(x,SR,frame_period=5);sp=pw.cheaptrick(x,f0,t,SR);ap=pw.d4c(x,f0,t,SR)
    v=np.where(f0>0)[0]
    if len(v)<10: return a
    end=t[v[-1]];k=(t>end-tail)&(t<=end+0.05);r=np.clip((t-(end-tail))/tail,0,1)
    f0=np.where(k&(f0>0),f0*(1+(up-1)*r**1.6),f0)
    y=pw.synthesize(f0,sp,ap,SR,frame_period=5)[:len(x)]
    return (y*32768).astype(np.float32)
def fwd_tight(p,o):
    K=M[p]['knots']
    for i in range(len(K)-1):
        n0,o0=K[i];n1,o1=K[i+1]
        if o0<=o<=o1: return n0+(n1-n0)*(o-o0)/(o1-o0) if o1>o0 else n0
    return K[-1][0]+(o-K[-1][1])
OUT={}
for P in cfg['parts']:
    p=P['part']
    if P.get('bridge'):
        b=DL['bridges'][p];la=line(b['who'],b['say']);t0=b.get('at',1.4);dur=round(max(b.get('min_dur',4.5),t0+len(la)/SR+1.2),3)
        fa=np.zeros(int(dur*SR),np.float32);fa[int(t0*SR):int(t0*SR)+len(la)]+=la
        write_wav(os.path.join(d,'build',f'f_{p}.wav'),fa)
        OUT[p]={'dur':dur,'knots':None,'ins':[],'dialog':[{'who':b['who'],'text':b['bubble'],'t0':t0,'t1':round(t0+len(la)/SR+.45,3),'with':[]}]};continue
    nw=os.path.join(d,'build',f'n_{p}.wav');a=read_audio(nw);T=len(a)/SR
    if M[p].get('cues'):
        C=M[p]['cues'];pts=[0.0]+[((C[i]['end']-0.2)+C[i+1]['start'])/2 for i in range(len(C)-1)]+[T]   # 문장 사이에만 끼움
    else:
        st,en=silences(nw,0.28);pts=[0.0]+[(s+e)/2 for s,e in zip(st,en)]+[T]
    groups={}
    for L in DL['lines'].get(p,[]):
        tau=fwd_tight(p,L['at']);cand=[x for x in pts if x>=tau-0.6] or [T]
        groups.setdefault(round(min(cand,key=lambda x:abs(x-tau)),3),[]).append(L)
    pieces=[];last=0;acc=0;ins=[];dialog=[]
    for g in sorted(groups):
        i=int(g*SR);pieces.append(a[last:i]);last=i;gap=[np.zeros(int(.3*SR),np.float32)];off=.3
        for L in groups[g]:
            la=line(L['who'],L['say']);du=len(la)/SR;t0=g+acc+off
            dialog.append({'who':L['who'],'text':L['bubble'],'t0':round(t0,3),'t1':round(t0+du+.45,3),'with':L.get('with',[])})
            gap+= [la,np.zeros(int(.3*SR),np.float32)];off+=du+.3
        gap.append(np.zeros(int((1.3 if g>=T-0.05 else .1)*SR),np.float32));   # 장면 끝 대사면 여운을 둠
        G=np.concatenate(gap);pieces.append(G);ins.append([round(g,4),round(len(G)/SR,4)]);acc+=len(G)/SR
    pieces.append(a[last:]);write_wav(os.path.join(d,'build',f'f_{p}.wav'),np.concatenate(pieces))
    OUT[p]={'dur':round(M[p]['dur']+acc,3),'knots':M[p]['knots'],'ins':ins,'dialog':dialog,'cues':M[p].get('cues')};print(p,OUT[p]['dur'],len(dialog),'lines')
json.dump(OUT,open(os.path.join(d,'build','final.json'),'w'),ensure_ascii=False,indent=1)
open(os.path.join(d,'timing.js'),'w').write('const TIMING='+json.dumps(OUT,ensure_ascii=False)+';\nconst DRUG_HL='+json.dumps(cfg.get('highlight',{}),ensure_ascii=False)+';\n')
