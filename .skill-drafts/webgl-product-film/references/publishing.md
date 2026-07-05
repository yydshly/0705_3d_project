# Publishing

Use this when turning a browser 3D demo into a shareable video.

## Recommended Package

Create a folder containing:

- Final MP4, preferably H.264 video and AAC audio.
- Cover image.
- SRT or VTT captions.
- Source WebM or raw capture when available.
- Publish notes with title, description, tags, and short commentary.

## Audio

- Keep narration slower than a normal explanation. Visual demos need breathing room.
- Align video duration to the longer of the visual timeline and voiceover.
- Keep music below voiceover. Avoid constant low-frequency rumble unless the scene needs tension.
- Do not hardcode API keys. Read TTS/music credentials from environment variables or a local ignored file.

## Captions

- Captions should explain capability, not repeat every visual.
- Keep each caption short enough to read in one shot.
- Match caption timing to visual events, not equal intervals.

## ffmpeg Notes

For broad compatibility:

```text
Video: H.264, yuv420p, 1080p or source aspect ratio, 30/60 fps
Audio: AAC, 48 kHz
Container: MP4
```

When raw WebM duration metadata is missing, fall back to known timeline length, caption end time, or probed audio duration.
