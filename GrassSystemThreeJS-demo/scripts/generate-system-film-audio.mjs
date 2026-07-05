import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const publicDir = resolve(projectRoot, 'public');
const desktopEnvPath = 'D:\\claude_code\\20260628_桌面女友\\desktop-girlfriend\\.env';

const narrationText = [
  '这是一个实时 WebGL 草地系统。',
  '土壤先出现，废弃汽车落在地面上。',
  '苔藓在潮湿阴影处生长，草叶从不均匀的区域逐渐铺开。',
  '数千根草叶由 GPU 实例化渲染，密度、高度和风向都由参数控制。',
  '风场推动草、云和光影一起变化，形成一个完整的实时三维场景。',
  '这就是 Three.js 和 WebGL 可以表达的产品级沉浸式展示能力。',
].join('<#0.55#>');

const musicPrompt = [
  'cinematic documentary instrumental background music for a real-time 3D WebGL grass system demo',
  'gentle piano motif, warm strings, soft organic percussion, airy texture',
  'hopeful, natural, elegant, immersive technology showcase',
  'no vocal, no lyrics, no heavy bass drone, no dark rumble, no aggressive beat',
  'slow build over 40 seconds, smooth transitions, suitable for narration',
].join(', ');

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

const desktopEnv = parseEnvFile(desktopEnvPath);

function configValue(name, fallback = '') {
  return process.env[name] || desktopEnv[name] || fallback;
}

function apiKey() {
  return (
    process.env.SYSTEM_FILM_MINIMAX_API_KEY ||
    process.env.MINIMAX_TTS_API_KEY ||
    process.env.MINIMAX_API_KEY ||
    desktopEnv.MINIMAX_TTS_API_KEY ||
    desktopEnv.MINIMAX_API_KEY ||
    ''
  ).trim();
}

function decodeAudioPayload(data, outputFormat) {
  const result = data?.data || data || {};
  const audio = result.audio || result.audio_url || result.url;
  if (!audio || typeof audio !== 'string') {
    throw new Error(`MiniMax response missing audio payload: ${JSON.stringify(data).slice(0, 300)}`);
  }
  if (audio.startsWith('http://') || audio.startsWith('https://')) {
    return { url: audio };
  }
  const trimmed = audio.trim();
  if (outputFormat === 'hex' || /^[0-9a-fA-F]+$/.test(trimmed)) {
    return { bytes: Buffer.from(trimmed, 'hex') };
  }
  return { bytes: Buffer.from(trimmed, 'base64') };
}

async function writeAudioFromResponse(data, outputPath, outputFormat) {
  const payload = decodeAudioPayload(data, outputFormat);
  if (payload.url) {
    const response = await fetch(payload.url);
    if (!response.ok) throw new Error(`MiniMax audio download failed: HTTP ${response.status}`);
    writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
    return;
  }
  writeFileSync(outputPath, payload.bytes);
}

function assertMiniMaxOk(data, label) {
  const status = data?.base_resp?.status_code;
  if (status !== undefined && status !== 0) {
    throw new Error(`${label} generation failed: ${JSON.stringify(data).slice(0, 500)}`);
  }
}

async function postJson(url, payload, key, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

async function generateVoiceover(key) {
  const baseUrl = configValue('SYSTEM_FILM_TTS_BASE_URL', configValue('MINIMAX_TTS_BASE_URL', 'https://api.minimaxi.com')).replace(/\/$/, '');
  const path = configValue('SYSTEM_FILM_TTS_PATH', configValue('MINIMAX_TTS_PATH', '/v1/t2a_v2'));
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const outputFormat = configValue('SYSTEM_FILM_TTS_OUTPUT_FORMAT', 'hex');
  const payload = {
    model: configValue('SYSTEM_FILM_TTS_MODEL', configValue('MINIMAX_TTS_MODEL', 'speech-2.8-hd')),
    text: narrationText,
    stream: false,
    voice_setting: {
      voice_id: configValue('SYSTEM_FILM_TTS_VOICE_ID', 'male-qn-jingying'),
      speed: Number(configValue('SYSTEM_FILM_TTS_SPEED', '0.8')),
      vol: Number(configValue('SYSTEM_FILM_TTS_VOLUME', '1.0')),
      pitch: Number(configValue('SYSTEM_FILM_TTS_PITCH', '-2')),
      emotion: configValue('SYSTEM_FILM_TTS_EMOTION', 'calm'),
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: 'mp3',
      channel: 1,
    },
    subtitle_enable: false,
    output_format: outputFormat,
    aigc_watermark: false,
    language_boost: 'Chinese',
  };
  const groupId = configValue('SYSTEM_FILM_MINIMAX_GROUP_ID', configValue('MINIMAX_TTS_GROUP_ID', configValue('MINIMAX_GROUP_ID', '')));
  if (groupId && baseUrl.includes('minimax.chat')) payload.group_id = groupId;

  const data = await postJson(url, payload, key, 180000);
  assertMiniMaxOk(data, 'TTS');
  await writeAudioFromResponse(data, resolve(publicDir, 'system-film-voiceover.mp3'), outputFormat);
}

async function generateMusic(key) {
  const baseUrl = configValue('SYSTEM_FILM_MUSIC_BASE_URL', 'https://api.minimaxi.com').replace(/\/$/, '');
  const outputFormat = configValue('SYSTEM_FILM_MUSIC_OUTPUT_FORMAT', 'hex');
  const payload = {
    model: configValue('SYSTEM_FILM_MUSIC_MODEL', 'music-2.6'),
    prompt: configValue('SYSTEM_FILM_MUSIC_PROMPT', musicPrompt),
    stream: false,
    output_format: outputFormat,
    aigc_watermark: false,
    lyrics_optimizer: false,
    is_instrumental: true,
    audio_setting: {
      sample_rate: 44100,
      bitrate: 256000,
      format: 'mp3',
    },
  };
  const data = await postJson(`${baseUrl}/v1/music_generation`, payload, key, 600000);
  assertMiniMaxOk(data, 'Music');
  await writeAudioFromResponse(data, resolve(publicDir, 'system-film-music.mp3'), outputFormat);
}

async function main() {
  mkdirSync(publicDir, { recursive: true });
  const key = apiKey();
  if (!key) {
    throw new Error('Missing MiniMax API key. Set SYSTEM_FILM_MINIMAX_API_KEY, MINIMAX_TTS_API_KEY, or MINIMAX_API_KEY.');
  }

  const mode = process.argv[2] || 'all';
  if (mode === 'all' || mode === 'voiceover') {
    console.log('Generating MiniMax male Chinese voiceover...');
    await generateVoiceover(key);
    console.log('Voiceover saved to public/system-film-voiceover.mp3');
  }
  if (mode === 'all' || mode === 'music') {
    console.log('Generating MiniMax instrumental background music...');
    await generateMusic(key);
    console.log('Music saved to public/system-film-music.mp3');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
