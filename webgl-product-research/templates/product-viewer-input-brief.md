# Product Viewer Input Brief

Use this brief when generating a practical 3D product viewer page with `model-viewer` or a similar high-level viewer.

The goal is not to create a cinematic 3D world. The goal is:

```text
one product
  -> clear inspection
  -> useful annotations
  -> configuration options
  -> practical publishing page
```

## 1. Product Identity

Product name:

One-sentence product description:

Target viewer:

Primary page goal:

- understand product
- inspect details
- compare variants
- preview in AR
- purchase / contact / learn more

Tone:

- premium
- playful
- technical
- warm
- industrial
- futuristic

## 2. Model Asset

Model file:

- GLB:
- glTF:
- USDZ:
- other:

Model source / license:

Known asset issues:

- scale:
- origin:
- texture size:
- polygon count:
- missing materials:
- animation:

Fallback poster image:

## 3. Viewer Behavior

Default camera view:

Reset camera view:

Needed views:

1. Hero / whole product:
2. Front:
3. Side:
4. Detail:
5. Optional bottom/top/back:

User controls:

- rotate
- zoom
- pan
- auto rotate
- reset
- guided tour

## 4. Hotspots / Annotations

For each hotspot:

```text
Hotspot title:
Model area:
Position estimate:
What it explains:
Camera view after click:
Supporting copy:
```

Recommended hotspot count:

```text
3-5 hotspots for a product landing page.
```

Avoid:

- too many labels;
- long text inside the 3D area;
- labels that hide the product;
- technical terms without user value.

## 5. Configuration

Variants needed:

- color:
- material:
- texture:
- mesh:
- animation state:
- bundle / accessory:

Variant labels:

Business meaning:

- price changes:
- spec changes:
- use-case changes:

## 6. AR Requirements

Need AR:

- yes
- no
- later

Target devices:

- iOS Quick Look:
- Android Scene Viewer:
- WebXR:

Placement:

- tabletop
- floor
- wall
- free placement

Scale:

- fixed real-world scale
- user-adjustable

## 7. Page Content

Hero title:

Subtitle:

Main product promise:

3 supporting sections:

1.
2.
3.

Specs:

- dimensions:
- weight:
- materials:
- battery / power:
- connectivity:
- compatibility:

CTA:

- buy
- join waitlist
- contact
- view docs
- download model

## 8. Publishing / QA

Required outputs:

- running demo
- README
- model credits
- poster image
- screenshot
- video
- captions

Quality checks:

- product is visible at first load;
- mobile layout does not crop essential controls;
- hotspots are readable;
- camera reset works;
- material changes are reversible;
- model loading and failure states are acceptable;
- AR button appears only where meaningful.

## 9. When To Choose Another Pattern

Choose custom Three.js / R3F instead of `model-viewer` if:

- the product needs a whole world or environment;
- shader effects are the main value;
- multiple products form an explorable scene;
- physics, particles, or game-like interaction are required;
- the viewer needs unusual camera or input behavior.
