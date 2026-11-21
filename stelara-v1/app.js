const steps=[
{title:'스텔라라 소개 · 제형과 허가 적응증',file:'intro',duration:23.378},{title:'정맥주사 vs 프리필드시린지',file:'forms',duration:25.675},
{title:'IL-12 · IL-23 · 공통 p40',file:0,duration:10.141},{title:'p40 차단 · 염증 감소',file:1,duration:13.955},
{title:'기전 영상 · 0:00–3:37',id:'KWHUwVdVICM',start:0,end:217},
{title:'용량과 사용법',file:5,duration:32.66},{title:'정맥주사 조제 · 희석과 주입',file:'iv',duration:27.31},
{title:'프리필드시린지 보관',file:'storage',duration:24.822},{title:'프리필드시린지 주사 방법',file:'inj',duration:35.941},
{title:'주의점 1 · 감염과 생백신',file:'4a',duration:16.859},{title:'주의점 2 · 결핵과 과민반응',file:'4b',duration:20.358},
{title:'Take-home message',file:'summary',duration:39.239}];
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
function smallYouTubeCaptions(){try{if(yt&&yt.getOptions('captions').includes('fontSize'))yt.setOption('captions','fontSize',-1)}catch{}}
function updateCaption(){const box=$('localCaption');if(transitionPending){box.textContent='';return;}box.hidden=isYT();if(isYT()){box.textContent='';return}const cue=(captions[steps[index].file]||[]).find(c=>local.currentTime>=c.start&&local.currentTime<c.end);box.innerHTML=cue?(window.hlHTML?hlHTML(cue.text):cue.text):''}
function update(){const s=steps[index];$('title').textContent=s.title;if($('ytTitle'))$('ytTitle').textContent=s.id?s.title:'';$('position').textContent=String(index+1).padStart(2,'0')+' / '+steps.length;$('ytNote').hidden=!isYT();$('ytNote').textContent=steps[index].id==='KWHUwVdVICM'?'기전 영상 0:00–3:37 · 영어 원음. ⚙ → 자막 → 자동 번역 → 한국어.':'자가주사 시연 1:30–4:40 · 한국어 자막이 없으면 ⚙ → 자막 → 자동 번역 → 한국어';if(isYT()){$('original').href='https://www.youtube.com/watch?v='+s.id+'&t='+Math.floor(s.start+pendingOffset)+'s'}sync()}
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
 if(!local.currentSrc.endsWith('part'+steps[index].file+'.mp4'))return;
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
  if(!isYT()){local.src='part'+steps[i].file+'.mp4';local.load();}
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
window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('youtube',{width:'100%',height:'100%',playerVars:{playsinline:1,cc_load_policy:1,cc_lang_pref:'ko',hl:'ko',origin:location.origin},events:{onApiChange:smallYouTubeCaptions,onReady:()=>{ytReady=true;smallYouTubeCaptions();if(isYT())playYT()},onStateChange:e=>{if(!currentYT()||transitionPhase==='covering')return;if(e.data===0)advance();if(e.data===1){if(transitionPhase==='loading')revealScene();try{local.pause()}catch{}wantsPlay=true;smallYouTubeCaptions();$('fallback').hidden=true}if(e.data===2&&!transitionPending)wantsPlay=false;if(e.data===5&&!wantsPlay)revealScene();sync()},onAutoplayBlocked:()=>{if(!isYT()||transitionPhase==='covering')return;revealScene();wantsPlay=false;sync();message('영상의 재생 버튼을 눌러 주세요.')},onError:e=>error('YouTube 재생 오류 '+e.data)}})};
$('play').onclick=()=>{if(!$('fallback').hidden){show(index,true,pendingOffset);return;}if(transitionPending){wantsPlay=!wantsPlay;sync();return;}if(ended){show(0,true);return}wantsPlay=!wantsPlay;if(isYT()){if(ytReady)wantsPlay?yt.playVideo():yt.pauseVideo();else loadYT()}else wantsPlay?playLocal():local.pause();sync()};
$('timeline').addEventListener('input',()=>{dragging=true;$('time').textContent=format(Number($('timeline').value))+' / '+format(total())});
$('timeline').addEventListener('change',()=>{const t=Number($('timeline').value);dragging=false;seek(t)});
local.addEventListener('loadedmetadata',()=>{if(isYT()||transitionPhase==='covering')return;local.currentTime=pendingOffset;local.playbackRate=slideRate;if(wantsPlay&&!isYT())playLocal()});
for(const event of ['loadeddata','playing','canplay','seeked'])local.addEventListener(event,localFrameReady);
local.addEventListener('ended',()=>{if(!isYT())advance()});
local.addEventListener('error',()=>{if(!isYT()&&transitionPhase!=='covering')error('영상 파일을 읽지 못했습니다. 새로고침해 주세요.')});
$('speed').onchange=e=>{slideRate=Number(e.target.value);local.playbackRate=slideRate;sync()};
$('continue').onclick=advance;
$('fullscreen').onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.querySelector('.cinema').requestFullscreen()}catch{message('전체 화면을 지원하지 않습니다.')}};
setInterval(()=>{if(!transitionPending&&currentYT()&&yt.getPlayerState()===1&&yt.getCurrentTime()>=steps[index].end-.45){advance(true)}sync()},50);
update();

// Initialize the external player before its scene to reduce connection delay.
loadYT();
