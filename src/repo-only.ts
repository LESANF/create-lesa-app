/**
 * 템플릿 레포 전용 파일 — 생성된 앱에는 들어가면 안 된다.
 * `AGENTS.md`·`docs/` 는 앱과 같이 가는 게 목적이라 여기 없다.
 */

import { rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ONLY = [
  'CHANGELOG.md', // 템플릿의 릴리즈 이력
  'LICENSE', // 템플릿 저작권 — 앱은 자기 것을 고른다
  'README.md', // "MVP 라 사용을 권하지 않습니다" — 아래에서 새로 쓴다
];

/** 레포 전용 파일을 지우고 앱 README 를 새로 쓴다. 복사·추출 어느 경로든 뒤에 한 번 돈다. */
export async function pruneRepoOnly(
  targetDir: string,
  app: { displayName: string; slug: string }
): Promise<void> {
  await Promise.all(
    REPO_ONLY.map(name => rm(path.join(targetDir, name), { force: true }))
  );

  const title = app.displayName || app.slug;
  await writeFile(
    path.join(targetDir, 'README.md'),
    `# ${title}\n\n` +
      '```bash\n' +
      'pnpm install\n' +
      'pnpm ios:development   # or pnpm android:development\n' +
      '```\n\n' +
      '작업 규칙과 메커니즘은 [`AGENTS.md`](./AGENTS.md), 영역별 문서는 [`docs/`](./docs) 에 있습니다.\n',
    'utf8'
  );
}
