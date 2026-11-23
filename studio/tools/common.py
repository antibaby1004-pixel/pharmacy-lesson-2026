import os,json,subprocess,wave,numpy as np
SR=24000
STUDIO=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load_drug(d):
    d=os.path.abspath(d);cfg=json.load(open(os.path.join(d,'drug.json')))
    os.makedirs(os.path.join(d,'build'),exist_ok=True);return d,cfg
def read_audio(path):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-ac','1','-ar',str(SR),'-f','s16le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.int16).astype(np.float32)
def write_wav(path,a):
    with wave.open(path,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(np.clip(a,-32767,32767).astype(np.int16).tobytes())
def silences(path,th,db=-45):
    import re
    log=subprocess.run(['ffmpeg','-i',path,'-af',f'silencedetect=n={db}dB:d={th}','-f','null','-'],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)];en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
    return st,en

def fade(a,ms=15):
    """문장 앞뒤를 짧게 페이드 — 잘린 지점의 '딱' 소리(클릭) 제거"""
    n=min(int(SR*ms/1000),len(a)//2)
    if n>1:
        a=a.copy();r=np.linspace(0,1,n,dtype=np.float32);a[:n]*=r;a[-n:]*=r[::-1]
    return a
