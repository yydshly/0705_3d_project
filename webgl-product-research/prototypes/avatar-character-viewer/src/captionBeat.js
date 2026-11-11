export const MOUTH_SHAPES = ['aa', 'ih', 'ou', 'ee', 'oh'];
const SPOKEN = /[\p{Script=Han}A-Za-z0-9]/u;
const MOUTH_LEAD_MS = 80;
const MOUTH_TAIL_MS = 120;

export const GUIDE_BEAT = {
  id: 'avatar-route-guide',
  title: 'VRM 运行时导览',
  audio: '/audio/guide-beat.wav',
  cues: [
    {
      start: 0,
      end: 8828,
      state: 'greet',
      expression: 'happy',
      caption: '你好。我是这页的角色导览，不是一个普通产品模型。',
    },
    {
      start: 8828,
      end: 17301,
      state: 'explain',
      expression: 'relaxed',
      caption: '这条路线是 VRM，经 GLTFLoader 和 VRMLoaderPlugin 进入 Three.js。',
    },
    {
      start: 17301,
      end: 26113,
      state: 'explain',
      expression: 'happy',
      caption: '这句有声音。嘴型按每个字开合，跟着字幕走。',
    },
    {
      start: 26113,
      end: 34880,
      state: 'think',
      expression: 'neutral',
      caption: '身体还是程序在摆动，没有单独制作的动作片段。',
    },
  ],
};

export function beatDuration(beat) {
  return beat.cues.reduce((max, cue) => Math.max(max, cue.end), 0);
}

export function cueAt(beat, elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return null;
  return beat.cues.find((cue) => elapsedMs >= cue.start && elapsedMs < cue.end) ?? null;
}

export function cueIndexAt(beat, elapsedMs) {
  const cue = cueAt(beat, elapsedMs);
  if (!cue) return -1;
  return beat.cues.indexOf(cue);
}

export function isBeatComplete(beat, elapsedMs) {
  return Number.isFinite(elapsedMs) && elapsedMs >= beatDuration(beat);
}

export function spokenUnits(caption) {
  return [...caption].filter((character) => SPOKEN.test(character));
}

export function mouthAt(cue, elapsedMs) {
  const closed = { shape: null, weight: 0 };
  if (!cue || !Number.isFinite(elapsedMs)) return closed;

  const local = elapsedMs - cue.start;
  const duration = cue.end - cue.start;
  if (local < MOUTH_LEAD_MS || local > duration - MOUTH_TAIL_MS) return closed;

  const units = spokenUnits(cue.caption);
  if (units.length === 0) return closed;

  const speakDuration = Math.max(duration - MOUTH_LEAD_MS - MOUTH_TAIL_MS, 1);
  const slice = speakDuration / units.length;
  const position = local - MOUTH_LEAD_MS;
  const index = Math.min(units.length - 1, Math.floor(position / slice));
  const phase = (position - index * slice) / slice;

  return {
    shape: MOUTH_SHAPES[index % MOUTH_SHAPES.length],
    weight: Math.sin(Math.PI * phase) * 0.9,
  };
}

export function validateBeat(beat) {
  const errors = [];
  if (!beat?.id) errors.push('missing id');
  if (typeof beat?.audio !== 'string' || beat.audio.trim() === '') errors.push('missing audio');
  if (!Array.isArray(beat?.cues) || beat.cues.length === 0) {
    errors.push('beat has no cues');
    return errors;
  }

  let expectedStart = 0;
  for (const cue of beat.cues) {
    if (cue.start !== expectedStart) {
      errors.push(`cue at ${cue.start} is not contiguous; expected ${expectedStart}`);
    }
    if (!(cue.end > cue.start)) {
      errors.push(`cue at ${cue.start} has no duration`);
    }
    for (const field of ['state', 'expression', 'caption']) {
      if (typeof cue[field] !== 'string' || cue[field].trim() === '') {
        errors.push(`cue at ${cue.start} is missing ${field}`);
      }
    }
    expectedStart = cue.end;
  }

  return errors;
}
