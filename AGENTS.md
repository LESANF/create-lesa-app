# create-lesa-app — 에이전트 규칙

템플릿(`LESANF/react-native-template-lesa`)을 받아 새 프로젝트를 만드는 CLI 다.
릴리즈 절차 전체는 템플릿 레포의 `docs/config.md` "릴리즈" 에 있고, 이 레포도 같은 절차를 따른다.

- **PR 은 `master` 로만 연다.** `feature/xxx` → 로컬 머지(`git merge --no-ff`, PR 없음) →
  버전 브랜치(`0.0.9`) → PR → `master`. 버전 브랜치로 가는 PR 은 만들지 않는다 — GitHub 은
  커밋을 처음 실어 온 PR 에 묶어서, 그 뒤의 `master` PR 에는 머지 커밋만 남는다(CI 가 막는다).
  작업 단위가 끝날 때마다 `master` PR 을 연다.
- **릴리즈는 master 머지가 아니라 태그와 `npm publish` 다.** 사용자는 npm 에서 받으므로
  master 가 앞서 있어도 가지 않는다. `npm publish` 와 OTP 는 사용자가 친다.
- **머지는 항상 merge commit**(`gh pr merge --merge`). squash 는 `Co-Authored-By` 를 뭉갠다.
- **`master` 에 직접 푸시하지 않는다.** 버전 브랜치는 릴리즈 후에도 남긴다.
- **`src/fetch-template.ts` 의 `TEMPLATE_REF` 는 태그다.** 템플릿을 릴리즈하면 같이 올리고
  템플릿 레포에서 `pnpm release:check` 로 확인한다.
- 커밋은 Conventional Commits, 공개 레포라 영어로 쓴다.
