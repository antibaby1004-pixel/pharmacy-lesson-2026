"""소개 장면 생성기 (v11).
1단계(첫 문장): 실제 제품 사진을 크게 띄우고 상품명을 소개.
2단계(둘째 문장부터): 사진을 오른쪽 위로 작게 줄이고, 설명 글귀를 크게 쌓는다.
설정: drug.json 의 "intro" 블록. 사용: python tools/intro_gen.py drugs/<약>
"""
import sys, os, json, re

def pen(label, sub='', color='#5B7FA6'):
    return f'''<svg viewBox="0 0 640 300"><rect x="70" y="110" width="440" height="80" rx="40" fill="#fff" stroke="#243341" stroke-width="7"/>
<rect x="150" y="128" width="160" height="44" rx="10" fill="#EEF6FB" stroke="#9FB4C6" stroke-width="3"/><rect x="440" y="104" width="120" height="92" rx="30" fill="{color}" stroke="#243341" stroke-width="7"/>
<rect x="30" y="126" width="60" height="48" rx="14" fill="#B6C6D2" stroke="#243341" stroke-width="6"/>
<text x="320" y="262" text-anchor="middle" font-size="44" font-weight="700" fill="#243341">{label}</text>
<text x="320" y="60" text-anchor="middle" font-size="30" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

def vial(label, sub='', cap='#7B6FD0'):
    return f'''<svg viewBox="0 0 300 420"><rect x="95" y="40" width="110" height="44" rx="8" fill="{cap}" stroke="#243341" stroke-width="6"/>
<rect x="110" y="84" width="80" height="26" fill="#DDE4EA" stroke="#243341" stroke-width="5"/>
<path d="M80 110 h140 a20 20 0 0 1 20 20 v220 a30 30 0 0 1 -30 30 h-120 a30 30 0 0 1 -30 -30 v-220 a20 20 0 0 1 20 -20z" fill="#fff" stroke="#243341" stroke-width="6"/>
<rect x="84" y="200" width="132" height="110" rx="10" fill="#F3F7FA" stroke="#9FB4C6" stroke-width="3"/>
<text x="150" y="252" text-anchor="middle" font-size="36" font-weight="700" fill="#243341">{label}</text>
<text x="150" y="290" text-anchor="middle" font-size="22" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''


def inhaler(label, sub='', color='#E0703A'):
    return f'''<svg viewBox="0 0 420 420"><rect x="120" y="30" width="150" height="250" rx="40" fill="{color}" stroke="#243341" stroke-width="7"/>
<path d="M110 250 h170 v60 a20 20 0 0 1 -20 20 h-40 v70 h-50 v-70 h-40 a20 20 0 0 1 -20 -20z" fill="#fff" stroke="#243341" stroke-width="7"/>
<rect x="145" y="80" width="100" height="70" rx="12" fill="#fff" opacity=".85"/><text x="195" y="125" text-anchor="middle" font-size="30" font-weight="700" fill="#243341">{label}</text>
<text x="300" y="380" font-size="26" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

def bag(label, sub='', color='#3A8FB7'):
    return f'''<svg viewBox="0 0 320 420"><path d="M60 40 h200 a20 20 0 0 1 20 20 v260 a40 40 0 0 1 -40 40 h-160 a40 40 0 0 1 -40 -40 v-260 a20 20 0 0 1 20 -20z" fill="#EEF6FB" stroke="#243341" stroke-width="7"/>
<rect x="135" y="360" width="50" height="40" rx="8" fill="{color}" stroke="#243341" stroke-width="5"/><rect x="80" y="120" width="160" height="120" rx="12" fill="#fff" stroke="#9FB4C6" stroke-width="3"/>
<text x="160" y="175" text-anchor="middle" font-size="34" font-weight="700" fill="#243341">{label}</text><text x="160" y="215" text-anchor="middle" font-size="22" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

def tablet(label, sub='', color='#FFFFFF'):
    return f'''<svg viewBox="0 0 420 300"><ellipse cx="210" cy="130" rx="150" ry="95" fill="{color}" stroke="#243341" stroke-width="7"/><path d="M60 130 h300" stroke="#C9D6E0" stroke-width="4"/>
<text x="210" y="270" text-anchor="middle" font-size="40" font-weight="700" fill="#243341">{label}</text><text x="210" y="122" text-anchor="middle" font-size="26" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

def patch(label, sub='', color='#F2E6D8'):
    return f'''<svg viewBox="0 0 460 340"><rect x="40" y="40" width="380" height="230" rx="26" fill="{color}" stroke="#243341" stroke-width="7"/><rect x="70" y="70" width="320" height="170" rx="16" fill="#fff" opacity=".6" stroke="#C9B79F" stroke-width="3" stroke-dasharray="10 8"/>
<text x="230" y="160" text-anchor="middle" font-size="40" font-weight="700" fill="#243341">{label}</text><text x="230" y="205" text-anchor="middle" font-size="24" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

def pfs(label, sub='', color='#7FC6CA'):
    return f'''<svg viewBox="0 0 640 260"><rect x="120" y="100" width="340" height="60" rx="14" fill="#fff" stroke="#243341" stroke-width="7"/><rect x="140" y="112" width="220" height="36" fill="{color}" opacity=".5"/>
<path d="M460 80 v100" stroke="#243341" stroke-width="10"/><rect x="460" y="118" width="120" height="24" fill="#B6C6D2" stroke="#243341" stroke-width="5"/><rect x="574" y="96" width="22" height="68" rx="6" fill="#B6C6D2" stroke="#243341" stroke-width="5"/>
<path d="M120 130 h-90" stroke="#243341" stroke-width="5"/><text x="300" y="232" text-anchor="middle" font-size="40" font-weight="700" fill="#243341">{label}</text><text x="300" y="60" text-anchor="middle" font-size="26" font-weight="600" fill="#3F4D5A">{sub}</text></svg>'''

