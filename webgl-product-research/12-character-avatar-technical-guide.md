# Character / Avatar Technical Guide

This guide explains the character display layer that sits between a normal 3D product viewer and a real character-led product experience.

The goal is not to make AI companion the project mainline. The goal is to understand the reusable capability behind AI companions, virtual guides, mascots, presenters, NPCs, and character-driven product pages.

## Core Idea

A character is not only a mesh.

```text
character experience
  = identity
  + asset format
  + rig / expressions
  + motion clips
  + runtime loader
  + behavior state
  + voice / captions
  + scene integration
```

This is why a simple GLB object can look acceptable as a product model, but feel lifeless as a companion or guide.

For a character, the viewer expects:

- idle motion;
- breathing or body micro-motion;
- eye blink and gaze;
- facial expression changes;
- gesture timing;
- lip-sync or speech rhythm;
- stable grounding and scale;
- a consistent role in the product story.

## Four Practical Routes

| Route | Best For | What It Provides | Main Risk |
| --- | --- | --- | --- |
| VRM | 3D humanoid avatar in a Three.js / R3F scene | A glTF-based humanoid avatar convention with humanoid bones, expressions, look-at, and runtime support through libraries such as `@pixiv/three-vrm` | Needs good avatar asset quality, motion retargeting, expression tuning, and performance checks |
| Live2D | 2D illustrated companion, anime-style UI character, desktop assistant | Cubism model display, expressions, breathing, lip-sync, physics, pose, motion, and Web SDK integration | It is not real 3D navigation; quality depends on authored layered model and parameters |
| Ready Player Me | Fast avatar creation and cross-platform identity | Hosted avatar creator and integration paths for web, React, Unity, Unreal, and APIs | Service, license, style, customization, and product fit must be checked |
| Plain GLB / glTF | Mascot, object-like character, stylized creature, non-human product figure | General 3D asset display, custom animations if authored | No standard humanoid expression contract unless the model is rigged and documented |

## When To Choose Which

Choose VRM when:

- the character should stand inside a 3D scene;
- the user expects camera orbit, gestures, gaze, and body movement;
- the product is a virtual guide, avatar, AI companion, 3D host, or embodied assistant;
- future work may add voice, lip sync, and expression switching.

Choose Live2D when:

- the product wants a 2D illustrated character rather than a 3D world character;
- facial expression and idle personality matter more than walking through a 3D space;
- the character lives as a desktop companion, sidebar guide, overlay assistant, or streamer-like presenter.

Choose Ready Player Me when:

- the project needs a quick generated avatar route;
- users should create or customize avatars;
- cross-app or game-style identity is more important than fully bespoke art direction.

Choose plain GLB when:

- the character is a mascot object, robot, toy, device, or non-human figure;
- the model already includes proper animation clips;
- humanoid standards are not required.

## Implementation Layers

### 1. Asset Intake

Collect the asset before designing the page.

Required inputs:

- asset format: `.vrm`, `.glb`, `.gltf`, Live2D `.model3.json` / `.moc3`, or hosted avatar;
- license and source;
- target visual style;
- body proportions and scale;
- available animation clips;
- expression or blendshape list;
- texture size and material setup;
- expected platform: website, desktop app, video, game-like page, or product demo.

If the user only has an image, the correct answer is not "just load it into Three.js." The project needs an asset creation route first: model generation, artist-made model, avatar platform, scanning, or 2D Live2D authoring.

### 2. Runtime Loader

The runtime route should match the asset:

```text
VRM
  -> Three.js / GLTFLoader
  -> VRMLoaderPlugin
  -> VRM object
  -> update loop for look-at, expressions, spring bones, motions

Live2D
  -> Cubism Web SDK / framework
  -> model settings
  -> expression / motion / physics / lip-sync update

Plain GLB
  -> Three.js / R3F GLTFLoader
  -> AnimationMixer
  -> custom clips / morph targets / material controls

Ready Player Me
  -> avatar creator or API
  -> generated avatar URL / GLB
  -> Three.js / R3F display and animation layer
```

### 3. Behavior State

Characters need state. A useful first state machine is:

```text
idle
  -> greet
  -> explain
  -> point
  -> think
  -> react
  -> return to idle
```

Each state should define:

- body animation;
- facial expression;
- gaze target;
- optional voice line;
- caption text;
- camera relationship;
- trigger condition.

Without this layer, the character is technically loaded but not meaningfully alive.

### 4. Voice And Captions

Voice is not a separate polish item for character-led pages.

It affects:

- motion timing;
- mouth movement;
- subtitle segmentation;
- camera holds;
- gesture beats;
- perceived personality.

For a video or guided site, write the voice script before final camera timing.

### 5. Scene Integration

A character should have a job in the scene:

- explain a product;
- guide a visitor through a portfolio;
- introduce research nodes;
- react to a scanned room or digital twin;
- demonstrate an AI agent workflow;
- act as a branded mascot.

If the character has no job, it becomes decoration and will feel weaker than a simpler product viewer.

## Quality Levels

| Level | Meaning | Typical Output |
| --- | --- | --- |
| C0 Missing | No usable character asset | Only concept text exists |
| C1 Placeholder | Simple model or billboard | Can test layout, cannot judge product quality |
| C2 Inspectable | Loads correctly, basic camera/control works | Good for internal technical test |
| C3 Presentable | Correct scale, lighting, idle motion, expressions | Suitable for prototype review |
| C4 Cinematic | Directed gestures, voice/caption timing, polished materials | Suitable for publishable demo |
| C5 Production | Optimized, licensed, responsive, fallback-ready | Suitable for real product use |

Most early demos fail because they stop at C1 or C2 while expecting a C4 reaction.

## Relationship To This Workspace

This capability fills the P1 gap after:

- real asset pipeline;
- 3D Gaussian Splatting / real-scene display;
- product viewer and cinematic product showcase;
- story-driven 3D portfolio prototype.

It connects to existing branches like this:

```text
desktop companion story
  -> needs character asset and behavior state

story-driven 3D portfolio
  -> can use a guide / presenter character

3DGS real-scene viewer
  -> can add avatar guide inside a scanned scene

cinematic product showcase
  -> can add presenter gestures or character-led explanation
```

## Recommended Next Step

Do not build a character page from theory alone.

The next useful prototype should be isolated:

```text
webgl-product-research/prototypes/avatar-character-viewer/
```

Minimum target:

- one real or clearly sourced character asset;
- idle animation;
- expression switch;
- camera orbit;
- voice/caption hook;
- quality checklist result.

If no reliable asset is available, start with the templates first and mark the prototype as blocked by asset quality rather than hiding the gap with placeholder geometry.
