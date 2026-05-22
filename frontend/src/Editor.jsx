import { useState, useRef, useEffect } from "react";
import axios from "axios";

const FONTS = ["Arial","Helvetica","Verdana","Impact","Georgia","Times New Roman","Courier New","Trebuchet MS","Comic Sans MS","Tahoma","Palatino","Garamond","Bookman","Gill Sans","Century Gothic","Calibri","Cambria","Segoe UI","Futura","Optima","Baskerville","Copperplate","Rockwell","Didot","Bodoni MT","Arial Black","Arial Narrow","Brush Script MT","Papyrus","Harrington","Lucida Handwriting","Lucida Console","Monaco","MV Boli","Freestyle Script","Curlz MT","Jokerman","Algerian","Castellar","Engravers MT","Felix Titling","Goudy Stout","Haettenschweiler","Kunstler Script","Tempus Sans ITC"];
const ANIMS = [
  {id:"none",l:"None"},{id:"fade",l:"Fade"},{id:"cinematic",l:"Cinematic"},
  {id:"slideUp",l:"Slide Up"},{id:"slideDown",l:"Slide Down"},{id:"slideLeft",l:"Slide Left"},
  {id:"slideRight",l:"Slide Right"},{id:"bounce",l:"Bounce"},{id:"zoom",l:"Zoom"},
  {id:"pop",l:"Pop"},{id:"spin",l:"Spin"},{id:"typewriter",l:"Typewriter"},
  {id:"wave",l:"Wave"},{id:"glitch",l:"Glitch"},{id:"neon",l:"Neon"},
  {id:"shake",l:"Shake"},{id:"blur",l:"Blur"},{id:"gold",l:"Gold"},
  {id:"fire",l:"Fire"},{id:"ticker",l:"Ticker"},
];
const TRANS = [{id:"none",l:"None"},{id:"fade",l:"Fade"},{id:"flash",l:"Flash"},{id:"wipe",l:"Wipe"},{id:"zoom",l:"Zoom"},{id:"slide",l:"Slide"}];
const STICKERS = ["❤️","🔥","✨","💫","⭐","🌟","💥","🎉","🎊","🎬","🎵","🎶","💍","👑","🌹","🦋","🌊","🌙","☀️","🌈","💎","🏆","🎯","💪","🙌","👏","🤍","🖤","💜","💙","😍","🥰","😎","🤩","🥳"];
const COLORS = ["#ffffff","#000000","#ff4444","#ff8800","#ffdd00","#44ff44","#00aaff","#aa44ff","#ff44aa","#ffd700","#ffb6c1","#00ffff","#ff6584","#6c63ff","#888888","#ff0000","#00ff00","#0000ff","#ff00ff","#ffff00","#ff8c00","#8b0000","#006400","#00008b"];
const PRESETS = [
  {l:"Normal",f:{brightness:100,contrast:100,saturation:100,blur:0,hue:0}},
  {l:"Cinematic",f:{brightness:90,contrast:130,saturation:80,blur:0,hue:0}},
  {l:"Warm",f:{brightness:105,contrast:110,saturation:130,blur:0,hue:15}},
  {l:"Cold",f:{brightness:95,contrast:115,saturation:70,blur:0,hue:-15}},
  {l:"B&W",f:{brightness:100,contrast:120,saturation:0,blur:0,hue:0}},
  {l:"Drama",f:{brightness:85,contrast:150,saturation:60,blur:0,hue:0}},
  {l:"Vintage",f:{brightness:95,contrast:105,saturation:80,blur:0,hue:20}},
  {l:"Neon",f:{brightness:110,contrast:140,saturation:200,blur:0,hue:0}},
];

const IC = {
  text:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  sticker: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  fx:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  filter:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  back:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polyline points="15 18 9 12 15 6"/></svg>,
  export:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:16,height:16}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  play:    <svg viewBox="0 0 24 24" fill="currentColor" style={{width:20,height:20}}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:20,height:20}}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  skipB:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>,
  skipF:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
  rwnd:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>,
  ffwd:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>,
  trash:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  clip:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:14,height:14}}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>,
  scissors:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:20,height:20}}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  zoom:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:12,height:12}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
};

function easeOut(p){return 1-Math.pow(1-p,3);}
function easeElastic(p){return p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;}

function drawTextWithStyle(ctx,item,text,fs){
  ctx.font=`${item.bold?"bold":""} ${item.italic?"italic":""} ${fs}px "${item.fontFamily}"`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  if(item.background){
    const m=ctx.measureText(text),prev=ctx.globalAlpha;
    ctx.globalAlpha*=0.8; ctx.fillStyle=item.bgColor||"rgba(0,0,0,0.6)";
    ctx.beginPath(); ctx.roundRect(-m.width/2-14,-fs*0.7-5,m.width+28,fs*1.5+10,8); ctx.fill();
    ctx.globalAlpha=prev;
  }
  if(item.outline){ctx.strokeStyle=item.outlineColor||"#000";ctx.lineWidth=item.outlineWidth||3;ctx.lineJoin="round";ctx.strokeText(text,0,0);}
  ctx.shadowColor="rgba(0,0,0,0.9)";ctx.shadowBlur=10;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;
  ctx.fillStyle=item.color;ctx.fillText(text,0,0);ctx.shadowColor="transparent";
}

