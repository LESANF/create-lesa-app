/**
 * ASCII 워드마크 — `assets/lesa-appkit.asciimtn` 를 `scripts/bake-intro.mjs` 로 접은 것.
 * 글리프는 10프레임 모두 같고 색만 흐른다. 무한 루프로 돈다 — 프레임 state 를 이 컴포넌트가
 * 들고 있어서 형제인 프롬프트는 리렌더되지 않는다(입력 커서가 영향받지 않는다).
 */

import { Box, Text } from 'ink';
import fs from 'node:fs';
import React, { useEffect, useState } from 'react';

type Run = [text: string, color: string | null];
type Frame = { ms: number; rows: Run[][] };

const { frames } = JSON.parse(
  fs.readFileSync(new URL('./assets/intro.json', import.meta.url), 'utf8'),
) as { frames: Frame[] };

export function Intro({ loop = true }: { loop?: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const last = frames.length - 1;
    if (index >= last && !loop) return;
    const timer = setTimeout(() => setIndex(index >= last ? 0 : index + 1), frames[index].ms);
    return () => clearTimeout(timer);
  }, [index, loop]);

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
