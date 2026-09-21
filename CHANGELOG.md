# Changelog

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) · [Semantic Versioning](https://semver.org/lang/ko/)

이 CLI 의 버전은 템플릿 버전과 **별개**다. 받아올 템플릿 태그는
`src/fetch-template.ts` 의 `TEMPLATE_REF` 에 고정돼 있다 — 템플릿이 릴리즈되면 그 값을
올려 다시 발행해야 새 템플릿이 나간다.

## [Unreleased]

### Docs

- `AGENTS.md` — 에이전트용 브랜치·릴리즈 규칙. npm 패키지에는 들어가지 않는다

## [0.0.9] — 2026-09-17

### Changed

- `TEMPLATE_REF` → `v0.0.9`. iOS NSE(푸시 게이트 안), pnpm 하한, 낡은 문서 제거
- `docs/template-completion.md` 를 생성 프로젝트에 복사하지 않는다(`REPO_ONLY`). 템플릿 레포의
  진행 기록이라 받는 쪽엔 소음이었다

## [0.0.8] — 2026-09-16

### Changed

- 받아오는 템플릿을 `v0.0.8` 으로 올린다(`TEMPLATE_REF`) — `MIGRATION.md` 가 들어간다

### Fixed

- `scripts/release-check.mjs` 와 `release:check` 스크립트를 생성된 앱에서 제외한다 —
  템플릿·CLI·npm 체인을 검사하는 것이라 앱과 무관하다. `MIGRATION.md` 는 남긴다(앱이
  템플릿을 올릴 때 읽는다)

## [0.0.7] — 2026-09-16

### Changed

- 받아오는 템플릿을 `v0.0.7` 으로 올린다(`TEMPLATE_REF`). `v0.0.6` 은 **푸시를 켜면
  prebuild 가 실패한다** — `expo-build-properties` 를 57.0.20 으로 올려 해소한 버전이다

## [0.0.6] — 2026-09-16

### Changed

- 받아오는 템플릿을 `v0.0.6` 으로 올린다(`TEMPLATE_REF`). iOS 27 UIScene 이 손수 만든
  패치·플러그인에서 **공식 스위치**(`expo-build-properties` 의 `ios.enableSceneSupport`)로
  바뀌었다 — 생성되는 프로젝트에 패치가 하나도 없다

## [0.0.5] — 2026-09-15

### Changed

- 받아오는 템플릿을 `v0.0.5` 로 올린다(`TEMPLATE_REF`). iOS 27 UIScene 수정과 Android
  adaptive 아이콘 foreground 가 새 프로젝트에 들어간다

## [0.0.4] — 2026-09-15

### Changed

- 받아오는 템플릿을 `v0.0.4` 로 올린다(`TEMPLATE_REF`). **iOS 27 SDK 에서 앱이 실행되지
  않던 문제(UIScene 생명주기)가 고쳐진 버전**이다 — 그 전 템플릿은 빌드는 되고 실행이
  안 된다. 앱 아이콘 배지 위치도 같이 들어간다

## [0.0.3] — 2026-09-15

### Changed

- 받아오는 템플릿을 `v0.0.3` 으로 올린다(`TEMPLATE_REF`). 프리로더 콜백 격리·딥링크
  인코딩·Android 서명 앵커·auth 로그인 라우트가 새 프로젝트에 들어간다

## [0.0.2] — 2026-09-14

### Changed

- 받아오는 템플릿을 `v0.0.2` 로 올린다(`TEMPLATE_REF`)

### Fixed

- 번역된 README(`README.ko.md`)가 생성된 앱에 그대로 복사됐다. 이름 목록이 아니라
  패턴으로 걸러 `README.<lang>.md` 를 전부 제외한다

- Java 예약어를 slug 으로 받아들여 `com.class.development` 같은 패키지를 만들었다.
  Android 가 그 이름으로 Java 를 생성하므로 Gradle 이 깨지고, 에러는 한참 뒤
  빌드에서 난다. 이제 입력 시점에 거부한다 — 검사는 하이픈을 뺀 세그먼트 기준이라
  `gym-class` 는 통과한다

- 표시 이름에 작은따옴표가 있으면(`Dev's App`) `env-candidates.ts` 가 문법적으로
  깨진 채 커밋됐다. 역슬래시는 escape 로 먹혀 조용히 사라졌고, 줄바꿈은 파일을
  깼다. 이제 리터럴에 맞게 escape 한다

- 완료 안내가 없어진 문서 절(`README "Make it yours" §3`)을 가리키고 있었다 —
  생성된 앱의 README 를 짧은 것으로 바꾸면서 그 절이 사라졌다. 이제 교체할 파일
  이름을 직접 말한다

### Changed

- 생성된 앱이 자기 정체를 갖는다 — `package.json` 의 `name` 을 slug 로, `version` 을
  `1.0.0` 으로 두고 템플릿 `license` 를 지운다. 스토어 버전인
  `env-candidates.ts` 의 `version.app` 도 같이 맞춘다

- 템플릿 레포 전용 파일(`CHANGELOG.md`·`LICENSE`·`README.md`)은 생성된 앱에 복사하지
  않는다. 대신 앱 이름으로 짧은 `README.md` 를 새로 쓴다. `AGENTS.md`·`docs/` 는
  앱과 같이 가는 게 목적이라 그대로 둔다
- `receipt.fileCount` 를 초기 커밋의 추적 파일 수로 센다 — 원격 경로는 복사 콜백이
  없어서 0 으로 찍히고 있었다

## [0.0.1] — 2026-09-11

첫 공개 릴리즈. **PoC** 다 — `0.0.x` 는 안정성을 약속하지 않는다.

### Added

- 질문 두세 개(앱 이름 → 필요 시 slug → 홈 화면 이름 → Apple Team ID)로 프로젝트 생성
- slug 하나에서 `name`·`scheme`·`bundleId`·`package`·`version` 파생.
  Android 패키지는 하이픈을 못 쓰므로 리버스 도메인에서만 제거한다
- 템플릿을 GitHub tarball(`TEMPLATE_REF` 고정)에서 받는다. 로컬 사본이 있으면 그걸 쓴다 —
  `--template <path>` → `$LESA_TEMPLATE_DIR` → 형제 폴더 → GitHub
- 복사 대상은 템플릿의 `git ls-files` — 산출물·로컬 상태를 정의상 제외한다
- 잔여 자리표시 검사(줄번호 출력) · 실패 시 생성 폴더 정리 · 초기 커밋
- `--help` · `--version` · 알 수 없는 플래그 거부
- 스텝 머신을 UI 밖(`src/flow.ts`)에 둬서 TTY 없이 `pnpm test` 로 전 구간 검증

---

[unreleased]: https://github.com/LESANF/create-lesa-app/compare/v0.0.8...HEAD
[0.0.9]: https://github.com/LESANF/create-lesa-app/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/LESANF/create-lesa-app/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/LESANF/create-lesa-app/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/LESANF/create-lesa-app/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/LESANF/create-lesa-app/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/LESANF/create-lesa-app/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/LESANF/create-lesa-app/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/LESANF/create-lesa-app/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/LESANF/create-lesa-app/releases/tag/v0.0.1