function renderText(ctx,item,t,W,H){
  if(!item.text||t<item.startTime||t>item.endTime)return;
  const progress=(t-item.startTime)/Math.max(0.001,item.endTime-item.startTime);
  const p=Math.min(1,progress*5),eP=easeOut(p),eEl=easeElastic(p);
  const x=(item.x/100)*W,y=(item.y/100)*H,fs=item.fontSize*(H/400);
  ctx.save();
  ctx.font=`${item.bold?"bold":""} ${item.italic?"italic":""} ${fs}px "${item.fontFamily}"`;
  switch(item.animation){
    case"none":{ctx.translate(x,y);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"fade":{ctx.globalAlpha=eP;ctx.translate(x,y);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"cinematic":{ctx.globalAlpha=eP;ctx.translate(x,y);ctx.shadowColor="#ffd700";ctx.shadowBlur=25*eP;drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"slideUp":{ctx.globalAlpha=eP;ctx.translate(x,y+(1-eP)*80);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"slideDown":{ctx.globalAlpha=eP;ctx.translate(x,y-(1-eP)*80);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"slideLeft":{ctx.globalAlpha=eP;ctx.translate(x+(1-eP)*150,y);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"slideRight":{ctx.globalAlpha=eP;ctx.translate(x-(1-eP)*150,y);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"bounce":{ctx.globalAlpha=Math.min(1,p*3);ctx.translate(x,y+(1-eEl)*-60);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"zoom":{ctx.globalAlpha=eP;ctx.translate(x,y);ctx.scale(0.1+eEl*0.9,0.1+eEl*0.9);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"pop":{const sc=p<0.3?(p/0.3)*1.4:p<0.5?1.4-((p-0.3)/0.2)*0.4:1;ctx.globalAlpha=Math.min(1,p*5);ctx.translate(x,y);ctx.scale(sc,sc);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"spin":{ctx.globalAlpha=eP;ctx.translate(x,y);ctx.rotate((1-eP)*Math.PI*2);drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"typewriter":{const show=item.text.substring(0,Math.floor(eP*item.text.length));ctx.translate(x,y);drawTextWithStyle(ctx,item,show,fs);break;}
    case"wave":{ctx.globalAlpha=eP;const tw=ctx.measureText(item.text).width;let cx2=-tw/2;item.text.split("").forEach((ch,i)=>{const cw=ctx.measureText(ch).width,wy=Math.sin(t*4+i*0.6)*12*eP;ctx.save();ctx.translate(x+cx2+cw/2,y+wy);drawTextWithStyle(ctx,item,ch,fs);cx2+=cw;ctx.restore();});break;}
    case"glitch":{const gx=Math.sin(t*20)*6*(1-progress);ctx.save();ctx.translate(x+gx,y);ctx.fillStyle="#ff0000";ctx.globalAlpha=eP*0.6;ctx.font=`${item.bold?"bold":""} ${item.italic?"italic":""} ${fs}px "${item.fontFamily}"`;ctx.fillText(item.text,0,0);ctx.restore();ctx.save();ctx.translate(x-gx,y);ctx.fillStyle="#00ffff";ctx.globalAlpha=eP*0.6;ctx.font=`${item.bold?"bold":""} ${item.italic?"italic":""} ${fs}px "${item.fontFamily}"`;ctx.fillText(item.text,0,0);ctx.restore();ctx.save();ctx.translate(x,y);ctx.globalAlpha=eP;drawTextWithStyle(ctx,item,item.text,fs);ctx.restore();break;}
    case"neon":{ctx.globalAlpha=eP;ctx.translate(x,y);ctx.shadowColor="#ff00ff";ctx.shadowBlur=20;drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"shake":{const sh=progress<0.3?(Math.random()-0.5)*14:0;ctx.translate(x+sh,y+(progress<0.3?(Math.random()-0.5)*14:0));drawTextWithStyle(ctx,item,item.text,fs);break;}
    case"blur":{ctx.filter=`blur(${(1-eP)*15}px)`;ctx.globalAlpha=eP;ctx.translate(x,y);drawTextWithStyle(ctx,item,item.text,fs);ctx.filter="none";break;}
    case"gold":{ctx.globalAlpha=eP;ctx.translate(x,y);const grad=ctx.createLinearGradient(-100,-fs/2,100,fs/2);grad.addColorStop(0,"#ffd700");grad.addColorStop(0.5,"#fff8dc");grad.addColorStop(1,"#ffd700");ctx.shadowColor="#ffa500";ctx.shadowBlur=20;ctx.fillStyle=grad;ctx.font=`${item.bold?"bold":""} ${item.italic?"italic":""} ${fs}px "${item.fontFamily}"`;ctx.fillText(item.text,0,0);break;}
    case"fire":{ctx.globalAlpha=eP;ctx.translate(x,y);for(let i=3;i>0;i--){ctx.save();ctx.translate((Math.random()-0.5)*4,(Math.random()-0.5)*4-i*2);ctx.fillStyle=i===3?"#ff4400":i===2?"#ff8800":"#ffcc00";ctx.globalAlpha=eP*(0.3+i*0.2);ctx.font=`bold ${fs}px "${item.fontFamily}"`;ctx.fillText(item.text,0,0);ctx.restore();}ctx.fillStyle="#fff";ctx.globalAlpha=eP;ctx.font=`bold ${fs}px "${item.fontFamily}"`;ctx.fillText(item.text,0,0);break;}
    case"ticker":{ctx.save();ctx.beginPath();ctx.rect(0,y-fs,W,fs*2);ctx.clip();const speed=60,tx2=W-(t-item.startTime)*speed%(W+ctx.measureText(item.text).width+100);ctx.translate(tx2,y);ctx.globalAlpha=1;drawTextWithStyle(ctx,item,item.text,fs);ctx.restore();break;}
    default:{ctx.translate(x,y);drawTextWithStyle(ctx,item,item.text,fs);break;}
  }
  ctx.restore();
}

function drawTransition(ctx,type,progress,W,H){
  ctx.save();
  switch(type){
    case"fade":ctx.fillStyle=`rgba(0,0,0,${Math.sin(progress*Math.PI)})`;ctx.fillRect(0,0,W,H);break;
    case"flash":if(progress<0.5){ctx.fillStyle=`rgba(255,255,255,${progress*2})`;ctx.fillRect(0,0,W,H);}break;
    case"wipe":ctx.fillStyle="#000";ctx.fillRect(0,0,W*progress,H);break;
    case"slide":ctx.fillStyle="#000";ctx.fillRect(W*(1-progress),0,W,H);break;
    case"zoom":ctx.globalAlpha=Math.sin(progress*Math.PI)*0.8;ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);break;
  }
  ctx.restore();
}

function TLItem({item,duration,onUpdate,onSelect,isSelected,pps}){
  const drag=useRef(null);
  const md=(e,type)=>{
    e.stopPropagation();onSelect(item.id);
    drag.current={type,startX:e.clientX,startTime:item.startTime,endTime:item.endTime};
    const mv=(e)=>{
      if(!drag.current)return;
      const dt=(e.clientX-drag.current.startX)/pps,d=drag.current.endTime-drag.current.startTime;
      if(type==="move"){const s=Math.max(0,Math.min(duration-d,drag.current.startTime+dt));onUpdate(item.id,{startTime:s,endTime:s+d});}
      else if(type==="left")onUpdate(item.id,{startTime:Math.max(0,Math.min(item.endTime-0.3,drag.current.startTime+dt))});
      else onUpdate(item.id,{endTime:Math.min(duration,Math.max(item.startTime+0.3,drag.current.endTime+dt))});
    };
    const up=()=>{drag.current=null;window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};
    window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);
  };
  const colors={text:{bg:"#1a1040",border:"#7c6aff",active:"#7c6aff"},sticker:{bg:"#1a0a20",border:"#a855f7",active:"#c084fc"},transition:{bg:"#0a1a20",border:"#06b6d4",active:"#22d3ee"}};
  const c=colors[item.type]||colors.text;
  return(
    <div style={{position:"absolute",left:item.startTime*pps,width:Math.max(20,(item.endTime-item.startTime)*pps),height:22,backgroundColor:isSelected?c.active+"22":c.bg,borderRadius:5,cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",userSelect:"none",border:`1px solid ${isSelected?c.active:c.border+"44"}`,overflow:"hidden",boxSizing:"border-box"}} onMouseDown={(e)=>md(e,"move")}>
      <div style={{position:"absolute",left:0,width:5,height:"100%",cursor:"ew-resize"}} onMouseDown={(e)=>md(e,"left")}/>
      <span style={{fontSize:9,color:isSelected?"#fff":"#666",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",padding:"0 6px"}}>{item.type==="sticker"?item.emoji:item.type==="transition"?item.transition:(item.text||"Text")}</span>
      <div style={{position:"absolute",right:0,width:5,height:"100%",cursor:"ew-resize"}} onMouseDown={(e)=>md(e,"right")}/>
    </div>
  );
}

function ClipBlock({clip,isSelected,onClick,pps}){
  const w=Math.max(50,(clip.endTime-clip.startTime)*pps);
  const fx=[clip.motion,clip.color,clip.texture].filter(e=>e&&e!=="none").join("+");
  return(
    <div onClick={onClick} style={{position:"absolute",left:clip.startTime*pps,width:w,height:56,background:isSelected?"rgba(124,106,255,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${isSelected?"rgba(124,106,255,0.5)":"rgba(255,255,255,0.06)"}`,borderRadius:8,cursor:"pointer",overflow:"hidden",boxSizing:"border-box",padding:"6px 8px",display:"flex",flexDirection:"column",gap:2}}>
      {isSelected&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#7c6aff,transparent)"}}/>}
      <div style={{fontSize:9,color:isSelected?"#a78bfa":"#3a3a5a",fontWeight:600,letterSpacing:"0.04em"}}>CLIP {clip.index+1}</div>
      {fx&&<div style={{fontSize:8,color:"#4a7a6a",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>⚡ {fx}</div>}
      {clip.transition&&clip.transition!=="none"&&<div style={{fontSize:8,color:"#4a6a8a"}}>↔ {clip.transition}</div>}
      <div style={{fontSize:8,color:"#222"}}>{(clip.endTime-clip.startTime).toFixed(1)}s</div>
    </div>
  );
}

export default function Editor({reelUrl,sessionId,onClose,textOverlays=[]}){
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const tlRef=useRef(null);
  const rafRef=useRef(null);

  const [duration,setDuration]=useState(30);
  const [currentTime,setCurrentTime]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [items,setItems]=useState([]);
  const [clips,setClips]=useState([]);
  const [selected,setSelected]=useState(null);
  const [selClipIdx,setSelClipIdx]=useState(null);
  const [panel,setPanel]=useState(null);
  const [pps,setPps]=useState(80);
  const [filters,setFilters]=useState({brightness:100,contrast:100,saturation:100,blur:0,hue:0});
  const [exporting,setExporting]=useState(false);
  const [expPct,setExpPct]=useState(0);
  const [showStickers,setShowStickers]=useState(false);
  const [showFX,setShowFX]=useState(false);
  const [activeTool,setActiveTool]=useState(null);

  const sel=items.find(i=>i.id===selected);
  const selClip=clips.find(c=>c.index===selClipIdx);
  const fmt=(s)=>`${Math.floor(s/60)}:${(s%60).toFixed(1).padStart(4,"0")}`;

  useEffect(()=>{
  const v=videoRef.current;if(!v)return;
  
 

  v.onloadedmetadata=()=>{
    const dur=v.duration;
    setDuration(dur);
   
  };

  // الفيديو ممكن يكون محمّل بالفعل
  if(v.readyState>=1 && v.duration>0){
    setDuration(v.duration);
   
  }

  v.ontimeupdate=()=>setCurrentTime(v.currentTime);
  v.onended=()=>setPlaying(false);

  if(sessionId){
    axios.get(`https://reel-maker-9pg6.onrender.com/clip-info/${sessionId}`)
      .then(res=>{if(res.data.clips?.length>0)setClips(res.data.clips);})
      .catch(()=>{});
  }
},[sessionId]);


  useEffect(()=>{
    const draw=()=>{
      const v=videoRef.current,c=canvasRef.current;if(!v||!c)return;
      const ctx=c.getContext("2d"),W=c.width,H=c.height,t=v.currentTime;
      const currentClip=clips.find(c=>t>=c.startTime&&t<=c.endTime);
      const clipMotion=currentClip?.motion||"none",clipColor=currentClip?.color||"none",clipTexture=currentClip?.texture||"none";
      let filterStr=`brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) hue-rotate(${filters.hue}deg)`;
      if(clipColor==="bw")filterStr+=" grayscale(1)";
      else if(clipColor==="warm")filterStr+=" sepia(0.4) saturate(1.4)";
      else if(clipColor==="cold")filterStr+=" hue-rotate(190deg) saturate(0.8)";
      else if(clipColor==="color_shift")filterStr+=` hue-rotate(${(t*40)%360}deg)`;
      if(clipTexture==="contrast")filterStr+=" contrast(1.5)";
      else if(clipTexture==="vignette")filterStr+=" brightness(0.8)";
      if(clipMotion==="zoom_in"&&currentClip){const cp=(t-currentClip.startTime)/Math.max(0.001,currentClip.endTime-currentClip.startTime),zoom=1+0.08*cp;ctx.filter=filterStr;ctx.drawImage(v,(W*(1-zoom))/2,(H*(1-zoom))/2,W*zoom,H*zoom);}
      else if(clipMotion==="zoom_out"&&currentClip){const cp=(t-currentClip.startTime)/Math.max(0.001,currentClip.endTime-currentClip.startTime),zoom=1.08-0.08*cp;ctx.filter=filterStr;ctx.drawImage(v,(W*(1-zoom))/2,(H*(1-zoom))/2,W*zoom,H*zoom);}
      else{ctx.filter=filterStr;ctx.drawImage(v,0,0,W,H);}
      ctx.filter="none";
      items.filter(i=>i.type==="transition").forEach(item=>{if(t<item.startTime||t>item.endTime)return;drawTransition(ctx,item.transition,(t-item.startTime)/Math.max(0.001,item.endTime-item.startTime),W,H);});
      items.filter(i=>i.type!=="transition").forEach(item=>{if(t<item.startTime||t>item.endTime)return;if(item.type==="sticker"){ctx.save();ctx.font=`${item.fontSize*(H/300)}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(item.emoji,(item.x/100)*W,(item.y/100)*H);ctx.restore();}else renderText(ctx,item,t,W,H);});
      if(sel&&t>=sel.startTime&&t<=sel.endTime&&sel.type!=="transition"){ctx.save();ctx.strokeStyle="rgba(124,106,255,0.6)";ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.strokeRect((sel.x/100)*W-70,(sel.y/100)*H-25,140,50);ctx.setLineDash([]);ctx.restore();}
      rafRef.current=requestAnimationFrame(draw);
    };
    rafRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(rafRef.current);
  },[items,sel,filters,clips]);

  useEffect(()=>{
    const onKey=(e)=>{
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      const v=videoRef.current;
      if(e.code==="Space"){e.preventDefault();togglePlay();}
      if(e.code==="ArrowLeft"&&!e.altKey){e.preventDefault();if(v)v.currentTime=Math.max(0,v.currentTime-(e.shiftKey?5:0.5));}
      if(e.code==="ArrowRight"&&!e.altKey){e.preventDefault();if(v)v.currentTime=Math.min(duration,v.currentTime+(e.shiftKey?5:0.5));}
      if((e.code==="Delete"||e.code==="Backspace")&&selected){setItems(prev=>prev.filter(i=>i.id!==selected));setSelected(null);setPanel(null);}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[selected,duration,playing]);

  const togglePlay=()=>{const v=videoRef.current;if(!v)return;playing?v.pause():v.play();setPlaying(!playing);};
  const seekTo=(t)=>{const v=videoRef.current;if(!v)return;v.currentTime=Math.max(0,Math.min(duration,t));};
  const updateItem=(id,fields)=>setItems(prev=>prev.map(i=>i.id===id?{...i,...fields}:i));
  const updateClip=(idx,fields)=>setClips(prev=>prev.map(c=>c.index===idx?{...c,...fields}:c));

  const addText=()=>{
    const item={id:Date.now(),type:"text",text:"Your Text",x:50,y:80,fontSize:36,color:"#ffffff",fontFamily:"Arial",bold:false,italic:false,background:false,bgColor:"rgba(0,0,0,0.5)",outline:false,outlineColor:"#000",outlineWidth:3,animation:"fade",startTime:Math.max(0,currentTime),endTime:Math.min(duration,currentTime+3)};
    setItems(prev=>[...prev,item]);setSelected(item.id);setSelClipIdx(null);setPanel("text");setActiveTool("text");setShowStickers(false);setShowFX(false);
  };
  const addSticker=(emoji)=>{
    const item={id:Date.now(),type:"sticker",emoji,x:50,y:50,fontSize:40,startTime:Math.max(0,currentTime),endTime:Math.min(duration,currentTime+3)};
    setItems(prev=>[...prev,item]);setSelected(item.id);setSelClipIdx(null);setPanel("sticker");setShowStickers(false);
  };
  const addTransition=(type)=>{
    const item={id:Date.now(),type:"transition",transition:type,startTime:Math.max(0,currentTime-0.3),endTime:Math.min(duration,currentTime+0.3)};
    setItems(prev=>[...prev,item]);setSelected(item.id);setSelClipIdx(null);setPanel("transition");setShowFX(false);
  };

  const handleCanvasMD=(e)=>{
    const c=canvasRef.current,rect=c.getBoundingClientRect();
    const px=((e.clientX-rect.left)/rect.width)*100,py=((e.clientY-rect.top)/rect.height)*100;
    const t=videoRef.current?.currentTime||0;
    let found=null;
    [...items].reverse().forEach(item=>{if(item.type==="transition"||t<item.startTime||t>item.endTime)return;if(Math.abs(item.x-px)<15&&Math.abs(item.y-py)<12)found=item.id;});
    setSelected(found);
    if(found){
      const onMove=(mv)=>{const x=Math.max(2,Math.min(98,((mv.clientX-rect.left)/rect.width)*100));const y=Math.max(2,Math.min(98,((mv.clientY-rect.top)/rect.height)*100));updateItem(found,{x,y});};
      const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
      window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
    }
  };

  const handleExport=async()=>{
    setExporting(true);setExpPct(0);
    const v=videoRef.current,c=document.createElement("canvas");
    c.width=1080;c.height=1920;
    const ctx=c.getContext("2d"),stream=c.captureStream(30);
    const recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp9"});
    const chunks=[];
    recorder.ondataavailable=(e)=>chunks.push(e.data);
    recorder.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="reel_edited.webm";a.click();setExporting(false);};
    v.currentTime=0;await new Promise(r=>setTimeout(r,300));
    v.play();recorder.start();
    const draw=()=>{
      if(v.ended||v.currentTime>=duration){v.pause();recorder.stop();return;}
      setExpPct(Math.round((v.currentTime/duration)*100));
      ctx.filter=`brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg)`;
      ctx.drawImage(v,0,0,c.width,c.height);ctx.filter="none";
      items.forEach(item=>{const t=v.currentTime;if(t<item.startTime||t>item.endTime)return;if(item.type==="sticker"){ctx.font=`${item.fontSize*3}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(item.emoji,(item.x/100)*c.width,(item.y/100)*c.height);}else if(item.type==="text")renderText(ctx,item,t,c.width,c.height);else if(item.type==="transition")drawTransition(ctx,item.transition,(t-item.startTime)/Math.max(0.001,item.endTime-item.startTime),c.width,c.height);});
      requestAnimationFrame(draw);
    };
    draw();
  };

  const renderPanel=()=>{
    if(panel==="clip"&&selClip)return(
      <div style={P.wrap}>
        <div style={P.head}><div style={P.headIcon}>{IC.clip}</div><span style={P.headTitle}>Clip {selClip.index+1}</span></div>
        <div style={P.sec}><span style={P.lbl}>Transition</span>
          <div style={P.chips}>{TRANS.map(t=><div key={t.id} onClick={()=>updateClip(selClip.index,{transition:t.id})} style={{...P.chip,background:selClip.transition===t.id?"rgba(124,106,255,0.25)":"rgba(255,255,255,0.03)",borderColor:selClip.transition===t.id?"#7c6aff":"rgba(255,255,255,0.07)",color:selClip.transition===t.id?"#c4baff":"#444"}}>{t.l}</div>)}</div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Duration: {(selClip.endTime-selClip.startTime).toFixed(2)}s</span></div>
        <div style={P.sec}><span style={P.lbl}>{fmt(selClip.startTime)} → {fmt(selClip.endTime)}</span></div>
      </div>
    );

    if(panel==="text"&&sel?.type==="text")return(
      <div style={P.wrap}>
        <div style={P.head}>
          <div style={P.headIcon}>{IC.text}</div>
          <span style={P.headTitle}>Text Layer</span>
          <button style={P.del} onClick={()=>{setItems(prev=>prev.filter(i=>i.id!==selected));setSelected(null);setPanel(null);}}>{IC.trash}</button>
        </div>
        <textarea style={P.ta} value={sel.text} onChange={e=>updateItem(selected,{text:e.target.value})} rows={2} placeholder="Type your text..."/>
        <div style={P.sec}><span style={P.lbl}>Font Family</span>
          <div style={{...P.chips,maxHeight:72,overflowY:"auto"}}>{FONTS.slice(0,20).map(f=><div key={f} onClick={()=>updateItem(selected,{fontFamily:f})} style={{...P.chip,fontFamily:f,background:sel.fontFamily===f?"rgba(124,106,255,0.25)":"rgba(255,255,255,0.03)",borderColor:sel.fontFamily===f?"#7c6aff":"rgba(255,255,255,0.07)",color:sel.fontFamily===f?"#c4baff":"#444"}}>{f}</div>)}</div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Size: {sel.fontSize}px</span><input type="range" min={10} max={200} value={sel.fontSize} onChange={e=>updateItem(selected,{fontSize:+e.target.value})} style={P.sl}/></div>
        <div style={P.sec}><span style={P.lbl}>Color</span>
          <div style={P.colorRow}>
            {COLORS.map(c=><div key={c} onClick={()=>updateItem(selected,{color:c})} style={{...P.dot,backgroundColor:c,outline:sel.color===c?"2px solid #7c6aff":"none",outlineOffset:2}}/>)}
            <input type="color" value={sel.color} onChange={e=>updateItem(selected,{color:e.target.value})} style={P.cp}/>
          </div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Style</span>
          <div style={P.row}>{[{k:"bold",l:"B"},{k:"italic",l:"I"},{k:"background",l:"BG"},{k:"outline",l:"OUT"}].map(({k,l})=><div key={k} onClick={()=>updateItem(selected,{[k]:!sel[k]})} style={{...P.styleBtn,background:sel[k]?"rgba(124,106,255,0.3)":"rgba(255,255,255,0.04)",borderColor:sel[k]?"#7c6aff":"rgba(255,255,255,0.08)",color:sel[k]?"#c4baff":"#444"}}>{l}</div>)}</div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Animation</span>
          <div style={P.animGrid}>{ANIMS.map(a=><div key={a.id} onClick={()=>updateItem(selected,{animation:a.id})} style={{...P.animChip,background:sel.animation===a.id?"rgba(124,106,255,0.25)":"rgba(255,255,255,0.03)",borderColor:sel.animation===a.id?"#7c6aff":"rgba(255,255,255,0.07)",color:sel.animation===a.id?"#c4baff":"#3a3a5a"}}>{a.l}</div>)}</div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Position</span>
          <div style={P.posGrid}>{[{l:"↖",x:15,y:12},{l:"↑",x:50,y:12},{l:"↗",x:85,y:12},{l:"←",x:15,y:50},{l:"·",x:50,y:50},{l:"→",x:85,y:50},{l:"↙",x:15,y:85},{l:"↓",x:50,y:85},{l:"↘",x:85,y:85}].map(pos=><div key={pos.l} onClick={()=>updateItem(selected,{x:pos.x,y:pos.y})} style={P.posBtn}>{pos.l}</div>)}</div>
        </div>
        <div style={P.sec}><span style={P.lbl}>Timing</span>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><span style={P.lbl}>In: {sel.startTime.toFixed(1)}s</span><input type="range" min={0} max={duration} step={0.1} value={sel.startTime} onChange={e=>updateItem(selected,{startTime:Math.min(+e.target.value,sel.endTime-0.3)})} style={P.sl}/></div>
            <div style={{flex:1}}><span style={P.lbl}>Out: {sel.endTime.toFixed(1)}s</span><input type="range" min={0} max={duration} step={0.1} value={sel.endTime} onChange={e=>updateItem(selected,{endTime:Math.max(+e.target.value,sel.startTime+0.3)})} style={P.sl}/></div>
          </div>
        </div>
      </div>
    );

    if(panel==="sticker"&&sel?.type==="sticker")return(
      <div style={P.wrap}>
        <div style={P.head}>
          <div style={P.headIcon}>{IC.sticker}</div>
          <span style={P.headTitle}>Sticker</span>
          <button style={P.del} onClick={()=>{setItems(prev=>prev.filter(i=>i.id!==selected));setSelected(null);setPanel(null);}}>{IC.trash}</button>
        </div>
        <div style={P.sec}><span style={P.lbl}>Size: {sel.fontSize}px</span><input type="range" min={20} max={150} value={sel.fontSize} onChange={e=>updateItem(selected,{fontSize:+e.target.value})} style={P.sl}/></div>
        <div style={P.sec}><div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}><span style={P.lbl}>X: {Math.round(sel.x)}%</span><input type="range" min={2} max={98} value={sel.x} onChange={e=>updateItem(selected,{x:+e.target.value})} style={P.sl}/></div>
          <div style={{flex:1}}><span style={P.lbl}>Y: {Math.round(sel.y)}%</span><input type="range" min={2} max={98} value={sel.y} onChange={e=>updateItem(selected,{y:+e.target.value})} style={P.sl}/></div>
        </div></div>
        <div style={P.sec}><div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}><span style={P.lbl}>In: {sel.startTime.toFixed(1)}s</span><input type="range" min={0} max={duration} step={0.1} value={sel.startTime} onChange={e=>updateItem(selected,{startTime:Math.min(+e.target.value,sel.endTime-0.3)})} style={P.sl}/></div>
          <div style={{flex:1}}><span style={P.lbl}>Out: {sel.endTime.toFixed(1)}s</span><input type="range" min={0} max={duration} step={0.1} value={sel.endTime} onChange={e=>updateItem(selected,{endTime:Math.max(+e.target.value,sel.startTime+0.3)})} style={P.sl}/></div>
        </div></div>
      </div>
    );

    if(panel==="transition"&&sel?.type==="transition")return(
      <div style={P.wrap}>
        <div style={P.head}>
          <div style={P.headIcon}>{IC.fx}</div>
          <span style={P.headTitle}>Transition</span>
          <button style={P.del} onClick={()=>{setItems(prev=>prev.filter(i=>i.id!==selected));setSelected(null);setPanel(null);}}>{IC.trash}</button>
        </div>
        <div style={P.sec}><span style={P.lbl}>Type</span>
          <div style={P.animGrid}>{TRANS.map(t=><div key={t.id} onClick={()=>updateItem(selected,{transition:t.id})} style={{...P.animChip,background:sel.transition===t.id?"rgba(6,182,212,0.2)":"rgba(255,255,255,0.03)",borderColor:sel.transition===t.id?"#06b6d4":"rgba(255,255,255,0.07)",color:sel.transition===t.id?"#67e8f9":"#3a3a5a"}}>{t.l}</div>)}</div>
        </div>
      </div>
    );

    if(panel==="filter")return(
      <div style={P.wrap}>
        <div style={P.head}><div style={P.headIcon}>{IC.filter}</div><span style={P.headTitle}>Color Grade</span></div>
        <div style={P.sec}><span style={P.lbl}>Presets</span>
          <div style={P.chips}>{PRESETS.map(pr=><div key={pr.l} onClick={()=>setFilters(pr.f)} style={{...P.chip,background:"rgba(255,255,255,0.03)",borderColor:"rgba(255,255,255,0.07)",color:"#444"}}>{pr.l}</div>)}</div>
        </div>
        {[{k:"brightness",l:"Brightness",min:50,max:150,u:"%"},{k:"contrast",l:"Contrast",min:50,max:200,u:"%"},{k:"saturation",l:"Saturation",min:0,max:200,u:"%"},{k:"blur",l:"Blur",min:0,max:10,u:"px"},{k:"hue",l:"Hue",min:-180,max:180,u:"°"}].map(f=>(
          <div key={f.k} style={P.sec}><span style={P.lbl}>{f.l}: {filters[f.k]}{f.u}</span><input type="range" min={f.min} max={f.max} value={filters[f.k]} onChange={e=>setFilters(prev=>({...prev,[f.k]:+e.target.value}))} style={P.sl}/></div>
        ))}
        <button style={P.resetBtn} onClick={()=>setFilters({brightness:100,contrast:100,saturation:100,blur:0,hue:0})}>Reset All</button>
      </div>
    );

    return(
      <div style={P.empty}>
        <div style={P.emptyIcon}>{IC.scissors}</div>
        <p style={P.emptyTitle}>Studio</p>
        <p style={P.emptySub}>Select a clip or add text overlays to begin editing</p>
        <div style={P.shortcuts}>
          {[["Space","Play / Pause"],["← →","Seek"],["Del","Remove"]].map(([k,v])=>(
            <div key={k} style={P.shortcut}><span style={P.shortKey}>{k}</span><span style={P.shortVal}>{v}</span></div>
          ))}
        </div>
      </div>
    );
  };

  return(
    <div style={s.root}>
      <div style={s.amb1}/><div style={s.amb2}/>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onClose}>{IC.back}<span>Back</span></button>
        <div style={s.headerCenter}>
          <div style={s.headerDot}/>
          <span style={s.headerTitle}>REEL STUDIO</span>
          <div style={s.headerDot}/>
        </div>
        <button style={exporting?s.exportBtnDis:s.exportBtn} onClick={handleExport} disabled={exporting}>
          {IC.export}<span>{exporting?`${expPct}%`:"Export HD"}</span>
        </button>
      </div>
      <div style={s.body}>
        <div style={s.leftCol}>
          {[
            {id:"text",   icon:IC.text,    label:"Text",    action:addText},
            {id:"sticker",icon:IC.sticker, label:"Sticker", action:()=>{setShowStickers(!showStickers);setShowFX(false);setActiveTool("sticker");}},
            {id:"fx",     icon:IC.fx,      label:"FX",      action:()=>{setShowFX(!showFX);setShowStickers(false);setActiveTool("fx");}},
            {id:"filter", icon:IC.filter,  label:"Grade",   action:()=>{setPanel(panel==="filter"?null:"filter");setActiveTool("filter");setShowStickers(false);setShowFX(false);}},
          ].map(tool=>(
            <div key={tool.id} style={{position:"relative"}}>
              <button style={{...s.toolBtn,background:activeTool===tool.id?"rgba(124,106,255,0.15)":"transparent",borderColor:activeTool===tool.id?"rgba(124,106,255,0.3)":"transparent"}} onClick={tool.action}>
                <div style={{color:activeTool===tool.id?"#a78bfa":"#2a2a4a"}}>{tool.icon}</div>
                <span style={{fontSize:9,color:activeTool===tool.id?"#7c6aff":"#1e1e2e",letterSpacing:"0.06em",fontWeight:600}}>{tool.label}</span>
              </button>
            </div>
          ))}
          {showStickers&&(
            <div style={s.popup}>
              <div style={s.popupGrid}>{STICKERS.map(e=><div key={e} onClick={()=>addSticker(e)} style={s.stickerBtn}>{e}</div>)}</div>
            </div>
          )}
          {showFX&&(
            <div style={s.popup}>
              <p style={s.popupLabel}>Add at {fmt(currentTime)}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {TRANS.map(t=>(<div key={t.id} onClick={()=>addTransition(t.id)} style={s.fxBtn}>{t.l}</div>))}
              </div>
            </div>
          )}
        </div>
        <div style={s.centerCol}>
          <div style={s.previewArea}>
            <video ref={videoRef} src={reelUrl} style={{display:"none"}}/>
            <div style={s.canvasFrame}>
              <canvas ref={canvasRef} width={405} height={720} style={s.canvas} onMouseDown={handleCanvasMD}/>
            </div>
          </div>
          <div style={s.controls}>
            <div style={s.progWrap} onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width*duration);}}>
              <div style={{...s.progFill,width:`${duration>0?(currentTime/duration)*100:0}%`}}/>
              <div style={{...s.progHead,left:`${duration>0?(currentTime/duration)*100:0}%`}}/>
            </div>
            <div style={s.timeRow}>
              <span style={s.timeCur}>{fmt(currentTime)}</span>
              <span style={s.timeSep}>/</span>
              <span style={s.timeTot}>{fmt(duration)}</span>
            </div>
            <div style={s.btnRow}>
              <button style={s.ctrlBtn} onClick={()=>seekTo(0)}>{IC.skipB}</button>
              <button style={s.ctrlBtn} onClick={()=>seekTo(currentTime-5)}>{IC.rwnd}</button>
              <button style={s.playBtn} onClick={togglePlay}>{playing?IC.pause:IC.play}</button>
              <button style={s.ctrlBtn} onClick={()=>seekTo(currentTime+5)}>{IC.ffwd}</button>
              <button style={s.ctrlBtn} onClick={()=>seekTo(duration)}>{IC.skipF}</button>
            </div>
          </div>
        </div>
        <div style={s.rightCol}>{renderPanel()}</div>
      </div>
      <div style={s.timeline}>
        <div style={s.tlTop}>
          <span style={s.tlLabel}>TIMELINE</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button style={s.zBtn} onClick={()=>setPps(p=>Math.max(20,p-20))}>{IC.zoom} −</button>
            <span style={s.zVal}>{pps}</span>
            <button style={s.zBtn} onClick={()=>setPps(p=>Math.min(300,p+20))}>+</button>
          </div>
        </div>
        <div style={s.tlScroll}>
          <div style={{paddingLeft:40}}>
            <div style={{position:"relative",height:14,width:Math.ceil(duration+1)*pps}}>
              {Array.from({length:Math.ceil(duration)+1},(_,i)=>(
                <div key={i} style={{position:"absolute",left:i*pps,display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:1,height:i%5===0?7:3,backgroundColor:i%5===0?"rgba(124,106,255,0.4)":"rgba(255,255,255,0.06)"}}/>
                  {i%5===0&&<span style={{fontSize:7,color:"rgba(124,106,255,0.5)",fontWeight:600}}>{i}s</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={s.tlRow}>
            <div style={s.tlTrackLabel}>{IC.clip}</div>
            <div ref={tlRef} style={{position:"relative",height:56,width:Math.max(duration*pps,500),cursor:"pointer"}} onClick={(e)=>{const r=tlRef.current.getBoundingClientRect();seekTo((e.clientX-r.left)/pps);}}>
              <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.01)",borderRadius:6,border:"1px solid rgba(255,255,255,0.03)"}}/>
              {clips.length>0
                ?clips.map(clip=>(<ClipBlock key={clip.index} clip={clip} isSelected={selClipIdx===clip.index} pps={pps} onClick={(e)=>{e.stopPropagation();setSelClipIdx(clip.index);setSelected(null);setPanel("clip");seekTo(clip.startTime);setActiveTool(null);}}/>))
                :<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:"rgba(255,255,255,0.05)",letterSpacing:"0.1em"}}>NO CLIPS — GENERATE A REEL FIRST</span></div>
              }
              <div style={{position:"absolute",left:currentTime*pps,width:1,top:-6,height:"calc(100% + 12px)",background:"linear-gradient(180deg,transparent,#7c6aff,#7c6aff,transparent)",zIndex:20,pointerEvents:"none"}}/>
            </div>
          </div>
          {items.filter(i=>i.type==="text").length>0&&(
            <div style={s.tlRow}>
              <div style={s.tlTrackLabel}>{IC.text}</div>
              <div style={{position:"relative",height:22,width:Math.max(duration*pps,500)}}>
                {items.filter(i=>i.type==="text").map(item=>(<TLItem key={item.id} item={item} duration={duration} onUpdate={updateItem} onSelect={(id)=>{setSelected(id);setSelClipIdx(null);setPanel("text");}} isSelected={selected===item.id} pps={pps}/>))}
                <div style={{position:"absolute",left:currentTime*pps,width:1,top:-2,height:"calc(100% + 4px)",background:"rgba(124,106,255,0.4)",zIndex:20,pointerEvents:"none"}}/>
              </div>
            </div>
          )}
          {items.filter(i=>i.type==="sticker").length>0&&(
            <div style={s.tlRow}>
              <div style={s.tlTrackLabel}>{IC.sticker}</div>
              <div style={{position:"relative",height:22,width:Math.max(duration*pps,500)}}>
                {items.filter(i=>i.type==="sticker").map(item=>(<TLItem key={item.id} item={item} duration={duration} onUpdate={updateItem} onSelect={(id)=>{setSelected(id);setSelClipIdx(null);setPanel("sticker");}} isSelected={selected===item.id} pps={pps}/>))}
                <div style={{position:"absolute",left:currentTime*pps,width:1,top:-2,height:"calc(100% + 4px)",background:"rgba(124,106,255,0.4)",zIndex:20,pointerEvents:"none"}}/>
              </div>
            </div>
          )}
          {items.filter(i=>i.type==="transition").length>0&&(
            <div style={s.tlRow}>
              <div style={s.tlTrackLabel}>{IC.fx}</div>
              <div style={{position:"relative",height:22,width:Math.max(duration*pps,500)}}>
                {items.filter(i=>i.type==="transition").map(item=>(<TLItem key={item.id} item={item} duration={duration} onUpdate={updateItem} onSelect={(id)=>{setSelected(id);setSelClipIdx(null);setPanel("transition");}} isSelected={selected===item.id} pps={pps}/>))}
                <div style={{position:"absolute",left:currentTime*pps,width:1,top:-2,height:"calc(100% + 4px)",background:"rgba(124,106,255,0.4)",zIndex:20,pointerEvents:"none"}}/>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Outfit:wght@700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:0.2}50%{opacity:0.5}}
        input[type=range]{-webkit-appearance:none;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#7c6aff;border-radius:50%;cursor:pointer;box-shadow:0 0 8px rgba(124,106,255,0.5)}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(124,106,255,0.2);border-radius:2px}
      `}</style>
    </div>
  );
}

const s={
  root:{position:"fixed",inset:0,backgroundColor:"#06060f",zIndex:1000,display:"flex",flexDirection:"column",fontFamily:"'Space Grotesk',sans-serif",color:"#fff",userSelect:"none",overflow:"hidden"},
  amb1:{position:"fixed",top:-300,left:-200,width:600,height:600,background:"radial-gradient(circle,rgba(124,106,255,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,animation:"pulse 5s ease-in-out infinite"},
  amb2:{position:"fixed",bottom:-200,right:-100,width:500,height:500,background:"radial-gradient(circle,rgba(0,255,136,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,animation:"pulse 7s ease-in-out infinite reverse"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:48,background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0,position:"relative",zIndex:10},
  backBtn:{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",color:"#444",cursor:"pointer",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:500,letterSpacing:"0.04em"},
  headerCenter:{display:"flex",alignItems:"center",gap:8},
  headerDot:{width:4,height:4,borderRadius:"50%",background:"rgba(124,106,255,0.4)"},
  headerTitle:{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.2em",fontFamily:"'Outfit',sans-serif"},
  exportBtn:{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",background:"linear-gradient(135deg,rgba(124,106,255,0.3),rgba(124,106,255,0.15))",border:"1px solid rgba(124,106,255,0.4)",color:"#c4baff",cursor:"pointer",borderRadius:8,fontSize:12,fontWeight:600,letterSpacing:"0.04em",boxShadow:"0 0 20px rgba(124,106,255,0.15)"},
  exportBtnDis:{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",color:"#333",cursor:"not-allowed",borderRadius:8,fontSize:12,fontWeight:600},
  body:{display:"flex",flex:1,overflow:"hidden",minHeight:0,position:"relative",zIndex:1},
  leftCol:{width:64,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(255,255,255,0.015)",borderRight:"1px solid rgba(255,255,255,0.04)",padding:"12px 4px",gap:2,position:"relative"},
  toolBtn:{width:56,padding:"10px 4px",background:"transparent",border:"1px solid transparent",borderRadius:10,color:"#aaa",fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s"},
  popup:{position:"absolute",left:"calc(100% + 8px)",top:0,background:"rgba(10,10,20,0.95)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,zIndex:200,minWidth:220,maxWidth:260,backdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"},
  popupLabel:{color:"rgba(124,106,255,0.5)",fontSize:10,margin:"0 0 8px",letterSpacing:"0.08em",fontWeight:600},
  popupGrid:{display:"flex",flexWrap:"wrap",gap:6},
  stickerBtn:{fontSize:22,cursor:"pointer",padding:6,borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)"},
  fxBtn:{padding:"5px 12px",background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:6,cursor:"pointer",fontSize:11,color:"#67e8f9",fontWeight:500},
  centerCol:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",background:"#000",minHeight:0,overflow:"hidden",position:"relative"},
  previewArea:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%",minHeight:0,overflow:"hidden"},
  canvasFrame:{position:"relative",display:"inline-flex"},
  canvas:{height:"100%",width:"auto",maxWidth:"100%",aspectRatio:"9/16",objectFit:"contain",cursor:"crosshair",display:"block",maxHeight:"calc(100vh - 280px)"},
  controls:{flexShrink:0,width:"100%",padding:"10px 24px 12px",background:"rgba(255,255,255,0.015)",borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",flexDirection:"column",alignItems:"center",gap:8},
  progWrap:{width:"100%",height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,cursor:"pointer",position:"relative"},
  progFill:{height:"100%",background:"linear-gradient(90deg,#7c6aff,#a78bfa)",borderRadius:2,position:"absolute",top:0,left:0,transition:"width 0.1s"},
  progHead:{position:"absolute",top:"50%",transform:"translate(-50%,-50%)",width:11,height:11,background:"#fff",borderRadius:"50%",border:"2px solid #7c6aff",pointerEvents:"none",boxShadow:"0 0 8px rgba(124,106,255,0.5)"},
  timeRow:{display:"flex",alignItems:"center",gap:6},
  timeCur:{fontSize:14,fontWeight:700,color:"#fff",fontVariantNumeric:"tabular-nums"},
  timeSep:{color:"rgba(255,255,255,0.15)",fontSize:13},
  timeTot:{fontSize:13,color:"rgba(255,255,255,0.2)",fontVariantNumeric:"tabular-nums"},
  btnRow:{display:"flex",alignItems:"center",gap:8},
  ctrlBtn:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",color:"#333",cursor:"pointer",width:34,height:32,borderRadius:8,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"},
  playBtn:{background:"#fff",color:"#000",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(255,255,255,0.15)"},
  rightCol:{width:260,flexShrink:0,background:"rgba(255,255,255,0.015)",borderLeft:"1px solid rgba(255,255,255,0.04)",overflowY:"auto"},
  timeline:{height:160,borderTop:"1px solid rgba(255,255,255,0.04)",background:"rgba(255,255,255,0.01)",flexShrink:0,display:"flex",flexDirection:"column",position:"relative",zIndex:1},
  tlTop:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"},
  tlLabel:{fontSize:9,color:"rgba(255,255,255,0.1)",fontWeight:700,letterSpacing:"0.15em"},
  zBtn:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",color:"#333",cursor:"pointer",padding:"2px 8px",borderRadius:5,fontSize:11,display:"flex",alignItems:"center",gap:4},
  zVal:{fontSize:9,color:"rgba(255,255,255,0.15)",minWidth:24,textAlign:"center"},
  tlScroll:{flex:1,overflowX:"auto",overflowY:"auto",padding:"4px 8px"},
  tlRow:{display:"flex",alignItems:"center",marginBottom:4},
  tlTrackLabel:{width:36,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.08)",flexShrink:0},
};

const P={
  wrap:{padding:16},
  head:{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.04)"},
  headIcon:{width:28,height:28,background:"rgba(124,106,255,0.1)",border:"1px solid rgba(124,106,255,0.15)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"#7c6aff",flexShrink:0},
  headTitle:{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.5)",flex:1,letterSpacing:"0.04em"},
  del:{background:"rgba(255,68,102,0.08)",border:"1px solid rgba(255,68,102,0.15)",color:"#ff4466",cursor:"pointer",padding:"5px 7px",borderRadius:6,display:"flex",alignItems:"center"},
  sec:{marginBottom:14},
  lbl:{color:"rgba(255,255,255,0.2)",fontSize:10,display:"block",marginBottom:5,letterSpacing:"0.06em",fontWeight:500},
  ta:{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#bbb",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",marginBottom:10},
  chips:{display:"flex",flexWrap:"wrap",gap:4,maxHeight:80,overflowY:"auto"},
  chip:{padding:"3px 9px",borderRadius:6,border:"1px solid",cursor:"pointer",fontSize:10,color:"#444",fontWeight:500,whiteSpace:"nowrap",transition:"all 0.15s"},
  sl:{width:"100%",cursor:"pointer"},
  colorRow:{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"},
  dot:{width:16,height:16,borderRadius:"50%",cursor:"pointer",flexShrink:0},
  cp:{width:16,height:16,borderRadius:"50%",border:"none",cursor:"pointer",padding:0,background:"none"},
  row:{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"},
  styleBtn:{padding:"4px 10px",borderRadius:6,border:"1px solid",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s"},
  animGrid:{display:"flex",flexWrap:"wrap",gap:4},
  animChip:{padding:"4px 8px",borderRadius:6,border:"1px solid",cursor:"pointer",color:"#fff",fontSize:10,fontWeight:500,transition:"all 0.15s"},
  posGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3},
  posBtn:{padding:"6px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.2)",textAlign:"center"},
  resetBtn:{width:"100%",padding:"8px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"rgba(255,255,255,0.2)",fontSize:11,cursor:"pointer",letterSpacing:"0.06em"},
  empty:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:24,textAlign:"center",minHeight:300},
  emptyIcon:{color:"rgba(124,106,255,0.2)",marginBottom:16},
  emptyTitle:{fontSize:15,fontWeight:600,color:"rgba(255,255,255,0.15)",margin:"0 0 6px",letterSpacing:"0.06em"},
  emptySub:{fontSize:11,color:"rgba(255,255,255,0.08)",margin:"0 0 24px",lineHeight:1.6},
  shortcuts:{width:"100%",display:"flex",flexDirection:"column",gap:6},
  shortcut:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6},
  shortKey:{fontSize:10,color:"rgba(124,106,255,0.4)",fontWeight:700,fontFamily:"monospace"},
  shortVal:{fontSize:10,color:"rgba(255,255,255,0.1)"},
};
