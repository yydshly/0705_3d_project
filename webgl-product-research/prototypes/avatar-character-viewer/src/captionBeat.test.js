import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GUIDE_BEAT,
  beatDuration,
  cueAt,
  cueIndexAt,
  isBeatComplete,
  validateBeat,
} from './captionBeat.js';

test('guide beat is a contiguous authored script', () => {
  assert.deepEqual(validateBeat(GUIDE_BEAT), []);
  assert.equal(beatDuration(GUIDE_BEAT), 12400);
  assert.equal(GUIDE_BEAT.cues.length, 4);
});

test('cue lookup is start-inclusive and end-exclusive', () => {
  assert.equal(cueAt(GUIDE_BEAT, 0)?.state, 'greet');
  assert.equal(cueAt(GUIDE_BEAT, 2799)?.caption, GUIDE_BEAT.cues[0].caption);
  assert.equal(cueAt(GUIDE_BEAT, 2800)?.state, 'explain');
  assert.equal(cueAt(GUIDE_BEAT, 9600)?.expression, 'neutral');
  assert.equal(cueAt(GUIDE_BEAT, 12399)?.state, 'think');
  assert.equal(cueAt(GUIDE_BEAT, 12400), null);
});

test('playback walks each cue once, then completes', () => {
  const seen = [];
  for (let elapsed = 0; elapsed < beatDuration(GUIDE_BEAT); elapsed += 200) {
    const index = cueIndexAt(GUIDE_BEAT, elapsed);
    if (seen.at(-1) !== index) seen.push(index);
    assert.equal(isBeatComplete(GUIDE_BEAT, elapsed), false);
  }

  assert.deepEqual(seen, [0, 1, 2, 3]);
  assert.equal(isBeatComplete(GUIDE_BEAT, 12400), true);
  assert.equal(cueIndexAt(GUIDE_BEAT, -1), -1);
  assert.equal(cueAt(GUIDE_BEAT, Number.NaN), null);
});

test('validateBeat rejects gaps, empty cues, and missing fields', () => {
  const broken = {
    id: 'broken',
    cues: [
      { start: 0, end: 1000, state: 'idle', expression: 'neutral', caption: 'ok' },
      { start: 1200, end: 1200, state: '', expression: 'happy', caption: '   ' },
    ],
  };

  const errors = validateBeat(broken);
  assert.ok(errors.some((error) => error.includes('not contiguous')));
  assert.ok(errors.some((error) => error.includes('no duration')));
  assert.ok(errors.some((error) => error.includes('missing state')));
  assert.ok(errors.some((error) => error.includes('missing caption')));
});
