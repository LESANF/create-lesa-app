/**
 * assets/lesa-appkit.asciimtn (822KB) → src/assets/intro.json (56KB).
 * 셀 하나씩 <Text> 를 만들면 ink 노드가 1020 개라 행별 색 런으로 접는다.
 *   node scripts/bake-intro.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = JSON.parse(fs.readFileSync(path.join(root, 'assets/lesa-appkit.asciimtn'), 'utf8'));

const { height, width } = project.canvas;
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

  const rows = grid.map(row => {
    const runs = [];
    for (const cell of row) {
      const last = runs.at(-1);
      if (last && last[1] === cell.color) last[0] += cell.char;
      else runs.push([cell.char, cell.color]);
    }
    // 우측 공백 런은 버린다 — 터미널 폭을 덜 쓴다.
    while (runs.length && runs.at(-1)[1] === null && !runs.at(-1)[0].trim()) runs.pop();
    return runs;
  });

  return { ms: Math.round(((frame.durationFrames ?? 1) / frameRate) * 1000), rows };
});

const target = path.join(root, 'src/assets/intro.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify({ frames, height, width }));

const runs = frames.reduce((sum, frame) => sum + frame.rows.reduce((n, row) => n + row.length, 0), 0);
console.log(`${frames.length} frames, ${runs} runs, ${fs.statSync(target).size} bytes → src/assets/intro.json`);
