/**
 * create-lesa-app 진입점.
 *
 *   create-lesa-app <dir> [--template <path>]
 *
 * 템플릿 경로는 `--template` → `LESA_TEMPLATE_DIR` → 형제 폴더 순으로 찾는다
 * (레포가 private 이라 tarball 이 아니라 로컬 복사다 — `docs/cli.md`).
 */

import { Box, render, Text, useApp, useStdout } from 'ink';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import React, { useEffect, useState } from 'react';

import { createApp, CREATE_STEPS } from './create.ts';
import { Intro } from './intro.tsx';
import { Frame, Prompt, railColors as colors, Section, Steps } from './ui.tsx';

import type { CreateProgress, CreateResult } from './create.ts';
import type { PromptResult } from './ui.tsx';

const USAGE = `create-lesa-app — create a project from the lesa Expo template

  create-lesa-app <dir> [options]

Options
  --template <path>   template directory (else $LESA_TEMPLATE_DIR, else a
                      sibling "lesa-expo-template" folder)
  -h, --help          show this
  -v, --version       print the version

It asks for an app name, a slug when the name is not lowercase ASCII, and an
optional Apple Team ID, then copies the template's git-tracked files, fills in
env-candidates.ts and makes the first commit.`;

class ArgError extends Error {}

function parseArgs(argv: string[]) {
  const rest = argv.slice(2);
  let templateDir = process.env.LESA_TEMPLATE_DIR ?? '';
  const positional: string[] = [];

  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--template') {
      templateDir = rest[++index] ?? '';
      if (!templateDir) throw new ArgError('--template needs a path');
      continue;
    }
    // 알 수 없는 플래그를 위치 인자로 삼으면 오타가 디렉터리 이름이 된다.
    if (arg.startsWith('-')) throw new ArgError(`unknown option: ${arg}`);
    positional.push(arg);
  }

  if (positional.length > 1) throw new ArgError(`unexpected argument: ${positional[1]}`);
  return { targetDir: positional[0] ?? '', templateDir };
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 템플릿 폴더로 보이는지 — 형제 폴더를 기본값으로 쓸지 판단한다. */
function looksLikeTemplate(dir: string): boolean {
  return existsSync(path.join(dir, 'env-candidates.ts')) && existsSync(path.join(dir, 'app.config.ts'));
}

/**
 * `--template` → `$LESA_TEMPLATE_DIR` → 형제 `lesa-expo-template` → 빈 문자열(= GitHub).
 * 빈 문자열은 실패가 아니다 — `create.ts` 가 tarball 을 받는다.
 */
function resolveTemplateDir(explicit: string): string {
  if (explicit) return path.resolve(explicit);
  const sibling = path.resolve(packageRoot, '../lesa-expo-template');
  return looksLikeTemplate(sibling) ? sibling : '';
}

type Stage =
  | { kind: 'input' }
  | { kind: 'working'; progress: CreateProgress; skipped: number[] }
  | { kind: 'done'; result: CreateResult };

/** 워드마크(20줄) + 가장 긴 화면이 들어갈 높이. 모자라면 애니메이션을 멈춘다. */
const ANIMATE_MIN_ROWS = 46;

function App({ targetDir, templateDir }: { targetDir: string; templateDir: string }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [stage, setStage] = useState<Stage>({ kind: 'input' });
  const [error, setError] = useState<string | null>(null);

  const settled = error !== null || stage.kind === 'done';

  // 끝나면 스스로 빠져나온다 — 인트로 타이머와 raw mode 가 이벤트 루프를 붙잡고 있어서
  // exit() 를 부르지 않으면 프로세스가 안 죽는다.
  useEffect(() => {
    if (settled) exit();
  }, [exit, settled]);

  const onDone = (input: PromptResult) => {
    setStage({ kind: 'working', progress: { index: 0 }, skipped: [] });
    void createApp({
      ...input,
      onStep: progress =>
        setStage(previous => ({
          kind: 'working',
          progress,
          // 건너뛴 단계는 누적한다 — 다음 단계로 넘어가도 표시가 남아야 한다.
          skipped:
            previous.kind === 'working' && progress.skipped
              ? [...new Set([...previous.skipped, progress.index])]
              : previous.kind === 'working'
                ? previous.skipped
                : [],
        })),
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
      {/* 출력이 터미널 높이를 넘으면 ink 가 제자리 갱신을 못 해 매 프레임이 쌓인다.
          완료·실패 화면은 가장 길므로 그때도 멈춘다. */}
      <Intro loop={!settled && (stdout?.rows ?? 0) >= ANIMATE_MIN_ROWS} />
      {error ? (
        <Frame footer="Failed — nothing was left behind">
          <Section color={colors.error} marker="■" title="Failed to create the project">
            <Text color={colors.softText}>{`  ${error}`}</Text>
          </Section>
        </Frame>
      ) : stage.kind === 'working' ? (
        <Frame footer={`Creating ${path.basename(targetDir)}…`}>
          <Steps
            current={stage.progress.index}
            labels={CREATE_STEPS}
            note={stage.progress.note}
            progress={
              stage.progress.total
                ? { done: stage.progress.done ?? 0, total: stage.progress.total }
                : undefined
            }
            skipped={new Set(stage.skipped)}
          />
        </Frame>
      ) : stage.kind === 'done' ? (
        <Frame footer="Done">
          <Section
            color={colors.done}
            marker="◆"
            title={`Created ${path.basename(stage.result.targetDir)}`}
          />
          <Steps
            current={CREATE_STEPS.length}
            details={{
              0:
                stage.result.receipt.source === 'github'
                  ? 'from GitHub'
                  : `${stage.result.receipt.fileCount} files`,
              1: 'identity substituted',
              3: '1 commit',
            }}
            labels={CREATE_STEPS}
            skipped={new Set(stage.result.receipt.wroteEnvFile ? [] : [2])}
          />
          <Section color={colors.done} marker="◇" title="Next steps">
            {stage.result.nextSteps.map(step => (
              <Text color={colors.softText} key={step}>{`  ${step}`}</Text>
            ))}
          </Section>
        </Frame>
      ) : (
        <Prompt onDone={onDone} />
      )}
    </Box>
  );
}

let args: ReturnType<typeof parseArgs>;
try {
  args = parseArgs(process.argv);
} catch (error) {
  console.error(`${error instanceof Error ? error.message : String(error)}\n\n${USAGE}`);
  process.exit(1);
}

if (args.help) {
  console.log(USAGE);
  process.exit(0);
}
if (args.version) {
  const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')) as {
    version: string;
  };
  console.log(pkg.version);
  process.exit(0);
}
if (!args.targetDir) {
  console.error(USAGE);
  process.exit(1);
}

const templateDir = resolveTemplateDir(args.templateDir);

render(<App targetDir={path.resolve(args.targetDir)} templateDir={templateDir} />);
