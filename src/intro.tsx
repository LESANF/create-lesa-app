/**
 * ASCII 워드마크 — `assets/lesa-appkit.asciimtn` 를 `scripts/bake-intro.mjs` 로 접은 것.
 * 글리프는 10프레임 모두 같고 색만 흐른다. 한 번 재생한 뒤 마지막 프레임에 멈춰
 * 프롬프트 위 배너로 남는다(멈춘 뒤에는 매 렌더가 같은 출력이라 비용이 없다).
 */

import { Box, Text } from 'ink';
import fs from 'node:fs';
import React, { useEffect, useState } from 'react';

type Run = [text: string, color: string | null];
type Frame = { ms: number; rows: Run[][] };

const { frames } = JSON.parse(
  fs.readFileSync(new URL('./assets/intro.json', import.meta.url), 'utf8'),
) as { frames: Frame[] };

export function Intro({ animate = true }: { animate?: boolean }) {
  const last = frames.length - 1;
  const [index, setIndex] = useState(animate ? 0 : last);

  useEffect(() => {
    if (index >= last) return;
    const timer = setTimeout(() => setIndex(index + 1), frames[index].ms);
    return () => clearTimeout(timer);
  }, [index, last]);

  return (
    <Box flexDirection="column" paddingLeft={2}>
      {frames[index].rows.map((runs, y) => (
        <Text key={y}>
          {runs.map(([text, color], run) => (
            <Text color={color ?? undefined} key={run}>
              {text}
            </Text>
          ))}
        </Text>
      ))}
    </Box>
  );
}
