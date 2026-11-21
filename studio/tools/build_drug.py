"""스펙(spec.json) 하나로 약물 폴더 전체를 만든다 (v12 템플릿).
사용: python tools/build_drug.py drugs/<slug>
spec.json 구조(요약):
  name, no, chip, voice(내레이터), cast{lead,cameo}, highlight, props
  greet{say,bubble}            — 소개 장면 첫 대사(주연, 약 이름 포함)
  intro{title,en,inn,photos,sents,facts[{s,lab,v,cls}]}
  parts[ {id,type: mech|ytslot|rows|summary, title(플레이어), sec, h1, sents, ...} ]
    mech : steps[{s,h,p}], key{s,text}, fig(SVG 안쪽), js(애니메이션; o=원본초, S[i]=문장 시작)
    rows : rows[{s,lab,v,cls}]
    summary : cards[{s,lab,v,cls}], cameo_say/cameo_bubble
    ytslot : 기전 유튜브 자리(링크 확정 전) — 문장 2개 고정
  lines{part:[{who: lead|cameo, after: 문장번호, say, bubble, act}]}
문장 sents 항목은 "화면문장" 또는 ["화면문장","읽기문장"].
"""
import sys, os, json, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {
    'park': {"voice": "en-US-AndrewMultilingualNeural", "rate": "+8%", "pitch": "-8Hz", "gain": 1.45},
    'haru': {"voice": "en-US-EmmaMultilingualNeural", "rate": "+22%", "pitch": "+20Hz", "gain": 1.15},
    'wang': {"voice": "en-US-BrianMultilingualNeural", "rate": "+6%", "pitch": "-14Hz", "gain": 1.35},
    'skull': {"voice": "it-IT-GiuseppeMultilingualNeural", "rate": "+16%", "pitch": "-2Hz", "gain": 1.3},
}
NARR = {'sunhi': ("ko-KR-SunHiNeural", "+4%"), 'hyunsu': ("ko-KR-HyunsuMultilingualNeural", "+4%"), 'injoon': ("ko-KR-InJoonNeural", "+6%")}

def ts(sents):
    t = 0.1; out = []
    for s in sents:
        text, say = (s, s) if isinstance(s, str) else (s[0], s[1])
        d = len(re.sub(r'[\s,.·?!]', '', say)) / 6.6
        out.append({"v": "A", "old": [round(t, 2), round(t + d, 2)], "text": text, "say": say}); t += d + 0.4
    return out

def page(spec, part, sec, h1, css, body, js, center=None):
    cf = f"window.CENTER_FIRST={center};" if center is not None else ""
    return f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../../lib/common.css"><style>
