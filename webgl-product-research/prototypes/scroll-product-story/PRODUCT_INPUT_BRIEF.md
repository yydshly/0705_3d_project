# Product Input Brief

Use this brief when you want to turn an idea, product, personal project, or portfolio into a scroll-driven 3D product page.

The input does not need to be technical. It needs to clarify what should be shown, why it matters, and what kind of output you want.

## 1. What Are We Showing?

Describe the object or project.

Examples:

- AI note-taking tool
- desktop companion project
- smart hardware device
- personal portfolio
- game character or scene
- WebGL technical demo

Fill in:

```text
Project / product name:
What it is:
Who it is for:
Why it matters:
```

## 2. Core Capabilities Or Selling Points

List 3-5 points. These usually become scroll chapters.

Example:

```text
1. Real-time conversation
2. Long-term memory
3. Emotional feedback
4. Desktop interaction
5. Customizable character appearance
```

Fill in:

```text
1.
2.
3.
4.
5.
```

## 3. Story Direction

Choose one story shape or describe your own.

### Product Story

```text
Problem
  -> product appears
  -> key capability
  -> detail inspection
  -> final call to action
```

### Personal Portfolio

```text
identity
  -> selected work
  -> process
  -> technical ability
  -> contact / next step
```

### Character Or Companion

```text
character appears
  -> environment establishes mood
  -> interaction examples
  -> emotion / memory / customization
  -> final hero moment
```

Fill in:

```text
Preferred story shape:
Opening moment:
Middle reveal:
Final moment:
```

## 4. Visual Assets

Mark what already exists.

```text
Logo:
Product screenshots:
Product images:
3D model (.glb/.gltf):
Textures:
Reference images:
Brand colors:
Existing website or repo:
```

If no 3D model exists, the template can start with:

- procedural placeholder model;
- geometric product stand-in;
- layered screenshots in 3D space;
- generated concept asset for later replacement;
- simple GLB found or created later.

## 5. Desired Visual Style

Choose or describe.

```text
Technology / premium
Warm / healing
SaaS / professional
Game-like / expressive
Cyberpunk / neon
Natural / ecological
Minimal / editorial
Luxury / product launch
```

Fill in:

```text
Style:
Mood:
Colors to use:
Colors to avoid:
References:
```

## 6. Output Target

Choose one or more.

```text
Interactive webpage only
Webpage + Film Mode
Webpage + publishable video
Product landing page
Personal portfolio
Social media short video
Technical explanation page
Internal demo
```

Fill in:

```text
Primary output:
Secondary output:
Target platform:
Preferred duration if video:
Aspect ratio if video:
```

## 7. Implementation Constraints

```text
Must run locally:
Must be deployable:
Mobile support required:
Need recording/export:
Need Chinese captions:
Need voiceover:
Need background music:
Need real GLB model:
Can use generated assets:
```

## 8. Example Filled Brief

```text
Project / product name: Desktop Companion
What it is: An AI companion that lives on the desktop and reacts to the user.
Who it is for: People who want a warmer personal AI interface.
Why it matters: It turns AI from a chat box into a persistent presence.

Core capabilities:
1. Real-time conversation
2. Long-term memory
3. Emotion feedback
4. Desktop interaction
5. Character customization

Story shape:
character appears -> room mood -> interaction examples -> memory/emotion -> final hero moment

Assets:
No GLB yet. Use a procedural character and desktop scene first.

Style:
Warm, light sci-fi, calm, personal, not dark cyberpunk.

Output:
Scroll-driven 3D webpage first, then a 60-second publishable video.
```

## How This Brief Maps To The Template

```text
Product name
  -> hero title and page identity

Core capabilities
  -> chapters array in src/App.jsx

Story direction
  -> chapter order and Film Mode timing

Visual assets
  -> 3D model, textures, screenshots, or procedural placeholders

Visual style
  -> src/styles.css, lighting, materials, camera tone

Output target
  -> interactive page, Film Mode, recording, subtitles, voiceover, publishing package
```
