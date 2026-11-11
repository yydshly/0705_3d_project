export const GUIDE_BEAT = {
  id: 'avatar-route-guide',
  title: 'VRM 运行时导览',
  cues: [
    {
      start: 0,
      end: 2800,
      state: 'greet',
      expression: 'happy',
      caption: '你好。我是这页的角色导览，不是一个普通产品模型。',
    },
    {
      start: 2800,
      end: 6200,
      state: 'explain',
      expression: 'relaxed',
      caption: '这条路线是 VRM，经 GLTFLoader 和 VRMLoaderPlugin 进入 Three.js。',
    },
    {
      start: 6200,
      end: 9600,
      state: 'explain',
      expression: 'happy',
      caption: '表情、视线和字幕按同一条时间轴切换，先于真实语音。',
    },
    {
      start: 9600,
      end: 12400,
      state: 'think',
      expression: 'neutral',
      caption: '真实口型和动作 clip 还没接入。这一拍只证明字幕钩子。',
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

export function validateBeat(beat) {
  const errors = [];
  if (!beat?.id) errors.push('missing id');
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
