import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GUIDE_BEAT,
  MOUTH_SHAPES,
  beatDuration,
  cueAt,
  cueIndexAt,
  isBeatComplete,
  mouthAt,
  spokenUnits,
  validateBeat,
} from './captionBeat.js';

test('guide beat is a contiguous spoken script', () => {
  assert.deepEqual(validateBeat(GUIDE_BEAT), []);
  assert.equal(beatDuration(GUIDE_BEAT), 34880);
  assert.equal(GUIDE_BEAT.cues.length, 4);
  assert.equal(GUIDE_BEAT.audio, '/audio/guide-beat.wav');
});

test('cue lookup follows the voice track boundaries', () => {
  assert.equal(cueAt(GUIDE_BEAT, 0)?.state, 'greet');
  assert.equal(cueAt(GUIDE_BEAT, 8827)?.caption, GUIDE_BEAT.cues[0].caption);
  assert.equal(cueAt(GUIDE_BEAT, 8828)?.state, 'explain');
  assert.equal(cueAt(GUIDE_BEAT, 17301)?.caption, GUIDE_BEAT.cues[2].caption);
  assert.equal(cueAt(GUIDE_BEAT, 26113)?.expression, 'neutral');
  assert.equal(cueAt(GUIDE_BEAT, 34879)?.state, 'think');
  assert.equal(cueAt(GUIDE_BEAT, 34880), null);
});

test('playback walks each cue once, then completes', () => {
  const seen = [];
  for (let elapsed = 0; elapsed < beatDuration(GUIDE_BEAT); elapsed += 400) {
    const index = cueIndexAt(GUIDE_BEAT, elapsed);
    if (seen.at(-1) !== index) seen.push(index);
    assert.equal(isBeatComplete(GUIDE_BEAT, elapsed), false);
  }

  assert.deepEqual(seen, [0, 1, 2, 3]);
  assert.equal(isBeatComplete(GUIDE_BEAT, 34880), true);
  assert.equal(cueIndexAt(GUIDE_BEAT, -1), -1);
  assert.equal(cueAt(GUIDE_BEAT, Number.NaN), null);
});

test('mouth opens once per spoken character and closes on punctuation-only text', () => {
  const cue = { start: 0, end: 1000, caption: '啊啊' };
  assert.deepEqual(spokenUnits('你好。'), ['你', '好']);
  assert.deepEqual(mouthAt(cue, 40), { shape: null, weight: 0 });
  assert.deepEqual(mouthAt(cue, 280), { shape: 'aa', weight: 0.9 });
  assert.equal(mouthAt(cue, 680).shape, 'ih');
  assert.ok(mouthAt(cue, 680).weight > 0.8);
  assert.deepEqual(mouthAt({ start: 0, end: 1000, caption: '。' }, 500), { shape: null, weight: 0 });
  assert.ok(MOUTH_SHAPES.includes(mouthAt(cue, 680).shape));
});

test('validateBeat rejects gaps, empty cues, and missing fields', () => {
  const broken = {
    id: 'broken',
    audio: '',
    cues: [
      { start: 0, end: 1000, state: 'idle', expression: 'neutral', caption: 'ok' },
      { start: 1200, end: 1200, state: '', expression: 'happy', caption: '   ' },
    ],
  };

  const errors = validateBeat(broken);
  assert.ok(errors.some((error) => error.includes('missing audio')));
  assert.ok(errors.some((error) => error.includes('not contiguous')));
  assert.ok(errors.some((error) => error.includes('no duration')));
  assert.ok(errors.some((error) => error.includes('missing state')));
  assert.ok(errors.some((error) => error.includes('missing caption')));
});
