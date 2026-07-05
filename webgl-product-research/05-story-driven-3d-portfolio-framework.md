# Story-Driven 3D Portfolio Framework

This document summarizes what we learned from comparing our prototypes with Samsy Ninja-style immersive portfolio websites.

## Core Conclusion

Our current prototype is not a mature Samsy Ninja-level website. It is a minimum viable model for generating a 3D portfolio or immersive product website.

The essential difference is:

```text
Our current prototype
  -> capability map
  -> nodes
  -> detail panels
  -> Film Mode script

Mature immersive portfolio
  -> brand story
  -> authored visual world
  -> memorable main object
  -> project proof
  -> directed emotional journey
```

So the reusable lesson is not "add more 3D." The lesson is:

```text
3D is the container.
Story is the organizing principle.
Assets create trust.
Interaction creates participation.
Film Mode makes the experience explainable.
```

## What We Have Validated

The `prototypes/game-portfolio-story/` demo validates the structural layer:

- A normal page can become a 3D scene.
- Content can become spatial nodes.
- A user can move, approach, and trigger content.
- Nodes can open detail layers.
- A guided path can explain the experience.
- Film Mode can act as a director script.
- Covers, publishing notes, and README guidance can be attached to the prototype.

This means the technical risk is no longer "can we build a 3D portfolio skeleton?" The remaining risk is quality:

- Is there a strong enough brand idea?
- Are the assets real enough?
- Is the story coherent?
- Does the camera guide attention?
- Does the page serve the content rather than distract from it?

## Samsy Ninja-Style Lessons We Can Reuse

We should not clone Samsy Ninja. We should reuse the product logic behind this class of site.

### 1. Start With Identity

Before building the scene, define:

- Who or what is being presented.
- What the viewer should remember.
- What emotional tone the site should create.
- What visual symbol represents the project.

Bad starting point:

```text
Make this page 3D.
```

Better starting point:

```text
Make this product feel like a futuristic research lab where each room proves one capability.
```

### 2. Turn Pages Into Places

Traditional website:

```text
Hero
  -> cards
  -> sections
  -> CTA
```

Immersive 3D website:

```text
World entrance
  -> route
  -> nodes / rooms / stations
  -> detail layers
  -> final memory point
```

### 3. Use DOM and WebGL for Different Jobs

WebGL should handle:

- spatial memory;
- models and atmosphere;
- camera and transitions;
- visual symbols;
- emotional impact.

DOM should handle:

- readable text;
- navigation;
- buttons;
- accessibility;
- detail panels;
- publishing and product information.

Do not put long explanations into 3D text.

### 4. Every Node Needs Proof

A node should not only say what it is. It should prove value through:

- a cover or screenshot;
- a real asset or model;
- a short outcome statement;
- a use case;
- a link to source, video, notes, or publishing output.

### 5. Film Mode Is a Story Tool, Not Just Recording Prep

Film Mode should define:

```text
opening
  -> why this exists
  -> capability 1
  -> capability 2
  -> capability 3
  -> synthesis
  -> next action
```

Recording can be added later. The director script is already useful because it makes the page explain itself.

## Input Template for Future 3D Website Generation

When asking Codex to generate a 3D portfolio, product site, or immersive showcase, provide this input:

```text
Project / brand name:

One-sentence identity:

Target viewer:

Emotional tone:

Visual world:

Main memorable object:

3-5 content nodes:
1.
2.
3.
4.
5.

For each node:
- title
- outcome
- asset or cover
- interaction
- detail content
- link or proof

Preferred navigation:
- scroll-driven
- free exploration
- guided tour
- mixed

Need Film Mode?
- yes / no

Need publishing package?
- README / cover / screenshots / video / captions / voiceover
```

## Current Prototype Status

`prototypes/game-portfolio-story/` is now useful as:

- a research hub;
- a 3D capability map;
- a game-like portfolio skeleton;
- a node/detail interaction test;
- a Film Mode script test;
- a publishing package scaffold.

It is not yet:

- a high-fidelity branded world;
- a final personal portfolio;
- a production-grade visual identity;
- a real-asset showcase;
- a replacement for custom art direction.

## Next Step Recommendation

Do not prioritize recording now. We already validated the recording path in the GrassSystemThreeJS work, and the current Film Mode can later connect to that pipeline.

The next useful step is:

```text
Upgrade webgl-product-film from "3D demo to film"
to "3D demo / immersive website / story-driven portfolio generator."
```

Recommended next actions:

1. Update the skill reference material with this story-driven portfolio framework.
2. Add an input brief template for future 3D website generation.
3. Create one real case using the template, not another abstract demo.
4. Replace generated SVG covers with real assets or Minimax-generated visual covers.
5. Only after the story and assets are strong, reconnect recording/export.

## Practical Decision

The current demo is enough as evidence for:

```text
3D portfolio skeleton generation
  -> yes

Node/detail/Film Mode workflow
  -> yes

High-end Samsy Ninja-level art direction
  -> not yet
```

So the project should now move from "Can we do this?" to:

```text
What story should this 3D website tell, and what real assets prove it?
```
