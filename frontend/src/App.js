import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Editor from "./Editor";


const TEMPLATES = [
  { id: "auto",      name: "Auto",      desc: "AI decides everything" },
  { id: "romantic",  name: "Romantic",  desc: "Soft, warm & dreamy" },
  { id: "cinematic", name: "Cinematic", desc: "Dark, dramatic & bold" },
  { id: "energetic", name: "Energetic", desc: "Fast, intense & powerful" },
];

const ALL_EFFECTS = [
  { id: "zoom_in",     label: "Zoom In" },
  { id: "zoom_out",    label: "Zoom Out" },
  { id: "tilt_left",   label: "Tilt Left" },
  { id: "tilt_right",  label: "Tilt Right" },
  { id: "spin",        label: "Spin" },
  { id: "bw",          label: "B&W" },
  { id: "warm",        label: "Warm" },
  { id: "cold",        label: "Cold" },
  { id: "green",       label: "Green" },
  { id: "color_shift", label: "Color Shift" },
  { id: "flash",       label: "Flash" },
  { id: "black_flash", label: "Dark Flash" },
  { id: "glitch",      label: "Glitch" },
  { id: "rgb_split",   label: "RGB Split" },
  { id: "fade_in",     label: "Fade In" },
  { id: "vignette",    label: "Vignette" },
  { id: "contrast",    label: "Contrast" },
  { id: "sharpen",     label: "Sharpen" },
  { id: "film_grain",  label: "Film Grain" },
  { id: "letterbox",   label: "Letterbox" },
  { id: "vhs",         label: "VHS" },
];

const IC = {
  film:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></svg>,
  music:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  palette:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><path d="M12 2C6.48 2 2 6.48 const [audioTrimStart, setAudioTrimStart] = useState(0);2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71a1 1 0 0 1 .71-1.71H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>,
  sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/></svg>,
  text:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{width:52,height:52}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" style={{width:20,height:20}}><polyline points="20 6 9 17 4 12"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  video:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:16,height:16}}><rect x="2" y="2" width="20" height="20" rx="3"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:20,height:20}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  loop:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:24,height:24}}><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  auto:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:32,height:32}}><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  romantic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:32,height:32}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  cinematic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:32,height:32}}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>,
  energetic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:32,height:32}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

const STEPS = [
  { id:1, label:"Videos",  icon: IC.film },
  { id:2, label:"Song",    icon: IC.music },
  { id:3, label:"Style",   icon: IC.palette },
  { id:4, label:"Effects", icon: IC.sparkles },
  { id:6, label:"Create",  icon: IC.loop },
];

