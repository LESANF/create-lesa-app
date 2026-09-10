<div align="center">

# create-lesa-app

**lesa Expo 템플릿 발사대.**<br/>
slug 하나만 주면 스킴·번들 ID·Android 패키지·첫 커밋까지 만들어 놓는다.

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/versions/v57.0.0/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)
[![expo-router](https://img.shields.io/badge/expo--router-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![Reanimated](https://img.shields.io/badge/Reanimated-4.5-FF6B6B?style=flat-square)](https://docs.swmansion.com/react-native-reanimated/)
[![Uniwind](https://img.shields.io/badge/Uniwind-1.11-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://uniwind.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)](https://zustand.docs.pmnd.rs)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[English](README.md) · **한국어**

</div>

---

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

> [!IMPORTANT]
> **이 패키지에는 템플릿이 없다.** 로컬 폴더에서 복사하는데 그 레포는 아직 공개 전이라,
> 사본이 없으면 아무것도 못 한다. 찾는 순서는
> `--template <path>` → `$LESA_TEMPLATE_DIR` → 형제 `lesa-expo-template` 폴더.

## slug 하나에서 나오는 것

|                        | development               | preview               | production    |
| ---------------------- | ------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — 전 환경 공통   |                       |               |
| `scheme`               | `<slug>-dev`              | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development` | `com.<slug*>.preview` | `com.<slug*>` |
| 버전                   | `0.0.1` build `1`         |                       |               |

`<slug*>` 는 하이픈을 뺀 값이다. Android 패키지명은 점 사이에 문자·숫자·밑줄만 허용하므로
`lesa-app` 은 `com.lesaapp` 이 된다. URL 스킴은 하이픈을 허용하니 그대로 둔다.

한글·일본어 이름은 홈 화면 이름으로 쓰고 slug 을 따로 묻는다. 로마자로 자동 변환하지
않는다 — 이 값이 Xcode 프로젝트명·스킴·`PRODUCT_NAME` 이 되는데 변환은 손실이 크다.

## 묻지 않는 것

API·OTA 주소, 유니버설 링크 호스트, Android 서명, 아이콘, `firebase/` 파일. 생성 시점에
알 수 없는 값들이다. 프로젝트가 채울 자리는 모두 `TODO(앱)` 으로 찍혀 있고, 완료 화면이
그 `grep` 명령을 띄운다.

## 알아둘 것

|                       |                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`git add` 먼저**    | 복사 대상은 템플릿의 `git ls-files` 다. 산출물과 로컬 상태는 정의상 빠지지만, **새로 만든** 템플릿 파일은 스테이징해야 복사된다.                             |
| **`npm link` 과 nvm** | 링크는 현재 Node 버전에 묶인다. 버전을 갈아타면 다시 걸거나, 이 레포 안에서 `pnpm start ../my-new-app` 을 쓴다.                                              |
| **TTY 없이 검증**     | 프롬프트 스텝 머신을 UI 밖(`src/flow.ts`)에 뒀다. `useInput` 이 TTY 를 요구해서 안에 두면 한 줄도 검증할 수 없다. `pnpm test` 가 렌더 없이 전 구간을 돌린다. |
| **실패는 깔끔하게**   | 실패한 실행은 만든 디렉터리를 지운다. `Ctrl+C` 는 조용히 지우지 않고 그대로 남긴다.                                                                          |

## 명령

|                         |                              |
| ----------------------- | ---------------------------- |
| `create-lesa-app <dir>` | 프로젝트 생성                |
| `--template <path>`     | 템플릿 경로 직접 지정        |
| `--help` · `--version`  | 사용법 · 버전                |
| `pnpm test`             | 스텝 머신·파생 규칙 테스트   |
| `pnpm type-check`       | `tsc --noEmit`               |
| `pnpm bake-intro`       | ASCII 워드마크 프레임 재생성 |

<div align="center">

MIT © [LESANF](https://github.com/LESANF)

</div>
