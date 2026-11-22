"""원내 도입 구분(신약·대체·용량추가·원외→원내)을 소개 장면·핵심 정리·플레이어 제목에 넣는다.
사용: python tools/apply_itype.py <itype.json> <약 ...>"""
import sys, os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COL = {'신약': '#007F86', '대체': '#B35C00', '용량추가': '#1F6FD1', '원외→원내': '#6B4FB8'}
def dur(say): return len(re.sub(r'[\s,.·?!]', '', say)) / 6.6
D = json.load(open(sys.argv[1]))
for slug in sys.argv[2:]:
    T = D[slug]; dr = os.path.join(ROOT, 'drugs', slug)
    specp = os.path.join(dr, 'spec.json')
    if os.path.exists(specp):
        S = json.load(open(specp)); I = S['intro']; sents = I['sents']
        if T['mode'] == 'replace': sents[T['idx']] = T['sent']; si = T['idx']
        elif T['mode'] == 'append' and sents[-1] != T['sent']: sents.append(T['sent']); si = len(sents) - 1
        elif T['mode'] == 'append': si = len(sents) - 1
        else:
            si = max(i for i, x in enumerate(sents) if '원내' in (x if isinstance(x, str) else x[0]))
        I['facts'] = [f for f in I['facts'] if f['lab'] != '도입']
        I['itype'] = {"kind": T['kind'], "detail": T['detail'], "s": si}
        json.dump(S, open(specp, 'w'), ensure_ascii=False, indent=1)
        os.system(f'{sys.executable} {ROOT}/tools/build_drug.py {dr} > /dev/null')
    else:
        NJ = json.load(open(os.path.join(dr, 'narration.json'))); N = NJ['parts']['intro']
        cfg = json.load(open(os.path.join(dr, 'drug.json'))); I = cfg['intro']
        starts = [x['old'][0] for x in N]
        fidx = [(max(i for i, st in enumerate(starts) if st <= f['t'] + 0.05), f['t'] - starts[max(i for i, st in enumerate(starts) if st <= f['t'] + 0.05)]) for f in I['facts']]
        aidx = []
        for a in I['actions'][1:]:
            k = max([i for i, st in enumerate(starts) if st <= a['t0'] + 0.05] or [0]); aidx.append((k, a['t0'] - starts[k], a['t1'] - a['t0']))
        text, say = T['sent']
        if T['mode'] == 'replace': N[T['idx']].update(text=text, say=say); si = T['idx']
        elif T['mode'] == 'append' and N[-1]['text'] != text: N.append({"v": "A", "old": [0, 0], "text": text, "say": say}); si = len(N) - 1
        elif T['mode'] == 'append': si = len(N) - 1
        else: si = len(N) - 1
        for i in range(max(1, min(si, len(N) - 1)), len(N)):
            t0 = N[i - 1]['old'][1] + 0.4 if i > 0 else N[0]['old'][0]
            if i >= si: N[i]['old'] = [round(t0, 2), round(t0 + dur(N[i]['say']), 2)]
            elif N[i]['old'][0] < t0: N[i]['old'] = [round(t0, 2), round(t0 + dur(N[i]['say']), 2)]
        for f, (k, off) in zip(I['facts'], fidx): f['t'] = round(N[k]['old'][0] + off, 2)
        for a, (k, off, ln) in zip(I['actions'][1:], aidx): a['t0'] = round(N[k]['old'][0] + off, 2); a['t1'] = round(a['t0'] + ln, 2)
        I['itype'] = {"kind": T['kind'], "detail": T['detail'], "t": N[si]['old'][0]}
        for P in cfg['parts']:
            if P['part'] == 'intro': P['video_dur'] = round(N[-1]['old'][1] + 0.4, 2)
        json.dump(NJ, open(os.path.join(dr, 'narration.json'), 'w'), ensure_ascii=False, indent=1)
        json.dump(cfg, open(os.path.join(dr, 'drug.json'), 'w'), ensure_ascii=False, indent=1)
        os.system(f'{sys.executable} {ROOT}/tools/intro_gen.py {dr} > /dev/null')
    cfg = json.load(open(os.path.join(dr, 'drug.json')))
    sc = [P['scene'] for P in cfg['parts'] if P['part'] == 'summary'][0]
    fp = os.path.join(dr, 'scenes', sc); h = open(fp).read()
    h = re.sub(r'<div class="itype".*?</div>\n?', '', h, flags=re.S)
    c = COL[T['kind']]; short = re.sub(r'<br>.*', '', T['detail'])
    pill = f'<div class="itype" style="position:absolute;right:96px;top:178px;display:flex;align-items:center;gap:14px;padding:10px 20px;border:3px solid {c};border-radius:16px;background:#fff;max-width:640px"><span style="background:{c};color:#fff;font-size:30px;font-weight:800;padding:4px 14px;border-radius:10px;white-space:nowrap">{T["kind"]}</span><span style="font-size:24px;font-weight:700;color:#243341;line-height:32px">{short}</span></div>\n'
    j = h.index('<script src="../timing.js"'); i = h.rindex('</div>', 0, j); h = h[:i] + pill + h[i:]
    open(fp, 'w').write(h)
    ap = os.path.join(dr, 'source', 'app.js'); a = open(ap).read()
    a = re.sub(r"(title:\s*(['\"])(?:(?!\2).)*?)(?: · (?:신약|대체|용량추가|원외→원내))?\2(,\s*file:\s*['\"]intro['\"])", lambda m: m.group(1) + f" · {T['kind']}" + m.group(2) + m.group(3), a, count=1)
    open(ap, 'w').write(a)
    print(slug, T['kind'], 'ok')
