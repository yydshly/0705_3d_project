# Avatar Caption Beat Evidence Note

Date: 2026-11-11

This note records the next runtime evidence for the P1 character branch: a caption-timed guide beat inside the existing VRM viewer.

## Why This Step

`prototypes/avatar-character-viewer/` already proved the loading route:

```text
VRM sample
  -> GLTFLoader
  -> VRMLoaderPlugin
  -> idle / greet / explain / think
  -> expression entry points
```

The character guide lists voice and captions as part of the character, not as later polish. The viewer README still said that layer was missing. This step adds that hook without pretending the branch now has speech audio, lip sync, or authored motion clips.

## What Was Added

The beat is a pure timeline in `src/captionBeat.js`. Each cue owns:

- start and end, in milliseconds;
- a behavior state already exposed by the viewer;
- an expression name already exposed by the viewer;
- one caption line.

`GUIDE_BEAT` is a 34.9 second, four-cue script. The cues are contiguous and match the voice file. Lookup is start-inclusive and end-exclusive. `node --test` checks the boundaries, the walk through every cue, the mouth rhythm, and rejection of gaps or empty fields.

The page plays that timeline from one button. While it plays, one audio file is the clock. The same time changes the character state, the expression request, the on-stage caption, and a mouth shape. Manual state or expression buttons cancel the beat and stop the voice.

The voice is `public/audio/guide-beat.wav`, rendered with espeak-ng's Mandarin voice from the four caption lines. Each line is followed by a short silence so the cue can finish cleanly. Mouth shapes use the VRM presets `aa`, `ih`, `ou`, `ee`, and `oh`. Each spoken character gets one open-close cycle. Punctuation does not open the mouth. This is speech rhythm, not a phoneme timeline aligned to the waveform.

## Bounded Conclusion

A character page can schedule behavior from one spoken script. The reusable unit is the cue, tied to a voice asset when one exists:

```text
script line
  -> voice duration
  -> state
  -> expression
  -> caption
  -> per-character mouth shape
```

This is enough to hear the guide, read the same words, and see the mouth open with the words. It is not enough to claim C4 cinematic quality. Gesture motion is still procedural sway, not an authored clip. A per-frame head offset was removed because it accumulated and twisted the neck. The mouth is not phoneme-accurate, and the voice is generated rather than performed.

## Skill Recommendation

`webgl-product-film` should treat a character request like this:

- if the page needs a speaking guide, require a script before camera timing;
- drive state, expression, captions, and mouth rhythm from that script;
- say clearly when the voice is generated, when mouth shapes are only per character, and when authored motion clips are still absent;
- do not send the task to the product-viewer route just because a 3D model is on screen.

The skill reference itself still lives outside this repository, so this note is the recommendation, not a skill-file edit.

## Still Open

- authored motion clips;
- phoneme-level lip sync against the waveform;
- a performed voice rather than a generated guide voice;
- Live2D runtime evidence;
- a product-specific character asset.
