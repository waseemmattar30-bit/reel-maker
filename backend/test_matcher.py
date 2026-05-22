from audio_analyzer import analyze_audio
from video_analyzer import analyze_clip
from smart_matcher import match_clips_to_beats

# Analyze audio
audio = analyze_audio("song.mp3")

# Analyze clips
clips = []
clips.append(analyze_clip("test_video2.mp4"))

# Match
result = match_clips_to_beats(clips, audio)

# Show first 5 matches
print("\n📊 First 5 matches:")
for match in result[:5]:
    print(match)