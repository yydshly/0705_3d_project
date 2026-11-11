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

`GUIDE_BEAT` is a 12.4 second, four-cue script. The cues are contiguous. Lookup is start-inclusive and end-exclusive. `node --test` checks the boundaries, the walk through every cue, and rejection of gaps or empty fields.

The page plays that timeline from one button. While it plays, the same clock changes the character state, the expression request, and the on-stage caption. Manual state or expression buttons cancel the beat. There is no audio file and no viseme track.

## Bounded Conclusion

A character page can schedule behavior before a voice asset exists. The reusable unit is the cue, not a waveform:

```text
script line
  -> state
  -> expression
  -> caption
  -> later: audio duration and mouth shape
```

This is enough to review pacing and to see whether the character's job is readable. It is not enough to claim C4 cinematic quality. The sample VRM may not contain every requested expression, and the existing viewer already reports that fallback in the evidence panel. Gesture motion is still procedural sway, not an authored clip.

## Skill Recommendation

`webgl-product-film` should treat a character request like this:

- if the page needs a speaking guide, require a script before camera timing;
- drive state, expression, and captions from that script;
- say clearly when audio, lip sync, and motion clips are still absent;
- do not send the task to the product-viewer route just because a 3D model is on screen.

The skill reference itself still lives outside this repository, so this note is the recommendation, not a skill-file edit.

## Still Open

- authored motion clips;
- real speech audio and duration-fitted timing;
- lip sync or speech rhythm;
- Live2D runtime evidence;
- a product-specific character asset.
