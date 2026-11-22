// shared timeline helpers + character
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, seg=(t,a,b)=>cl((t-a)/(b-a));
const back=t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const easeOut=t=>1-Math.pow(1-t,3);
let DUR=10;
let KN=null, INS=[], CUR=null;
function useTiming(p){const T=TIMING[p];CUR=p;DUR=T.dur;KN=T.knots;INS=T.ins||[];}
function fwdTight(o){if(!KN)return o;for(let i=0;i<KN.length-1;i++){const [n0,o0]=KN[i],[n1,o1]=KN[i+1];if(o>=o0&&o<=o1){return o1>o0?n0+(n1-n0)*(o-o0)/(o1-o0):n0}}return KN[KN.length-1][0]+(o-KN[KN.length-1][1])}
// fwd: source(old) seconds -> final seconds (tightened pauses + inserted dialogue gaps)
function fwd(o){const tau=fwdTight(o);let acc=0;for(const [ti,di] of INS){if(ti<tau-1e-6)acc+=di}return Math.min(DUR,tau+acc)}
function invTight(n){if(!KN)return n;const R=.18;
 for(let i=0;i<KN.length-1;i++){const [n0,o0]=KN[i],[n1,o1]=KN[i+1];if(n1===n0&&o1>o0){if(n>n0-R&&n<n0+R){const a=n0-R,b=n0+R,oa=fwdInvLin(a),ob=fwdInvLin(b);return oa+(ob-oa)*(n-a)/(b-a)}}}
 return fwdInvLin(n)}
function inv(n){let acc=0;for(const [ti,di] of INS){if(n<ti+acc)break;if(n<ti+acc+di)return invTight(ti);acc+=di}return invTight(n-acc)}
function fwdInvLin(n){let best=null;for(let i=0;i<KN.length-1;i++){const [n0,o0]=KN[i],[n1,o1]=KN[i+1];if(n1>n0&&n>=n0&&n<=n1)return o0+(o1-o0)*(n-n0)/(n1-n0)}const L=KN[KN.length-1];if(n>=L[0])return L[1]+(n-L[0]);return n}

