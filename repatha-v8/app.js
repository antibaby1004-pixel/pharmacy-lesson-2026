const BL={},BP={};function getB(f){if(!BP[f])BP[f]=fetch('part'+f+'.mp4').then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>(BL[f]=URL.createObjectURL(b))).catch(()=>{delete BP[f];return 'part'+f+'.mp4'});return BP[f]}
function pre(i){const s=steps[i];if(s&&!s.id&&s.file)getB(s.file)}
const steps=[
{title:'레파타 소개 · 치료 목적과 허가 적응증 · 원외→원내',file:'intro',duration:37.994},
{title:'정상 생리 · 수용체 재활용',file:0,duration:6.75},{title:'분해 단백질 · 수용체 분해',file:1,duration:7.603},{title:'evolocumab · 수용체 보존',file:2,duration:12.487},
{title:'공식 기전 영상 · 0:40–3:23',id:'8mvyOSj83dg',start:40,end:203},
{title:'특징과 사용 이유',file:3,duration:27.687},{title:'용량과 사용법',file:5,duration:31.868},
{title:'주사 전 · 1회용 펜과 보관',file:'storage',duration:33.073},
{title:'주사 방법 · 프리필드펜 순서',file:'inj',duration:63.462},
{title:'주의점과 부작용',file:4,duration:20.603},
{title:'Take-home message',file:'summary',duration:44.651}];
const $=id=>document.getElementById(id),local=$('local');
let index=0,yt,ytReady=false,ytLoading=false,wantsPlay=false,slideRate=1,pendingOffset=0,ended=false,dragging=false;
const isYT=()=>!!steps[index].id;
const message=s=>$('status').textContent=s;
const length=s=>s.id?s.end-s.start:s.duration/slideRate;
const total=()=>steps.reduce((a,s)=>a+length(s),0);
const before=i=>steps.slice(0,i).reduce((a,s)=>a+length(s),0);
const format=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function currentYT(){return ytReady&&isYT()&&yt.getVideoData().video_id===steps[index].id}
function elapsed(){return before(index)+(isYT()?(currentYT()?Math.max(0,yt.getCurrentTime()-steps[index].start):pendingOffset):local.currentTime/slideRate)}
function sync(){updateCaption();if(!dragging)$('timeline').value=Math.min(total(),elapsed());$('timeline').max=total();$('time').textContent=format(elapsed())+' / '+format(total());$('play').textContent=wantsPlay?'일시정지':'재생';$('play').setAttribute('aria-label',wantsPlay?'일시정지':'재생')}
function smallYouTubeCaptions(){try{if(!yt||!yt.getOptions)return;if((typeof YTKO!=='undefined'?YTKO:{})[steps[index]&&steps[index].id]){try{yt.unloadModule('captions')}catch{}return}try{yt.loadModule('captions')}catch{}if(!yt.getOptions('captions').length)return;try{yt.setOption('captions','fontSize',0)}catch{}const L=yt.getOption('captions','tracklist')||[];const cur=yt.getOption('captions','track')||{};if(cur.languageCode==='ko'||(cur.translationLanguage&&cur.translationLanguage.languageCode==='ko'))return;const ko=L.find(x=>x.languageCode==='ko');if(ko){yt.setOption('captions','track',ko);return}if(L.length){const s=L.find(x=>/^en/.test(x.languageCode)&&!x.kind)||L.find(x=>/^en/.test(x.languageCode))||L[0];yt.setOption('captions','track',Object.assign({},s,{translationLanguage:{languageCode:'ko',languageName:'Korean'}}))}}catch{}}
function updateCaption(){const box=$('localCaption');if(transitionPending){box.textContent='';return;}box.hidden=isYT();if(isYT()){box.textContent='';return}const cue=(captions[steps[index].file]||[]).find(c=>local.currentTime>=c.start&&local.currentTime<c.end);box.innerHTML=cue?(window.hlHTML?hlHTML(cue.text):cue.text):''}
function update(){const s=steps[index];$('title').textContent=s.title;if($('ytTitle'))$('ytTitle').textContent=s.id?s.title:'';$('position').textContent=String(index+1).padStart(2,'0')+' / '+steps.length;$('ytNote').hidden=!isYT();$('ytNote').textContent=steps[index].id==='8mvyOSj83dg'?'기전 영상 0:40–3:23 · 영어 원음. ⚙ → 자막 → 자동 번역 → 한국어.':'자가주사 시연 1:30–4:40 · 한국어 자막이 없으면 ⚙ → 자막 → 자동 번역 → 한국어';if(isYT()){$('original').href='https://www.youtube.com/watch?v='+s.id+'&t='+Math.floor(s.start+pendingOffset)+'s'}sync()}
function error(t){revealScene();try{local.pause();if(ytReady)yt.stopVideo()}catch{}message(t);$('errorText').textContent=t;$('fallback').hidden=false;wantsPlay=false;sync()}
function playLocal(){const token=transitionId;local.playbackRate=slideRate;local.play().catch(()=>{if(token!==transitionId||isYT()||transitionPhase==='covering')return;wantsPlay=false;localFrameReady();sync();message('재생 버튼을 눌러 주세요.')})}
let ytLoadedFor=-1;function playYT(){if(ytLoadedFor===transitionId)return;ytLoadedFor=transitionId;try{local.pause()}catch{}const s=steps[index],clip={videoId:s.id,startSeconds:s.start+pendingOffset,endSeconds:s.end};wantsPlay?yt.loadVideoById(clip):yt.cueVideoById(clip);yt.setPlaybackRate(1)}
let transitionId=0,transitionPending=false,transitionPhase='idle',transitionTimer,transitionWatchdog,frameRequested=false;
function revealScene(token=transitionId){
 if(token!==transitionId||transitionPhase==='covering')return;
 clearTimeout(transitionWatchdog);transitionPending=false;transitionPhase='idle';$('transitionVeil').classList.remove('covered');
}
function localFrameReady(){
 if(isYT()||transitionPhase!=='loading'||frameRequested||local.readyState<2||local.seeking)return;
 if(!local.currentSrc.endsWith('part'+steps[index].file+'.mp4')&&local.currentSrc!==BL[steps[index].file])return;
 if(Math.abs(local.currentTime-pendingOffset)>1)return;
 const token=transitionId;frameRequested=true;
 const reveal=()=>{if(token===transitionId&&!isYT()&&transitionPhase==='loading')revealScene(token);};
 if(wantsPlay&&local.requestVideoFrameCallback)local.requestVideoFrameCallback(reveal);
 else requestAnimationFrame(()=>requestAnimationFrame(reveal));
}
function show(i,auto=true,offset=0,finishOutgoing=false){
 if(i<0||i>=steps.length)return;
 const token=++transitionId;transitionPending=true;transitionPhase='covering';frameRequested=false;
 clearTimeout(transitionTimer);clearTimeout(transitionWatchdog);wantsPlay=auto;
 $('transitionVeil').classList.add('covered');$('localCaption').textContent='';
 if(!finishOutgoing){local.pause();if(ytReady)yt.stopVideo();}
 transitionTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(token!==transitionId)return;
  // The outgoing scene is fully covered before sources and visibility change.
  local.pause();if(ytReady)yt.stopVideo();
  index=i;pendingOffset=offset;ended=false;transitionPhase='loading';$('fallback').hidden=true;
  local.removeAttribute('poster');local.hidden=isYT();$('youtubeWrap').hidden=!isYT();
  if(!isYT()){getB(steps[i].file).then(u=>{if(token!==transitionId)return;local.src=u;local.load()})}pre(i+1);pre(i+2);
  update();message('구간이 끝나면 자동으로 이어집니다.');
  transitionWatchdog=setTimeout(()=>{
   if(token!==transitionId||!transitionPending)return;
   if(isYT()){revealScene(token);return}
   // Never expose an unprepared or stale frame on timeout.
   local.hidden=true;$('youtubeWrap').hidden=true;
   error('영상 연결이 지연되고 있습니다. 재생 버튼으로 다시 시도해 주세요.');
  },12000);
  if(isYT()){if(ytReady)playYT();else loadYT();}
 })),450);
}
function advance(finishOutgoing=false){if(transitionPending)return;if(index<steps.length-1)show(index+1,true,0,finishOutgoing);else{ended=true;wantsPlay=false;if(currentYT())yt.pauseVideo();else local.pause();message('교육이 끝났습니다.');sync()}}
function seek(t){const auto=wantsPlay;let i=0;while(i<steps.length-1&&t>=length(steps[i])){t-=length(steps[i]);i++}show(i,auto,Math.min(t,length(steps[i])-.05)*(steps[i].id?1:slideRate))}
function loadYT(){if(ytLoading)return;ytLoading=true;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytLoading=false;error('YouTube를 불러오지 못했습니다.')};document.head.appendChild(s)}
window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('youtube',{width:'100%',height:'100%',playerVars:{playsinline:1,cc_load_policy:1,cc_lang_pref:'ko',hl:'ko',origin:location.origin},events:{onApiChange:smallYouTubeCaptions,onReady:()=>{ytReady=true;smallYouTubeCaptions();if(isYT())playYT()},onStateChange:e=>{if(!currentYT()||transitionPhase==='covering')return;if(e.data===0)advance();if(e.data===1){smallYouTubeCaptions();setTimeout(smallYouTubeCaptions,1500);setTimeout(smallYouTubeCaptions,4000);if(transitionPhase==='loading')revealScene();try{local.pause()}catch{}wantsPlay=true;smallYouTubeCaptions();$('fallback').hidden=true}if(e.data===2&&!transitionPending)wantsPlay=false;if(e.data===5&&!wantsPlay)revealScene();sync()},onAutoplayBlocked:()=>{if(!isYT()||transitionPhase==='covering')return;revealScene();wantsPlay=false;sync();message('영상의 재생 버튼을 눌러 주세요.')},onError:e=>error('YouTube 재생 오류 '+e.data)}})};
$('play').onclick=()=>{if(!$('fallback').hidden){show(index,true,pendingOffset);return;}if(transitionPending){wantsPlay=!wantsPlay;sync();return;}if(ended){show(0,true);return}wantsPlay=!wantsPlay;if(isYT()){if(ytReady)wantsPlay?yt.playVideo():yt.pauseVideo();else loadYT()}else wantsPlay?playLocal():local.pause();sync()};
$('timeline').addEventListener('input',()=>{dragging=true;$('time').textContent=format(Number($('timeline').value))+' / '+format(total())});
$('timeline').addEventListener('change',()=>{const t=Number($('timeline').value);dragging=false;seek(t)});
local.addEventListener('loadedmetadata',()=>{if(isYT()||transitionPhase==='covering')return;local.currentTime=pendingOffset;local.playbackRate=slideRate;if(wantsPlay&&!isYT())playLocal()});
for(const event of ['loadeddata','playing','canplay','seeked'])local.addEventListener(event,localFrameReady);
local.addEventListener('ended',()=>{if(!isYT())advance()});
local.addEventListener('error',()=>{if(!isYT()&&transitionPhase!=='covering')error('영상 파일을 읽지 못했습니다. 새로고침해 주세요.')});
$('speed').onchange=e=>{slideRate=Number(e.target.value);local.playbackRate=slideRate;sync()};
$('continue').onclick=advance;
$('fullscreen').onclick=async()=>{const c=document.querySelector('.cinema'),b=document.body;if(document.fullscreenElement||document.webkitFullscreenElement){try{screen.orientation.unlock()}catch{}(document.exitFullscreen||document.webkitExitFullscreen).call(document);return}if(b.classList.contains('pfs-on')){b.classList.remove('pfs-on');$('fullscreen').textContent='전체 화면';return}try{if(c.requestFullscreen){await c.requestFullscreen();try{await screen.orientation.lock('landscape')}catch{}}else if(c.webkitRequestFullscreen){c.webkitRequestFullscreen()}else throw 0}catch{b.classList.add('pfs-on');$('fullscreen').textContent='닫기'}};
setInterval(()=>{if(!transitionPending&&currentYT()&&yt.getPlayerState()===1&&yt.getCurrentTime()>=steps[index].end-.45){advance(true)}sync()},50);
update();

// Initialize the external player before its scene to reduce connection delay.
loadYT();

// v20: 유튜브 구간 한국어 자막 — captions.js의 YTKO[영상ID] = [[초, 문장], ...]
setInterval(()=>{const box=document.getElementById('ytKo');if(!box)return;let txt='';try{const s=steps[index];const L=(typeof YTKO!=='undefined'?YTKO:{})[s&&s.id];if(L&&isYT()&&ytReady&&!transitionPending){const ct=yt.getCurrentTime();let k=-1;for(let j=0;j<L.length;j++){if(L[j][0]<=ct+0.15)k=j;else break}if(k>=0&&ct<(k+1<L.length?L[k+1][0]:L[k][0]+9))txt=L[k][1]}}catch{}if(box.dataset.t!==txt){box.dataset.t=txt;box.innerHTML=txt?'<span>'+txt.replace(/</g,'&lt;')+'</span>':''}},200);
