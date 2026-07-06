# Avatar / Character Motion Evidence Note

Date: 2026-07-06

This note records the first evidence chain for the P1 Avatar / VRM / Live2D / character motion gap.

## Why This Matters

Earlier prototypes proved several 3D Web patterns:

- shader vegetation and technical film;
- scroll-driven DOM + WebGL websites;
- game-like 3D portfolio nodes;
- practical product model viewing;
- cinematic product animation;
- 3DGS real-scene display.

The missing layer is character embodiment. AI companion, desktop assistant, virtual guide, mascot, and presenter pages need more than a model viewer.

## Source Evidence

### VRM

Official VRM documentation describes VRM as a 3D humanoid avatar file format for VR. This positions VRM as an avatar format, not just a generic model file.

Source:

```text
https://vrm.dev/en/
```

### three-vrm

The `@pixiv/three-vrm` project is a Three.js route for using VRM assets in the browser. Its README shows the practical entry shape:

```text
Three.js
  -> GLTFLoader
  -> VRMLoaderPlugin
  -> VRM runtime object
```

The project also documents installation through npm with `three` and `@pixiv/three-vrm`.

Source:

```text
https://github.com/pixiv/three-vrm
```

### Live2D Cubism Web

The Live2D Cubism Web samples describe a browser sample implementation for displaying models output by Live2D Cubism Editor. The sample project is used with the Cubism Web Framework and Cubism Core, and the Core binary is downloaded from the official SDK rather than managed directly in that repository.

Source:

```text
https://github.com/Live2D/CubismWebSamples
```

The Live2D SDK manual lists character runtime features such as:

- automatic eye blinking;
- breath;
- lip sync;
- physics;
- pose;
- motion;
- expression motion.

Source:

```text
https://docs.live2d.com/en/cubism-sdk-manual/top/
```

### Ready Player Me

Ready Player Me documents itself as a cross-game avatar platform with integration paths for Unity, Unreal, and web stacks. Its docs expose web, React, API, Avatar Creator, customization, and custom asset routes.

Source:

```text
https://docs.readyplayer.me/ready-player-me/
```

## Bounded Conclusion

Character display should be routed as its own capability branch.

It should not be treated as:

```text
normal GLB product viewer + idle rotation
```

The minimum reusable model is:

```text
asset format
  -> rig / expressions
  -> motion
  -> runtime loader
  -> behavior state
  -> voice / captions
  -> scene role
```

## Route Decision

| User Goal | Recommended Route |
| --- | --- |
| 3D humanoid avatar in a Three.js scene | VRM / three-vrm |
| 2D expressive companion or desktop assistant | Live2D Cubism Web |
| Fast generated avatar for product validation | Ready Player Me |
| Mascot object or stylized product character | GLB / glTF with authored animations |

## Relationship To Current Skill

`webgl-product-film` should learn:

- requests involving AI companion, avatar, virtual guide, presenter, Live2D, VRM, mascot, or character-led websites need a character route;
- asset quality should be checked before building a character demo;
- character quality depends on rigging, expressions, motion, voice timing, and behavior state;
- a character can support existing branches such as immersive websites, product films, story-driven portfolios, and real-scene viewers.

## Next Evidence Needed

The next evidence should be runtime evidence:

```text
prototype/avatar-character-viewer
  -> load one real VRM, Live2D, or GLB character asset
  -> switch expression
  -> play idle / gesture
  -> attach caption / voice hook
  -> document quality level
```

If no real asset is available, do not fake the conclusion with placeholder geometry. Mark the prototype as asset-blocked and use the input brief to collect or generate a suitable character asset.
