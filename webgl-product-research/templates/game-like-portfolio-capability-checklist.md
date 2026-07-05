# Game-Like 3D Portfolio Capability Checklist

Use this checklist when evaluating or designing a 3D portfolio, product museum, AI tool showroom, or virtual exhibition.

## 1. Core Experience Choice

Decide the primary navigation model first:

```text
Scroll-driven story
  -> Best for linear product explanation, landing pages, cinematic reveal

Free exploration
  -> Best for portfolios, product collections, virtual showrooms, playful brand worlds

Hybrid
  -> Best when users need both a guided demo and optional exploration
```

Do not add physics or free movement unless it improves understanding or emotional engagement.

## 2. Spatial Structure

A good spatial portfolio needs a map, not just floating models.

Check for:

- Clear entry point.
- Recognizable zones or chapters.
- Landmarks that help orientation.
- A reason to move from one area to the next.
- A final or return point.

Useful mapping:

```text
project category -> zone
individual project -> board / booth / object
CTA or link -> interaction area
award / metric -> trophy / marker / label
about/contact -> terminal / room / character / sign
```

## 3. Navigation Entity

The user needs an embodied way to move.

Options:

- Vehicle: playful, game-like, good for portfolios.
- Character: personal, narrative, good for companion/IP/product guide.
- Camera path: cinematic, controlled, good for product launch.
- Cursor/object grab: practical, good for tools or product inspection.

Evaluate:

- Is movement easy to understand?
- Does the entity fit the product tone?
- Can non-technical users recover if lost?
- Is there a guided mode for passive viewing?

## 4. Camera Direction

The camera should explain the space.

Check for:

- Smooth follow target.
- Stable distance.
- Zoom controls or adaptive framing.
- Special camera angles for important zones.
- Avoidance of motion sickness.
- Debug controls separated from user controls.

Bad sign:

```text
The camera rotates because it can, not because it helps the user understand.
```

## 5. Interaction Areas

3D interaction should have visible affordances.

Check for:

- Hover/enter feedback.
- Clear trigger area.
- Label or icon in the 3D world.
- Sound or animation response.
- Deactivation/activation states.
- Links or actions that match user intent.

Interaction model:

```text
detect area
  -> show affordance
  -> user enters/clicks
  -> play feedback
  -> open content / change state / navigate
```

## 6. Asset Pipeline

High-quality spatial sites depend on organized assets.

Look for:

- GLB runtime models.
- Separate collision meshes.
- Compressed textures where needed.
- Shadow/floor textures.
- Matcaps or PBR materials.
- Audio folders grouped by interaction type.
- Clear naming between source assets and runtime assets.

Repository guidance:

- Commit runtime assets needed to run the web demo.
- Avoid committing heavy authoring sources unless the research explicitly studies modeling workflow.
- Document asset license and origin.

## 7. Physics Use

Physics should create meaningful interaction, not random chaos.

Good uses:

- Vehicle movement.
- Collision feedback.
- Pushable props.
- Jump, bounce, rolling objects.
- Spatial constraints.

Watch for:

- Users getting stuck.
- Camera losing the subject.
- Objects jittering.
- Controls feeling too sensitive.
- Physics making the story harder to understand.

## 8. Sound Feedback

Sound can make a 3D world feel responsive.

Useful categories:

- Engine or movement loop.
- Collision sounds.
- UI area enter/click.
- Reveal/start sound.
- Ambient bed.
- Special object sounds.

Keep sound optional or controlled. A research prototype can include sound, but a product version should respect mute/autoplay constraints.

## 9. Performance

Check early:

- Bundle size.
- Texture size.
- Number of draw calls.
- Post-processing cost.
- Physics step cost.
- Mobile fallback.
- Loading screen and progress.

A spatial page needs a stronger loading strategy than a normal landing page.

## 10. Reusable Output

After analysis, produce:

- Source evidence summary.
- Runtime verification notes.
- Capability map.
- What can be reused.
- What depends on custom assets.
- Whether to build a derivative prototype.

Bounded conclusion format:

```text
This pattern is reusable for ...
It requires ...
It is not suitable for ...
Next prototype should test ...
```
