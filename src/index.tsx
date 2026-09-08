/**
 * create-lesa-app 진입점.
 *
 *   create-lesa-app <dir> [--template <path>]
 *
 * 템플릿 경로는 `--template` → `LESA_TEMPLATE_DIR` → 형제 폴더 순으로 찾는다
 * (레포가 private 이라 tarball 이 아니라 로컬 복사다 — `docs/cli.md`).
 */

import { Box, render, Text } from 'ink';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
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

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 템플릿 폴더로 보이는지 — 형제 폴더를 기본값으로 쓸지 판단한다. */
function looksLikeTemplate(dir: string): boolean {
  return existsSync(path.join(dir, 'env-candidates.ts')) && existsSync(path.join(dir, 'app.config.ts'));
}

/** `--template` → `LESA_TEMPLATE_DIR` → 형제 `lesa-expo-template`. */
function resolveTemplateDir(explicit: string): string {
  if (explicit) return path.resolve(explicit);
  const sibling = path.resolve(packageRoot, '../lesa-expo-template');
  return looksLikeTemplate(sibling) ? sibling : '';
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

const args = parseArgs(process.argv);

if (!args.targetDir) {
  console.error('Usage: create-lesa-app <dir> [--template <path>]');
  process.exit(1);
}

const templateDir = resolveTemplateDir(args.templateDir);
if (!templateDir) {
  console.error(
    'Could not find the template. Pass --template <path>, set LESA_TEMPLATE_DIR,\n' +
      `or put lesa-expo-template next to ${packageRoot}`,
  );
  process.exit(1);
}

render(<App targetDir={path.resolve(args.targetDir)} templateDir={templateDir} />);
