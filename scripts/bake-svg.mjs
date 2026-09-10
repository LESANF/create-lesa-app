/**
 * src/assets/intro.json → assets/intro.svg (README 용 애니메이션).
 * 프레임마다 그룹을 만들고 CSS keyframes 로 opacity 를 돌린다 — GitHub 은 <img> 로 참조된
 * SVG 의 CSS 애니메이션을 그대로 재생한다.
 *   node scripts/bake-svg.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { frames, height, width } = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/intro.json'), 'utf8'),
);

const FONT = 15; // px
const CW = FONT * 0.6; // 모노스페이스 advance
const LH = FONT * 1.15;
const PAD = 14;
const BG = '#0d1117'; // GitHub dark canvas
const W = Math.ceil(width * CW + PAD * 2);
const H = Math.ceil(height * LH + PAD * 2);

const total = frames.reduce((sum, f) => sum + f.ms, 0);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let css = '';
let elapsed = 0;
const groups = frames.map((frame, index) => {
  const from = (elapsed / total) * 100;
  elapsed += frame.ms;
  const to = (elapsed / total) * 100;
  // 프레임 구간에만 보이게. 경계는 겹치지 않도록 소수점을 남긴다.
  css += `@keyframes f${index}{0%,${from.toFixed(3)}%{opacity:0}${from.toFixed(3)}%,${to.toFixed(3)}%{opacity:1}${to.toFixed(3)}%,100%{opacity:0}}\n`;

  let body = '';
  frame.rows.forEach((runs, row) => {
    let col = 0;
    for (const [text, color] of runs) {
      if (text.trim()) {
        const x = (PAD + col * CW).toFixed(2);
        const y = (PAD + (row + 0.8) * LH).toFixed(2);
        body += `<text x="${x}" y="${y}"${color ? ` fill="${color}"` : ''}>${esc(text)}</text>`;
      }
      col += [...text].length;
    }
  });
  return `<g class="f${index}">${body}</g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="LESA APPKIT">
<style>
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:${FONT}px;white-space:pre;fill:#c9d1d9}
g{opacity:0;animation-duration:${(total / 1000).toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:step-end}
${frames.map((_, i) => `.f${i}{animation-name:f${i}}`).join('')}
${css}</style>
<rect width="100%" height="100%" rx="6" fill="${BG}"/>
${groups.join('\n')}
</svg>
`;

const target = path.join(root, 'assets/intro.svg');
fs.writeFileSync(target, svg);
console.log(
  `${frames.length} frames · ${(total / 1000).toFixed(2)}s · ${W}×${H} · ${fs.statSync(target).size} bytes → assets/intro.svg`,
);
