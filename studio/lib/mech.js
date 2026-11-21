// mechanism figure parts (fig coords 1056x640)
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,parent,html){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(html)e.innerHTML=html;if(parent)parent.appendChild(e);return e}
const RECEPTOR=`<path d="M0 60 V0 M0 0 L-26 -32 M0 0 L26 -32" stroke="#3E5872" stroke-width="12" stroke-linecap="round" fill="none"/>`;
const LDL=`<circle r="34" fill="#d9a441"/><g fill="#FFFFFF" opacity=".75"><circle cx="-12" cy="-10" r="4"/><circle cx="10" cy="8" r="4"/><circle cx="14" cy="-14" r="3"/><circle cx="-6" cy="14" r="3"/></g>`;
const PCSK=`<g fill="#c98b93" stroke="#a3606b" stroke-width="2"><circle cx="0" cy="0" r="16"/><circle cx="20" cy="-14" r="14"/><circle cx="18" cy="14" r="13"/></g>`;
const AB=`<path d="M0 44 V6 M0 6 L-22 -22 M0 6 L22 -22" stroke="#007F86" stroke-width="11" stroke-linecap="round" fill="none"/>`;
function baseFig(svg){
 el('text',{x:36,y:60,'font-size':28,'font-weight':600,fill:'#5A6B7B','letter-spacing':2},svg,'혈액 · BLOOD');
 el('rect',{x:0,y:232,width:1056,height:420,fill:'#F1F4F7'},svg);
 const m=el('g',{},svg);let s='';
 for(let x=12;x<1056;x+=22){s+=`<circle cx="${x}" cy="240" r="6" fill="#a9bcb9"/><circle cx="${x}" cy="262" r="6" fill="#a9bcb9"/><line x1="${x}" y1="246" x2="${x}" y2="256" stroke="#c9d6d4" stroke-width="2"/>`}
 m.innerHTML=s;
 el('text',{x:36,y:324,'font-size':28,'font-weight':600,fill:'#5A6B7B','letter-spacing':2},svg,'간세포 · HEPATOCYTE');
}
function grp(svg,inner,id){return el('g',{id},svg,inner)}
function setT(g,x,y,s=1,o=1,r=0){g.setAttribute('transform',`translate(${x} ${y}) rotate(${r}) scale(${s})`);g.style.opacity=o}
function lbl(svg,x,y,txt,color='#243341',size=24,anchor='start',w=600){return el('text',{x,y,'font-size':Math.round(size*1.4),'font-weight':w,fill:color,'text-anchor':anchor},svg,txt)}
function pathDraw(p,prog){const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L*(1-prog)}
