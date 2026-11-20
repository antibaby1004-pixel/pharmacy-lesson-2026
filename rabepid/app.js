const steps=[{"title": "약물 소개 · 두 함량과 치료 목적", "file": 0, "duration": 35.45, "mediaStart": 0.0, "source": "intro.mp4"}, {"title": "두 성분의 작용 위치", "file": 1, "duration": 28.05, "mediaStart": 35.45, "source": "intro.mp4"}, {"title": "기전 영상 · 위산 분비 억제", "id": "oAEwnbi9Cio", "start": 0, "end": 118}, {"title": "기전 영상 · calcium carbonate", "id": "EmcCMQ-xkLA", "start": 0, "end": null, "toEnd": true, "portrait": true}, {"title": "용량과 사용법", "file": 2, "duration": 41.0, "mediaStart": 0.0, "source": "lesson.mp4"}, {"title": "주의점과 부작용", "file": 4, "duration": 51.2, "mediaStart": 41.0, "source": "lesson.mp4"}, {"title": "함께 복용하는 약 · 상호작용", "file": 7, "duration": 52.75, "mediaStart": 92.2, "source": "lesson.mp4"}, {"title": "사용 및 보관법", "file": 5, "duration": 31.0, "mediaStart": 144.95, "source": "lesson.mp4"}, {"title": "Take-home message", "file": 6, "duration": 27.45, "mediaStart": 175.95, "source": "lesson.mp4"}];
const $=id=>document.getElementById(id),local=$('local');
let index=0,yt,ytReady=false,ytLoading=false,wantsPlay=false,slideRate=1.1,pendingOffset=0,ended=false,dragging=false;
const isYT=()=>!!steps[index].id;
const mediaBase=()=>steps[index].mediaStart||0;
const mediaSource=s=>s.source;
const localElapsed=()=>Math.max(0,local.currentTime-mediaBase());
const message=s=>$('status').textContent=s;
const length=s=>s.id?(Number.isFinite(s.end)?Math.max(0,s.end-s.start):1):s.duration/slideRate;
function readYTDuration(){if(!currentYT()||!steps[index].toEnd)return;const duration=yt.getDuration();if(Number.isFinite(duration)&&duration>steps[index].start)steps[index].end=duration;}
const durationPending=()=>steps.some(s=>s.toEnd&&!Number.isFinite(s.end));
const total=()=>steps.reduce((a,s)=>a+length(s),0);
const before=i=>steps.slice(0,i).reduce((a,s)=>a+length(s),0);
const format=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function currentYT(){return ytReady&&isYT()&&yt.getVideoData().video_id===steps[index].id}
function elapsed(){return before(index)+(isYT()?(currentYT()?Math.max(0,yt.getCurrentTime()-steps[index].start):pendingOffset):localElapsed()/slideRate)}
function sync(){updateCaption();if(!dragging)$('timeline').value=Math.min(total(),elapsed());$('timeline').max=total();$('time').textContent=format(elapsed())+' / '+(durationPending()?'전체 길이 확인 중':format(total()));$('play').textContent=wantsPlay?'일시정지':'재생';$('play').setAttribute('aria-label',wantsPlay?'일시정지':'재생')}
function smallYouTubeCaptions(){try{if(yt&&yt.getOptions('captions').includes('fontSize'))yt.setOption('captions','fontSize',-1)}catch{}}
function updateCaption(){const box=$('localCaption');if(transitionPending){box.textContent='';return;}box.hidden=isYT();if(isYT()){box.textContent='';return}const cue=(captions[steps[index].file]||[]).find(c=>localElapsed()>=c.start&&localElapsed()<c.end);box.textContent=cue?cue.text:''}
function update(){const s=steps[index];$('title').textContent=s.title;$('position').textContent=String(index+1).padStart(2,'0')+' / '+steps.length;$('ytNote').hidden=!isYT();$('ytNote').textContent=s.id==='oAEwnbi9Cio'?'기전 영상 · 0:00–1:58':s.id?'calcium carbonate · 처음부터 끝까지':'';$('youtubeWrap').classList.toggle('portrait',!!s.portrait);if(isYT()){$('original').href='https://www.youtube.com/watch?v='+s.id+'&t='+Math.floor(s.start+pendingOffset)+'s'}sync()}
function error(t){revealScene();message(t);$('errorText').textContent=t;$('fallback').hidden=false;wantsPlay=false;sync()}
function playLocal(){const token=transitionId;local.playbackRate=slideRate;local.play().catch(()=>{if(token!==transitionId||isYT()||transitionPhase==='covering')return;wantsPlay=false;localFrameReady();sync();message('재생 버튼을 눌러 주세요.')})}
function playYT(){$('youtubeWrap').hidden=false;const s=steps[index],clip={videoId:s.id,startSeconds:s.start+pendingOffset,...(s.toEnd?{}:{endSeconds:s.end})};wantsPlay?yt.loadVideoById(clip):yt.cueVideoById(clip);yt.setPlaybackRate(1)}
let transitionId=0,transitionPending=false,transitionPhase='idle',transitionTimer,transitionWatchdog,frameRequested=false;
function revealScene(token=transitionId){
 if(token!==transitionId||transitionPhase==='covering')return;
 clearTimeout(transitionWatchdog);transitionPending=false;transitionPhase='idle';$('transitionVeil').classList.remove('covered');
}
function localFrameReady(){
 if(isYT()||transitionPhase!=='loading'||frameRequested||local.readyState<2||local.seeking)return;
 if(!local.currentSrc.endsWith(mediaSource(steps[index])))return;
 if(Math.abs(localElapsed()-pendingOffset)>1)return;
 const token=transitionId;frameRequested=true;
 const reveal=()=>{if(token===transitionId&&!isYT()&&transitionPhase==='loading')revealScene(token);};
 if(wantsPlay&&local.requestVideoFrameCallback)local.requestVideoFrameCallback(reveal);
 else requestAnimationFrame(()=>requestAnimationFrame(reveal));
}
function show(i,auto=true,offset=0,finishOutgoing=false){
 if(i<0||i>=steps.length)return;
 const token=++transitionId;transitionPending=true;transitionPhase='covering';frameRequested=false;
 clearTimeout(transitionTimer);clearTimeout(transitionWatchdog);wantsPlay=auto;
 $('transitionVeil').classList.add('covered');$('transitionVeil').textContent='';$('localCaption').textContent='';
 if(!finishOutgoing){local.pause();if(ytReady)yt.pauseVideo();}
 transitionTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(token!==transitionId)return;
  // The outgoing scene is fully covered before sources and visibility change.
  local.pause();if(ytReady)yt.pauseVideo();
  index=i;pendingOffset=offset;ended=false;transitionPhase='loading';$('fallback').hidden=true;
  local.removeAttribute('poster');local.hidden=isYT();$('youtubeWrap').hidden=!isYT();
  if(!isYT()){local.src=mediaSource(steps[i]);local.load();}
  update();message('구간이 끝나면 자동으로 이어집니다.');if(isYT())$('transitionVeil').textContent='YouTube 영상 연결 중…';
  transitionWatchdog=setTimeout(()=>{
   if(token!==transitionId||!transitionPending)return;
   // Never expose an unprepared or stale frame on timeout.
   local.hidden=true;$('youtubeWrap').hidden=!isYT();
   error(isYT()?'YouTube 자동재생이 지연되거나 제한되었습니다. 영상 안의 재생 버튼을 누르거나 아래 원본 링크로 시청해 주세요.':'영상 연결이 지연되고 있습니다. 재생 버튼으로 다시 시도해 주세요.');
  },12000);
  if(isYT()){if(ytReady)playYT();else loadYT();}
 })),450);
}
function advance(finishOutgoing=false){if(transitionPending)return;if(index<steps.length-1)show(index+1,true,0,finishOutgoing);else{ended=true;wantsPlay=false;if(currentYT())yt.pauseVideo();else local.pause();message('교육이 끝났습니다.');sync()}}
function seek(t){const auto=wantsPlay;let i=0;while(i<steps.length-1&&t>=length(steps[i])){t-=length(steps[i]);i++}show(i,auto,Math.min(t,length(steps[i])-.05)*(steps[i].id?1:slideRate))}
function loadYT(){if(ytLoading)return;ytLoading=true;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytLoading=false;error('YouTube를 불러오지 못했습니다.')};document.head.appendChild(s)}
window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('youtube',{width:'100%',height:'100%',playerVars:{playsinline:1,cc_load_policy:1,cc_lang_pref:'ko',hl:'ko',origin:location.origin},events:{onApiChange:smallYouTubeCaptions,onReady:()=>{ytReady=true;smallYouTubeCaptions();if(isYT())playYT()},onStateChange:e=>{if(!currentYT()||transitionPhase==='covering')return;readYTDuration();if(e.data===0&&transitionPhase==='idle')advance();if(e.data===1){if(transitionPhase==='loading'&&yt.getCurrentTime()>=steps[index].start+pendingOffset-.5)revealScene();wantsPlay=true;$('youtubeWrap').hidden=false;smallYouTubeCaptions();$('fallback').hidden=true}if(e.data===2&&!transitionPending)wantsPlay=false;if([2,5].includes(e.data)&&transitionPhase==='loading'&&!wantsPlay){ $('youtubeWrap').hidden=false;revealScene();if(e.data!==3){wantsPlay=false;message('영상 안의 재생 버튼을 눌러 주세요.');}}sync()},onAutoplayBlocked:()=>{if(!isYT()||transitionPhase==='covering')return;revealScene();wantsPlay=false;sync();message('영상의 재생 버튼을 눌러 주세요.')},onError:e=>{if(!isYT()||transitionPhase==='covering')return;$('youtubeWrap').hidden=false;error('YouTube 재생 오류 '+e.data+' · 아래 원본 링크에서 시청할 수 있습니다.');}}})};
$('play').onclick=()=>{if(!$('fallback').hidden){show(index,true,pendingOffset);return;}if(transitionPending){wantsPlay=!wantsPlay;sync();return;}if(ended){show(0,true);return}wantsPlay=!wantsPlay;if(isYT()){if(ytReady)wantsPlay?yt.playVideo():yt.pauseVideo();else loadYT()}else wantsPlay?playLocal():local.pause();sync()};
$('timeline').addEventListener('input',()=>{dragging=true;$('time').textContent=format(Number($('timeline').value))+' / '+format(total())});
$('timeline').addEventListener('change',()=>{const t=Number($('timeline').value);dragging=false;seek(t)});
local.addEventListener('loadedmetadata',()=>{if(isYT()||transitionPhase==='covering')return;local.currentTime=mediaBase()+pendingOffset;local.playbackRate=slideRate;if(wantsPlay&&!isYT())playLocal()});
for(const event of ['loadeddata','playing','canplay','seeked'])local.addEventListener(event,localFrameReady);
local.addEventListener('ended',()=>{if(!isYT())advance()});
local.addEventListener('error',()=>{if(!isYT()&&transitionPhase!=='covering')error('영상 파일을 읽지 못했습니다. 새로고침해 주세요.')});
$('speed').onchange=e=>{slideRate=Number(e.target.value);local.playbackRate=slideRate;sync()};
$('continue').onclick=advance;
$('fullscreen').onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.querySelector('.cinema').requestFullscreen()}catch{message('전체 화면을 지원하지 않습니다.')}};
setInterval(()=>{
 if(!isYT()&&!transitionPending&&steps[index].mediaStart!==undefined){
  while(index<steps.length-1&&steps[index+1].source===steps[index].source&&steps[index+1].mediaStart!==undefined&&local.currentTime>=steps[index+1].mediaStart){index++;pendingOffset=0;update();}
 }
 readYTDuration();if(!transitionPending&&currentYT()&&yt.getPlayerState()===1&&Number.isFinite(steps[index].end)&&yt.getCurrentTime()>=steps[index].end){yt.pauseVideo();advance(false)}sync()},50);
update();

// Initialize the external player before its scene to reduce connection delay.
loadYT();

const lessonPreload=document.createElement('video');lessonPreload.preload='auto';lessonPreload.muted=true;lessonPreload.src='lesson.mp4';lessonPreload.hidden=true;document.body.appendChild(lessonPreload);lessonPreload.load();
