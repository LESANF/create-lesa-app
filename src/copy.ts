/**
 * 로컬 템플릿 폴더 → 대상 디렉터리 복사.
 *
 * 템플릿 레포가 private 이라 tarball 을 쓸 수 없다(사유: 템플릿 `docs/cli.md`).
 * 배포 방식이 정해지면 이 파일만 교체한다 — 다른 모듈은 `copyTemplate` 시그니처만 안다.
 *
 * **복사 대상 = git 이 추적하는 파일.** 제외 목록을 손으로 들고 있으면 템플릿에 새 gitignore
 * 항목이 생길 때마다 놓친다(실제로 `.pnpm-store`·`expo-env.d.ts`·`npmlogin.log` 를 놓쳤다).
 * `git ls-files` 는 산출물·로컬 상태를 정의상 제외한다.
 */

import { execFile } from 'node:child_process';
import { access, cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export class CopyError extends Error {}

/** 템플릿으로 쓸 수 있는 폴더인지 — 잘못된 경로를 조용히 복사하는 것을 막는다. */
export async function assertTemplate(templateDir: string): Promise<void> {
  for (const marker of ['env-candidates.ts', 'app.config.ts', 'package.json']) {
    try {
      await access(path.join(templateDir, marker));
    } catch {
      throw new CopyError(`템플릿 폴더가 아닙니다 (${marker} 없음): ${templateDir}`);
    }
  }
}

/** 대상이 비어 있어야 한다. 기존 파일을 덮어쓰지 않는다. */
export async function assertEmptyTarget(targetDir: string): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(targetDir);
  } catch {
    return; // 없으면 아래에서 만든다
  }
  if (entries.filter(name => name !== '.DS_Store').length > 0) {
    throw new CopyError(`대상 디렉터리가 비어 있지 않습니다: ${targetDir}`);
  }
}

/** git 이 추적하는 파일 목록. `-z` 로 공백·유니코드 파일명을 안전하게 받는다. */
async function trackedFiles(templateDir: string): Promise<string[]> {
  try {
    const { stdout } = await run('git', ['-C', templateDir, 'ls-files', '-z'], {
      maxBuffer: 32 * 1024 * 1024,
    });
    const files = stdout.split('\0').filter(Boolean);
    if (files.length === 0) throw new Error('empty');
    return files;
  } catch {
    throw new CopyError(
      `템플릿에서 git 추적 파일을 읽지 못했습니다: ${templateDir}\n` +
        `  git 레포여야 합니다(복사 대상을 git 이 정한다).`
    );
  }
}

export async function copyTemplate(templateDir: string, targetDir: string): Promise<void> {
  await assertTemplate(templateDir);
  await assertEmptyTarget(targetDir);

  const files = await trackedFiles(templateDir);
  await mkdir(targetDir, { recursive: true });

  for (const rel of files) {
    const to = path.join(targetDir, rel);
    await mkdir(path.dirname(to), { recursive: true });
    await cp(path.join(templateDir, rel), to);
  }
}