svg text{{font-family:P}}
{css}
</style></head><body><div class="stage">
<div class="fade"><header class="top"><div class="sec">{sec}</div><div class="chip">{spec['chip']}</div></header>{('<h1>'+h1+'</h1>') if h1 else ''}</div>
<div class="fade">{body}</div>
</div>
<script src="../timing.js"></script><script src="../../../lib/core.js"></script><script>
useTiming('{part}');{cf}const $i=i=>document.getElementById(i);
{js}
</script><script src="../../../lib/highlight.js"></script></body></html>
'''

def jsobj(x):
    return re.sub(r'"(\w+)":', r'\1:', json.dumps(x, ensure_ascii=False))

POOL = ['point', 'nod', 'think', 'thumbs', 'clap']

def acts_for(N, props, seed, center=True):
    a = [{"k": "walk", "t0": 0.15, "t1": 1.2, "x0": 2250, "x1": 1640}]
    for i, s in enumerate(N[1:], 1):
        t0 = s['old'][0] + 0.2
        if (i + seed) % 2 == 0 and props:
            a.append({"k": "prop", "name": props[(i + seed) // 2 % len(props)], "t0": round(t0, 2), "t1": round(t0 + 2.6, 2)})
        else:
            k = POOL[(i + seed) % len(POOL)]
            x = {"k": k, "t0": round(t0, 2), "t1": round(t0 + 1.6, 2)}
            if k == 'point': x['ang'] = 100
            a.append(x)
    return a

ROWCSS = '''.box{position:absolute;left:96px;width:1344px;padding:20px 32px;display:grid;grid-template-columns:240px 1fr;align-items:center;gap:24px}
.box .lab{font-size:30px}.box .v{font-size:38px;font-weight:600;line-height:50px}
.box.red{border-color:#F2B8B2;background:#FCE9E7}.box.red .lab,.box.red .v{color:#8E2219}
.box.amb{border-color:#F3C58A;background:#FFF7EC}.box.amb .lab,.box.amb .v{color:#7D4A00}'''
MECH = '''.grid{display:grid;grid-template-columns:680px 1fr;gap:52px;width:1344px}.fig{height:640px;position:relative;overflow:hidden}'''
SUMCSS = '''.g{position:absolute;left:96px;top:262px;width:1344px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.c{padding:26px 30px;height:300px;box-sizing:border-box}.c .v{font-size:38px;font-weight:600;line-height:52px;margin-top:16px}
.c.red{border-color:#F2B8B2;background:#FCE9E7}.c.red .lab,.c.red .v{color:#8E2219}
.c.amb{border-color:#F3C58A;background:#FFF7EC}.c.amb .lab,.c.amb .v{color:#7D4A00}'''
YTCSS = '''.slot{position:absolute;left:96px;top:270px;width:1344px;height:620px;border:4px dashed #9FB4C6;border-radius:28px;background:#F3F7FA;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.slot .pl{width:150px;height:150px;border-radius:50%;background:#C9D6E0;display:flex;align-items:center;justify-content:center}
.slot .t{font-size:56px;font-weight:700;color:#243341}.slot .d{font-size:36px;font-weight:600;color:#3F4D5A;text-align:center;line-height:50px}'''

def build(dr):
    S = json.load(open(os.path.join(dr, 'spec.json')))
    os.makedirs(os.path.join(dr, 'scenes'), exist_ok=True); os.makedirs(os.path.join(dr, 'source'), exist_ok=True)
    nv, nr = NARR[S.get('voice', 'sunhi')]
    NARRJ = {"voices": {"A": {"voice": nv, "rate": nr, "pitch": "+0Hz", "gain": 1.0, "role": "전체 내레이션"}}, "gap": 0.35, "lead": 0.15, "tail": 0.45, "parts": {}}
    cast = S['cast']; props = S.get('props', ['book', 'magnifier', 'clock', 'pill'])
    parts = [{"part": "intro", "scene": "intro.html"}]; steps = []; lines = {}
    # ---- intro
    NI = ts(S['intro']['sents']); NARRJ['parts']['intro'] = NI
    I = S['intro']
    facts = [{"t": round(NI[f['s']]['old'][0], 2), "lab": f['lab'], "v": f['v'], **({"cls": f['cls']} if f.get('cls') else {})} for f in I['facts']]
    ia = [{"k": "walk", "t0": 0.25, "t1": 1.15, "x0": 960, "x1": 1640}] + acts_for(NI, props, 1)[1:]
    intro = {"title": I['title'], "en": I['en'], "inn": I['inn'], "photos": I['photos'], "facts": facts, "actions": ia}
    if I.get('photo_note'): intro['photo_note'] = I['photo_note']
    if S.get('chip'): intro['chip'] = S['chip']
    g = S['greet']
    lines['intro'] = [{"who": cast['lead'], "bubble": g['bubble'], "say": g['say'], "at": 0.0,
                       "with": [{"k": "walk", "dt": 0, "len": 0.9, "x0": 2250, "x1": 960}, {"k": "wave", "dt": 1.0, "len": 1.6}, {"k": "hop", "dt": 1.4, "len": 1.0}]}]
    steps.append({"title": S.get('intro_title', f"{S['name']} 소개"), "file": "intro", "duration": round(NI[-1]['old'][1] + 3)})
    seed = 0
    for P in S['parts']:
        pid = P['id']; seed += 1
        if P['type'] == 'ytslot':
            P.setdefault('sents', ["이 자리에는 기전 원본 영상이 들어갈 예정이에요.", "링크가 정해지면 이 구간에서 바로 이어서 재생돼요."])
        N = ts(P['sents']); NARRJ['parts'][pid] = N
        T = lambda i: round(N[i]['old'][0], 2)
        scene = f"{pid}.html"
        parts.append({"part": pid, "scene": scene, "video_dur": round(N[-1]['old'][1] + 0.4, 2)})
        steps.append({"title": P.get('title', pid), "file": pid, "duration": round(N[-1]['old'][1] + 2)})
        A = acts_for(N, props, seed)
        cam = []
        for L in S.get('lines', {}).get(pid, []):
            at = round(N[L['after']]['old'][1] + 0.2, 2)
            who = cast[L['who']]
            d = {"who": who, "bubble": L['bubble'], "say": L['say'], "at": at, "with": L.get('with', [{"k": L.get('act', 'nod'), "dt": 0, "len": 1.4}])}
            lines.setdefault(pid, []).append(d)
            if L['who'] == 'cameo':
                A.append({"k": "walk", "t0": round(max(0.2, at - 2.2), 2), "t1": round(max(0.9, at - 1.3), 2), "x0": "cur", "x1": 1560})
                A.sort(key=lambda a: a['t0'])
                cam += [{"k": "walk", "t0": round(max(0.3, at - 2.0), 2), "t1": round(max(1.0, at - 0.8), 2), "x0": 2300, "x1": 1840},
                        {"k": "walk", "t0": round(at + 0.6, 2), "t1": round(at + 1.8, 2), "x0": 1840, "x1": 2320}]
        c2 = f"SCENE.char2=makeChar({jsobj(cam)},'cameo');" if cam else ''
        if P['type'] == 'mech':
            st = '<div class="steps">' + ''.join(
                f'<div class="s" data-on="{T(x["s"])}{","+str(T(P["steps"][k+1]["s"])) if k+1 < len(P["steps"]) else ""}"><div class="n">{k+1}</div><div><h3>{x["h"]}</h3><p>{x["p"]}</p></div></div>'
                for k, x in enumerate(P['steps'])) + '</div>'
            key = f'<div class="key" data-in="{T(P["key"]["s"])}"><span class="k">KEY</span><span>{P["key"]["text"]}</span></div>' if P.get('key') else ''
            body = f'<div class="grid">{st}<div class="card fig"><svg width="100%" height="100%" viewBox="0 0 612 640">{P["fig"]}</svg></div></div>{key}<div class="fn">{P.get("fn","교육용 개념도")}</div>'
            js = f"const S={json.dumps([x['old'][0] for x in N])};\n{P.get('js','')}\nSCENE.char=makeChar({jsobj(A)},'lead');{c2}"
            html = page(S, pid, P['sec'], P['h1'], MECH + P.get('css', ''), body, js)
        elif P['type'] == 'rows':
            n = len(P['rows'])
            body = ''.join(f'<div class="card box {r.get("cls","")}" style="top:{262+i*130}px" data-in="{T(r["s"])}"><span class="lab">{r["lab"]}</span><div><div class="v">{r["v"]}</div></div></div>' for i, r in enumerate(P['rows']))
            js = f"SCENE.char=makeChar({jsobj(A)},'lead');{c2}"
            html = page(S, pid, P['sec'], P['h1'], ROWCSS, body, js, center=1.2)
        elif P['type'] == 'ytslot':
            body = f'<div class="slot" data-in="0.3"><div class="pl"><svg width="70" height="70" viewBox="0 0 70 70"><path d="M20 10 L60 35 L20 60z" fill="#fff"/></svg></div><div class="t">{P.get("label","기전 영상 자리")}</div><div class="d">원본 유튜브 영상의 재생 구간이 정해지면<br>이 자리에 연결됩니다</div></div>'
            A2 = [{"k": "walk", "t0": 0.2, "t1": 1.2, "x0": 2250, "x1": 1660}, {"k": "point", "t0": 1.4, "t1": 3.4, "ang": 100}, {"k": "think", "t0": T(1) + 0.2, "t1": T(1) + 2.0}]
            html = page(S, pid, P['sec'], P['h1'], YTCSS, body, f"SCENE.char=makeChar({jsobj(A2)},'lead');")
        elif P['type'] == 'summary':
            cards = ''.join(f'<div class="card c {c.get("cls","")}" data-in="{T(c["s"])}"><span class="lab">{c["lab"]}</span><div class="v">{c["v"]}</div></div>' for c in P['cards'])
            body = f'<div class="wm">{S.get("no","")}</div><div class="g">{cards}</div>'
            end = round(N[-1]['old'][1] + 0.2, 2)
            A[0]['x1'] = 1560
            js = ("const BT=((TIMING.summary.dialog||[]).find(d=>d.who==='both')||{}).t0||1e9;\n"
                  "SCENE.anim=(o,T)=>{const dm=1-.72*easeOut(seg(T,BT-1.1,BT-.2));document.querySelectorAll('.card,.wm').forEach(e=>e.style.filter=dm<1?`opacity(${dm})`:'')};\n"
                  f"SCENE.char=makeChar({jsobj(A)},'lead');\n"
                  f"SCENE.char2=makeChar({jsobj([{'k':'walk','t0':round(end-1.6,2),'t1':round(end-0.4,2),'x0':2300,'x1':1830},{'k':'nod','t0':round(end-0.2,2),'t1':round(end+0.6,2)}])},'cameo');")
            html = page(S, pid, P['sec'], P['h1'], SUMCSS, body, js, center=1.6)
            lines.setdefault(pid, []).extend([
                {"who": cast['cameo'], "bubble": P['cameo_bubble'], "say": P['cameo_say'], "at": end, "with": [{"k": "thumbs", "dt": 0, "len": 1.4}]},
                {"who": "both", "bubble": "수고하셨습니다!<br>안녕~!", "say": "수고하셨습니다! 안녕!", "at": end + 0.1,
                 "with": [{"k": "walk", "for": cast['lead'], "dt": 0, "len": 1.1, "x0": "cur", "x1": 840}, {"k": "walk", "for": cast['cameo'], "dt": 0, "len": 1.1, "x0": "cur", "x1": 1090},
                          {"k": "wave", "dt": 0.9, "len": 2.2}, {"k": "hop", "dt": 0.9, "len": 2.2}]}])
        open(os.path.join(dr, 'scenes', scene), 'w').write(html)
    # placeholder intro.html for intro_gen (chip)
    open(os.path.join(dr, 'scenes', 'intro.html'), 'w').write(f'<div class="chip">{S["chip"]}</div>')
    json.dump(NARRJ, open(os.path.join(dr, 'narration.json'), 'w'), ensure_ascii=False, indent=1)
    order = ["intro"] + [P['id'] for P in S['parts']]
    drug = {"name": S['name'], "no": S.get('no', ''), "name_en": S.get('name_en', ''), "parts": parts, "order": order, "player_parts": order,
            "cast": cast, "props": props, "highlight": S.get('highlight', {}), "intro": intro}
    json.dump(drug, open(os.path.join(dr, 'drug.json'), 'w'), ensure_ascii=False, indent=1)
    V = {k: VOICES[k] for k in (cast['lead'], cast['cameo'])}
    json.dump({"voices": V, "lines": lines, "bridges": {}}, open(os.path.join(dr, 'dialog.json'), 'w'), ensure_ascii=False, indent=1)
    app = open(os.path.join(ROOT, 'drugs', 'kinteles', 'source', 'app.js')).read()
    i = app.index('const steps=['); j = app.index('];', i) + 2
    stj = 'const steps=[\n' + ',\n'.join(jsobj(s) for s in steps) + '];'
    open(os.path.join(dr, 'source', 'app.js'), 'w').write(app[:i] + stj + app[j:])
    open(os.path.join(dr, 'source', 'captions.js'), 'w').write('const captions={};')
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'intro_gen.py'), dr], check=True)
    print('built', dr, order)

if __name__ == '__main__':
    for a in sys.argv[1:]:
        build(a)
