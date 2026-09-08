/**
 * 생성 오케스트레이션 — 복사 → 치환 → git init → 안내.
 * 프롬프트(ink)와 분리해서 UI 없이도 테스트할 수 있게 둔다.
 */

import { execFile } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { applyEnvCandidates, applyEnvFile } from './apply.ts';
import { copyTemplate } from './copy.ts';
import { derive } from './derive.ts';

import type { AppInput } from './derive.ts';

const run = promisify(execFile);

export type CreateOptions = AppInput & {
  templateDir: string;
  targetDir: string;
  /** 진행 로그. ink 쪽에서는 상태 업데이트로 바꿔 넘긴다. */
  onStep?: (message: string) => void;
};

export type CreateResult = {
  targetDir: string;
  fields: ReturnType<typeof derive>;
  nextSteps: string[];
};

async function gitInit(dir: string): Promise<void> {
  await run('git', ['-C', dir, 'init', '-q']);
  await run('git', ['-C', dir, 'add', '-A']);
  // 커밋 서명·author 가 없는 환경에서도 실패하지 않게 -c 로 넘긴다.
  await run('git', [
    '-C',
    dir,
    '-c',
    'user.name=create-lesa-app',
    '-c',
    'user.email=noreply@localhost',
    'commit',
    '-q',
    '-m',
    'chore: initial commit from create-lesa-app',
  ]);
}

/**
 * 실패하면 만든 디렉터리를 지운다 — 반쯤 만들어진 상태를 남기지 않는다.
 * 단 `targetDir` 이 원래 있었으면(비어 있었을 뿐) 지우지 않고 내용만 비운다.
 */
export async function createApp(options: CreateOptions): Promise<CreateResult> {
  const { appleTeamId, displayName, onStep, slug, targetDir, templateDir } = options;
  const step = onStep ?? (() => undefined);
  const fields = derive({ displayName, slug });

  let copied = false;
  try {
    step('copying template');
    await copyTemplate(templateDir, targetDir);
    copied = true;

    step('applying env-candidates.ts');
    await applyEnvCandidates(targetDir, fields);

    if (appleTeamId) {
      step('writing .env');
      await applyEnvFile(targetDir, appleTeamId);
    }

    step('git init');
    await gitInit(targetDir);
  } catch (error) {
    if (copied) {
      await rm(targetDir, { force: true, recursive: true }).catch(() => undefined);
    }
    throw error;
  }

  const name = path.basename(targetDir);
  return {
    fields,
    nextSteps: [
      `cd ${name} && pnpm install`,
      'pnpm ios:development   (or pnpm android:development)',
      'Replace the icon and splash in assets/ — README "Make it yours" §3',
      'Drop your config files into firebase/ to turn push on — docs/push.md',
      'grep -rn "TODO(앱)" src   — the spots your project fills in',
    ],
    targetDir,
  };
}
