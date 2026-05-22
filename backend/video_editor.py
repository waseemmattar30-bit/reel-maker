import cv2
import textwrap
import numpy as np
import random
import json
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips, VideoClip
from PIL import Image, ImageDraw, ImageFont

# ============ ALL EFFECTS ============

def apply_zoom_smooth(frame, progress, intensity=0.06):
    zoom = 1.0 + intensity * progress
    h, w = frame.shape[:2]
    new_h, new_w = int(h * zoom), int(w * zoom)
    resized = cv2.resize(frame, (new_w, new_h))
    y = (new_h - h) // 2
    x = (new_w - w) // 2
    return resized[y:y+h, x:x+w]

def apply_zoom_out_smooth(frame, progress, intensity=0.06):
    zoom = max(1.06 - intensity * progress, 0.85)
    h, w = frame.shape[:2]
    new_h, new_w = int(h * zoom), int(w * zoom)
    resized = cv2.resize(frame, (new_w, new_h))
    result = np.zeros_like(frame)
    y = (h - new_h) // 2
    x = (w - new_w) // 2
    y, x = max(0, y), max(0, x)
    result[y:y+new_h, x:x+new_w] = resized[:h-y, :w-x]
    return result

def apply_warm(frame, strength=0.25):
    result = frame.copy().astype(np.float32)
    result[:, :, 2] = np.clip(result[:, :, 2] * (1 + strength), 0, 255)
    result[:, :, 0] = np.clip(result[:, :, 0] * (1 - strength * 0.4), 0, 255)
    return result.astype(np.uint8)

def apply_cold(frame, strength=0.25):
    result = frame.copy().astype(np.float32)
    result[:, :, 0] = np.clip(result[:, :, 0] * (1 + strength), 0, 255)
    result[:, :, 2] = np.clip(result[:, :, 2] * (1 - strength * 0.4), 0, 255)
    return result.astype(np.uint8)

def apply_green(frame, strength=0.2):
    result = frame.copy().astype(np.float32)
    result[:, :, 1] = np.clip(result[:, :, 1] * (1 + strength), 0, 255)
    result[:, :, 2] = np.clip(result[:, :, 2] * (1 - strength * 0.3), 0, 255)
    return result.astype(np.uint8)

def apply_bw(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

def apply_vignette(frame, strength=0.5):
    h, w = frame.shape[:2]
    kernel_x = cv2.getGaussianKernel(w, w * 0.6)
    kernel_y = cv2.getGaussianKernel(h, h * 0.6)
    mask = kernel_y * kernel_x.T
    mask = mask / mask.max()
    mask = 1 - (1 - mask) * strength
    result = frame.copy().astype(np.float32)
    for i in range(3):
        result[:, :, i] *= mask
    return result.astype(np.uint8)

def apply_contrast(frame, alpha=1.3, beta=-15):
    return cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)

def apply_flash(frame, progress, max_intensity=0.5):
    intensity = max_intensity * (1 - progress / 0.2) if progress < 0.2 else 0
    if intensity <= 0:
        return frame
    overlay = np.ones_like(frame) * 255
    return cv2.addWeighted(frame, 1 - intensity, overlay, intensity, 0)

def apply_black_flash(frame, progress, max_intensity=0.6):
    intensity = max_intensity * (1 - progress / 0.2) if progress < 0.2 else 0
    if intensity <= 0:
        return frame
    overlay = np.zeros_like(frame)
    return cv2.addWeighted(frame, 1 - intensity, overlay, intensity, 0)

def apply_glitch(frame):
    result = frame.copy()
    shift = np.random.randint(5, 20)
    result[:, shift:, 2] = frame[:, :-shift, 2]
    result[:, :-shift, 0] = frame[:, shift:, 0]
    for _ in range(random.randint(2, 5)):
        y = np.random.randint(0, frame.shape[0])
        h = np.random.randint(2, 10)
        result[y:y+h, :] = np.roll(result[y:y+h, :], shift * 2, axis=1)
    return result