function sceneFade(t){const a=easeOut(seg(t,0,.35))*(1-seg(t,DUR-.35,DUR));$$('.fade').forEach(e=>e.style.opacity=a)}
function entries(t){
 $$('[data-in]').forEach(e=>{const t0=+e.dataset.in;const p=easeOut(seg(t,t0,t0+.55));e.style.opacity=p;e.style.transform=`translateY(${(1-p)*24}px)`});
 $$('[data-on]').forEach(e=>{const [a,b]=e.dataset.on.split(',').map(Number);e.classList.toggle('on',t>=a&&t<(isNaN(b)?1e9:b))});
 one(t,'.stage .box[data-in]');one(t,'.stage .g>.c[data-in]',3.2);
}
// v16: 한 화면에 한 가지 — 가장 최근에 나온 줄·카드만 크게(cur), 나머지는 숨김
function one(t,sel,hold){const L=$$(sel);if(L.length<2||L.some(e=>e.querySelector('svg,canvas,.tl,.bar,.W')))return;let cur=null;L.forEach(e=>{if(t>=+e.dataset.in)cur=e});if(hold&&cur===L[L.length-1]&&t>=+cur.dataset.in+hold)cur=null;L.forEach(e=>e.classList.toggle('cur',e===cur));L.forEach(e=>e.classList.toggle('gone',!!cur&&e!==cur))}
/* ---------------- character ---------------- */
const CHAR_SVG=`
<g id="cBody">
 <g id="legL" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#3b4a66"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <g id="legR" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#3b4a66"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <path class="o" d="M70 480 L92 350 Q110 300 180 294 Q250 300 268 350 L290 480Z" fill="#fff"/>
 <path class="o" d="M150 298 L180 352 L210 298" fill="#007F86"/>
 <path class="o" d="M180 352 V478" fill="none" stroke-width="4"/>
 <rect x="210" y="370" width="50" height="26" rx="5" fill="#243341"/><text x="235" y="390" text-anchor="middle" font-weight="700" font-size="16" fill="#fff">선배</text>
 <g id="head">
  <rect class="o" x="164" y="252" width="32" height="44" rx="8" fill="#e9c09c"/>
  <ellipse class="o" cx="180" cy="190" rx="84" ry="90" fill="#f3cfae"/>
  <path class="o" d="M96 178 L90 128 L114 144 L118 98 L140 128 L156 84 L174 120 L196 82 L208 122 L236 92 L236 132 L264 116 L266 178 Q244 136 180 138 Q118 136 96 178Z" fill="#3a2f28"/>
  <g id="eyeN"><path class="o" d="M122 196 h38 M200 196 h38" fill="none"/><path d="M124 198 q17 13 34 0 M202 198 q17 13 34 0" fill="none" stroke="#243341" stroke-width="5"/></g>
  <g id="eyeC" style="display:none"><path class="o" d="M122 200 q19 8 38 0 M200 200 q19 8 38 0" fill="none"/></g>
  <g id="eyeW" style="display:none"><circle class="o" cx="141" cy="196" r="17" fill="#fff"/><circle class="o" cx="219" cy="196" r="17" fill="#fff"/><circle cx="141" cy="198" r="7" fill="#243341"/><circle cx="219" cy="198" r="7" fill="#243341"/></g>
  <path d="M122 220 q19 11 38 0 M200 220 q19 11 38 0" fill="none" stroke="#9a8fc4" stroke-width="6" stroke-linecap="round"/>
  <g fill="#6b5a4e"><circle cx="156" cy="262" r="2.5"/><circle cx="168" cy="268" r="2.5"/><circle cx="192" cy="268" r="2.5"/><circle cx="204" cy="262" r="2.5"/><circle cx="180" cy="272" r="2.5"/></g>
  <path id="mF" class="o" d="M164 248 h32" fill="none"/>
  <ellipse id="mO" class="o" cx="180" cy="248" rx="13" ry="9" fill="#7a2e2e" style="display:none"/>
  <ellipse id="mY" class="o" cx="180" cy="250" rx="20" ry="26" fill="#7a2e2e" style="display:none"/>
  <path id="mS" class="o" d="M160 242 q20 18 40 0" fill="none" style="display:none"/>
  <path id="sweat" d="M268 150 q10 18 0 28 q-10 -10 0 -28z" fill="#7ea6e0" style="opacity:0"/>
  <text id="qm" x="292" y="96" font-size="72" font-weight="700" fill="#007F86" style="opacity:0">?</text>
  <g id="bang" style="opacity:0"><path class="o" d="M60 70 l18 30 M40 120 l30 8 M300 70 l-18 30 M320 120 l-30 8" fill="none" stroke="#a86400" stroke-width="7"/></g>
 </g>
 <g id="armM"><g id="armMr"><rect class="o" x="-20" y="0" width="40" height="150" rx="18" fill="#fff"/><circle class="o" cx="0" cy="152" r="18" fill="#f3cfae"/>
   <g id="mug" transform="translate(0 150)"><rect class="o" x="6" y="-30" width="54" height="58" rx="8" fill="#3d7a6e"/><path class="o" d="M60 -16 q20 0 20 16 q0 16 -20 16" fill="none"/></g></g></g>
 <g id="armP"><g id="armPr"><rect class="o" x="-20" y="0" width="40" height="160" rx="18" fill="#fff"/>
   <g id="hP"><circle class="o" cx="0" cy="162" r="18" fill="#f3cfae"/><path class="o" d="M0 176 v26" fill="none" stroke-width="10"/></g>
   <g id="hW" style="display:none"><ellipse class="o" cx="0" cy="170" rx="22" ry="26" fill="#f3cfae"/><path class="o" d="M-12 190 v14 M0 194 v14 M12 190 v14" fill="none" stroke-width="5"/></g>
   <g id="hT" style="display:none"><g id="hTi"><rect class="o" x="-22" y="148" width="44" height="38" rx="12" fill="#f3cfae"/><path d="M-4 160 h22 M-4 170 h22 M-4 180 h18" stroke="#243341" stroke-width="3.5" stroke-linecap="round"/><rect class="o" x="-22" y="112" width="18" height="44" rx="9" fill="#f3cfae"/></g></g>
</g>
 </g></g>
</g>`;
const HARU_SVG=`
<g id="cBody">
 <g id="drops" style="opacity:0" fill="#7ea6e0"><circle id="d1" cx="0" cy="0" r="10"/><circle id="d2" cx="0" cy="0" r="7"/><circle id="d3" cx="0" cy="0" r="12"/><circle id="d4" cx="0" cy="0" r="6"/><circle id="d5" cx="0" cy="0" r="8"/></g>
 <g id="tail"><path class="o" d="M246 450 q96 44 128 -8 q10 -22 -12 -26 q-30 32 -116 4z" fill="#8a5a3c"/></g>
 <g id="legL"><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#6e4630"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#4a2f20"/></g>
 <g id="legR"><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#6e4630"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#4a2f20"/></g>
 <path class="o" d="M70 480 L92 350 Q110 300 180 294 Q250 300 268 350 L290 480Z" fill="#fff"/>
 <path class="o" d="M150 298 L180 340 L210 298" fill="#f3d7a2"/>
 <path class="o" d="M180 340 V478" fill="none" stroke-width="4"/>
 <rect x="204" y="368" width="58" height="28" rx="6" fill="#3d7a6e"/><text x="233" y="389" text-anchor="middle" font-weight="700" font-size="17" fill="#fff">신입</text>
 <g id="head">
  <rect class="o" x="164" y="252" width="32" height="44" rx="8" fill="#6e4630"/>
  <circle class="o" cx="112" cy="120" r="20" fill="#8a5a3c"/><circle class="o" cx="248" cy="120" r="20" fill="#8a5a3c"/><circle cx="112" cy="120" r="8" fill="#5a3826"/><circle cx="248" cy="120" r="8" fill="#5a3826"/>
  <ellipse class="o" cx="180" cy="196" rx="90" ry="86" fill="#8a5a3c"/>
  <path class="o" d="M108 214 Q116 170 180 170 Q244 170 252 214 Q248 276 180 280 Q112 276 108 214Z" fill="#efdcc4"/>
  <g id="eyeN"><circle cx="142" cy="198" r="11" fill="#243341"/><circle cx="218" cy="198" r="11" fill="#243341"/><circle cx="146" cy="193" r="4.5" fill="#fff"/><circle cx="222" cy="193" r="4.5" fill="#fff"/></g>
  <g id="eyeC" style="display:none"><path d="M126 202 q16 -16 32 0 M202 202 q16 -16 32 0" fill="none" stroke="#243341" stroke-width="7" stroke-linecap="round"/></g>
  <g id="eyeW" style="display:none"><circle class="o" cx="142" cy="196" r="18" fill="#fff"/><circle class="o" cx="218" cy="196" r="18" fill="#fff"/><circle cx="142" cy="198" r="8" fill="#243341"/><circle cx="218" cy="198" r="8" fill="#243341"/></g>
  <g id="eyeK" style="display:none"><path d="M126 202 q16 -16 32 0" fill="none" stroke="#243341" stroke-width="7" stroke-linecap="round"/><circle cx="218" cy="198" r="11" fill="#243341"/><circle cx="222" cy="193" r="4.5" fill="#fff"/></g>
  <ellipse class="o" cx="180" cy="224" rx="16" ry="11" fill="#3a2418"/>
  <path d="M116 226 h-36 M118 238 l-34 8 M244 226 h36 M242 238 l34 8" stroke="#3a2418" stroke-width="3" stroke-linecap="round"/>
  <circle cx="122" cy="246" r="10" fill="#f4a9a0" opacity=".8"/><circle cx="238" cy="246" r="10" fill="#f4a9a0" opacity=".8"/>
  <path id="mF" class="o" d="M164 244 q8 8 16 0 q8 8 16 0" fill="none" stroke-width="5"/>
  <ellipse id="mO" class="o" cx="180" cy="250" rx="12" ry="10" fill="#7a2e2e" style="display:none"/>
  <ellipse id="mY" class="o" cx="180" cy="254" rx="18" ry="22" fill="#7a2e2e" style="display:none"/>
  <g id="mS" style="display:none"><path class="o" d="M158 244 q22 24 44 0Z" fill="#7a2e2e"/><path d="M166 246 h28" stroke="#fff" stroke-width="5"/></g>
  <path id="sweat" d="M276 150 q10 18 0 28 q-10 -10 0 -28z" fill="#7ea6e0" style="opacity:0"/>
  <text id="qm" x="296" y="96" font-size="72" font-weight="700" fill="#3d7a6e" style="opacity:0">?</text>
  <g id="bang" style="opacity:0"><path class="o" d="M60 70 l18 30 M40 120 l30 8 M300 70 l-18 30 M320 120 l-30 8" fill="none" stroke="#a86400" stroke-width="7"/></g>
  <g id="spark" style="opacity:0" fill="#d9a441"><path d="M40 70 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6z"/><path d="M310 60 l5 11 l11 5 l-11 5 l-5 11 l-5 -11 l-11 -5 l11 -5z"/><path d="M330 150 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4z"/></g>
 </g>
 <g id="armM"><g id="armMr"><rect class="o" x="-20" y="0" width="40" height="150" rx="18" fill="#fff"/><ellipse class="o" cx="0" cy="152" rx="20" ry="18" fill="#6e4630"/>
   <g id="mug" transform="translate(0 150)"><rect class="o" x="2" y="-46" width="70" height="92" rx="8" fill="#e3efeb"/><rect x="22" y="-54" width="30" height="14" rx="4" fill="#3f5a6b"/><path d="M14 -18 l8 8 l14 -16" stroke="#3d7a6e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M14 10 h44 M14 26 h30" stroke="#a9bcb9" stroke-width="4"/></g></g></g>
 <g id="armP"><g id="armPr"><rect class="o" x="-20" y="0" width="40" height="160" rx="18" fill="#fff"/>
   <g id="hP"><ellipse class="o" cx="0" cy="164" rx="20" ry="18" fill="#6e4630"/><path class="o" d="M0 178 v22" fill="none" stroke-width="10" stroke="#6e4630"/></g>
   <g id="hW" style="display:none"><ellipse class="o" cx="0" cy="170" rx="24" ry="24" fill="#6e4630"/><path class="o" d="M-14 186 v12 M0 190 v12 M14 186 v12" fill="none" stroke-width="5"/></g>
   <g id="hT" style="display:none"><g id="hTi"><rect class="o" x="-22" y="148" width="44" height="38" rx="12" fill="#6e4630"/><path d="M-4 160 h22 M-4 170 h22 M-4 180 h18" stroke="#efdcc4" stroke-width="3.5" stroke-linecap="round"/><rect class="o" x="-22" y="112" width="18" height="44" rx="9" fill="#6e4630"/></g></g>
 </g></g>
</g>`;


