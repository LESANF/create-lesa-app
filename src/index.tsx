#!/usr/bin/env node
/**
 * create-lesa-app 진입점.
 *
 *   pnpm start <dir> [--template <path>]
 *
 * 템플릿 경로는 `--template` 또는 `LESA_TEMPLATE_DIR` 로 준다(레포가 private 이라 로컬 복사).
 */

import { Box, render, Text } from 'ink';
import path from 'node:path';
import process from 'node:process';
import React, { useState } from 'react';

import { createApp } from './create.ts';
import { Intro } from './intro.tsx';
import { Prompt } from './ui.tsx';

import type { CreateResult } from './create.ts';
import type { PromptResult } from './ui.tsx';

function parseArgs(argv: string[]) {
  const rest = argv.slice(2);
  let templateDir = process.env.LESA_TEMPLATE_DIR ?? '';
  const positional: string[] = [];

  for (let index = 0; index < rest.length; index++) {
    if (rest[index] === '--template') {
      templateDir = rest[++index] ?? '';
      continue;
    }
    positional.push(rest[index]);
  }

  return { targetDir: positional[0] ?? '', templateDir };
}

type Stage =
  | { kind: 'input' }
  | { kind: 'working'; step: string }
  | { kind: 'done'; result: CreateResult };

function App({ targetDir, templateDir }: { targetDir: string; templateDir: string }) {
  const [stage, setStage] = useState<Stage>({ kind: 'input' });
  const [error, setError] = useState<string | null>(null);

  const onDone = (input: PromptResult) => {
    setStage({ kind: 'working', step: 'starting' });
    void createApp({
      ...input,
      onStep: step => setStage({ kind: 'working', step }),
      targetDir,
      templateDir,
    })
      .then(result => setStage({ kind: 'done', result }))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
        process.exitCode = 1;
      });
  };

  return (
    <Box flexDirection="column">
      <Intro />
      {error ? (
        <Box flexDirection="column" marginTop={1} paddingLeft={2}>
          <Text color="#FB7185">{'Failed to create the project'}</Text>
          <Text color="#CBD5E1">{error}</Text>
        </Box>
      ) : stage.kind === 'working' ? (
        <Box marginTop={1} paddingLeft={2}>
          <Text color="#FBBF24">{`… ${stage.step}`}</Text>
        </Box>
      ) : stage.kind === 'done' ? (
        <Box flexDirection="column" marginTop={1} paddingLeft={2}>
          <Text color="#2DD4BF">{`✔ Created ${path.basename(stage.result.targetDir)}`}</Text>
          <Box flexDirection="column" marginTop={1}>
            {stage.result.nextSteps.map(step => (
              <Text color="#CBD5E1" key={step}>{`  ${step}`}</Text>
            ))}
          </Box>
        </Box>
      ) : (
        <Prompt onDone={onDone} />
      )}
    </Box>
  );
}

const { targetDir, templateDir } = parseArgs(process.argv);

if (!targetDir) {
  console.error('Usage: create-lesa-app <dir> [--template <path>]');
  process.exit(1);
}
if (!templateDir) {
  console.error('A template path is required — pass --template <path> or set LESA_TEMPLATE_DIR');
  process.exit(1);
}

render(<App targetDir={path.resolve(targetDir)} templateDir={path.resolve(templateDir)} />);