function Dots({ step }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:40}}>
      {STEPS.map((st) => (
        <div key={st.id} style={{
          width: step===st.id ? 24 : 8,
          height: 8, borderRadius: 4,
          background: step > st.id ? "#7c6aff" : step===st.id ? "linear-gradient(90deg,#7c6aff,#a78bfa)" : "rgba(255,255,255,0.08)",
          transition: "all 0.4s ease",
        }}/>
      ))}
    </div>
  );
}
function AudioTrimmer({audio, duration, trimStart, trimEnd, onTrimChange, onRemove}){
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const barRef = useRef(null);

  useEffect(()=>{
    if(!audio) return;
    const url = URL.createObjectURL(audio);
    if(audioRef.current){
      audioRef.current.src = url;
      audioRef.current.currentTime = trimStart;
    }
    return ()=> URL.revokeObjectURL(url);
  },[audio]);

  useEffect(()=>{
    const a = audioRef.current;
    if(!a) return;
    const update = ()=>{
      setCurrentTime(a.currentTime);
      if(a.currentTime >= trimEnd){ a.pause(); a.currentTime=trimStart; setPlaying(false); }
    };
    a.addEventListener("timeupdate", update);
    return ()=> a.removeEventListener("timeupdate", update);
  },[trimStart, trimEnd]);

  const togglePlay = ()=>{
    const a = audioRef.current;
    if(!a) return;
    if(playing){ a.pause(); setPlaying(false); }
    else { a.currentTime = trimStart; a.play(); setPlaying(true); }
  };

  const fmt = s => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;

  const handleBarClick = (e, type)=>{
    e.stopPropagation();
    const bar = barRef.current;
    if(!bar) return;
    const onMove = mv=>{
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (mv.clientX-rect.left)/rect.width));
      const t = pct * duration;
      if(type==="start") onTrimChange(Math.min(t, trimEnd-1), trimEnd);
      else onTrimChange(trimStart, Math.max(t, trimStart+1));
    };
    const onUp = ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startPct = (trimStart/duration)*100;
  const endPct = (trimEnd/duration)*100;
  const curPct = (currentTime/duration)*100;

  return(
    <div style={{width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:16,marginBottom:12}}>
      <audio ref={audioRef}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{color:"#888",fontSize:13,fontWeight:500}}>{audio.name}</span>
        <button onClick={onRemove} style={{background:"none",border:"none",color:"#ff4466",cursor:"pointer",fontSize:12}}>✕ Remove</button>
      </div>

      {/* Waveform bar */}
      <div ref={barRef} style={{position:"relative",height:48,background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:12,overflow:"visible",cursor:"pointer"}}
        onClick={e=>{
          const rect=barRef.current.getBoundingClientRect();
          const pct=(e.clientX-rect.left)/rect.width;
          const t=pct*duration;
          if(audioRef.current) audioRef.current.currentTime=t;
        }}>

        {/* Selected region */}
        <div style={{position:"absolute",top:0,bottom:0,left:`${startPct}%`,width:`${endPct-startPct}%`,background:"rgba(124,106,255,0.2)",borderRadius:4}}/>

        {/* Fake waveform */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",gap:1,padding:"0 2px"}}>
          {Array.from({length:80},(_,i)=>{
            const h = 20+Math.sin(i*0.8)*15+Math.sin(i*0.3)*10+Math.random()*8;
            const inRange = (i/80)*100>=startPct && (i/80)*100<=endPct;
            return <div key={i} style={{flex:1,height:`${h}%`,background:inRange?"#7c6aff":"rgba(255,255,255,0.1)",borderRadius:1,transition:"background 0.2s"}}/>;
          })}
        </div>

        {/* Playhead */}
        <div style={{position:"absolute",top:-4,bottom:-4,left:`${curPct}%`,width:2,background:"#fff",borderRadius:1,pointerEvents:"none"}}/>

        {/* Start handle */}
        <div onMouseDown={e=>handleBarClick(e,"start")} style={{position:"absolute",top:-6,bottom:-6,left:`${startPct}%`,width:12,background:"#7c6aff",borderRadius:3,cursor:"ew-resize",transform:"translateX(-50%)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:2,height:16,background:"rgba(255,255,255,0.8)",borderRadius:1}}/>
        </div>

        {/* End handle */}
        <div onMouseDown={e=>handleBarClick(e,"end")} style={{position:"absolute",top:-6,bottom:-6,left:`${endPct}%`,width:12,background:"#7c6aff",borderRadius:3,cursor:"ew-resize",transform:"translateX(-50%)",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:2,height:16,background:"rgba(255,255,255,0.8)",borderRadius:1}}/>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#555",fontSize:12}}>{fmt(trimStart)}</span>
        <button onClick={togglePlay} style={{width:40,height:40,borderRadius:"50%",background:"rgba(124,106,255,0.2)",border:"1px solid rgba(124,106,255,0.3)",color:"#a78bfa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
          {playing ? "⏸" : "▶"}
        </button>
        <span style={{color:"#555",fontSize:12}}>{fmt(trimEnd)}</span>
      </div>
      <p style={{textAlign:"center",color:"#555",fontSize:11,margin:"8px 0 0"}}>
        Selected: {fmt(trimEnd-trimStart)} · Drag handles to trim
      </p>
    </div>
  );
}
export default function App() {
  const [step, setStep] = useState(1);
  const [videos, setVideos] = useState([]);
  const [audio, setAudio] = useState(null);
  const [loop, setLoop] = useState(false);
  const [template, setTemplate] = useState("auto");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reelUrl, setReelUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [audioTrimStart, setAudioTrimStart] = useState(0);
  const [audioTrimEnd, setAudioTrimEnd] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // Text overlays
  const [wantText, setWantText] = useState(null);
  const [textOverlays, setTextOverlays] = useState([]);
  const [newText, setNewText] = useState("");
  const [newTextTime, setNewTextTime] = useState("start");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [] },
    onDrop: (files) => setVideos(prev => [...prev, ...files]),
  });

  const toggleEffect = (id) =>
    setSelectedEffects(prev => prev.includes(id) ? prev.filter(e=>e!==id) : [...prev,id]);

  const addTextOverlay = () => {
    if(!newText.trim()) return;
    setTextOverlays(prev=>[...prev,{text:newText.trim(),time:newTextTime}]);
    setNewText("");
  };

  const handleGenerate = async () => {
    if (!videos.length || !audio) { setError("Please upload videos and a song!"); return; }
    setLoading(true); setError(null); setReelUrl(null); setSessionId(null);
    setProgress("Analyzing your song..."); setProgressPct(10);
    const fd = new FormData();
    videos.forEach(v => fd.append("videos", v));
    fd.append("audio", audio); fd.append("loop", loop.toString());
    fd.append("audio_start", audioTrimStart.toString());
    fd.append("audio_end", (audioTrimEnd ?? audioDuration).toString());
    fd.append("template", template); fd.append("effects", JSON.stringify(selectedEffects));
    fd.append("text_overlays", JSON.stringify(textOverlays));
    try {
      setTimeout(()=>{setProgress("Analyzing clips...");setProgressPct(30);},3000);
      setTimeout(()=>{setProgress("Matching to beats...");setProgressPct(55);},6000);
      setTimeout(()=>{setProgress("Applying effects...");setProgressPct(75);},10000);
      setTimeout(()=>{setProgress("Exporting reel...");setProgressPct(90);},20000);
      const res = await axios.post("http://127.0.0.1:8000/generate", fd, {responseType:"blob",timeout:600000});
      const sid = res.headers["x-session-id"] || Object.entries(res.headers).find(([k])=>k.toLowerCase()==="x-session-id")?.[1];
      setSessionId(sid);
      setReelUrl(URL.createObjectURL(res.data));
      setProgress(""); setProgressPct(100);
    } catch(e) { setError("Something went wrong. Try again!"); setProgress(""); setProgressPct(0); }
    finally { setLoading(false); }
  };
console.log("textOverlays before editor:", textOverlays);

  if (showEditor && reelUrl) return (
    <Editor
      reelUrl={reelUrl}
      sessionId={sessionId}
      textOverlays={textOverlays}
      onClose={()=>setShowEditor(false)}
    />
  );

  return (
    <div style={s.page}>
      <div style={s.amb1}/><div style={s.amb2}/>
      <div style={s.screen}>

        {/* ── STEP 1: Videos ── */}
        {step === 1 && (
          <div style={s.fullStep}>
            <Dots step={step}/>
            <div style={s.stepIconBig}>{IC.film}</div>
            <h1 style={s.stepTitle}>Upload your videos</h1>
            <p style={s.stepSub}>Add as many clips as you want — we'll sync them to the beat</p>
            <div {...getRootProps()} style={{...s.bigDrop, borderColor: isDragActive?"#7c6aff":"rgba(255,255,255,0.08)", background: isDragActive?"rgba(124,106,255,0.06)":"rgba(255,255,255,0.02)"}}>
              <input {...getInputProps()}/>
              <div style={s.dropInner}>
                <div style={{color: isDragActive?"#7c6aff":"#2a2a4a",marginBottom:12}}>{IC.upload}</div>
                <p style={s.dropTxt}>{isDragActive?"Drop here!":"Drag & drop or click to select"}</p>
                <p style={s.dropHint}>MP4, MOV, AVI supported</p>
              </div>
            </div>
            {videos.length > 0 && (
              <div style={s.fileList}>
                {videos.map((v,i)=>(
                  <div key={i} style={s.fileRow}>
                    <div style={{color:"#7c6aff"}}>{IC.video}</div>
                    <span style={s.fileName}>{v.name}</span>
                    <button style={s.removeBtn} onClick={()=>setVideos(videos.filter((_,j)=>j!==i))}>{IC.close}</button>
                  </div>
                ))}
              </div>
            )}
            {videos.length > 0 && (
              <button style={s.mainBtn} onClick={()=>setStep(2)}><span>Continue</span>{IC.arrow}</button>
            )}
          </div>
        )}

        {/* ── STEP 2: Song ── */}
        {step === 2 && (
  <div style={s.fullStep}>
    <Dots step={step}/>
    <div style={s.stepIconBig}>{IC.music}</div>
    <h1 style={s.stepTitle}>Choose your song</h1>
    <p style={s.stepSub}>Pick a section to use in your reel</p>

    {!audio ? (
      <label style={{cursor:"pointer",display:"block",width:"100%"}}>
        <input type="file" accept="audio/*" style={{display:"none"}}
          onChange={e=>{
            const f=e.target.files[0];
            if(!f)return;
            setAudio(f);
            const url=URL.createObjectURL(f);
            const a=new Audio(url);
            a.onloadedmetadata=()=>{
              setAudioDuration(a.duration);
              setAudioTrimEnd(a.duration);
            };
          }}/>
        <div style={{...s.bigDrop,borderColor:"rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",cursor:"pointer"}}>
          <div style={s.dropInner}>
            <div style={{color:"#2a2a4a",marginBottom:12}}>{IC.music}</div>
            <p style={s.dropTxt}>Tap to choose audio</p>
            <p style={s.dropHint}>MP3, WAV, AAC supported</p>
          </div>
        </div>
      </label>
    ) : (
      <AudioTrimmer
        audio={audio}
        duration={audioDuration}
        trimStart={audioTrimStart}
        trimEnd={audioTrimEnd ?? audioDuration}
        onTrimChange={(s,e)=>{setAudioTrimStart(s);setAudioTrimEnd(e);}}
        onRemove={()=>{setAudio(null);setAudioTrimStart(0);setAudioTrimEnd(null);setAudioDuration(0);}}
      />
    )}

    <div style={s.twoBtn}>
      <button style={s.backBtn} onClick={()=>setStep(1)}>Back</button>
      {audio && <button style={s.mainBtn} onClick={()=>setStep(3)}><span>Continue</span>{IC.arrow}</button>}
    </div>
  </div>
)}
        {/* ── STEP 3: Template ── */}
        {step === 3 && (
          <div style={s.fullStep}>
            <Dots step={step}/>
            <div style={s.stepIconBig}>{IC.palette}</div>
            <h1 style={s.stepTitle}>Pick a style</h1>
            <p style={s.stepSub}>Choose the mood and pacing for your reel</p>
            <div style={s.templateGrid}>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>setTemplate(t.id)} style={{...s.templateCard, borderColor: template===t.id?"#7c6aff":"rgba(255,255,255,0.06)", background: template===t.id?"rgba(124,106,255,0.12)":"rgba(255,255,255,0.02)"}}>
                  {template===t.id && <div style={s.tGlow}/>}
                  <div style={{color: template===t.id?"#7c6aff":"#333", marginBottom:8}}>{IC[t.id]}</div>
                  <span style={{fontSize:15,fontWeight:700,color: template===t.id?"#fff":"#666",marginBottom:4}}>{t.name}</span>
                  <span style={{fontSize:12,color:"#333",textAlign:"center"}}>{t.desc}</span>
                </div>
              ))}
            </div>
            <div style={s.twoBtn}>
              <button style={s.backBtn} onClick={()=>setStep(2)}>Back</button>
              <button style={s.mainBtn} onClick={()=>setStep(4)}><span>Continue</span>{IC.arrow}</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Effects ── */}
        {step === 4 && (
          <div style={s.fullStep}>
            <Dots step={step}/>
            <div style={s.stepIconBig}>{IC.sparkles}</div>
            <h1 style={s.stepTitle}>Select effects</h1>
            <p style={s.stepSub}>Mix and match visual effects for your reel</p>
            <div style={s.fxHeader}>
              <span style={{color:"#444",fontSize:13}}>{selectedEffects.length===0?"All active (random)":`${selectedEffects.length} selected`}</span>
              <div style={{display:"flex",gap:8}}>
                <button style={s.smBtn} onClick={()=>setSelectedEffects(ALL_EFFECTS.map(e=>e.id))}>Select all</button>
                <button style={s.smBtn} onClick={()=>setSelectedEffects([])}>Clear</button>
              </div>
            </div>
            <div style={s.fxGrid}>
              {ALL_EFFECTS.map(e=>(
                <div key={e.id} onClick={()=>toggleEffect(e.id)} style={{...s.fxChip, background: selectedEffects.includes(e.id)?"rgba(124,106,255,0.18)":"rgba(255,255,255,0.03)", borderColor: selectedEffects.includes(e.id)?"#7c6aff":"rgba(255,255,255,0.06)", color: selectedEffects.includes(e.id)?"#c4baff":"#3a3a5a"}}>
                  {e.label}
                </div>
              ))}
            </div>
            <div style={s.loopRow}>
              <div style={{color:"#444"}}>{IC.loop}</div>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:14,color:"#888",fontWeight:500}}>Loop Clips</p>
                <p style={{margin:0,fontSize:11,color:"#2a2a4a"}}>{loop?"Repeat clips to fill duration":"Use each clip once"}</p>
              </div>
              <div onClick={()=>setLoop(!loop)} style={{...s.toggle, background: loop?"linear-gradient(135deg,#7c6aff,#a78bfa)":"#111", border: loop?"1px solid #7c6aff":"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{...s.toggleDot, left: loop?27:4}}/>
              </div>
            </div>
            <div style={s.twoBtn}>
              <button style={s.backBtn} onClick={()=>setStep(3)}>Back</button>
              <button style={s.mainBtn} onClick={()=>setStep(6)}><span>Continue</span>{IC.arrow}</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Text ── */}
        {step === 5 && (
          <div style={s.fullStep}>
            <Dots step={step}/>
            <div style={s.stepIconBig}>{IC.text}</div>
            <h1 style={s.stepTitle}>Add text overlay?</h1>
            <p style={s.stepSub}>Add names, dates or a message that appears on your reel</p>

            {wantText === null && (
              <>
                <div style={{display:"flex",gap:10,width:"100%",marginBottom:16}}>
                  <button style={{...s.mainBtn,background:"rgba(124,106,255,0.15)",border:"1px solid rgba(124,106,255,0.3)",color:"#a78bfa",boxShadow:"none"}} onClick={()=>setWantText(true)}>
                    Yes, add text
                  </button>
                  <button style={s.backBtn} onClick={()=>setStep(6)}>
                    Skip
                  </button>
                </div>
                <button style={s.backBtnSm} onClick={()=>setStep(4)}>← Back</button>
              </>
            )}

            {wantText === true && (
              <div style={{width:"100%"}}>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <input
                    value={newText}
                    onChange={e=>setNewText(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") addTextOverlay(); }}
                    placeholder="e.g. John & Jane • 2025"
                    style={{flex:1,padding:"13px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}
                  />
                  <select value={newTextTime} onChange={e=>setNewTextTime(e.target.value)}
                    style={{padding:"0 12px",background:"rgba(10,10,20,0.9)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#888",fontSize:12,outline:"none",cursor:"pointer"}}>
                    <option value="start">Start</option>
                    <option value="middle">Middle</option>
                    <option value="end">End</option>
                  </select>
                  <button onClick={addTextOverlay} style={{padding:"0 18px",background:"rgba(124,106,255,0.2)",border:"1px solid rgba(124,106,255,0.3)",borderRadius:12,color:"#a78bfa",fontSize:13,cursor:"pointer",fontWeight:600}}>
                    Add
                  </button>
                </div>

                {textOverlays.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,marginBottom:6,textAlign:"left"}}>
                    <span style={{flex:1,color:"#ccc",fontSize:13}}>{t.text}</span>
                    <span style={{color:"rgba(124,106,255,0.6)",fontSize:11,padding:"2px 8px",background:"rgba(124,106,255,0.08)",borderRadius:6}}>{t.time}</span>
                    <button onClick={()=>setTextOverlays(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ff4466",cursor:"pointer",fontSize:14,padding:4}}>✕</button>
                  </div>
                ))}

                <div style={s.twoBtn}>
                  <button style={s.backBtn} onClick={()=>setWantText(null)}>Back</button>
                  <button style={s.mainBtn} onClick={()=>setStep(6)}><span>Continue</span>{IC.arrow}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 6: Generate ── */}
        {step === 6 && (
          <div style={s.fullStep}>
            <Dots step={step}/>
            <div style={s.stepIconBig}>{IC.film}</div>
            <h1 style={s.stepTitle}>Ready to create</h1>
            <p style={s.stepSub}>
              {videos.length} video{videos.length>1?"s":""} · {audio?.name} · {template} style
              {selectedEffects.length>0?` · ${selectedEffects.length} effects`:" · all effects"}
              {textOverlays.length>0?` · ${textOverlays.length} text overlay${textOverlays.length>1?"s":""}` : ""}
            </p>

            {!loading && !reelUrl && (
              <button style={s.generateBtn} onClick={handleGenerate}>
                <div style={{color:"rgba(255,255,255,0.8)",marginRight:12}}>{IC.film}</div>
                <span>Generate Reel</span>
              </button>
            )}

            {loading && (
              <div style={s.loadingBox}>
                <div style={s.spinnerBig}/>
                <p style={s.loadingTxt}>{progress||"Generating..."}</p>
                <div style={s.progWrap}>
                  <div style={{...s.progBar,width:`${progressPct}%`}}/>
                </div>
              </div>
            )}

            {error && <p style={s.errorTxt}>{error}</p>}

            {reelUrl && (
              <div style={s.result}>
                <div style={s.resultTop}/>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 10px #00ff88"}}/>
                  <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff"}}>Your Reel is Ready</h2>
                </div>
                <video src={reelUrl} controls style={s.video}/>
                <div style={s.resBtns}>
                  <button style={s.editBtn} onClick={()=>setShowEditor(true)}>{IC.edit}<span>Edit in Studio</span></button>
                  <a href={reelUrl} download="reel.mp4" style={s.dlBtn}>{IC.download}<span>Download</span></a>
                </div>
              </div>
            )}

            {!reelUrl && !loading && (
              <button style={s.backBtnSm} onClick={()=>setStep(5)}>← Back</button>
            )}
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap');
        *{box-sizing:border-box}body{margin:0;background:#06060f}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a14}::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.25}50%{opacity:0.6}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

const s = {
  page:{backgroundColor:"#06060f",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",position:"relative",overflow:"hidden"},
  amb1:{position:"fixed",top:-300,left:-200,width:700,height:700,background:"radial-gradient(circle,rgba(124,106,255,0.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,animation:"pulse 5s ease-in-out infinite"},
  amb2:{position:"fixed",bottom:-200,right:-100,width:600,height:600,background:"radial-gradient(circle,rgba(0,255,136,0.05) 0%,transparent 70%)",pointerEvents:"none",zIndex:0,animation:"pulse 7s ease-in-out infinite reverse"},
  screen:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px",position:"relative",zIndex:1},
  fullStep:{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",animation:"fadeUp 0.35s ease"},
  stepIconBig:{width:72,height:72,background:"linear-gradient(135deg,rgba(124,106,255,0.15),rgba(124,106,255,0.05))",border:"1px solid rgba(124,106,255,0.2)",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",color:"#7c6aff",marginBottom:24,boxShadow:"0 0 40px rgba(124,106,255,0.1)"},
  stepTitle:{margin:0,fontSize:32,fontWeight:800,fontFamily:"'Outfit',sans-serif",letterSpacing:"0.01em",background:"linear-gradient(135deg,#fff 40%,#9d8fff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:12},
  stepSub:{color:"#3a3a5a",fontSize:15,margin:"0 0 36px",lineHeight:1.6,maxWidth:380},
  bigDrop:{width:"100%",border:"1px dashed",borderRadius:20,padding:"44px 24px",cursor:"pointer",transition:"all 0.2s",marginBottom:16},
  dropInner:{display:"flex",flexDirection:"column",alignItems:"center"},
  dropTxt:{color:"#555",margin:"0 0 6px",fontSize:15},
  dropHint:{color:"#252535",margin:0,fontSize:13},
  fileList:{width:"100%",display:"flex",flexDirection:"column",gap:8,marginBottom:16},
  fileRow:{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,textAlign:"left"},
  fileName:{color:"#666",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:13},
  removeBtn:{background:"none",border:"none",color:"#ff4466",cursor:"pointer",padding:4,display:"flex",alignItems:"center"},
  mainBtn:{display:"flex",alignItems:"center",gap:10,justifyContent:"center",padding:"15px 32px",background:"linear-gradient(135deg,#7c6aff,#5b4fd4)",color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 0 30px rgba(124,106,255,0.3)",flex:1},
  backBtn:{padding:"15px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",color:"#444",borderRadius:14,fontSize:15,fontWeight:500,cursor:"pointer"},
  backBtnSm:{marginTop:16,padding:"10px 20px",background:"none",border:"none",color:"#333",fontSize:14,cursor:"pointer"},
  twoBtn:{display:"flex",gap:10,width:"100%",marginTop:8},
  templateGrid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,width:"100%",marginBottom:16},
  templateCard:{display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px",borderRadius:18,border:"1px solid",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"},
  tGlow:{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:1,background:"linear-gradient(90deg,transparent,#7c6aff,transparent)"},
  fxHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",marginBottom:14},
  smBtn:{padding:"5px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"#444",fontSize:12,cursor:"pointer"},
  fxGrid:{display:"flex",flexWrap:"wrap",gap:7,width:"100%",justifyContent:"center",marginBottom:16},
  fxChip:{padding:"7px 15px",borderRadius:20,border:"1px solid",cursor:"pointer",transition:"all 0.15s",fontSize:13,fontWeight:500},
  loopRow:{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,width:"100%",marginBottom:16,textAlign:"left"},
  toggle:{width:52,height:28,borderRadius:14,cursor:"pointer",position:"relative",transition:"all 0.3s",flexShrink:0},
  toggleDot:{width:20,height:20,background:"#fff",borderRadius:"50%",position:"absolute",top:4,transition:"all 0.3s",boxShadow:"0 2px 8px rgba(0,0,0,0.5)"},
  generateBtn:{width:"100%",padding:"22px",background:"linear-gradient(135deg,#7c6aff,#5b4fd4)",color:"#fff",border:"none",borderRadius:18,fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 0 50px rgba(124,106,255,0.35),0 8px 30px rgba(0,0,0,0.5)",letterSpacing:"0.04em",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16},
  loadingBox:{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"32px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:18},
  spinnerBig:{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(124,106,255,0.15)",borderTopColor:"#7c6aff",animation:"spin 0.9s linear infinite"},
  loadingTxt:{color:"#555",fontSize:15,margin:0},
  progWrap:{width:"100%",height:2,background:"rgba(255,255,255,0.05)",borderRadius:1,overflow:"hidden"},
  progBar:{height:"100%",background:"linear-gradient(90deg,#7c6aff,#00ff88)",borderRadius:1,transition:"width 1s ease"},
  errorTxt:{color:"#ff4466",fontSize:13,marginTop:8},
  result:{width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(124,106,255,0.15)",borderRadius:20,padding:22,position:"relative",overflow:"hidden",textAlign:"left"},
  resultTop:{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(124,106,255,0.5),transparent)"},
  video:{width:"100%",borderRadius:12,marginBottom:12,backgroundColor:"#000"},
  resBtns:{display:"flex",gap:10},
  editBtn:{flex:1,padding:"13px",background:"rgba(124,106,255,0.12)",border:"1px solid rgba(124,106,255,0.3)",color:"#a78bfa",borderRadius:11,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8},
  dlBtn:{flex:1,padding:"13px",background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",color:"#00ff88",borderRadius:11,textDecoration:"none",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8},
};
