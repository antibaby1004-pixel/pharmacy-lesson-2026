"""1단계: 내레이션의 긴 쉼(threshold초 초과)을 keep*2초로 줄이고 시각 대응표(build/map.json)를 만든다.
사용: python tools/tighten.py drugs/<약>"""
import sys,os,json,numpy as np
from common import *
d,cfg=load_drug(sys.argv[1]);T=cfg.get('tighten',{});TH=T.get('threshold',0.7);KEEP=T.get('keep',0.25);PAD=T.get('tail_pad_if_short',0.6)
out={}
for P in cfg['parts']:
    if P.get('bridge'): continue
    p=P['part'];src=os.path.join(d,P['narration']);a=read_audio(src);D=len(a)/SR
    tmp=os.path.join(d,'build',f'_src_{p}.wav');write_wav(tmp,a)
    st,en=silences(tmp,TH)
    if len(en)<len(st): en.append(D)
    cuts=[]
    for s,e in zip(st,en):
        if e-s<=TH: continue
        ca,cb=(s+KEEP,e-KEEP) if e<D-0.05 else (s+0.5,D)
        if cb-ca>0.02: cuts.append((ca,cb))
    keep=[];t=0
    for s,e in cuts: keep.append((t,s));t=e
    keep.append((t,D));segs=[];knots=[];nt=0
    for s,e in keep:
        i0,i1=int(s*SR),int(e*SR);seg=a[i0:i1].copy();f=min(len(seg),int(.008*SR))
        if f>1: seg[:f]*=np.linspace(0,1,f);seg[-f:]*=np.linspace(1,0,f)
        segs.append(seg);knots.append([round(nt,4),round(s,4)]);nt+=(i1-i0)/SR;knots.append([round(nt,4),round(e,4)])
    write_wav(os.path.join(d,'build',f'n_{p}.wav'),np.concatenate(segs))
    vd=P.get('video_dur',D);pad=PAD if D<vd-0.3 else 0.0
    out[p]={'old':round(D,3),'new':round(nt,3),'dur':round(nt+pad,3),'knots':knots};os.remove(tmp)
    print(p,round(D,2),'->',out[p]['dur'])
json.dump(out,open(os.path.join(d,'build','map.json'),'w'),indent=1)