window.EXTRA_SVG={wang:`
<g id="cBody">
 <g id="legL" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#6b6f78"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <g id="legR" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#6b6f78"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <path class="o" d="M70 480 L92 350 Q110 300 180 294 Q250 300 268 350 L290 480Z" fill="#fff"/>
 <path class="o" d="M150 298 L180 340 L210 298" fill="#eaf0f6"/><path class="o" d="M162 312 l18 10 l18 -10 v20 l-18 -10 l-18 10z" fill="#c0392b"/>
 <path class="o" d="M180 352 V478" fill="none" stroke-width="4"/>
 <rect x="210" y="370" width="50" height="26" rx="5" fill="#7D4A00"/><text x="235" y="390" text-anchor="middle" font-weight="700" font-size="16" fill="#fff">교수</text>
 <g id="head">
  <rect class="o" x="164" y="252" width="32" height="44" rx="8" fill="#e9c09c"/>
  <ellipse class="o" cx="180" cy="186" rx="86" ry="94" fill="#f3cfae"/>
  <path d="M138 112 q22 -14 44 -6" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
  <path class="o" d="M98 210 q-22 -34 -6 -78 q12 26 26 34 q-12 18 -20 44z" fill="#eef1f5"/>
  <path class="o" d="M262 210 q22 -34 6 -78 q-12 26 -26 34 q12 18 20 44z" fill="#eef1f5"/>
  <path d="M120 166 q20 -14 42 -2 M198 164 q22 -12 42 2" stroke="#d7dde4" stroke-width="10" fill="none" stroke-linecap="round"/>
  <g id="eyeN"><circle cx="141" cy="200" r="7" fill="#243341"/><circle cx="219" cy="200" r="7" fill="#243341"/></g>
  <g id="eyeC" style="display:none"><path d="M128 202 q13 -10 26 0 M206 202 q13 -10 26 0" fill="none" stroke="#243341" stroke-width="5" stroke-linecap="round"/></g>
  <g id="eyeW" style="display:none"><circle cx="141" cy="200" r="13" fill="#fff" stroke="#243341" stroke-width="3"/><circle cx="219" cy="200" r="13" fill="#fff" stroke="#243341" stroke-width="3"/><circle cx="141" cy="201" r="5" fill="#243341"/><circle cx="219" cy="201" r="5" fill="#243341"/></g>
  <g id="eyeK" style="display:none"><path d="M128 202 q13 -10 26 0" fill="none" stroke="#243341" stroke-width="5" stroke-linecap="round"/><circle cx="219" cy="200" r="7" fill="#243341"/></g>
  <circle class="o" cx="141" cy="200" r="27" fill="#ffffff44" stroke-width="5"/><circle class="o" cx="219" cy="200" r="27" fill="#ffffff44" stroke-width="5"/><path class="o" d="M168 198 q12 -8 24 0" fill="none" stroke-width="5"/>
  <path class="o" d="M176 214 q4 16 -6 22" fill="none" stroke-width="4"/>
  <path class="o" d="M134 248 q22 -18 46 -2 q24 -16 46 2 q-12 18 -46 8 q-34 10 -46 -8z" fill="#eef1f5"/>
  <path id="mF" class="o" d="M168 266 q12 6 24 0" fill="none"/>
  <ellipse id="mO" class="o" cx="180" cy="268" rx="12" ry="8" fill="#7a2e2e" style="display:none"/>
  <ellipse id="mY" class="o" cx="180" cy="270" rx="16" ry="14" fill="#7a2e2e" style="display:none"/>
  <path id="mS" class="o" d="M164 262 q16 14 32 0" fill="none" style="display:none"/>
  <path id="sweat" d="M268 150 q10 18 0 28 q-10 -10 0 -28z" fill="#7ea6e0" style="opacity:0"/>
  <text id="qm" x="292" y="96" font-size="72" font-weight="700" fill="#007F86" style="opacity:0">?</text>
  <g id="bang" style="opacity:0"><path class="o" d="M60 70 l18 30 M40 120 l30 8 M300 70 l-18 30 M320 120 l-30 8" fill="none" stroke="#a86400" stroke-width="7"/></g>
  <g id="spark" style="opacity:0" fill="#d9a441"><path d="M40 70 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6z"/><path d="M310 60 l5 11 l11 5 l-11 5 l-5 11 l-5 -11 l-11 -5 l11 -5z"/></g>
 </g>
 <g id="armM"><g id="armMr"><rect class="o" x="-20" y="0" width="40" height="150" rx="18" fill="#fff"/><circle class="o" cx="0" cy="152" r="18" fill="#f3cfae"/>
   <g id="mug" transform="translate(0 150)"><rect class="o" x="2" y="-44" width="70" height="88" rx="6" fill="#1f6fd1"/><rect x="10" y="-36" width="54" height="10" rx="3" fill="#cfe0f7"/><path d="M12 -10 h48 M12 4 h40" stroke="#cfe0f7" stroke-width="4"/></g></g></g>
 <g id="armP"><g id="armPr"><rect class="o" x="-20" y="0" width="40" height="160" rx="18" fill="#fff"/>
   <g id="hP"><circle class="o" cx="0" cy="162" r="18" fill="#f3cfae"/><path class="o" d="M0 176 v26" fill="none" stroke-width="10"/></g>
   <g id="hW" style="display:none"><ellipse class="o" cx="0" cy="170" rx="22" ry="26" fill="#f3cfae"/><path class="o" d="M-12 190 v14 M0 194 v14 M12 190 v14" fill="none" stroke-width="5"/></g>
   <g id="hT" style="display:none"><g id="hTi"><rect class="o" x="-22" y="148" width="44" height="38" rx="12" fill="#f3cfae"/><path d="M-4 160 h22 M-4 170 h22 M-4 180 h18" stroke="#243341" stroke-width="3.5" stroke-linecap="round"/><rect class="o" x="-22" y="112" width="18" height="44" rx="9" fill="#f3cfae"/></g></g>
</g>
 </g></g>
</g>`,skull:`
<g id="cBody">
 <g id="legL" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#2b2f3a"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <g id="legR" ><rect class="o" x="-22" y="0" width="44" height="170" rx="14" fill="#2b2f3a"/><ellipse class="o" cx="-12" cy="178" rx="34" ry="16" fill="#243341"/></g>
 <path class="o" d="M70 480 L92 350 Q110 300 180 294 Q250 300 268 350 L290 480Z" fill="#fff"/>
 <path class="o" d="M150 298 L180 344 L210 298" fill="#6b4bb5"/>
 <path class="o" d="M180 352 V478" fill="none" stroke-width="4"/>
 <rect x="210" y="370" width="50" height="26" rx="5" fill="#6b4bb5"/><text x="235" y="390" text-anchor="middle" font-weight="700" font-size="16" fill="#fff">약사</text>
 <g id="head">
  <rect class="o" x="166" y="252" width="28" height="12" rx="4" fill="#efeadb"/><rect class="o" x="166" y="268" width="28" height="12" rx="4" fill="#efeadb"/><rect class="o" x="166" y="284" width="28" height="12" rx="4" fill="#efeadb"/>
  <path class="o" d="M98 186 q0 -98 82 -98 q82 0 82 98 q0 34 -22 50 l0 22 q-60 14 -120 0 l0 -22 q-22 -16 -22 -50z" fill="#f7f3e8"/>
  <path d="M120 120 q20 -18 40 -16" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
  <ellipse class="o" cx="142" cy="190" rx="26" ry="30" fill="#2b2f3a"/><ellipse class="o" cx="218" cy="190" rx="26" ry="30" fill="#2b2f3a"/>
  <g id="eyeN"><circle cx="146" cy="192" r="7" fill="#7FE0D6"/><circle cx="222" cy="192" r="7" fill="#7FE0D6"/></g>
  <g id="eyeC" style="display:none"><path d="M128 194 q14 -10 28 0 M204 194 q14 -10 28 0" fill="none" stroke="#7FE0D6" stroke-width="5" stroke-linecap="round"/></g>
  <g id="eyeW" style="display:none"><circle cx="142" cy="190" r="13" fill="#7FE0D6"/><circle cx="218" cy="190" r="13" fill="#7FE0D6"/><circle cx="142" cy="190" r="5" fill="#fff"/><circle cx="218" cy="190" r="5" fill="#fff"/></g>
  <g id="eyeK" style="display:none"><path d="M128 194 q14 -10 28 0" fill="none" stroke="#7FE0D6" stroke-width="5" stroke-linecap="round"/><circle cx="222" cy="192" r="7" fill="#7FE0D6"/></g>
  <path class="o" d="M180 216 l-12 20 h24z" fill="#2b2f3a"/>
  <path id="mF" class="o" d="M140 252 h80 M150 244 v16 M164 244 v16 M180 244 v16 M196 244 v16 M210 244 v16" fill="none" stroke-width="4"/>
  <g id="mO" style="display:none"><rect class="o" x="150" y="242" width="60" height="22" rx="6" fill="#2b2f3a"/><path d="M160 242 v8 M172 242 v8 M184 242 v8 M196 242 v8" stroke="#f7f3e8" stroke-width="5"/></g>
  <g id="mY" style="display:none"><rect class="o" x="148" y="240" width="64" height="34" rx="8" fill="#2b2f3a"/><path d="M158 240 v8 M170 240 v8 M182 240 v8 M194 240 v8 M206 240 v8" stroke="#f7f3e8" stroke-width="5"/></g>
  <path id="mS" class="o" d="M138 244 q42 26 84 0 M152 252 v10 M166 256 v10 M180 258 v10 M194 256 v10 M208 252 v10" fill="none" stroke-width="4" style="display:none"/>
  <path id="sweat" d="M268 150 q10 18 0 28 q-10 -10 0 -28z" fill="#7ea6e0" style="opacity:0"/>
  <text id="qm" x="292" y="96" font-size="72" font-weight="700" fill="#007F86" style="opacity:0">?</text>
  <g id="bang" style="opacity:0"><path class="o" d="M60 70 l18 30 M40 120 l30 8 M300 70 l-18 30 M320 120 l-30 8" fill="none" stroke="#a86400" stroke-width="7"/></g>
  <g id="spark" style="opacity:0" fill="#d9a441"><path d="M40 70 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6z"/><path d="M310 60 l5 11 l11 5 l-11 5 l-5 11 l-5 -11 l-11 -5 l11 -5z"/></g>
 </g>
 <g id="armM"><g id="armMr"><rect class="o" x="-20" y="0" width="40" height="150" rx="18" fill="#fff"/><circle class="o" cx="0" cy="152" r="18" fill="#f7f3e8"/>
   <g id="mug" transform="translate(0 150)"><path class="o" d="M4 -10 h70 l-10 40 h-50z" fill="#cfd6de"/><path class="o" d="M30 -10 L64 -54" fill="none" stroke-width="12" stroke-linecap="round"/><path d="M14 0 h50" stroke="#9aa4ae" stroke-width="4"/></g></g></g>
 <g id="armP"><g id="armPr"><rect class="o" x="-20" y="0" width="40" height="160" rx="18" fill="#fff"/>
   <g id="hP"><circle class="o" cx="0" cy="162" r="18" fill="#f7f3e8"/><path class="o" d="M0 176 v26" fill="none" stroke-width="10"/></g>
   <g id="hW" style="display:none"><ellipse class="o" cx="0" cy="170" rx="22" ry="26" fill="#f7f3e8"/><path class="o" d="M-12 190 v14 M0 194 v14 M12 190 v14" fill="none" stroke-width="5"/></g>
   <g id="hT" style="display:none"><g id="hTi"><rect class="o" x="-22" y="148" width="44" height="38" rx="12" fill="#f7f3e8"/><path d="M-4 160 h22 M-4 170 h22 M-4 180 h18" stroke="#243341" stroke-width="3.5" stroke-linecap="round"/><rect class="o" x="-22" y="112" width="18" height="44" rx="9" fill="#f7f3e8"/></g></g>
</g>
 </g></g>
</g>`};
// ---- v9: 역할(주연/까메오)·소품·빈자리 찾기 ----
const CAST=(typeof DRUG_CAST!=='undefined'&&DRUG_CAST)||{lead:'park',cameo:'haru'};
function roleType(t){return (t==='lead'||t==='cameo')?CAST[t]:t}
window.CHRS=window.CHRS||[];
const PROPS={
 vial:'<rect class="o" x="14" y="-40" width="44" height="80" rx="8" fill="#eaf4fb"/><rect class="o" x="10" y="-54" width="52" height="16" rx="4" fill="#4f7fc8"/><rect x="18" y="-6" width="36" height="40" rx="5" fill="#ffffff" stroke="#9bb3c8" stroke-width="3"/>',
 syringe:'<rect class="o" x="4" y="-12" width="70" height="24" rx="6" fill="#ffffff"/><rect x="10" y="-6" width="40" height="12" fill="#bfe3e5"/><path class="o" d="M74 0 h22" fill="none" stroke-width="4"/><path class="o" d="M-10 -16 v32 M-10 0 h14" fill="none" stroke-width="5"/>',
 magnifier:'<circle class="o" cx="44" cy="-18" r="28" fill="#e9f6f7"/><circle cx="44" cy="-18" r="18" fill="none" stroke="#9ccfd2" stroke-width="4"/><path class="o" d="M24 2 L4 30" fill="none" stroke-width="12" stroke-linecap="round"/>',
 clock:'<circle class="o" cx="38" cy="-4" r="34" fill="#fff8e6"/><path d="M38 -4 v-20 M38 -4 h14" stroke="#243341" stroke-width="5" stroke-linecap="round"/><circle class="o" cx="12" cy="-34" r="9" fill="#d96c00"/><circle class="o" cx="64" cy="-34" r="9" fill="#d96c00"/>',
 thermo:'<rect class="o" x="28" y="-56" width="20" height="86" rx="10" fill="#fff"/><circle class="o" cx="38" cy="36" r="16" fill="#d2342a"/><rect x="34" y="-20" width="8" height="52" fill="#d2342a"/>',
 book:'<rect class="o" x="2" y="-44" width="70" height="88" rx="6" fill="#1f6fd1"/><rect x="10" y="-36" width="54" height="10" rx="3" fill="#cfe0f7"/><path d="M12 -10 h48 M12 4 h40" stroke="#cfe0f7" stroke-width="4"/>',
 pill:'<rect class="o" x="12" y="-30" width="50" height="70" rx="10" fill="#f4a43a"/><rect class="o" x="8" y="-48" width="58" height="20" rx="5" fill="#fff"/><rect x="18" y="-8" width="38" height="26" rx="4" fill="#fff"/>',
 phone:'<rect class="o" x="12" y="-50" width="48" height="92" rx="10" fill="#243341"/><rect x="18" y="-40" width="36" height="66" rx="4" fill="#bfe3e5"/>',
 mega:'<path class="o" d="M6 -12 L58 -40 V40 L6 12 Z" fill="#f28c28"/><rect class="o" x="-6" y="-14" width="14" height="28" rx="4" fill="#fff"/>',
 bag:'<path class="o" d="M10 -40 h52 l6 80 h-64 z" fill="#eaf4fb"/><rect x="26" y="-30" width="20" height="10" fill="#4f7fc8"/><path d="M36 -12 v40 M16 8 h40" stroke="#9bb3c8" stroke-width="4"/>'
};
function contentRects(){const st=$('.stage').getBoundingClientRect();
 return [...document.querySelectorAll('.stage .card,.stage [data-in],.stage [data-on],.stage .figc,.stage .list,.stage .steps,.stage .fig,.stage .l,.stage .box')].filter(e=>!e.closest('svg.chr')&&!e.closest('header')&&!e.classList.contains('wm'))
 .map(e=>{const r=e.getBoundingClientRect();return {l:r.left-st.left,r:r.right-st.left,t:r.top-st.top,b:r.bottom-st.top}}).filter(r=>r.r-r.l>4&&r.b-r.t>4)}
