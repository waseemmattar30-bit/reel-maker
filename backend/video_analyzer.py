import cv2
import numpy as np

def analyze_clip(video_path):
    print(f"🎬 Analyzing: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    
    # Get video info
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    
    # Get middle frame
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return None
    
    # 1. Check brightness
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    
    # 2. Check sharpness
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    
    # 3. Detect faces
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    has_faces = len(faces) > 0
    
    # 4. Calculate quality score
    brightness_score = min(brightness / 128, 1.0) * 10
    sharpness_score = min(sharpness / 500, 1.0) * 10
    face_bonus = 2 if has_faces else 0
    quality = (brightness_score + sharpness_score) / 2 + face_bonus
    
    result = {
        "path": video_path,
        "duration": round(duration, 2),
        "brightness": round(brightness, 2),
        "sharpness": round(sharpness, 2),
        "has_faces": has_faces,
        "quality_score": round(quality, 2)
    }
    
    print(f"✅ Duration: {result['duration']}s")
    print(f"✅ Brightness: {result['brightness']}")
    print(f"✅ Sharpness: {result['sharpness']}")
    print(f"✅ Faces: {result['has_faces']}")
    print(f"✅ Quality Score: {result['quality_score']}/12")
    
    return result