DRAW = {'pen': pen, 'vial': vial, 'inhaler': inhaler, 'bag': bag, 'tablet': tablet, 'patch': patch, 'pfs': pfs}

def build(dr):
    cfg = json.load(open(os.path.join(dr, 'drug.json')))
    I = cfg['intro']
    N = json.load(open(os.path.join(dr, 'narration.json')))['parts']['intro']
    tB = N[1]['old'][0] if len(N) > 1 else 4.0
    old = open(os.path.join(dr, 'scenes', 'intro.html')).read()
    m = re.search(r'<div class="chip">(.*?)</div>', old)
    chip = I.get('chip') or (m.group(1) if m else cfg['name'])
    figs = ''
    for p in I['photos']:
        if 'img' in p:
            body = f'<img src="{p["img"]}">'
        else:
            body = DRAW[p['draw']](*p.get('args', []))
        figs += f'<figure>{body}<figcaption>{p.get("label","")}</figcaption></figure>'
    capsrc = I.get('photo_note', '실제 제품 사진' if any('img' in p for p in I['photos']) else '제품 그림 · 실제 사진 준비 중')
    rows = ''.join(
        f'<div class="card fr {r.get("cls","")}" data-in="{r["t"]}"><span class="lab">{r["lab"]}</span><div class="v">{r["v"]}</div></div>'
        for r in I['facts'])
    acts = json.dumps(I.get('actions', []), ensure_ascii=False)
    acts = re.sub(r'"(\w+)":', r'\1:', acts)
    char2 = ''
    if I.get('cameo_actions'):
        a2 = re.sub(r'"(\w+)":', r'\1:', json.dumps(I['cameo_actions'], ensure_ascii=False))
        char2 = f"SCENE.char2=makeChar({a2},'cameo');"
    html = f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../../lib/common.css"><style>
svg text{{font-family:P}}
.nm{{position:absolute;left:96px;top:170px;transform-origin:0 0;white-space:nowrap}}
.nm .t{{font-size:128px;line-height:136px;font-weight:700;letter-spacing:-.03em;margin:0}}
.nm .t span{{font-size:60px;font-weight:600;color:var(--muted);margin-left:20px;letter-spacing:0}}
.nm .inn{{font-size:52px;line-height:64px;font-weight:700;margin:4px 0 0}}
.ph{{position:absolute;left:96px;top:390px;width:1344px;height:620px;box-sizing:border-box;padding:26px 30px 18px;transform-origin:0 0;display:flex;flex-direction:column;z-index:4}}
.ph .im{{flex:1;display:flex;gap:36px;justify-content:center;align-items:stretch;min-height:0}}
.ph figure{{margin:0;flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:12px}}
.ph figure img,.ph figure svg{{flex:1;min-height:0;width:100%;object-fit:contain;border-radius:12px}}
.ph figcaption{{font-size:38px;font-weight:700;color:#243341;text-align:center}}
.ph .cap{{font-size:26px;color:var(--muted);font-weight:600;margin-top:6px}}
.facts{{position:absolute;left:96px;top:322px;width:810px;display:flex;flex-direction:column;gap:16px}}
.fr{{display:grid;grid-template-columns:190px 1fr;gap:22px;align-items:center;padding:20px 28px}}
.fr .lab{{font-size:30px}}.fr .v{{font-size:42px;line-height:54px;font-weight:700}}
.fr.amb{{border-color:#F3C58A;background:#FFF7EC}}.fr.amb .lab,.fr.amb .v{{color:#7D4A00}}
.fr.red{{border-color:#F2B8B2;background:#FCE9E7}}.fr.red .lab,.fr.red .v{{color:#8E2219}}
</style></head><body><div class="stage">
<div class="fade"><header class="top"><div class="sec"><b>약물 소개</b> · DRUG OVERVIEW</div><div class="chip">{chip}</div></header></div>
<div class="fade">
<div class="nm" id="nm"><p class="t">{I['title']}<span>{I['en']}</span></p><p class="inn">{I['inn']}</p></div>
<div class="card ph" id="ph"><div class="im">{figs}</div><div class="cap" id="cap">{capsrc}</div></div>
<div class="facts">{rows}</div>
</div>
</div>
<script src="../timing.js"></script><script src="../../../lib/core.js"></script><script>
useTiming('intro');const $i=i=>document.getElementById(i);const TB={tB};
SCENE.anim=(o,T)=>{{const k=ease(seg(o,TB-0.25,TB+0.75));
 $i('nm').style.transform=`scale(${{lerp(1,.6,k)}})`;$i('nm').style.opacity=Math.max(seg(o,0.2,0.7),seg(T||0,1.6,2.2));
 const ph=$i('ph');ph.style.opacity=seg(o,0.8,1.3);ph.style.transform=`translate(${{lerp(0,834,k)}}px,${{lerp(0,-200,k)}}px) scale(${{lerp(1,.38,k)}})`;
 ph.querySelectorAll('figcaption,.cap').forEach(e=>e.style.opacity=1-seg(o,TB-0.3,TB+0.2))}};
SCENE.char=makeChar({acts},'lead');{char2}
</script><script src="../../../lib/highlight.js"></script></body></html>
'''
    open(os.path.join(dr, 'scenes', 'intro.html'), 'w').write(html)
    print(dr, 'intro.html', 'tB=', tB)

if __name__ == '__main__':
    for a in sys.argv[1:]:
        build(a)