def apply_tilt(frame, angle=3):
    h, w = frame.shape[:2]
    matrix = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
    return cv2.warpAffine(frame, matrix, (w, h))

def apply_sharpen(frame):
    kernel = np.array([[0, -0.5, 0], [-0.5, 3, -0.5], [0, -0.5, 0]])
    return cv2.filter2D(frame, -1, kernel)

def apply_fade_in(frame, progress, dur=0.3):
    if progress < dur:
        alpha = progress / dur
        black = np.zeros_like(frame)
        return cv2.addWeighted(black, 1 - alpha, frame, alpha, 0)
    return frame

def apply_rgb_split(frame, shift=8):
    result = frame.copy()
    result[:, shift:, 2] = frame[:, :-shift, 2]
    result[:, :-shift, 0] = frame[:, shift:, 0]
    return result

def apply_vhs(frame):
    noise = np.random.randint(0, 25, frame.shape, dtype=np.uint8)
    frame = cv2.add(frame, noise)
    result = frame.copy()
    for y in range(0, frame.shape[0], 4):
        result[y, :] = (result[y, :].astype(np.float32) * 0.85).astype(np.uint8)
    result[:, 3:, 0] = frame[:, :-3, 0]
    result = cv2.GaussianBlur(result, (3, 1), 0)
    return result

def apply_spin(frame, angle=5):
    h, w = frame.shape[:2]
    matrix = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
    return cv2.warpAffine(frame, matrix, (w, h))

def apply_letterbox(frame, size=0.08):
    result = frame.copy()
    h = frame.shape[0]
    bar = int(h * size)
    result[:bar, :] = 0
    result[-bar:, :] = 0
    return result

def apply_color_shift(frame, t=0):
    result = frame.copy().astype(np.float32)
    shift = np.sin(t * 2) * 0.3 + 0.3
    result[:, :, 2] = np.clip(result[:, :, 2] * (1 + shift * 0.5), 0, 255)
    result[:, :, 0] = np.clip(result[:, :, 0] * (1 + (1-shift) * 0.5), 0, 255)
    return result.astype(np.uint8)

def apply_film_grain(frame, strength=25):
    noise = np.random.normal(0, strength, frame.shape).astype(np.int16)
    return np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)

def apply_split_screen(frame, mode="quad"):
    h, w = frame.shape[:2]
    result = np.zeros_like(frame)
    if mode == "quad":
        half_h, half_w = h // 2, w // 2
        small = cv2.resize(frame, (half_w, half_h))
        result[:half_h, :half_w] = small
        result[:half_h, half_w:] = apply_warm(small)
        result[half_h:, :half_w] = apply_cold(small)
        result[half_h:, half_w:] = apply_contrast(small)
    elif mode == "mirror_quad":
        half_h, half_w = h // 2, w // 2
        small = cv2.resize(frame, (half_w, half_h))
        result[:half_h, :half_w] = apply_warm(small)
        result[:half_h, half_w:] = apply_cold(cv2.flip(small, 1))
        result[half_h:, :half_w] = apply_green(cv2.flip(small, 0))
        result[half_h:, half_w:] = apply_contrast(cv2.flip(small, -1))
    elif mode == "vertical_3":
        third_w = w // 3
        result[:, :third_w] = apply_warm(frame)[:, :third_w]
        result[:, third_w:2*third_w] = frame[:, third_w:2*third_w]
        result[:, 2*third_w:] = apply_cold(frame)[:, 2*third_w:]
    return result

TEMPLATES = {
    "romantic":  {"mood_override": "romantic",  "dur_range": (0.3, 1.5), "zoom_range": (0.05, 0.15)},
    "cinematic": {"mood_override": "neutral",   "dur_range": (0.6, 1.8), "zoom_range": (0.05, 0.10)},
    "energetic": {"mood_override": "energetic", "dur_range": (0.2, 1.0), "zoom_range": (0.08, 0.18)},
    "auto": None,
}

