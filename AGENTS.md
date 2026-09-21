# create-lesa-app — 에이전트 규칙

템플릿(`LESANF/react-native-template-lesa`)을 받아 새 프로젝트를 만드는 CLI 다.
릴리즈 절차 전체는 템플릿 레포의 `docs/config.md` "릴리즈" 에 있고, 이 레포도 같은 절차를 따른다.

- **`feature/xxx` → PR → 버전 브랜치(`0.0.9`) → PR → `master`.** 피쳐 PR 은 버전 브랜치로 연다.
  프로필 achievements 도 이 피쳐 PR 을 센다 — 집계 때문에 흐름을 바꾸지 않는다
  (경위는 템플릿 `docs/config.md` "브랜치 모델").
- **`master` 로 머지되는 것이 릴리즈다.** 태그는 그 뒤에 master 에서 달고, `npm publish` 와
  OTP 는 사용자가 친다.
- **머지는 항상 merge commit**(`gh pr merge --merge`). squash 는 `Co-Authored-By` 를 뭉갠다.
- **`master` 에 직접 푸시하지 않는다.** 버전 브랜치는 릴리즈 후에도 남긴다.
- **`src/fetch-template.ts` 의 `TEMPLATE_REF` 는 태그다.** 템플릿을 릴리즈하면 같이 올리고
  템플릿 레포에서 `pnpm release:check` 로 확인한다.
- 커밋은 Conventional Commits, 공개 레포라 영어로 쓴다.
