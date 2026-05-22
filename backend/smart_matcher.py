import numpy as np
import random

def match_clips_to_beats(clips_analysis, audio_analysis, loop=False):
    print("🧠 Pro matching clips to beats...")

    beat_times      = audio_analysis["beat_times"]
    beat_excitement = audio_analysis.get("beat_excitement", [0.5]*len(beat_times))
    downbeats       = set(round(t,2) for t in audio_analysis.get("downbeat_times",[]))
    drops           = set(round(t,2) for t in audio_analysis.get("drops",[]))
    chorus_start    = audio_analysis["chorus_start"]
    boundary_times  = audio_analysis.get("boundary_times", [0, audio_analysis["duration"]])
    fade_start      = audio_analysis.get("fade_start", audio_analysis["duration"]*0.9)
    mood            = audio_analysis["mood"]
    duration        = audio_analysis["duration"]

    if not beat_times or not clips_analysis:
        return []

    sorted_clips = sorted(clips_analysis, key=lambda x: x["quality_score"], reverse=True)
    n = len(sorted_clips)
    top_clips = sorted_clips[:max(1, n//3)]
    mid_clips = sorted_clips[:max(1, n*2//3)]
    all_clips = sorted_clips

    def get_dur_range(section, excitement, is_drop):
        if is_drop:
            return (0.2, 0.5)
        if section == "chorus":
            if mood == "energetic": return (0.3, 0.8)
            if mood == "romantic":  return (1.0, 2.5)
            return (0.5, 1.5)
        if section == "pre_chorus":
            if mood == "energetic": return (0.4, 1.0)
            return (0.8, 2.0)
        if mood == "romantic":  return (1.5, 3.5)
        if mood == "energetic": return (0.5, 1.2)
        return (0.8, 2.0)

    def get_section(bt):
        if bt >= chorus_start:           return "chorus"
        if bt >= chorus_start * 0.7:     return "pre_chorus"
        if bt < 10.0:                    return "intro"
        return "verse"

    def get_effect(section, excitement, is_drop, is_downbeat):
        if is_drop:
            return random.choice(["flash_zoom", "black_flash", "rgb_split"])
        if section == "chorus":
            if excitement > 0.8:
                return random.choice(["flash_zoom","flash_zoom","zoom_tilt"])
            return random.choice(["zoom_tilt","soft_zoom","flash_zoom"])
        if section == "pre_chorus":
            return random.choice(["zoom_tilt","soft_zoom","fade_in"])
        if section == "intro":
            return "fade_in"
        if is_downbeat and excitement > 0.6:
            return "soft_zoom"
        return random.choice(["soft_zoom","none","none"])

    color_options = {
        "intro":      ["none", "cold"],
        "verse":      ["warm", "none", "cold"],
        "pre_chorus": ["warm", "cold"],
        "chorus":     ["warm", "warm", "color_shift"],
    }

    section_color_cache = {}

    def get_color(section, bt):
        sec_key = 0
        for k in range(len(boundary_times) - 1):
            if boundary_times[k] <= bt < boundary_times[k + 1]:
                sec_key = k
                break
        cache_key = f"{section}_{sec_key}"
        if cache_key not in section_color_cache:
            opts = color_options.get(section, ["none"])
            section_color_cache[cache_key] = random.choice(opts)
        return section_color_cache[cache_key]

    def should_slow_mo(section, excitement, clip_dur):
        if mood == "energetic":
            return False
        if section in ("verse","intro") and excitement < 0.35 and clip_dur > 1.5:
            return random.random() < 0.4
        if section == "chorus" and mood == "romantic" and excitement < 0.5:
            return random.random() < 0.25
        return False

    matched = []
    clip_idx = 0
    i = 0
    last_clip_path = None

    avg_clip_dur = 1.2 if mood == "energetic" else 1.8 if mood == "romantic" else 1.5
    MAX_DURATION = len(all_clips) * avg_clip_dur if not loop else 60

    while i < len(beat_times):
        bt = beat_times[i]
        if bt >= duration - 0.3:
            break

        current_total = sum(m["clip_dur"] for m in matched)
        if current_total >= MAX_DURATION:
            break

        section    = get_section(bt)
        excitement = beat_excitement[i] if i < len(beat_excitement) else 0.5
        is_drop    = round(bt, 2) in drops
        is_downbeat= round(bt, 2) in downbeats

        min_d, max_d = get_dur_range(section, excitement, is_drop)
        target_end = bt + random.uniform(min_d, max_d)

        j = i + 1
        while j < len(beat_times) and beat_times[j] < target_end:
            j += 1

        actual_end = min(beat_times[j] if j < len(beat_times) else target_end, duration)
        clip_dur   = actual_end - bt

        if clip_dur < 0.15:
            i = j
            continue

        pool = top_clips if section == "chorus" else (mid_clips if section == "pre_chorus" else all_clips)

        attempts = 0
        while attempts < 5:
            clip = pool[clip_idx % len(pool)]
            if clip["path"] != last_clip_path or len(pool) == 1:
                break
            clip_idx += 1
            attempts += 1

        effect  = get_effect(section, excitement, is_drop, is_downbeat)
        color   = get_color(section, bt)
        slow_mo = should_slow_mo(section, excitement, clip_dur)
        in_fade = bt >= fade_start

        matched.append({
            "clip_path":   clip["path"],
            "beat_time":   round(bt, 3),
            "end_time":    round(actual_end, 3),
            "clip_dur":    round(clip_dur, 3),
            "section":     section,
            "effect":      effect,
            "color":       color,
            "excitement":  round(excitement, 3),
            "is_drop":     is_drop,
            "is_downbeat": is_downbeat,
            "slow_mo":     slow_mo,
            "in_fade":     in_fade,
            "quality":     clip["quality_score"],
        })

        last_clip_path = clip["path"]
        clip_idx += 1
        i = j

    total_dur = sum(m["clip_dur"] for m in matched)
    sections  = {}
    for m in matched:
        sections[m["section"]] = sections.get(m["section"], 0) + 1

    print(f"✅ {len(matched)} clips | {total_dur:.1f}s total | loop={loop}")
    for s, c in sorted(sections.items()):
        print(f"   {s}: {c} clips")
    print(f"   drops: {sum(1 for m in matched if m['is_drop'])} | slow-mo: {sum(1 for m in matched if m['slow_mo'])}")

    return matched