COLOR_EFFECTS =      ["warm", "cold", "green", "bw", "color_shift"]
TEXTURE_EFFECTS =    ["vignette", "contrast", "sharpen", "film_grain", "letterbox"]
MOTION_EFFECTS =     ["zoom_in", "zoom_out", "tilt_left", "tilt_right", "spin"]
TRANSITION_EFFECTS = ["flash", "black_flash", "fade_in", "glitch", "rgb_split"]
OVERLAY_EFFECTS =    ["vhs"]

def get_random_combo(mood, template_cfg=None, selected_effects=None):
    if template_cfg:
        zoom_i = random.uniform(*template_cfg["zoom_range"])
    elif mood == "romantic":
        zoom_i = random.uniform(0.05, 0.10)
    elif mood == "energetic":
        zoom_i = random.uniform(0.08, 0.14)
    else:
        zoom_i = random.uniform(0.05, 0.10)

    if selected_effects and len(selected_effects) > 0:
        se = selected_effects
        color_pool =      [e for e in COLOR_EFFECTS      if e in se] or ["warm"]
        texture_pool =    [e for e in TEXTURE_EFFECTS    if e in se] or ["none"]
        motion_pool =     [e for e in MOTION_EFFECTS     if e in se] or ["zoom_in"]
        transition_pool = [e for e in TRANSITION_EFFECTS if e in se] or ["flash"]
        overlay_pool =    [e for e in OVERLAY_EFFECTS    if e in se] or ["none"]
    else:
        if mood == "romantic":
            color_pool =      ["warm", "warm", "warm", "none"]
            texture_pool =    ["vignette", "letterbox", "film_grain", "vignette"]
            motion_pool =     ["zoom_in", "zoom_in", "zoom_out", "zoom_in"]
            transition_pool = ["flash", "flash", "black_flash", "fade_in"]
            overlay_pool =    ["none", "none", "none", "none"]
        elif mood == "energetic":
            color_pool =      ["cold", "color_shift", "none", "cold"]
            texture_pool =    ["contrast", "sharpen", "film_grain", "none"]
            motion_pool =     ["zoom_in", "tilt_left", "tilt_right", "spin"]
            transition_pool = ["flash", "black_flash", "glitch", "rgb_split"]
            overlay_pool =    ["vhs", "none", "none"]
        else:
            color_pool =      ["cold", "none", "none", "cold"]
            texture_pool =    ["letterbox", "contrast", "vignette", "none"]
            motion_pool =     ["zoom_in", "tilt_left", "tilt_right", "none"]
            transition_pool = ["black_flash", "fade_in", "none"]
            overlay_pool =    ["none", "none", "none"]

    return {
        "color":          random.choice(color_pool),
        "texture":        random.choice(texture_pool),
        "motion":         random.choice(motion_pool),
        "transition":     random.choice(transition_pool),
        "overlay":        random.choice(overlay_pool),
        "zoom_intensity": zoom_i,
    }

def create_slow_motion_clip(clip, factor=0.5):
    new_dur = clip.duration / factor
    def make_frame(t):
        return clip.get_frame(min(t * factor, clip.duration - 0.01))
    return VideoClip(make_frame, duration=new_dur).set_fps(30)

def create_fast_clip(clip, factor=2.0):
    new_dur = clip.duration / factor
    def make_frame(t):
        return clip.get_frame(min(t * factor, clip.duration - 0.01))
    return VideoClip(make_frame, duration=new_dur).set_fps(30)

def get_clip_type(mood, beat_index):
    if beat_index % 10 == 0 and random.random() < 0.25:
        return random.choice(["split_quad", "split_mirror", "split_v3"])
    if mood == "romantic":
        return random.choices(["slow_motion", "normal"], weights=[45, 55])[0]
    elif mood == "neutral":
        return random.choices(["normal", "slow_motion", "fast"], weights=[45, 30, 25])[0]
    else:
        return random.choices(["normal", "fast", "slow_motion"], weights=[35, 45, 20])[0]

