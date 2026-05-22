from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
import uuid
import json

from audio_analyzer import analyze_audio
from video_analyzer import analyze_clip
from smart_matcher import match_clips_to_beats
from video_editor import create_reel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-ID"],
)

UPLOAD_DIR = "/tmp/uploads"
OUTPUT_DIR = "/tmp/outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def home():
    return {"message": "Reel Maker API ✅"}

@app.post("/generate")
async def generate(
    videos: List[UploadFile] = File(...),
    audio: UploadFile = File(...),
    audio_start: str = Form(default="0"),
    audio_end: str = Form(default="-1"),
    loop: str = Form(default="false"),
    template: str = Form(default="auto"),
    effects: str = Form(default="[]"),
    text_overlays: str = Form(default="[]"),
):
    session_id = str(uuid.uuid4())[:8]
    session_dir = f"{UPLOAD_DIR}/{session_id}"
    os.makedirs(session_dir, exist_ok=True)

    video_paths = []
    for video in videos:
        path = f"{session_dir}/{video.filename}"
        with open(path, "wb") as f:
            shutil.copyfileobj(video.file, f)
        video_paths.append(path)

    audio_path = f"{session_dir}/{audio.filename}"
    audio_start_sec = float(audio_start)
    audio_end_sec = float(audio_end) if float(audio_end) > 0 else None
    with open(audio_path, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    print("🎵 Analyzing audio...")
    audio_analysis = analyze_audio(audio_path)

    print("🎬 Analyzing videos...")
    clips_analysis = []
    for path in video_paths:
        result = analyze_clip(path)
        if result:
            clips_analysis.append(result)

    print("🧠 Matching...")
    output_path = f"{OUTPUT_DIR}/{session_id}_reel.mp4"
    should_loop = loop.lower() == "true"
    selected_effects = json.loads(effects)

    matched = match_clips_to_beats(clips_analysis, audio_analysis, loop=should_loop)

    

    parsed_text_overlays = json.loads(text_overlays)

    create_reel(
        matched,
        audio_path,
        output_path,
        loop=should_loop,
        template=template,
        selected_effects=selected_effects,
        text_overlays=parsed_text_overlays if parsed_text_overlays else None,
        audio_start=audio_start_sec,
        audio_end=audio_end_sec,
    )

    response = FileResponse(
        output_path,
        media_type="video/mp4",
        filename="reel.mp4",
    )
    response.headers["X-Session-ID"] = session_id
    response.headers["Access-Control-Expose-Headers"] = "X-Session-ID"
    response.headers["Access-Control-Allow-Origin"] = "*"
    print(f"✅ Session ID: {session_id}")
    return response

@app.get("/clip-info/{session_id}")
def get_clip_info(session_id: str):
    info_path = f"{OUTPUT_DIR}/{session_id}_reel_info.json"
    if not os.path.exists(info_path):
        return JSONResponse({"clips": [], "error": "Not found"})
    with open(info_path) as f:
        data = json.load(f)
    return JSONResponse({"clips": data})

@app.post("/regenerate-clip")
async def regenerate_clip(
    session_id: str = Form(...),
    clip_index: int = Form(...),
    motion: str = Form(default="none"),
    color: str = Form(default="none"),
    texture: str = Form(default="none"),
    transition: str = Form(default="none"),
):
    from video_editor import apply_all_effects, apply_zoom_smooth, apply_zoom_out_smooth, apply_warm, apply_cold, apply_bw, apply_contrast, apply_vignette, apply_film_grain, apply_glitch, apply_vhs, apply_letterbox, apply_tilt, apply_color_shift, apply_spin
    from moviepy.editor import VideoFileClip, VideoClip
    import cv2, numpy as np

    info_path = f"{OUTPUT_DIR}/{session_id}_reel_info.json"
    reel_path = f"{OUTPUT_DIR}/{session_id}_reel.mp4"

    if not os.path.exists(info_path):
        return JSONResponse({"error": "Not found"}, status_code=404)

    with open(info_path) as f:
        clip_info = json.load(f)

    # Find clip
    clip_data = next((c for c in clip_info if c["index"] == clip_index), None)
    if not clip_data:
        return JSONResponse({"error": "Clip not found"}, status_code=404)

    # Load original source video
    source_path = None
    for session_dir in os.listdir(UPLOAD_DIR):
        full_dir = f"{UPLOAD_DIR}/{session_dir}"
        if os.path.isdir(full_dir):
            for f in os.listdir(full_dir):
                if f == clip_data.get("source"):
                    source_path = f"{full_dir}/{f}"
                    break

    if not source_path or not os.path.exists(source_path):
        return JSONResponse({"error": "Source not found"}, status_code=404)

    # Load full reel to get the clip segment
    try:
        full_reel = VideoFileClip(reel_path)
        start_t = clip_data["startTime"]
        end_t = clip_data["endTime"]
        short = full_reel.subclip(start_t, end_t)
        dur = short.duration

        combo = {"color": color, "motion": motion, "texture": texture, "overlay": "none", "transition": transition, "zoom_intensity": 0.06}

        def make_frame(t, sc=short, cb=combo, d=dur):
            frame = sc.get_frame(min(t, d - 0.01))
            bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            progress = t / d if d > 0 else 0

            # Apply motion
            if cb["motion"] == "zoom_in":
                bgr = apply_zoom_smooth(bgr, progress, cb["zoom_intensity"])
            elif cb["motion"] == "zoom_out":
                bgr = apply_zoom_out_smooth(bgr, progress, cb["zoom_intensity"])
            elif cb["motion"] == "tilt_left":
                bgr = apply_tilt(bgr, -3)
            elif cb["motion"] == "tilt_right":
                bgr = apply_tilt(bgr, 3)
            elif cb["motion"] == "spin":
                bgr = apply_spin(bgr, progress * 8)

            # Apply color
            if cb["color"] == "warm":     bgr = apply_warm(bgr)
            elif cb["color"] == "cold":   bgr = apply_cold(bgr)
            elif cb["color"] == "bw":     bgr = apply_bw(bgr)
            elif cb["color"] == "color_shift": bgr = apply_color_shift(bgr, t)

            # Apply texture
            if cb["texture"] == "contrast":   bgr = apply_contrast(bgr)
            elif cb["texture"] == "vignette": bgr = apply_vignette(bgr)
            elif cb["texture"] == "film_grain": bgr = apply_film_grain(bgr)
            elif cb["texture"] == "letterbox": bgr = apply_letterbox(bgr)

            # Apply overlay
            if cb["overlay"] == "vhs": bgr = apply_vhs(bgr)

            return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

        new_clip = VideoClip(make_frame, duration=dur).set_fps(30)

        # Save temp clip
        temp_path = f"{OUTPUT_DIR}/{session_id}_clip_{clip_index}_temp.mp4"
        new_clip.write_videofile(temp_path, fps=30, codec="libx264", audio_codec="aac", bitrate="8000k", verbose=False, logger=None)

        # Now rebuild full reel with updated clip
        clips_list = []
        for ci in sorted(clip_info, key=lambda x: x["index"]):
            if ci["index"] == clip_index:
                clips_list.append(VideoFileClip(temp_path))
            else:
                s = ci["startTime"]
                e = ci["endTime"]
                clips_list.append(full_reel.subclip(s, e))

        from moviepy.editor import concatenate_videoclips, AudioFileClip
        final = concatenate_videoclips(clips_list, method="compose")

        # Add audio from original
        audio_clip = full_reel.audio
        if audio_clip:
            final = final.set_audio(audio_clip.subclip(0, min(final.duration, audio_clip.duration)))

        # Save new reel
        new_reel_path = f"{OUTPUT_DIR}/{session_id}_reel.mp4"
        final.write_videofile(new_reel_path, fps=30, codec="libx264", audio_codec="aac", bitrate="8000k", verbose=False, logger=None)

        # Update clip info
        for clip in clip_info:
            if clip["index"] == clip_index:
                clip["motion"] = motion
                clip["color"] = color
                clip["texture"] = texture
                clip["transition"] = transition
                break

        with open(info_path, "w") as f:
            json.dump(clip_info, f, indent=2)

        # Cleanup temp
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return FileResponse(
            new_reel_path,
            media_type="video/mp4",
            filename="reel_updated.mp4",
            headers={"Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "X-Clips-Info", "X-Clips-Info": json.dumps(clip_info)}
        )

    except Exception as e:
        print(f"Error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

  