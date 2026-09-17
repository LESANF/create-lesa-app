/**
 * 템플릿 레포 전용 파일 — 생성된 앱에는 들어가면 안 된다.
 * `AGENTS.md`·`docs/` 는 앱과 같이 가는 게 목적이라 여기 없다.
 */

import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ONLY = [
  'CHANGELOG.md', // 템플릿의 릴리즈 이력
  'docs/template-completion.md', // 템플릿 레포의 진행 기록
  'LICENSE', // 템플릿 저작권 — 앱은 자기 것을 고른다
  'README.md', // "MVP 라 사용을 권하지 않습니다" — 아래에서 새로 쓴다
  'scripts/release-check.mjs', // 템플릿·CLI·npm 체인 검사 — 앱과 무관하다
];

/** 앱에서 의미 없는 npm 스크립트. 파일을 지웠으니 호출부도 지운다. */
const REPO_ONLY_SCRIPTS = ['release:check'];

/** 번역된 README — `README.ko.md` 처럼 언어 코드가 붙은 것들. */
const LOCALIZED_README = /^README\.[a-z]{2}(-[A-Z]{2})?\.md$/;

/** 레포 전용 파일을 지우고 앱 README 를 새로 쓴다. 복사·추출 어느 경로든 뒤에 한 번 돈다. */
export async function pruneRepoOnly(
  targetDir: string,
  app: { displayName: string; slug: string }
): Promise<void> {
  const entries = await readdir(targetDir);
  const remove = [...REPO_ONLY, ...entries.filter(name => LOCALIZED_README.test(name))];
  await Promise.all(remove.map(name => rm(path.join(targetDir, name), { force: true })));

  await removeRepoOnlyScripts(targetDir);

  const title = app.displayName || app.slug;
  await writeFile(
    path.join(targetDir, 'README.md'),
    `# ${title}\n\n` +
      '```bash\n' +
      'pnpm install\n' +
      'pnpm ios:development   # or pnpm android:development\n' +
      '```\n\n' +
      '아이콘·스플래시는 `assets/images/` 의 `icon.png`·`adaptive-icon.png`·`splash-icon.png` 를 교체합니다.\n\n' +
      '작업 규칙과 메커니즘은 [`AGENTS.md`](./AGENTS.md), 영역별 문서는 [`docs/`](./docs) 에 있습니다.\n',
    'utf8'
  );
}

async function removeRepoOnlyScripts(targetDir: string): Promise<void> {
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts) return;

  let changed = false;
  for (const name of REPO_ONLY_SCRIPTS) {
    if (name in pkg.scripts) {
      delete pkg.scripts[name];
      changed = true;
    }
  }
  if (changed) await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}