def apply_all_effects(frame, combo, progress, t=0):
    if combo["motion"] == "zoom_in":
        frame = apply_zoom_smooth(frame, progress, combo["zoom_intensity"])
    elif combo["motion"] == "zoom_out":
        frame = apply_zoom_out_smooth(frame, progress, combo["zoom_intensity"])
    elif combo["motion"] == "tilt_left":
        frame = apply_tilt(frame, -3)
    elif combo["motion"] == "tilt_right":
        frame = apply_tilt(frame, 3)
    elif combo["motion"] == "spin":
        frame = apply_spin(frame, progress * 8)

    if combo["color"] == "warm":           frame = apply_warm(frame)
    elif combo["color"] == "cold":         frame = apply_cold(frame)
    elif combo["color"] == "green":        frame = apply_green(frame)
    elif combo["color"] == "bw":           frame = apply_bw(frame)
    elif combo["color"] == "color_shift":  frame = apply_color_shift(frame, t)

    if combo["texture"] == "vignette":     frame = apply_vignette(frame)
    elif combo["texture"] == "contrast":   frame = apply_contrast(frame)
    elif combo["texture"] == "sharpen":    frame = apply_sharpen(frame)
    elif combo["texture"] == "film_grain": frame = apply_film_grain(frame)
    elif combo["texture"] == "letterbox":  frame = apply_letterbox(frame)

    if combo["overlay"] == "vhs":          frame = apply_vhs(frame)

    if combo["transition"] == "flash":
        frame = apply_flash(frame, progress)
    elif combo["transition"] == "black_flash":
        frame = apply_black_flash(frame, progress)
    elif combo["transition"] == "fade_in":
        frame = apply_fade_in(frame, progress)
    elif combo["transition"] == "glitch" and progress < 0.2:
        fade = 1 - progress / 0.2
        frame = cv2.addWeighted(frame, 1 - fade * 0.6, apply_glitch(frame), fade * 0.6, 0)
    elif combo["transition"] == "rgb_split" and progress < 0.2:
        fade = 1 - progress / 0.2
        frame = cv2.addWeighted(frame, 1 - fade * 0.7, apply_rgb_split(frame), fade * 0.7, 0)

    return frame

def add_text_to_frame(frame, text, position="bottom", alpha=1.0, slide_progress=1.0):
    """Add professional text overlay with slide-up animation"""
    h, w = frame.shape[:2]
    font_size = int(h * 0.055)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Georgia.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", font_size)
        except:
            font = ImageFont.load_default()

    if position == "bottom":
        base_y = int(h * 0.82)
    elif position == "middle":
        base_y = int(h * 0.45)
    else:
        base_y = int(h * 0.1)

    # Ease out slide up
    ease = 1 - (1 - min(slide_progress, 1.0)) ** 3
    slide_offset = int((1 - ease) * 50)
    y = base_y + slide_offset

    tmp_img = Image.fromarray(frame)
    tmp_draw = ImageDraw.Draw(tmp_img)
    bbox = tmp_draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x = (w - text_w) // 2

    overlay = Image.fromarray(frame).convert("RGBA")
    txt_layer = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(txt_layer)

    ta = int(255 * alpha)
    sa = int(200 * alpha)

    for ox, oy in [(-2,-2),(2,-2),(-2,2),(2,2),(-2,0),(2,0),(0,-2),(0,2)]:
        draw.text((x+ox, y+oy), text, font=font, fill=(0, 0, 0, sa))
    draw.text((x, y), text, font=font, fill=(255, 255, 255, ta))

    result = Image.alpha_composite(overlay, txt_layer).convert("RGB")
    return np.array(result)


