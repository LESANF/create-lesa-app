/**
 * 생성된 프로젝트의 `env-candidates.ts` 자리표시를 치환하고 `.env` 를 만든다.
 *
 * 자리표시 문자열 치환이다 — AST·템플릿 엔진을 쓰지 않는다(사유: 템플릿 `docs/cli.md`).
 * 치환 후 잔여 자리표시를 검사해서 남으면 실패로 본다: 템플릿의 자리표시가 바뀌었는데
 * 여기를 안 고친 경우를 조용히 넘기지 않기 위한 장치다.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { DerivedFields } from './derive.ts';

/** 템플릿 `env-candidates.ts` 의 자리표시 → 파생값. 순서가 중요하다(긴 것 먼저). */
function replacements(fields: DerivedFields): [string, string][] {
  return [
    // bundleId / package — 긴 접미사부터 치환해야 `write.your.bundlename` 이 먼저 먹지 않는다.
    ['write.your.bundlename.development', fields.bundleId.development],
    ['write.your.bundlename.preview', fields.bundleId.preview],
    ['write.your.bundlename', fields.bundleId.production],
    // scheme
    ['write-your-scheme-dev', fields.scheme.development],
    ['write-your-scheme-preview', fields.scheme.preview],
    ['write-your-scheme', fields.scheme.production],
    // identity
    ['write-your-app-name', fields.name],
    ['write-your-app-slug', fields.slug],
  ];
}

const LEFTOVER = /write[-.]your/;

export class ApplyError extends Error {}

/** `env-candidates.ts` 치환. displayName 은 자리표시가 아니라 빈 문자열이라 따로 넣는다. */
export async function applyEnvCandidates(
  projectDir: string,
  fields: DerivedFields
): Promise<void> {
  const file = path.join(projectDir, 'env-candidates.ts');
  let source: string;
  try {
    source = await readFile(file, 'utf8');
  } catch {
    throw new ApplyError(`env-candidates.ts 를 찾을 수 없습니다: ${file}`);
  }

  for (const [from, to] of replacements(fields)) {
    source = source.replaceAll(from, to);
  }

  if (fields.displayName) {
    const before = source;
    source = source.replace("displayName: '',", `displayName: '${fields.displayName}',`);
    if (source === before) {
      throw new ApplyError("displayName 자리(`displayName: '',`)를 찾지 못했습니다.");
    }
  }

  const leftover = source
    .split('\n')
    .map((line, index) => [index + 1, line] as const)
    .filter(([, line]) => LEFTOVER.test(line));
  if (leftover.length > 0) {
    throw new ApplyError(
      `치환되지 않은 자리표시가 남았습니다 — 템플릿이 바뀌었을 수 있습니다:\n` +
        leftover.map(([n, line]) => `  env-candidates.ts:${n}  ${line.trim()}`).join('\n')
    );
  }

  await writeFile(file, source);
}

/**
 * Apple Team ID 를 받았으면 `.env` 를 미리 만든다.
 * 안 받았으면 아무것도 하지 않는다 — 템플릿의 postinstall 이 `.env.example` 에서 만든다.
 */
export async function applyEnvFile(projectDir: string, appleTeamId: string): Promise<void> {
  if (!appleTeamId) return;

  const example = path.join(projectDir, '.env.example');
  const target = path.join(projectDir, '.env');
  const source = await readFile(example, 'utf8');

  // .env.example 은 그 줄을 주석으로 갖고 있다 — 주석을 벗기고 값을 채운다.
  const line = `APP_BUILD_ONLY_APPLE_TEAM_ID=${appleTeamId}`;
  const replaced = source.replace(/^# APP_BUILD_ONLY_APPLE_TEAM_ID=$/m, line);
  if (replaced === source) {
    throw new ApplyError('.env.example 에서 APP_BUILD_ONLY_APPLE_TEAM_ID 주석 줄을 찾지 못했습니다.');
  }

  await writeFile(target, replaced);
}
