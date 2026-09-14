/**
 * 생성된 앱이 자기 정체를 갖게 한다 — 템플릿의 이름·버전·라이선스를 물려받지 않도록.
 *
 * 앱의 스토어 버전은 `env-candidates.ts` 의 `version.app` 이고 `package.json` 의 것이
 * 아니다. 둘이 어긋나면 읽는 사람이 헷갈리므로 같이 맞춘다.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** 새 앱의 첫 버전. 스토어 첫 배포 관례다. */
export const INITIAL_VERSION = '1.0.0';

export class IdentityError extends Error {}

export async function applyIdentity(projectDir: string, slug: string): Promise<void> {
  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown>;
  pkg.name = slug;
  pkg.version = INITIAL_VERSION;
  delete pkg.license; // 템플릿 라이선스다. 앱은 자기 것을 고른다
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  const envPath = path.join(projectDir, 'env-candidates.ts');
  const source = await readFile(envPath, 'utf8');
  const block = /(version:\s*\{\s*app:\s*\{)([^}]*)(\})/;
  const match = source.match(block);
  if (!match) {
    throw new IdentityError(
      `Could not find version.app in env-candidates.ts — the template shape changed.`
    );
  }
  const replaced = match[2].replace(/'\d+\.\d+\.\d+'/g, `'${INITIAL_VERSION}'`);
  await writeFile(envPath, source.replace(block, `$1${replaced}$3`), 'utf8');
}
