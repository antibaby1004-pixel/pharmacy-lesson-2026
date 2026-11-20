const steps=[{"title": "약물 소개", "file": 0, "duration": 31.1}, {"title": "암세포 증식의 핵심: 유전물질 복제", "file": 1, "duration": 10.6}, {"title": "원본 기전 영상 · 0:15–2:45", "id": "QA5ufAU1NSk", "start": 15, "end": 165}, {"title": "주의점과 부작용", "file": 3, "duration": 25.5}, {"title": "용량과 사용법", "file": 4, "duration": 28.3}, {"title": "분말제제: 재구성 후 농도를 확인하세요", "file": 5, "duration": 41.8}, {"title": "Take-home message", "file": 6, "duration": 33.0}];
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
function updateCaption(){const box=$('localCaption');box.hidden=isYT();if(isYT()){box.textContent='';return}const cue=(captions[steps[index].file]||[]).find(c=>local.currentTime>=c.start&&local.currentTime<c.end);box.textContent=cue?cue.text:''}
function update(){const s=steps[index];$('title').textContent=s.title;$('position').textContent=String(index+1).padStart(2,'0')+' / '+steps.length;$('ytNote').hidden=!isYT();$('ytNote').textContent='원본 기전 영상 0:15–2:45 · 한국어 자막 우선. 필요 시 ⚙ → 자막 → 자동 번역 → 한국어';if(isYT()){$('original').href='https://www.youtube.com/watch?v='+s.id+'&t='+Math.floor(s.start+pendingOffset)+'s'}sync()}
function error(t){revealScene();message(t);$('errorText').textContent=t;$('fallback').hidden=false;wantsPlay=false;sync()}
function playLocal(){local.playbackRate=slideRate;local.play().catch(()=>{revealScene();wantsPlay=false;sync();message('재생 버튼을 눌러 주세요.')})}
function playYT(){const s=steps[index],clip={videoId:s.id,startSeconds:s.start+pendingOffset,endSeconds:s.end};wantsPlay?yt.loadVideoById(clip):yt.cueVideoById(clip);yt.setPlaybackRate(1)}
let transitionId=0,transitionPending=false,transitionTimer,transitionWatchdog;
function revealScene(){clearTimeout(transitionWatchdog);transitionPending=false;$('transitionVeil').classList.remove('covered');}
function show(i,auto=true,offset=0){
 if(i<0||i>=steps.length)return;
 const token=++transitionId;transitionPending=true;clearTimeout(transitionTimer);clearTimeout(transitionWatchdog);
 local.pause();if(ytReady)yt.pauseVideo();wantsPlay=auto;
 $('transitionVeil').classList.add('covered');$('localCaption').textContent='';
 transitionTimer=setTimeout(()=>{
  if(token!==transitionId)return;
  index=i;pendingOffset=offset;ended=false;$('fallback').hidden=true;
  local.hidden=isYT();$('youtubeWrap').hidden=!isYT();update();message('구간이 끝나면 자동으로 이어집니다.');
  transitionWatchdog=setTimeout(()=>{if(token===transitionId&&transitionPending){revealScene();message('연결을 기다리는 중입니다. 필요하면 재생 버튼을 눌러 주세요.');}},8000);
  if(isYT()){if(ytReady)playYT();else loadYT();}else{local.src='part'+steps[i].file+'.mp4';local.load();}
 },450);
}
function advance(){if(transitionPending)return;if(index<steps.length-1)show(index+1,true);else{ended=true;wantsPlay=false;if(currentYT())yt.pauseVideo();else local.pause();message('교육이 끝났습니다.');sync()}}
function seek(t){const auto=wantsPlay;let i=0;while(i<steps.length-1&&t>=length(steps[i])){t-=length(steps[i]);i++}show(i,auto,Math.min(t,length(steps[i])-.05)*(steps[i].id?1:slideRate))}
function loadYT(){if(ytLoading)return;ytLoading=true;const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{ytLoading=false;error('YouTube를 불러오지 못했습니다.')};document.head.appendChild(s)}
window.onYouTubeIframeAPIReady=()=>{yt=new YT.Player('youtube',{width:'100%',height:'100%',playerVars:{playsinline:1,cc_load_policy:1,cc_lang_pref:'ko',hl:'ko',origin:location.origin},events:{onApiChange:smallYouTubeCaptions,onReady:()=>{ytReady=true;smallYouTubeCaptions();if(isYT())playYT()},onStateChange:e=>{if(!currentYT())return;if(e.data===0)advance();if(e.data===1){revealScene();wantsPlay=true;smallYouTubeCaptions();$('fallback').hidden=true}if(e.data===2&&!transitionPending)wantsPlay=false;if(e.data===5&&!wantsPlay)revealScene();sync()},onAutoplayBlocked:()=>{revealScene();wantsPlay=false;sync();message('영상의 재생 버튼을 눌러 주세요.')},onError:e=>error('YouTube 재생 오류 '+e.data)}})};
$('play').onclick=()=>{if(ended){show(0,true);return}wantsPlay=!wantsPlay;if(isYT()){if(ytReady)wantsPlay?yt.playVideo():yt.pauseVideo();else loadYT()}else wantsPlay?playLocal():local.pause();sync()};
$('timeline').addEventListener('input',()=>{dragging=true;$('time').textContent=format(Number($('timeline').value))+' / '+format(total())});
$('timeline').addEventListener('change',()=>{const t=Number($('timeline').value);dragging=false;seek(t)});
local.addEventListener('loadedmetadata',()=>{local.currentTime=pendingOffset;local.playbackRate=slideRate;if(wantsPlay&&!isYT())playLocal()});
local.addEventListener('playing',()=>{if(!isYT())revealScene()});
local.addEventListener('canplay',()=>{if(!isYT()&&!wantsPlay)revealScene()});
local.addEventListener('ended',()=>{if(!isYT())advance()});
local.addEventListener('error',()=>{if(!isYT())error('영상 파일을 읽지 못했습니다. 새로고침해 주세요.')});
$('speed').onchange=e=>{slideRate=Number(e.target.value);local.playbackRate=slideRate;sync()};
$('continue').onclick=advance;
$('fullscreen').onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.querySelector('.cinema').requestFullscreen()}catch{message('전체 화면을 지원하지 않습니다.')}};
setInterval(()=>{if(currentYT()&&yt.getPlayerState()===1&&yt.getCurrentTime()>=steps[index].end){advance()}sync()},200);
update();

// Initialize the external player before its scene to reduce connection delay.
loadYT();
