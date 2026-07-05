# Asset Credits

This prototype now uses a real animated GLB companion character for the visible in-scene character. A generated transparent image and the earlier procedural/local model are retained as reference or fallback assets for future character passes.

## RobotExpressive.glb

- Source: three.js examples, `examples/models/gltf/RobotExpressive/RobotExpressive.glb`
- Upstream repository: https://github.com/mrdoob/three.js
- Model README: https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/README.md
- License stated by upstream README: CC0 1.0
- Usage in this project: active visible companion model. The scroll story maps product stages to its built-in animations such as `Wave`, `Yes`, `ThumbsUp`, and `Sitting`.

The original local model is kept at `public/models/desktop-companion.glb` as a fallback/reference asset.

## companion-character.png

- Source: generated in Codex image generation during this prototype iteration.
- Prompt intent: stylized 3D desktop AI companion character, cream shell, teal/pink emissive accents, waving pose.
- Processing: generated on a flat chroma-key background, then converted to transparency with the local `remove_chroma_key.py` helper.
- Usage in this project: retained reference asset. The current stable page uses the animated `RobotExpressive.glb` model instead of this image layer.
- Files:
  - `public/images/companion-character-source.png`
  - `public/images/companion-character.png`
