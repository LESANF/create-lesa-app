/**
 * 생성 오케스트레이션 — 복사 → 치환 → git init → 안내.
 * 프롬프트(ink)와 분리해서 UI 없이도 테스트할 수 있게 둔다.
 */

import { execFile } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { applyEnvCandidates, applyEnvFile } from './apply.ts';
import { assertEmptyTarget, copyTemplate } from './copy.ts';
import { derive } from './derive.ts';
import { fetchTemplate } from './fetch-template.ts';
import { pruneRepoOnly } from './repo-only.ts';

import type { AppInput } from './derive.ts';

const run = promisify(execFile);

/** 진행 표시용 단계 이름 — UI 가 이 순서대로 목록을 그린다. */
export const CREATE_STEPS = [
  'Get template files',
  'Apply env-candidates.ts',
  'Write .env',
  'Git init',
] as const;

export type CreateProgress = {
  /** `CREATE_STEPS` 안의 위치. */
  index: number;
  /** 그 단계의 세부 진행(원격 다운로드 등). */
  note?: string;
  /** 이 단계가 건너뛰어졌는지(예: Team ID 를 안 받으면 `.env` 를 안 만든다). */
  skipped?: boolean;
  /** 파일 복사처럼 셀 수 있는 단계의 진행률. */
  done?: number;
  total?: number;
};

export type CreateOptions = AppInput & {
  /** 비어 있으면 GitHub 에서 tarball 을 받는다. */
  templateDir: string;
  targetDir: string;
  /** 진행 상황. ink 쪽에서는 상태 업데이트로 바꿔 넘긴다. */
  onStep?: (progress: CreateProgress) => void;
};

export type CreateResult = {
  targetDir: string;
  fields: ReturnType<typeof derive>;
  nextSteps: string[];
  /** 끝난 뒤 무엇이 됐는지 보여주는 영수증 — 생성이 300ms 라 진행 표시는 스쳐 지나간다. */
  receipt: { fileCount: number; wroteEnvFile: boolean; source: 'local' | 'github' };
};

async function countTracked(dir: string): Promise<number> {
  const { stdout } = await run('git', ['-C', dir, 'ls-files', '-z'], {
    maxBuffer: 32 * 1024 * 1024,
  });
  return stdout.split('\0').filter(Boolean).length;
}

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
  let fileCount = 0;
  try {
    step({ index: 0 });
    if (templateDir) {
      await copyTemplate(templateDir, targetDir, (done, total) => {
        fileCount = total;
        step({ done, index: 0, total });
      });
    } else {
      // 원격은 진행률을 알 수 없다 — 단계 메시지만 바꾼다.
      await assertEmptyTarget(targetDir);
      await fetchTemplate(targetDir, message => step({ index: 0, note: message }));
    }
    copied = true;
    await pruneRepoOnly(targetDir, { displayName, slug });

    step({ index: 1 });
    await applyEnvCandidates(targetDir, fields);

    step({ index: 2, skipped: !appleTeamId });
    if (appleTeamId) await applyEnvFile(targetDir, appleTeamId);

    step({ index: 3 });
    await gitInit(targetDir);
    // 추적 파일 수가 유일한 정답이다 — 원격 경로는 복사 콜백이 없고, prune 이 3개를 뺀다.
    fileCount = await countTracked(targetDir);
    step({ index: CREATE_STEPS.length });
  } catch (error) {
    if (copied) {
      await rm(targetDir, { force: true, recursive: true }).catch(() => undefined);
    }
    throw error;
  }

  const name = path.basename(targetDir);
  return {
    fields,
    receipt: {
      fileCount,
      source: templateDir ? 'local' : 'github',
      wroteEnvFile: Boolean(appleTeamId),
    },
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
