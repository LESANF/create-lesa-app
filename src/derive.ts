/**
 * slug 하나에서 env-candidates.ts 의 전 필드를 파생한다. 순수 함수 — 여기가 유일한 논리다.
 * 파생 규칙의 근거는 템플릿 `docs/cli.md` "파생 규칙".
 */

export type AppInput = {
  /** 영문 소문자 식별자. Xcode 프로젝트명·스킴·PRODUCT_NAME 이 여기서 나온다. */
  slug: string;
  /** 홈 화면에 보일 이름. 한글이면 채우고, 영문이면 빈 문자열(템플릿이 name 을 그대로 쓴다). */
  displayName: string;
  /** .env 의 APP_BUILD_ONLY_APPLE_TEAM_ID. 비우면 Xcode 자동 서명. */
  appleTeamId: string;
};

export type PerEnv = { development: string; preview: string; production: string };

export type DerivedFields = {
  name: string;
  displayName: string;
  slug: string;
  scheme: PerEnv;
  bundleId: PerEnv;
  package: PerEnv;
};

export const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/;

/** 입력 검증 — 통과하지 못하면 이유를 돌려준다(호출부가 다시 묻는다). */
export function validateSlug(slug: string): string | null {
  if (!slug) return 'slug 을 입력하세요.';
  if (!SLUG_PATTERN.test(slug)) {
    return '영문 소문자로 시작하고, 소문자·숫자·하이픈만 쓸 수 있습니다 (예: my-app).';
  }
  // reverse-domain 세그먼트로 들어가므로 하이픈으로 끝나면 `com.my-app-.development` 가 된다.
  if (slug.endsWith('-')) return '하이픈으로 끝날 수 없습니다.';
  return null;
}

/**
 * production 은 접미사가 없다 — 템플릿 자리표시(`write.your.bundlename`)와 같은 컨벤션.
 * bundleId 충돌 검증은 하지 않는다(생성 후 env-candidates.ts 에서 바꾼다).
 */
export function derive({ slug, displayName }: Omit<AppInput, 'appleTeamId'>): DerivedFields {
  // Android package 는 하이픈을 못 쓴다(문자·숫자·밑줄만, 점으로 구분) — SDK 57 app config 문서.
  // iOS bundleId 는 허용하지만 둘을 같게 두려고 같은 값을 쓴다. scheme 은 하이픈이 허용된다.
  const reverseDomain = `com.${slug.replaceAll('-', '')}`;
  const identifiers: PerEnv = {
    development: `${reverseDomain}.development`,
    preview: `${reverseDomain}.preview`,
    production: reverseDomain,
  };

  return {
    name: slug,
    displayName,
    slug,
    scheme: {
      development: `${slug}-dev`,
      preview: `${slug}-preview`,
      production: slug,
    },
    bundleId: identifiers,
    // Android package 는 iOS bundleId 와 같다 (참조 앱 KR/JP 동일).
    package: identifiers,
  };
}
