import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const projectRoot = resolve(scriptDir, '..');
const downloadsDir = join(process.env.USERPROFILE || '', 'Downloads');
const ffmpeg = 'D:\\26project\\26audio_and_video_project\\ffmpeg-n6.1.3-win64-gpl-shared-6.1\\bin\\ffmpeg.exe';
const ffprobe = 'D:\\26project\\26audio_and_video_project\\ffmpeg-n6.1.3-win64-gpl-shared-6.1\\bin\\ffprobe.exe';

function latestRecordedWebm() {
  if (!existsSync(downloadsDir)) return null;
  const files = readdirSync(downloadsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^grasssystem-system-build-film-.*\.webm$/i.test(entry.name))
    .map((entry) => {
      const path = join(downloadsDir, entry.name);
      const stat = spawnSync('powershell', [
        '-NoProfile',
        '-Command',
        `(Get-Item -LiteralPath '${path.replace(/'/g, "''")}').LastWriteTimeUtc.Ticks`,
      ], { encoding: 'utf8' });
      return { path, ticks: Number(stat.stdout.trim() || 0) };
    })
    .sort((a, b) => b.ticks - a.ticks);
  return files[0]?.path || null;
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} failed\n${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function probeDuration(input) {
  const output = run(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nokey=1:noprint_wrappers=1',
    input,
  ]);
  const duration = Number(output);
  return Number.isFinite(duration) ? duration : null;
}

function secondsFromTimestamp(value) {
  const match = value.match(/(?:(\d+):)?(\d+):(\d+)[.,](\d+)/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const fraction = Number(`0.${match[4]}`);
  return hours * 3600 + minutes * 60 + seconds + fraction;
}

function fallbackDurationFromCaptions() {
  const vttPath = resolve(projectRoot, 'public', 'system-film-captions.vtt');
  if (!existsSync(vttPath)) return 50.63;
  const matches = [...readFileSync(vttPath, 'utf8').matchAll(/-->\s*([0-9:.,]+)/g)];
  const last = matches.at(-1)?.[1];
  const captionEnd = last ? secondsFromTimestamp(last) : null;
  return captionEnd ? captionEnd + 1.23 : 50.63;
}

function vttToSrt(vttText) {
  const blocks = vttText
    .replace(/^\uFEFF?WEBVTT[^\n]*\n+/i, '')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.trim().split(/\r?\n/);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    const timing = lines[timingIndex].replace(/\./g, ',');
    const text = lines.slice(timingIndex + 1).join('\n');
    return `${index + 1}\n${timing}\n${text}`;
  }).join('\n\n') + '\n';
}

function safeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

const input = process.argv[2] ? resolve(process.argv[2]) : latestRecordedWebm();
if (!input || !existsSync(input)) {
  throw new Error('No recorded WebM found. Pass a file path or record with Record System Film first.');
}
if (!existsSync(ffmpeg) || !existsSync(ffprobe)) {
  throw new Error('ffmpeg/ffprobe not found at the configured path.');
}

const outDir = resolve(projectRoot, 'publish', `system-film-${safeTimestamp()}`);
mkdirSync(outDir, { recursive: true });

const sourceCopy = join(outDir, 'source.webm');
const mp4Path = join(outDir, 'system-film-16x9.mp4');
const coverRaw = join(outDir, 'cover-raw.png');
const coverTitle = join(outDir, 'cover-title.png');
const srtPath = join(outDir, 'system-film-captions.srt');
const notesPath = join(outDir, 'publish-notes.md');

copyFileSync(input, sourceCopy);

const sourceDuration = probeDuration(input) || fallbackDurationFromCaptions();
const voicePath = resolve(projectRoot, 'public', 'system-film-voiceover.mp3');
const musicPath = resolve(projectRoot, 'public', 'system-film-music.mp3');
const hasPublishAudio = existsSync(voicePath) && existsSync(musicPath);
const baseVideoArgs = [
  '-vf', 'scale=1920:1080:flags=lanczos,fps=60,format=yuv420p',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '18',
  '-profile:v', 'high',
  '-level', '4.2',
  '-movflags', '+faststart',
];

if (hasPublishAudio) {
  const fadeOutStart = Math.max(0, sourceDuration - 2.5).toFixed(2);
  run(ffmpeg, [
    '-y',
    '-i', input,
    '-i', musicPath,
    '-i', voicePath,
    '-filter_complex',
    [
      `[1:a]atrim=0:${sourceDuration.toFixed(3)},asetpts=PTS-STARTPTS,volume=0.24,afade=t=in:st=0:d=3.2,afade=t=out:st=${fadeOutStart}:d=2.5[music]`,
      '[2:a]adelay=350|350,volume=0.95[voice]',
      '[music][voice]amix=inputs=2:duration=longest:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11[aout]',
    ].join(';'),
    '-map', '0:v:0',
    '-map', '[aout]',
    '-t', sourceDuration.toFixed(3),
    ...baseVideoArgs,
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    mp4Path,
  ]);
} else {
  run(ffmpeg, [
    '-y',
    '-i', input,
    ...baseVideoArgs,
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    mp4Path,
  ]);
}

const duration = probeDuration(mp4Path);
const coverTime = Math.max(3, Math.min(duration - 1.2, duration * 0.88)).toFixed(2);

run(ffmpeg, [
  '-y',
  '-ss', coverTime,
  '-i', mp4Path,
  '-frames:v', '1',
  '-vf', 'scale=1920:1080:flags=lanczos',
  coverRaw,
]);

// The recorded frame already contains the final in-video title overlay. Reuse it
// as the publish cover to avoid platform-font or ffmpeg text-encoding issues.
copyFileSync(coverRaw, coverTitle);

const vttPath = resolve(projectRoot, 'public', 'system-film-captions.vtt');
if (existsSync(vttPath)) {
  writeFileSync(srtPath, vttToSrt(readFileSync(vttPath, 'utf8')), 'utf8');
}

const notes = `# Three.js WebGL Grass System 发布包

## 输出文件

- 视频：system-film-16x9.mp4
- 封面：cover-title.png
- 无字封面：cover-raw.png
- 字幕：system-film-captions.srt
- 源文件备份：source.webm
- 音轨来源：${hasPublishAudio ? 'MiniMax 男声旁白 + MiniMax 背景音乐离线混音' : '源 WebM 音轨'}

## 视频规格

- 画幅：16:9
- 分辨率：1920x1080
- 帧率：60fps
- 视频编码：H.264
- 音频编码：AAC 192k
- 时长：${duration.toFixed(2)} 秒

## 推荐标题

用 Three.js 做了一个实时 GPU 草地系统

## 推荐简介

这是一个基于 Three.js 和 WebGL 的实时草地系统演示。场景结合了 GPU 实例化草叶、Shader 生长、局部苔藓、土壤材质、风场模拟、体积云和电影化镜头，用浏览器实时渲染出一个从无到有的 3D 生态场景。

## 标签

Three.js, WebGL, Shader, GPU渲染, 3D网页, 前端可视化, 草地系统, 实时渲染
`;

writeFileSync(notesPath, notes, 'utf8');

console.log(JSON.stringify({
  input,
  outDir,
  mp4Path,
  coverTitle,
  coverRaw,
  srtPath: existsSync(srtPath) ? srtPath : null,
  duration,
}, null, 2));
