/* 핵심어 색: 성분명=파랑, 용량·수치=주황, 주의·경고=빨강, 작용 표적=청록. 약별 단어는 drug.json "highlight" */
(function(){
const H=(typeof DRUG_HL!=='undefined')?DRUG_HL:{};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const words=(a)=>a&&a.length?new RegExp('('+a.map(esc).sort((x,y)=>y.length-x.length).join('|')+')','g'):null;
const DOSE=/((?:≤|≥|<|>)?\d+(?:[.,]\d+)?(?:\s?[–~-]\s?\d+(?:[.,]\d+)?)?\s?(?:mg|mL|mcg|μg|µg|g|IU|U|°C|℃|%|주마다|주|일|분|시간|개월|회|개)(?![A-Za-z가-힣]))/g;
const WARN=words((H.warn||[]).concat(['즉시 진료','즉시','금지','금기','호흡곤란','숨이 차','부종','붓','알레르기','아나필락시스','응급','동결','얼리','재사용']));
const RULES=[['hl-gen',words(H.generic||[])],['hl-tgt',words(H.target||[])],['hl-warn',WARN],['hl-dose',DOSE]].filter(r=>r[1]);
function mark(text){ // 겹치지 않게 앞에서부터 가장 먼저 맞는 규칙 적용
  const out=[];let i=0;
  while(i<text.length){let best=null;
    for(const [cls,re] of RULES){re.lastIndex=i;const m=re.exec(text);if(m&&(!best||m.index<best.i))best={i:m.index,s:m[0],cls}}
    if(!best){out.push([null,text.slice(i)]);break}
    if(best.i>i)out.push([null,text.slice(i,best.i)]);out.push([best.cls,best.s]);i=best.i+best.s.length}
  return out}
window.hlHTML=function(text){return mark(text).map(([c,s])=>{s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;');return c?`<span class="${c}">${s}</span>`:s}).join('')};
function walk(root){
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||!n.nodeValue.trim())return 2;
    if(p.closest('svg,script,style,.bubble,.no-hl,[class^="hl-"],.unit'))return 2;return 1}});
  const ns=[];while(tw.nextNode())ns.push(tw.currentNode);
  for(const n of ns){const parts=mark(n.nodeValue);if(parts.length<2&&!parts[0][0])continue;
    const f=document.createDocumentFragment();for(const [c,s] of parts){if(c){const e=document.createElement('span');e.className=c;e.textContent=s;f.appendChild(e)}else f.appendChild(document.createTextNode(s))}
    n.parentNode.replaceChild(f,n)}}
if(typeof document!=='undefined'&&document.querySelector('.stage'))walk(document.querySelector('.stage'));
})();
