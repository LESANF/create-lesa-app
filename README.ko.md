<div align="center">

# create-lesa-app

lesa Expo 템플릿 발사대.<br/>
slug 하나만 주면 스킴·번들 ID·Android 패키지·첫 커밋까지 나온다.

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/versions/v57.0.0/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)
[![expo-router](https://img.shields.io/badge/expo--router-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![Reanimated](https://img.shields.io/badge/Reanimated-4.5-FF6B6B?style=flat-square)](https://docs.swmansion.com/react-native-reanimated/)<br/>
[![Uniwind](https://img.shields.io/badge/Uniwind-1.11-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://uniwind.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)](https://zustand.docs.pmnd.rs)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[English](README.md) · [한국어](README.ko.md)

**⚗️ 전부 실험적입니다. 저(LESA)를 위해 만들었습니다.**

</div>

> [!WARNING]
> **이건 제 것입니다.** 제 취향·제 업무 흐름에 맞춰 만들었고 모든 선택이 실험적입니다.
> 안정성도 하위 호환도 지원도 약속하지 않고, 예고 없이 구조가 바뀝니다.
>
> 읽고 참고하시는 건 환영합니다. 다만 **그대로 쓰지 말고 직접 검증하세요.**

<br/>

```bash
pnpm install && npm link
create-lesa-app my-new-app
```

```
  ┌  create-lesa-app
  │
  │  ◇ App name
  │    lesa-app
  │
  │  ◇ Display name
  │    Lesa App
  │
  │  ◆ Apple Team ID
  │  ╭────────────────────────────────────────────────╮
  │  │ › ▌                                            │
  │  ╰────────────────────────────────────────────────╯
  │    optional · iOS only · Enter to skip
  │
  └  Enter skip or continue · Esc cancel
```

> [!IMPORTANT]
> **템플릿은 이 패키지에 없다.** 로컬 폴더에서 복사하고, 그 레포는 아직 공개 전이다.
> 찾는 순서는 `--template <path>` → `$LESA_TEMPLATE_DIR` → 형제 `lesa-expo-template`.

<br/>

## slug 하나에서 나오는 것

| 필드                   | development               | preview               | production    |
| ---------------------- | ------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — 전 환경 공통   |                       |               |
| `scheme`               | `<slug>-dev`              | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development` | `com.<slug*>.preview` | `com.<slug*>` |
| 버전                   | `0.0.1` build `1`         |                       |               |

`<slug*>` 는 하이픈을 뺀 값이다. Android 패키지명은 점 사이에 문자·숫자·밑줄만 허용해서
`lesa-app` 이 `com.lesaapp` 이 된다. URL 스킴은 하이픈을 허용하니 그대로 둔다.

소문자 ASCII 가 아닌 이름은 표시명으로 쓰고 slug 을 따로 묻는다. 로마자로 변환하지 않는다.
이 값이 Xcode 프로젝트명·스킴·`PRODUCT_NAME` 이 되는데 변환은 잃는 게 너무 많다.

<br/>

## 묻지 않는 것

API·OTA 주소, 유니버설 링크 호스트, Android 서명, 아이콘, `firebase/` 파일. 생성 시점에
알 수 없다. 프로젝트가 채울 자리는 전부 `TODO(앱)` 으로 찍혀 있고 완료 화면이 그 `grep`
명령을 띄운다.

<br/>

## 알아둘 것

- **새 파일은 스테이징해야 한다.** 복사 대상은 `git ls-files` 다. 산출물과 로컬 상태가
  정의상 빠지는 대신, 방금 만든 파일은 `git add` 전까지 복사되지 않는다.
- **`npm link` 는 Node 버전을 따라간다.** nvm 으로 갈아타면 다시 걸거나, 링크 없이 이
  레포에서 `pnpm start ../my-new-app` 을 쓴다.
- **프롬프트를 TTY 없이 검증한다.** `useInput` 이 TTY 를 요구하므로 스텝 머신은
  `src/flow.ts` 에 따로 뒀다. `pnpm test` 가 전 구간을 돌린다.
- **실패는 치우고 나간다.** 실패한 실행은 만든 디렉터리를 지운다. `Ctrl+C` 는 조용히
  지우지 않고 남긴다.

<br/>

## 명령

|                         |                              |
| ----------------------- | ---------------------------- |
| `create-lesa-app <dir>` | 프로젝트 생성                |
| `--template <path>`     | 템플릿 경로 직접 지정        |
| `--help` · `--version`  | 사용법 · 버전                |
| `pnpm test`             | 스텝 머신·파생 규칙 테스트   |
| `pnpm type-check`       | `tsc --noEmit`               |
| `pnpm bake-intro`       | ASCII 워드마크 프레임 재생성 |

<br/>

## 라이선스

MIT — 마음대로 쓰세요.
