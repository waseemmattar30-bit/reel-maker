import librosa
import numpy as np
from scipy.signal import find_peaks

def analyze_audio(audio_path):
    print("🎵 Analyzing audio (Pro)...")

    y, sr = librosa.load(audio_path, sr=22050)
    duration = float(len(y) / sr)

    # ── 1. Tempo & Beats ──────────────────────────────
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, tightness=100)
    beat_times = librosa.frames_to_time(beats, sr=sr).tolist()
    tempo = float(np.squeeze(tempo))

    # Also get downbeats (every 4th beat = measure start)
    downbeat_times = beat_times[::4]

    # ── 2. Mood ───────────────────────────────────────
    if tempo > 128:
        mood = "energetic"
    elif tempo > 95:
        mood = "neutral"
    else:
        mood = "romantic"

    # ── 3. Energy (high-res) ──────────────────────────
    hop = 512
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    rms_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)

    # Smooth over ~0.5s window
    win = int(sr / hop / 2)
    smoothed = np.convolve(rms, np.ones(win)/win, mode='same')

    # ── 4. Spectral features ──────────────────────────
    # Brightness (high freq energy)
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    spec_times = librosa.frames_to_time(np.arange(len(spec_centroid)), sr=sr, hop_length=hop)

    # Bass energy (kick detection)
    y_bass = librosa.effects.preemphasis(y, coef=-0.97)  # invert = bass emphasis
    bass_rms = librosa.feature.rms(y=y_bass, hop_length=hop)[0]

    # ── 5. Onset strength (percussive hits) ───────────
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onset_times = librosa.frames_to_time(np.arange(len(onset_env)), sr=sr, hop_length=hop)

    # Strong onsets = cut points
    onset_peaks, _ = find_peaks(onset_env, height=np.percentile(onset_env, 80), distance=int(sr/hop*0.2))
    strong_onset_times = onset_times[onset_peaks].tolist()

    # ── 6. Section detection ──────────────────────────
    # Use structural segmentation via MFCC + recurrence
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop*4)
    
    # Normalize
    mfcc = (mfcc - mfcc.mean(axis=1, keepdims=True)) / (mfcc.std(axis=1, keepdims=True) + 1e-6)

    # Compute self-similarity
    sim = np.dot(mfcc.T, mfcc)
    sim = (sim - sim.min()) / (sim.max() - sim.min() + 1e-6)

    # Detect boundaries via novelty
    kernel_size = 8
    kernel = np.zeros((2*kernel_size, 2*kernel_size))
    kernel[:kernel_size, :kernel_size] = 1
    kernel[kernel_size:, kernel_size:] = 1
    kernel[:kernel_size, kernel_size:] = -1
    kernel[kernel_size:, :kernel_size] = -1

    from scipy.ndimage import convolve as nd_convolve
    novelty = nd_convolve(sim, kernel)
    novelty_diag = np.diag(novelty)

    # Section boundary times
    boundary_peaks, _ = find_peaks(novelty_diag, distance=kernel_size*2)
    boundary_times_raw = librosa.frames_to_time(
        boundary_peaks * 4, sr=sr, hop_length=hop
    ).tolist()
    # Filter: min 8s between boundaries
    boundary_times = [0.0]
    for t in boundary_times_raw:
        if t - boundary_times[-1] >= 8.0:
            boundary_times.append(float(t))
    boundary_times.append(duration)

    # ── 7. Chorus detection (best section) ────────────
    # Score each section: avg energy + brightness + length weight
    section_scores = []
    for i in range(len(boundary_times) - 1):
        s, e = boundary_times[i], boundary_times[i+1]
        # Skip intro (first 15%)
        if s < duration * 0.15:
            section_scores.append(0)
            continue
        mask = (rms_times >= s) & (rms_times < e)
        if mask.sum() == 0:
            section_scores.append(0)
            continue
        avg_energy = float(smoothed[mask].mean())
        mask_c = (spec_times >= s) & (spec_times < e)
        avg_bright = float(spec_centroid[mask_c].mean()) if mask_c.sum() > 0 else 0
        length_score = min(1.0, (e - s) / 20.0)  # longer = better up to 20s
        score = avg_energy * 0.5 + (avg_bright / 5000) * 0.3 + length_score * 0.2
        section_scores.append(score)

    best_section_idx = int(np.argmax(section_scores)) if section_scores else 0
    chorus_start = float(boundary_times[best_section_idx])

    # ── 8. Beat energy (per beat) ─────────────────────
    beat_energy = []
    beat_brightness = []
    beat_bass = []

    for bt in beat_times:
        idx = int(np.searchsorted(rms_times, bt))
        idx = min(idx, len(smoothed) - 1)
        beat_energy.append(float(smoothed[idx]))

        idx_c = int(np.searchsorted(spec_times, bt))
        idx_c = min(idx_c, len(spec_centroid) - 1)
        beat_brightness.append(float(spec_centroid[idx_c]))

        idx_b = int(np.searchsorted(rms_times, bt))
        idx_b = min(idx_b, len(bass_rms) - 1)
        beat_bass.append(float(bass_rms[idx_b]))

    # Normalize 0-1
    def norm(arr):
        a = np.array(arr)
        mn, mx = a.min(), a.max()
        return ((a - mn) / (mx - mn + 1e-6)).tolist()

    beat_energy_norm     = norm(beat_energy)
    beat_brightness_norm = norm(beat_brightness)
    beat_bass_norm       = norm(beat_bass)

    # Combined excitement score per beat
    beat_excitement = [
        0.5*e + 0.3*br + 0.2*ba
        for e, br, ba in zip(beat_energy_norm, beat_brightness_norm, beat_bass_norm)
    ]

    # High-energy beats (top 30%)
    exc_threshold = np.percentile(beat_excitement, 70)
    high_energy_beats = [
        bt for bt, ex in zip(beat_times, beat_excitement)
        if ex >= exc_threshold
    ]

    # ── 9. Drop detection (sudden energy surge) ───────
    drops = []
    for i in range(1, len(beat_excitement)):
        delta = beat_excitement[i] - beat_excitement[i-1]
        if delta > 0.3:  # sudden jump
            drops.append(beat_times[i])

    # ── 10. Fade out zone ─────────────────────────────
    # Last 10% of song = fade zone
    fade_start = duration * 0.9

    result = {
        "tempo":               tempo,
        "mood":                mood,
        "duration":            duration,
        "beat_times":          beat_times,
        "downbeat_times":      downbeat_times,
        "beat_energy":         beat_energy_norm,
        "beat_brightness":     beat_brightness_norm,
        "beat_bass":           beat_bass_norm,
        "beat_excitement":     beat_excitement,
        "high_energy_beats":   high_energy_beats,
        "drops":               drops,
        "chorus_start":        chorus_start,
        "boundary_times":      boundary_times,
        "strong_onset_times":  strong_onset_times,
        "fade_start":          fade_start,
    }

    print(f"✅ Tempo: {tempo:.1f} BPM | Mood: {mood} | Duration: {duration:.1f}s")
    print(f"✅ Beats: {len(beat_times)} | Chorus: {chorus_start:.1f}s | Drops: {len(drops)}")
    print(f"✅ Sections: {len(boundary_times)-1} | Strong onsets: {len(strong_onset_times)}")
    return result