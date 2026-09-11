# Changelog

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) · [Semantic Versioning](https://semver.org/lang/ko/)

이 CLI 의 버전은 템플릿 버전과 **별개**다. 받아올 템플릿 태그는
`src/fetch-template.ts` 의 `TEMPLATE_REF` 에 고정돼 있다 — 템플릿이 릴리즈되면 그 값을
올려 다시 발행해야 새 템플릿이 나간다.

## [Unreleased]

### Changed

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

[unreleased]: https://github.com/LESANF/create-lesa-app/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/LESANF/create-lesa-app/releases/tag/v0.0.1
