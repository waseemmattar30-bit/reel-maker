from audio_analyzer import analyze_audio
from video_analyzer import analyze_clip
from smart_matcher import match_clips_to_beats
from video_editor import create_reel

# Analyze audio
audio = analyze_audio("song.mp3")

# Analyze ALL clips
video_files = [
    "asd.mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (3).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (4).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (5).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (6).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (7).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (8).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (9).mp4",
    "grok-video-84562ce8-3676-46ee-a7cb-fdce148fb0f7 (10).mp4",
]

clips = []
for v in video_files:
    result = analyze_clip(v)
    if result:
        clips.append(result)

print(f"\n✅ Analyzed {len(clips)} clips")

# Match
matched = match_clips_to_beats(clips, audio)

# Create reel
output = create_reel(matched, "song.mp3", "output_reel2.mp4")
print(f"\n🎉 Done! Check: {output}")