def create_reel(matched, audio_path, output_path="output_reel.mp4",
                loop=False, template="auto", selected_effects=None, text_overlays=None,
                audio_start=0, audio_end=None):
    print("🎬 Creating reel (Pro)...")

    if not matched:
        print("❌ No matched clips!")
        return None

    template_cfg = TEMPLATES.get(template)

    # Detect mood from matched data or beat spacing
    beat_times = [m["beat_time"] for m in matched]
    if template_cfg and template_cfg.get("mood_override"):
        mood = template_cfg["mood_override"]
    elif len(beat_times) > 1:
        avg = np.mean(np.diff(beat_times[:20]))
        mood = "romantic" if avg > 0.8 else "neutral" if avg > 0.5 else "energetic"
    else:
        mood = "neutral"

    print(f"🎵 Mood: {mood} | Clips to render: {len(matched)}")

    # Load all unique source videos
    unique_paths = list(set(m["clip_path"] for m in matched))
    loaded = {}
    for p in unique_paths:
        try:
            loaded[p] = VideoFileClip(p)
            w, h = loaded[p].size
            if h > w:  # vertical video
                loaded[p] = loaded[p].resize(height=1080)
            else:  # horizontal video
                loaded[p] = loaded[p].resize(width=1920)
            print(f"✅ Loaded: {p}")
        except Exception as e:
            print(f"⚠️ Failed {p}: {e}")

    if not loaded:
        return None

    clips = []
    clip_combos = []

    for counter, m in enumerate(matched):
        path    = m["clip_path"]
        src     = loaded.get(path)
        if src is None:
            continue

        clip_dur   = m.get("clip_dur", 1.0)
        section    = m.get("section", "verse")
        slow_mo    = m.get("slow_mo", False)
        in_fade    = m.get("in_fade", False)
        is_drop    = m.get("is_drop", False)
        excitement = m.get("excitement", 0.5)

        # Source clip position — spread across source video
        # Source clip position — use beat_time to pick best moment
        total_src_dur = src.duration
        beat_time = m.get("beat_time", 0)
        
        # حاول تبدأ من نقطة في الفيديو تتناسب مع الـ beat
        src_start = (beat_time % max(0.1, total_src_dur - clip_dur))
        src_start = min(src_start, max(0, total_src_dur - clip_dur - 0.05))
        src_start = max(0, src_start)
        src_end   = min(src_start + clip_dur, total_src_dur)

        if src_end - src_start < 0.15:
            continue

        short = src.subclip(src_start, src_end)

        # Slow motion on selected clips
        if slow_mo:
            short = create_slow_motion_clip(short, 0.5)
        elif is_drop and mood == "energetic":
            short = create_fast_clip(short, 1.5)

        dur = short.duration

        # Build effects combo from matched data + selected_effects override
        if selected_effects and len(selected_effects) > 0:
            combo = get_random_combo(mood, template_cfg, selected_effects)
            # bw بس كليب وحد في المنتصف
            if "bw" in (selected_effects or []):
                combo["color"] = "bw" if counter == len(matched) // 2 else m.get("color", "none")
            else:
                combo["color"] = m.get("color", combo["color"])
        else:
            # Use smart matcher's color, derive motion/texture from section
            matched_color = m.get("color", "none")
            if section == "chorus":
                motion = random.choice(["zoom_in","zoom_in","zoom_out"])
                texture = random.choice(["vignette","letterbox","film_grain"])
                transition = random.choice(["flash","black_flash"]) if is_drop else random.choice(["flash","fade_in"])
            elif section == "pre_chorus":
                motion = random.choice(["zoom_in","tilt_left","tilt_right"])
                texture = random.choice(["vignette","contrast","none"])
                transition = random.choice(["fade_in","flash"])
            elif section == "intro":
                motion = "zoom_in"
                texture = "vignette"
                transition = "fade_in"
            else:  # verse
                motion = random.choice(["zoom_in","zoom_out","none"])
                texture = random.choice(["film_grain","none","vignette"])
                transition = random.choice(["fade_in","none","none"])

            combo = {
                "color":          matched_color,
                "motion":         motion,
                "texture":        texture,
                "transition":     transition,
                "overlay":        "none",
                "zoom_intensity": 0.06 + excitement * 0.06,
            }

        # Fade out zone: reduce brightness
        fade_alpha = 1.0
        if in_fade:
            fade_alpha = max(0.3, 1.0 - (excitement * 0.5))

        print(f"🎞️ [{section:10s}] {dur:.2f}s | {combo['color']:12s}+{combo['motion']:10s} | drop={is_drop} slow={slow_mo}")

        def make_frame(t, sc=short, cb=combo, d=dur, fa=fade_alpha):
            frame = sc.get_frame(min(t, d - 0.01))
            bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            progress = t / d if d > 0 else 0
            bgr = apply_all_effects(bgr, cb, progress, t)
            if fa < 1.0:
                bgr = cv2.convertScaleAbs(bgr, alpha=fa, beta=0)
            return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

        vc = VideoClip(make_frame, duration=dur).set_fps(30)
        clips.append(vc)
        clip_combos.append({
            "source":     path.split("/")[-1],
            "clip_type":  "slow_motion" if slow_mo else "normal",
            "color":      combo["color"],
            "motion":     combo["motion"],
            "texture":    combo["texture"],
            "overlay":    combo["overlay"],
            "transition": combo["transition"],
            "section":    section,
        })

    if not clips:
        print("❌ No clips rendered!")
        return None

    total_dur = sum(c.duration for c in clips)
    print(f"\n✅ {len(clips)} clips | {total_dur:.1f}s")
    print("🔗 Combining with transitions...")
    
    cf = 0.3 if mood == "energetic" else 0.5 if mood == "romantic" else 0.4

    def apply_transition(frame, t, dur, fade, transition_type):
        progress = 0.0
        is_fade_zone = False
        
        if t < fade:
            progress = t / fade
            is_fade_zone = True
            is_out = False
        elif t > dur - fade:
            progress = (dur - t) / fade
            progress = max(0.0, progress)
            is_fade_zone = True
            is_out = True
        
        if not is_fade_zone:
            return frame

        if transition_type == "fade":
            return (frame * progress).astype(np.uint8)
        
        elif transition_type == "white_fade":
            white = np.ones_like(frame) * 255
            return cv2.addWeighted(frame, progress, white, 1 - progress, 0)
        
        elif transition_type == "slide_left":
            h, w = frame.shape[:2]
            shift = int((1 - progress) * w * 0.3)
            result = np.zeros_like(frame)
            if is_out:
                result[:, :w-shift] = frame[:, shift:]
            else:
                result[:, shift:] = frame[:, :w-shift]
            return result
        
        elif transition_type == "zoom_fade":
            alpha = progress
            zoom = 1.0 + (1 - progress) * 0.15
            h, w = frame.shape[:2]
            new_h, new_w = int(h * zoom), int(w * zoom)
            resized = cv2.resize(frame, (new_w, new_h))
            y = (new_h - h) // 2
            x = (new_w - w) // 2
            zoomed = resized[y:y+h, x:x+w]
            return (zoomed * alpha).astype(np.uint8)
        
        elif transition_type == "blur_fade":
            alpha = progress
            blur_strength = int((1 - progress) * 15) * 2 + 1
            blurred = cv2.GaussianBlur(frame, (blur_strength, blur_strength), 0)
            return cv2.addWeighted(blurred, 1 - alpha, frame, alpha, 0).astype(np.uint8)
        
        return (frame * progress).astype(np.uint8)

    # Transition types per mood
    if mood == "energetic":
        transition_pool = ["fade", "white_fade", "zoom_fade", "slide_left"]
    elif mood == "romantic":
        transition_pool = ["fade", "blur_fade", "zoom_fade", "white_fade"]
    else:
        transition_pool = ["fade", "zoom_fade", "blur_fade", "slide_left"]

    crossfaded = []
    all_transitions = ["fade", "white_fade", "zoom_fade", "blur_fade"]
    
    for idx, clip in enumerate(clips):
        d = clip.duration
        tt = random.choice(all_transitions)  # عشوائي لكل كليب

        if d < cf * 2 + 0.1:
            crossfaded.append(clip)
            continue

        def make_cf_frame(t, c=clip, dur=d, fade=cf, tt=tt):
            frame = c.get_frame(min(t, dur - 0.01))
            return apply_transition(frame, t, dur, fade, tt)

        crossfaded.append(VideoClip(make_cf_frame, duration=d).set_fps(30))

    final = concatenate_videoclips(crossfaded, method="compose")

    print("🎵 Adding audio...")

    audio_clip = AudioFileClip(audio_path)
    a_start = float(audio_start) if audio_start else 0
    a_end = float(audio_end) if audio_end else audio_clip.duration
    audio = audio_clip.subclip(a_start, min(a_end, audio_clip.duration))
    audio = audio.subclip(0, min(final.duration, audio.duration))
    fade_dur = min(2.0, audio.duration * 0.1)
    audio = audio.audio_fadeout(fade_dur)
    final = final.set_audio(audio)

    # ✅ Add text overlays baked into video
    if text_overlays and len(text_overlays) > 0:
        print(f"✍️ Adding {len(text_overlays)} text overlay(s)...")
        total_dur = final.duration
        base_clip = final

        def make_text_frame(t, base=base_clip, overlays=text_overlays, dur=total_dur):
            frame = base.get_frame(t)
            for ov in overlays:
                text = ov.get("text", "")
                if not text:
                    continue
                time_pos = ov.get("time", "start")
                fade_dur = 0.6
                if time_pos == "start":
                    start, end = 0, min(4, dur)
                    pos = "top"
                elif time_pos == "middle":
                    start, end = dur * 0.4, min(dur * 0.4 + 4, dur)
                    pos = "middle"
                else:
                    start, end = dur * 0.75, dur
                    pos = "bottom"
                if t < start or t > end:
                    continue
                if t - start < fade_dur:
                    alpha = (t - start) / fade_dur
                    slide_progress = (t - start) / fade_dur
                elif end - t < fade_dur:
                    alpha = (end - t) / fade_dur
                    slide_progress = 1.0
                else:
                    alpha = 1.0
                    slide_progress = 1.0
                frame = add_text_to_frame(frame, text, position=pos, alpha=alpha, slide_progress=slide_progress)
            return frame

        final = VideoClip(make_text_frame, duration=total_dur)
        final = final.set_audio(audio)

    print("💾 Exporting...")
    final.write_videofile(output_path, fps=30, codec="libx264",
                          audio_codec="aac", bitrate="20000k",
                          ffmpeg_params=["-crf", "18", "-preset", "slow"])

    # Save clip info JSON
    clip_info = []
    total_time = 0.0
    for i, (clip, combo) in enumerate(zip(clips, clip_combos)):
        clip_info.append({
            "index": i,
            "startTime": round(total_time, 3),
            "endTime": round(total_time + clip.duration, 3),
            "duration": round(clip.duration, 3),
            "source": combo["source"],
            "clipType": combo["clip_type"],
            "color": combo["color"],
            "motion": combo["motion"],
            "texture": combo["texture"],
            "overlay": combo["overlay"],
            "transition": combo["transition"],
        })
        total_time += clip.duration

    info_path = output_path.replace(".mp4", "_info.json")
    with open(info_path, "w") as f:
        json.dump(clip_info, f, indent=2)
    print(f"✅ Clip info saved: {info_path}")

    print(f"\n🎉 Done: {output_path}")
    return output_path