/**
 * assets/lesa-appkit.asciimtn (822KB) → src/assets/intro.json.
 * 셀 하나씩 <Text> 를 만들면 ink 노드가 1020 개라 행별 색 런으로 접는다.
 *
 * 원본 20줄 중 8줄이 바깥 `╔═╗` 테두리와 여백이다. 글자만 잘라내 13줄로 만든다 —
 * 배너가 화면을 덜 먹고, 프롬프트의 `╭─╮`·`│` 와 테두리 스타일이 부딪히지 않는다.
 *   node scripts/bake-intro.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = JSON.parse(fs.readFileSync(path.join(root, 'assets/lesa-appkit.asciimtn'), 'utf8'));

const { height, width } = project.canvas;
/** 글자만 남기는 범위(원본을 열어 확인한 값). 바깥 테두리 행·열을 버린다. */
const CROP = { x0: 2, x1: 49, y0: 3, y1: 15 };
const frameRate = project.timeline?.frameRate ?? 15;
const layer = project.layers?.find(item => item.visible !== false) ?? project.layers?.[0];

const frames = (layer.contentFrames ?? []).map(frame => {
  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: ' ', color: null })),
  );

  for (const [position, cell] of Object.entries(frame.data ?? {})) {
    const [x, y] = position.split(',').map(Number);
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    grid[y][x] = {
      char: cell.char ?? cell.character ?? ' ',
      color: cell.color ?? cell.foreground ?? cell.fg ?? null,
    };
  }

  const rows = grid.slice(CROP.y0, CROP.y1 + 1).map(full => {
    const row = full.slice(CROP.x0, CROP.x1 + 1);
    const runs = [];
    for (const cell of row) {
      const last = runs.at(-1);
      if (last && last[1] === cell.color) last[0] += cell.char;
      else runs.push([cell.char, cell.color]);
    }
    // 우측 공백 런은 버린다 — 터미널 폭을 덜 쓴다.
    while (runs.length && runs.at(-1)[1] === null && !runs.at(-1)[0].trim()) runs.pop();
    // 전부 비면 ink 가 그 줄을 아예 안 그린다 — 글자 사이 빈 줄이 필요하다.
    return runs.length ? runs : [[' ', null]];
  });

  return { ms: Math.round(((frame.durationFrames ?? 1) / frameRate) * 1000), rows };
});

const target = path.join(root, 'src/assets/intro.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(
  target,
  JSON.stringify({
    frames,
    height: CROP.y1 - CROP.y0 + 1,
    width: CROP.x1 - CROP.x0 + 1,
  }),
);

const runs = frames.reduce((sum, frame) => sum + frame.rows.reduce((n, row) => n + row.length, 0), 0);
console.log(`${frames.length} frames, ${runs} runs, ${fs.statSync(target).size} bytes → src/assets/intro.json`);
