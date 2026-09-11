/**
 * 템플릿 tarball 다운로드 → 추출. 로컬 템플릿 폴더가 없을 때 쓴다.
 *
 * GitHub 의 `/archive/` 는 **그 ref 에서 git 이 추적하는 파일**을 담는다 — 로컬 경로의
 * `git ls-files` 와 같은 집합이다. 그래서 두 경로의 결과가 같다.
 *
 * 태그에 고정한다. `master` 로 받으면 어제 만든 프로젝트와 오늘 만든 프로젝트가 달라진다.
 */

import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const TEMPLATE_REPO = 'LESANF/react-native-template-lesa';
/** 템플릿을 릴리즈하면 이 값을 올린다. */
export const TEMPLATE_REF = 'v0.0.1';

export class FetchError extends Error {}

function archiveUrl(repo: string, ref: string): string {
  const kind = /^v?\d+\.\d+\.\d+/.test(ref) ? 'tags' : 'heads';
  return `https://codeload.github.com/${repo}/tar.gz/refs/${kind}/${ref}`;
}

/**
 * tarball 을 받아 `targetDir` 에 푼다. 최상위 디렉터리(`repo-ref/`)는 벗긴다.
 * `tar` 는 macOS·Linux 기본이고 Windows 10+ 에도 bsdtar 로 있다.
 */
export async function fetchTemplate(
  targetDir: string,
  onStep?: (message: string) => void,
  repo = TEMPLATE_REPO,
  ref = TEMPLATE_REF
): Promise<void> {
  const url = archiveUrl(repo, ref);
  onStep?.(`downloading ${repo}@${ref}`);

  let body: ArrayBuffer;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new FetchError(
        response.status === 404
          ? `Template not found: ${repo}@${ref}\n  The repository may be private, or the ref does not exist.`
          : `Download failed (HTTP ${response.status}): ${url}`
      );
    }
    body = await response.arrayBuffer();
  } catch (error) {
    if (error instanceof FetchError) throw error;
    throw new FetchError(
      `Could not reach GitHub. Check your connection, or pass --template <path> to use a local copy.\n  ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const work = await mkdtemp(path.join(tmpdir(), 'create-lesa-app-'));
  const archive = path.join(work, 'template.tar.gz');
  try {
    await writeFile(archive, Buffer.from(body));
    await mkdir(targetDir, { recursive: true });
    onStep?.('extracting');
    // --strip-components=1 이 `<repo>-<ref>/` 최상위를 벗긴다.
    await run('tar', ['-xzf', archive, '-C', targetDir, '--strip-components=1']);
  } catch (error) {
    throw new FetchError(
      `Could not extract the template archive. Is \`tar\` available?\n  ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    await rm(work, { force: true, recursive: true }).catch(() => undefined);
  }
}
