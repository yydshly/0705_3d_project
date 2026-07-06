# Character Display Checklist

Use this checklist to judge whether a character/avatar demo is ready for review, publishing, or production.

## Route Check

| Question | Yes / No | Notes |
| --- | --- | --- |
| Is this a character problem rather than a normal product model problem? | | |
| Is the route chosen: VRM, Live2D, Ready Player Me, or GLB? | | |
| Is the asset source and license known? | | |
| Is the target output clear: website, video, desktop, product page, or game-like scene? | | |

## Asset Quality

| Check | Pass / Fail | Notes |
| --- | --- | --- |
| Character loads without errors | | |
| Scale and body proportions look correct | | |
| Character is grounded, not floating or sinking | | |
| Materials and textures are not placeholder-level | | |
| Face / head readability works at normal camera distance | | |
| File size is reasonable for target platform | | |
| Mobile constraints are considered | | |

## Rig And Expression

| Check | Pass / Fail | Notes |
| --- | --- | --- |
| Skeleton / rig is usable | | |
| Idle pose is natural | | |
| Blink works or is intentionally absent | | |
| Gaze / look-at works or is intentionally absent | | |
| Basic expressions can switch | | |
| Expression names are documented | | |
| Morph targets or blendshapes are known | | |

## Motion

| Check | Pass / Fail | Notes |
| --- | --- | --- |
| Idle motion exists | | |
| Motion speed feels natural | | |
| Gesture timing matches scene beats | | |
| Transitions between states are not abrupt | | |
| Animation loops do not visibly pop | | |
| Motion does not break grounding | | |

## Voice And Caption

| Check | Pass / Fail | Notes |
| --- | --- | --- |
| Script is written before final timing | | |
| Voice duration fits camera pacing | | |
| Captions are readable | | |
| Lip sync or speech rhythm is handled if needed | | |
| Character gesture beats align with important lines | | |

## Scene Role

| Check | Pass / Fail | Notes |
| --- | --- | --- |
| Character has a clear job in the page or film | | |
| Character points attention to useful content | | |
| DOM text and character action do not fight each other | | |
| Camera framing supports the character role | | |
| The scene still works without constant character movement | | |

## Quality Level

| Level | Meaning | Status |
| --- | --- | --- |
| C0 Missing | No usable character asset | |
| C1 Placeholder | Can test placement only | |
| C2 Inspectable | Loads correctly with basic camera/control | |
| C3 Presentable | Correct scale, lighting, idle motion, expressions | |
| C4 Cinematic | Directed gestures, voice/caption timing, polished scene | |
| C5 Production | Optimized, licensed, fallback-ready | |

## Route-Specific Checks

### VRM

- Verify `GLTFLoader` and `VRMLoaderPlugin` route.
- Check humanoid bones, expression manager, look-at behavior, spring bones, and update loop.
- Confirm motions can be retargeted or authored for the avatar.

### Live2D

- Verify Cubism model files and runtime dependencies.
- Check eye blink, breath, expression, motion, physics, and lip-sync needs.
- Confirm the model is intended for the current Cubism SDK version.

### Ready Player Me

- Verify avatar creator or generated avatar URL.
- Check customization, style fit, export route, and license terms.
- Confirm whether the generated asset can be used in the target product or video.

### Plain GLB / glTF

- Check animation clips with `AnimationMixer`.
- Check morph targets if facial expression is required.
- Confirm whether it is a mascot/object character rather than a humanoid avatar.

## Decision

```text
Current quality level:
Main blocker:
Recommended next action:
Can publish now?
  [ ] yes
  [ ] no
```
