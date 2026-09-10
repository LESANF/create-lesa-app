[English](README.md) · **한국어**

# create-lesa-app

lesa Expo 템플릿의 발사대. 질문 두세 개를 받아 slug 하나에서 모든 식별자를 파생하고,
템플릿을 복사한 뒤 첫 커밋을 만든다.

```bash
pnpm install && npm link       # 최초 1회
create-lesa-app my-new-app
```

```
  ┌  create-lesa-app
  │
  │  ◇ App name        레사앱
  │  ◇ Slug            lesa-app
  │  ◆ Apple Team ID   ▌   선택 · iOS 전용 · Enter 로 건너뛰기
  │
  └  Enter skip or continue · Esc cancel
```

> **템플릿을 담고 있지 않다.** 로컬 폴더에서 복사하며, 그 레포는 아직 공개되지 않았다 —
> 사본이 없으면 작업할 대상이 없다. 탐색 순서는 `--template <path>` →
> `$LESA_TEMPLATE_DIR` → 형제 `lesa-expo-template` 폴더.

## slug 하나에서 나오는 것

|                        | development               | preview               | production    |
| ---------------------- | ------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — 전 환경 공통   |                       |               |
| `scheme`               | `<slug>-dev`              | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development` | `com.<slug*>.preview` | `com.<slug*>` |
| 버전                   | `0.0.1` build `1`         |                       |               |

`<slug*>` 는 하이픈을 뺀 값이다 — Android package 는 점 사이에 문자·숫자·밑줄만 허용해서
`lesa-app` → `com.lesaapp` 이 된다. URL scheme 은 하이픈을 그대로 둔다.

비ASCII 앱 이름은 홈 화면 이름으로 두고 slug 을 따로 묻는다. 자동 로마자 변환은 하지
않는다 — 이 값이 Xcode 프로젝트명·스킴·`PRODUCT_NAME` 이 되기 때문이다.

## 묻지 않는 것

API·OTA URL, 유니버설 링크 호스트, Android 서명, 아이콘, `firebase/` 파일 — 생성 시점에
알 수 없는 값들이다. 프로젝트가 채워야 하는 곳은 모두 `TODO(앱)` 으로 표시돼 있고, 완료
화면이 그 `grep` 명령을 출력한다.

## 알아둘 것

- 복사 대상은 템플릿의 `git ls-files` 다. 산출물과 로컬 상태는 정의상 제외되지만,
  **템플릿에 새로 만든 파일은 `git add` 해야 복사된다.**
- `npm link` 는 현재 Node 버전(nvm)에 묶인다 — 버전을 갈아타면 다시 걸어야 한다.
  연결 없이 쓰려면 이 레포 안에서 `pnpm start ../my-new-app`.
- 프롬프트 스텝 머신은 UI 밖(`src/flow.ts`)에 있다 — `useInput` 이 TTY 를 요구해서
  안에 두면 검증이 불가능하다. `pnpm test` 가 렌더 없이 전 구간을 돌린다.
- 실패한 실행은 만든 디렉터리를 지운다. Ctrl+C 는 그대로 남긴다.

`--help` · `--version` · `pnpm test` · `pnpm type-check` · `pnpm bake-intro`.

MIT