function freeXs(top){const R=contentRects(),out=[];for(let x=130;x<=1860;x+=20){const L=x-120,Rr=x+120;if(!R.some(r=>r.l<Rr&&r.r>L&&r.t<1070&&r.b>top))out.push(x)}return out}
function xAtW(walks,t,def){let x=walks.length?walks[0].x0:def;for(const w of walks){if(t>=w.t1)x=w.x1;else if(t>=w.t0)return lerp(w.x0,w.x1,seg(t,w.t0,w.t1))}return x}

// 쉬는 구간을 다양한 동작·짧은 이동으로 자동으로 채움(장면마다 같은 결과가 나오도록 고정 난수)
function ambient(acts,HARU,seed){
 let h=0;for(const c of seed)h=(h*31+c.charCodeAt(0))>>>0;const rnd=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
 const G=HARU?['hop','memo','clap','spin','giggle','wink','lean','dance','nod','spark','think','cheer']:['nod','sip','lean','think','shrug','point','yawn','turn','sip','thumbs','facepalm','nod'];
 const ZX=HARU?[1790,1870]:[1520,1610];
 const FREE=freeXs(HARU?600:560).filter(x=>x>=140);
 const others=window.CHRS.slice();
 const okX=(nx,t)=>others.every(o=>Math.abs(xAtW(o.walks,t,1700)-nx)>250&&Math.abs(xAtW(o.walks,t+1.1,1700)-nx)>250);
 const PL=(typeof DRUG_PROPS!=='undefined'&&DRUG_PROPS.length)?DRUG_PROPS:['magnifier','clock','book','phone'];
 const walks=acts.filter(a=>a.k==='walk').sort((p,q)=>p.t0-q.t0);
 const xAt=t=>{let x=walks.length?walks[0].x0:1700;for(const w of walks){if(w.t1<=t)x=w.x1}return x};
 const busy=acts.filter(a=>a.t0!==undefined&&a.k!=='blink').map(a=>[a.t0-.25,a.t1+.25]);
 const start=walks.length?walks[0].t1+.4:.6, end=DUR-.6;
 let t=start,n=0,last='';
 while(t<end-1.3){
  const x=xAt(t);if(x<-60||x>1990){t+=.5;continue}
  const len=1.2+rnd()*.5;
  if(busy.some(([a,b])=>t<b&&t+len>a)){t+=.3;continue}
  n++;
  if(n%3===0&&!acts.some(a=>a.k==='bubble'&&t<a.t1+.2&&t+1.1>a.t0-.2)){
   let nx=null;const cand=(FREE.length?FREE:[...Array(9)].map((_,i)=>ZX[0]+i*(ZX[1]-ZX[0])/8)).filter(v=>Math.abs(v-x)>=80&&Math.abs(v-x)<=700&&okX(v,t));
   if(cand.length)nx=cand[Math.floor(rnd()*cand.length)];else{t+=.5;continue}
   const w={k:'walk',t0:t,t1:t+1.0,x0:x,x1:Math.round(nx),run:HARU&&rnd()<.4};acts.push(w);walks.push(w);walks.sort((p,q)=>p.t0-q.t0);busy.push([t-.2,t+1.2]);t+=1.6+rnd()*.8;continue}
  let k=G[Math.floor(rnd()*G.length)];if(k===last)k=G[(G.indexOf(k)+1)%G.length];if(n%4===1)k='prop';last=k;
  const a={k,t0:t,t1:t+len};if(k==='prop'){a.name=PL[Math.floor(rnd()*PL.length)];a.t1=t+2.2}if(k==='point')a.ang=88+rnd()*20;if(k==='lean')a.ang=(rnd()<.5?-1:1)*(8+rnd()*6);
  acts.push(a);busy.push([t-.2,t+len+.2]);t+=len+.9+rnd()*1.1;
 }
}
function makeChar(acts0,type){
 const ROLE=type||'park';type=roleType(type||'park');if(!type)return ()=>{};
 const HARU=type==='haru';
 const SV={park:CHAR_SVG,haru:HARU_SVG,...(window.EXTRA_SVG||{})};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id=type==='park'?'char':(type==='haru'?'char2':'chr_'+type);svg.classList.add('chr');if(window.CHRS.length)svg.classList.add('r2');svg.setAttribute('viewBox','0 0 360 640');svg.innerHTML=SV[type]||CHAR_SVG;$('.stage').appendChild(svg);
 {const m=svg.querySelector('#mug');if(m){const d=document.createElementNS('http://www.w3.org/2000/svg','g');d.id='mugDef';while(m.firstChild)d.appendChild(m.firstChild);m.appendChild(d);const a=document.createElementNS('http://www.w3.org/2000/svg','g');a.id='mugAlt';m.appendChild(a)}}
 let propNow=null;
 const bub=document.createElement('div');bub.className='bubble';bub.style.opacity=0;$('.stage').appendChild(bub);
 // times given in source (old) seconds -> convert to new timeline, enforce minimum lengths
 const MIN={splash:.6,spin:.8,memo:1.0,clap:.8,cheer:1.0,float:1.4,bow:.8,dance:1.2,giggle:.8,wink:.6,spark:.6,walk:.9,bubble:1.8,point:1.2,wave:1.0,thumbs:1.0,sip:1.0,yawn:1.4,think:1.4,facepalm:1.2,shrug:1.0,hop:.8,lean:.8,celebrate:1.2,turn:.6,nod:.8,talk:.8,sweat:1.0};
 const DLG=(CUR&&TIMING[CUR]&&TIMING[CUR].dialog)||[];const who=type;
 const acts=acts0.filter(a=>!(DLG.length&&((a.k==='bubble'&&!a.keep)||a.k==='talk'))).map(a=>{const c={...a};if(a.t0!==undefined){c.t0=fwd(a.t0);c.t1=a.t1!==undefined?fwd(a.t1):c.t0+1.4;const m=MIN[a.k]||0;if(c.t1-c.t0<m)c.t1=c.t0+m;}return c});
 for(const d of DLG){const both=d.who==='both';if(d.who!==who&&!both)continue;if(!(both&&ROLE==='cameo'))acts.push({k:'bubble',t0:d.t0-0.05,t1:d.t1,text:d.text,free:both});acts.push({k:'talk',t0:d.t0,t1:d.t1-0.4});for(const w of (d.with||[])){if(w.for&&w.for!==who)continue;const t0=d.t0+(w.dt||0);acts.push({...w,t0,t1:t0+(w.len||1.4)})}}
 acts.sort((p,q)=>(p.t0??0)-(q.t0??0));
 acts.sort((p,q)=>(p.t0??0)-(q.t0??0));
 if(window.CENTER_FIRST!==undefined&&ROLE==='lead'){const w0=acts.find(a=>a.k==='walk');if(w0){let until=Math.max(fwd(window.CENTER_FIRST),w0.t1+2.0);for(const d of DLG){if((d.who===who||d.who==='both')&&d.t0<until+1.0&&d.t1>until-0.6)until=Math.max(until,d.t1+0.2)}const orig=w0.x1;w0.x1=960;const fr=freeXs(560).filter(v=>v>1200);const tx=fr.length?fr.reduce((p,v)=>Math.abs(v-orig)<Math.abs(p-orig)?v:p,fr[0]):orig;acts.push({k:'walk',t0:until,t1:until+1.1,x0:960,x1:tx});acts.push({k:'wave',t0:w0.t1+.1,t1:Math.min(until-.1,w0.t1+1.6)})}}
 acts.sort((p,q)=>(p.t0??0)-(q.t0??0));
 const resolveCur=()=>{let cx=null;for(const a of acts){if(a.k!=='walk')continue;if(a.x0==='cur')a.cur=true;if(a.cur)a.x0=cx??1700;cx=a.x1}};resolveCur();
 const S0=HARU?.64:.72, BASE=1030;
 const g=id=>svg.querySelector('#'+id)||document.createElementNS('http://www.w3.org/2000/svg','g'), show=(id,v)=>g(id).style.display=v?'':'none';
 const act=(k,t)=>acts.find(a=>a.k===k&&t>=a.t0&&t<a.t1);
 const ramp=(a,t,r=.35)=>easeOut(seg(t,a.t0,a.t0+r))*(1-easeOut(seg(t,a.t1-r,a.t1)));
 let walks=acts.filter(a=>a.k==='walk').sort((p,q)=>p.t0-q.t0);
 const ENTRY={type,walks};window.CHRS.push(ENTRY);let prepared=false;
 return function(t){
  if(!prepared){prepared=true;   // 모든 캐릭터가 만들어진 뒤 쉬는 동작을 채워 서로 겹치지 않게
   if(!window.NO_AMBIENT){window.CHRS=window.CHRS.filter(c=>c!==ENTRY).concat([]);ambient(acts,HARU,(CUR||'')+who);window.CHRS.push(ENTRY)}
   acts.sort((p,q)=>(p.t0??0)-(q.t0??0));resolveCur();walks=acts.filter(a=>a.k==='walk').sort((p,q)=>p.t0-q.t0);ENTRY.walks=walks}
  let x=null,walking=null;
  for(const w of walks){ if(t>=w.t0&&t<w.t1){x=lerp(w.x0,w.x1,ease(seg(t,w.t0,w.t1)));walking=w;break;} }
  if(x===null){const past=walks.filter(w=>w.t1<=t);const last=past[past.length-1];x=last?last.x1:(walks.length?walks[0].x0:1700);}
  const visible=x>-300&&x<2250;
  svg.style.display=visible?'':'none';
  // facing: walking right -> mirrored; turn back 0.35s after stopping
  let face=1;
  if(walking){face=walking.x1>walking.x0?-1:1}
  else{const past=walks.filter(w=>w.t1<=t);const last=past[past.length-1];if(last&&last.x1>last.x0){face=lerp(-1,1,ease(seg(t,last.t1,last.t1+.35)))}}
  const tn=act('turn',t);if(tn){face*=Math.cos(seg(t,tn.t0,tn.t1)*Math.PI*2)}
  const spn=act('spin',t);if(spn){face*=Math.cos(seg(t,spn.t0,spn.t1)*Math.PI*4)}
  const run=walking&&walking.run, fr=run?3.0:1.7, amp=run?26:20;
  const ph=t*Math.PI*2*fr, sw=walking?Math.sin(ph)*amp:0;
  let bob=walking?-Math.abs(Math.sin(ph))*(run?16:10):Math.sin(t*2.2)*1.5;
  const hp=act('hop',t)||act('celebrate',t)||act('cheer',t)||act('spin',t)||act('dance',t); if(hp)bob+=-Math.abs(Math.sin((t-hp.t0)*Math.PI*2.6))*34*ramp(hp,t,.15);
  const sur=acts.find(a=>a.k==='surprise'&&t>=a.t0&&t<a.t0+1.4);const sp=sur?seg(t,sur.t0,sur.t0+1.4):0;
  const jump=sur?-Math.sin(Math.min(1,sp*2.2)*Math.PI)*40:0;
  const S=S0*(walking&&walking.s1?lerp(walking.s0||1,walking.s1,ease(seg(t,walking.t0,walking.t1))):1);
  const top=BASE-620*S+bob+jump;
  svg.style.transform=`translate(${x-180*S*face}px,${top}px) scale(${S*face},${S})`;
  const ln=act('lean',t), fl=act('float',t), dn=act('dance',t), gg=act('giggle',t), bw=act('bow',t), sl=walking&&walking.slide;
  let rot=ln?(ln.ang??-12)*ramp(ln,t,.3):(walking?Math.sin(ph)*1.5:0), bx=0, by=0;
  if(dn)rot+=Math.sin((t-dn.t0)*7)*12*ramp(dn,t,.2);
  if(gg)bx+=Math.sin(t*45)*4*ramp(gg,t,.15);
  if(bw)rot+=10*ramp(bw,t,.3);
  if(sl){rot=-72;by=-40}
  let fr2=0; if(fl){fr2=ramp(fl,t,.4);rot=lerp(rot,-90,fr2);by+=lerp(0,-150,fr2)+Math.sin(t*3)*8*fr2}
  g('cBody').setAttribute('transform',`translate(${bx} ${by}) rotate(${rot} 180 ${fl?420:620})`);
  g('tail').setAttribute('transform',`rotate(${Math.sin(t*(walking?9:3.2))*12} 246 450)`);
  const swl=sl?0:sw;g('legL').setAttribute('transform',`translate(150 430) rotate(${swl})`);
  g('legR').setAttribute('transform',`translate(210 430) rotate(${-swl})`);
  // mug arm
  const sip=act('sip',t);const sv=sip?Math.sin(seg(t,sip.t0,sip.t1)*Math.PI):0;
  const sh=act('shrug',t);const shv=sh?ramp(sh,t,.25):0;
  const mm=act('memo',t), cp=act('clap',t), ch=act('cheer',t);
  let ma=(walking&&!sl?sw*.6:0)+sv*112-shv*38;
  if(mm)ma=lerp(ma,44,ramp(mm,t,.3)); if(cp)ma=lerp(ma,40+Math.sin((t-cp.t0)*16)*10,ramp(cp,t,.2)); if(ch)ma=lerp(ma,-160,ramp(ch,t,.25)); if(dn)ma+=Math.cos((t-dn.t0)*7)*30*ramp(dn,t,.2); if(fl)ma=lerp(ma,40,fr2); if(sl)ma=-150;
  const prp=act('prop',t),pn=prp?prp.name:null;if(pn!==propNow){propNow=pn;const a=svg.querySelector('#mugAlt'),dd=svg.querySelector('#mugDef');if(a&&dd){a.innerHTML=pn?(PROPS[pn]||''):'';dd.style.display=pn?'none':''}}
  if(prp)ma=lerp(ma,70+Math.sin((t-prp.t0)*3)*6,ramp(prp,t,.3));
  g('armM').setAttribute('transform','translate(262 318)');g('armMr').setAttribute('transform',`rotate(${ma})`);g('mug').setAttribute('transform',`translate(0 150) rotate(${-ma})`);
  // gesture arm
  let pa=walking?-sw*.6:0, hand='P';
  const pt=act('point',t), wv=act('wave',t), th=act('thumbs',t), tk2=act('think',t), fp=act('facepalm',t), ce=act('celebrate',t);
  if(pt){pa=lerp(pa,pt.ang??96,back(seg(t,pt.t0,pt.t0+.45))*(1-ease(seg(t,pt.t1-.4,pt.t1))));}
  if(wv){const r=ramp(wv,t,.3);pa=lerp(pa,150+Math.sin((t-wv.t0)*9)*18,r);hand=r>.3?'W':'P';}
  if(th){const r=ramp(th,t,.3);pa=lerp(pa,130,r);hand=r>.3?'T':'P';}
  if(ce){const r=ramp(ce,t,.25);pa=lerp(pa,165+Math.sin((t-ce.t0)*12)*8,r);hand=r>.3?'T':'P';}
  if(tk2){pa=lerp(pa,-128,ramp(tk2,t,.35));}
  if(fp){pa=lerp(pa,-140,ramp(fp,t,.25));}
  if(sh){pa=lerp(pa,58,shv);hand=shv>.4?'W':hand;}
  if(mm){pa=lerp(pa,-38+Math.sin((t-mm.t0)*14)*6,ramp(mm,t,.3));}
  if(cp){pa=lerp(pa,-40-Math.sin((t-cp.t0)*16)*10,ramp(cp,t,.2));hand='W';}
  if(ch){pa=lerp(pa,165,ramp(ch,t,.25));hand='W';}
  if(dn){pa+=Math.sin((t-dn.t0)*7)*30*ramp(dn,t,.2);}
  if(gg){pa=lerp(pa,-150,ramp(gg,t,.2));hand='W';}
  if(fl){pa=lerp(pa,-40,fr2);}
  if(sl){pa=150;hand='W';}
  g('armP').setAttribute('transform','translate(98 318)');g('armPr').setAttribute('transform',`rotate(${pa})`);
  show('hP',hand==='P');show('hW',hand==='W');show('hT',hand==='T');
  g('hTi').setAttribute('transform',`rotate(${-pa} 0 166)`);
  // face
  const yw=act('yawn',t), tk=act('talk',t);
  let eyes='N';
  const blink=[...Array(40)].some((_,i)=>{const b=1.3+i*3.1;return t>b&&t<b+.13});
  if(blink)eyes='C'; if(yw&&ramp(yw,t,.4)>.4)eyes='C'; if(fp&&ramp(fp,t)>.4)eyes='C'; if(sur&&sp<.75)eyes='W'; if(ce&&ramp(ce,t)>.3)eyes='C';
  const wk=act('wink',t); if(wk&&ramp(wk,t,.15)>.3)eyes='K'; if((ch||gg||fl||sl)&&eyes!=='W')eyes='C'; if(bw&&ramp(bw,t)>.3)eyes='C';
  show('eyeN',eyes==='N');show('eyeC',eyes==='C');show('eyeW',eyes==='W');show('eyeK',eyes==='K');
  let m='F'; if((th||ce)&&ramp(th||ce,t)>.3)m='S'; if(ch||gg||wk||dn||fl||sl||cp)m='S'; if(tk&&Math.floor(t*9)%2===0)m='O'; if(sur&&sp<.6)m='O'; if(yw&&ramp(yw,t,.4)>.3)m='Y';
  show('mF',m==='F');show('mO',m==='O');show('mY',m==='Y');show('mS',m==='S');
  const nd=act('nod',t);let hr=bw?18*ramp(bw,t,.3):0; hr+=nd?Math.sin((t-nd.t0)*10)*5*ramp(nd,t,.2):0; if(yw)hr+=-8*ramp(yw,t,.4); if(pt)hr+=-5*ramp(pt,t,.4); if(tk2)hr+=7*ramp(tk2,t,.35); if(sh)hr+=6*shv; if(fp)hr+=-4*ramp(fp,t,.25);
  g('head').setAttribute('transform',`rotate(${hr} 180 260)`);
  const swt=act('sweat',t)||(fp?{t0:fp.t0+.3,t1:fp.t1}:null); g('sweat').style.opacity=swt&&t>=swt.t0?ramp(swt,t,.25):0; g('sweat').setAttribute('transform',`translate(0 ${swt?seg(t,swt.t0,swt.t1)*26:0})`);
  g('bang').style.opacity=sur&&sp<.8?1:0;
  const spl=act('splash',t)||(sl?{t0:walking.t0,t1:walking.t1}:null);const dr=g('drops');
  if(spl){const q=seg(t,spl.t0,spl.t1);dr.style.opacity=1-q*q;[[-1,-1.2],[-.4,-1.6],[.5,-1.5],[1.1,-1],[0,-1.9]].forEach((v,i)=>{const d=g('d'+(i+1));const k=(sl?((t*3+i*.2)%1):q);d.setAttribute('cx',180+v[0]*160*k);d.setAttribute('cy',(sl?560:300)+v[1]*150*k+260*k*k)})}else dr.style.opacity=0;
  const spk=act('spark',t)||wk||ch;g('spark').style.opacity=spk?ramp(spk,t,.2)*(.6+.4*Math.sin(t*12)):0;
  g('qm').style.opacity=tk2?ramp(tk2,t,.3):0; g('qm').setAttribute('transform',`translate(0 ${tk2?-Math.abs(Math.sin((t-tk2.t0)*4))*8:0})`);
  // bubble
  const b=act('bubble',t);
  if(b&&visible){const bi=back(seg(t,b.t0,b.t0+.35)),bo=1-seg(t,b.t1-.25,b.t1);bub.innerHTML=b.text;bub.style.opacity=bo;bub.style.transform=`scale(${bi*bo})`;
   let right=Math.min(Math.max(x+150,520),1890);const bw2=bub.offsetWidth||430;if(!window.BUBBLE_FREE&&!b.free&&x>1300)right=Math.min(1900,Math.max(right,1456+bw2));bub.style.left='auto';bub.style.right=(1920-right)+'px';bub.style.bottom=(1080-(top+70*S))+'px';}
  else bub.style.opacity=0;
 };
}
window.SCENE={};
window.render=function(t){const o=inv(t);sceneFade(t);entries(o);if(SCENE.anim)SCENE.anim(o,t);if(SCENE.char)SCENE.char(t);if(SCENE.char2)SCENE.char2(t)};
