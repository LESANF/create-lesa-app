<div align="center">

# create-lesa-app

**Launcher for the lesa Expo template.**<br/>
One slug in — schemes, bundle ids, Android packages and a first commit out.

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/versions/v57.0.0/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)
[![expo-router](https://img.shields.io/badge/expo--router-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![Reanimated](https://img.shields.io/badge/Reanimated-4.5-FF6B6B?style=flat-square)](https://docs.swmansion.com/react-native-reanimated/)
[![Uniwind](https://img.shields.io/badge/Uniwind-1.11-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://uniwind.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)](https://zustand.docs.pmnd.rs)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**English** · [한국어](README.ko.md)

</div>

---

```bash
pnpm install && npm link       # once
create-lesa-app my-new-app
```

```
  ┌  create-lesa-app
  │
  │  ◇ App name        레사앱
  │  ◇ Slug            lesa-app
  │  ◆ Apple Team ID   ▌   optional · iOS only · Enter to skip
  │
  └  Enter skip or continue · Esc cancel
```

> [!IMPORTANT]
> **This package does not contain the template.** It copies one from a local
> folder, and that repository is not public yet — without a copy there is
> nothing to work with. Lookup order:
> `--template <path>` → `$LESA_TEMPLATE_DIR` → a sibling `lesa-expo-template`.

## What one slug becomes

|                        | development                 | preview               | production    |
| ---------------------- | --------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — all environments |                       |               |
| `scheme`               | `<slug>-dev`                | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development`   | `com.<slug*>.preview` | `com.<slug*>` |
| version                | `0.0.1` build `1`           |                       |               |

`<slug*>` drops hyphens — Android package names allow only letters, digits and
underscores between periods, so `lesa-app` becomes `com.lesaapp`. URL schemes
do allow hyphens, so those keep them.

A non-ASCII app name is kept as the home-screen name and a slug is asked
separately. It is never romanized: that value becomes the Xcode project name,
the scheme and `PRODUCT_NAME`, and the transliteration is lossy.

## Not asked

API and OTA URLs, universal-link hosts, Android signing, icons, `firebase/`
files — none are knowable at creation time. Everything the project must fill in
is marked `TODO(앱)`, and the closing screen prints the `grep` for it.

## Good to know

|                            |                                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`git add` first**        | Copying is driven by `git ls-files` in the template. Build output and local state are excluded by definition — but a **new** template file must be staged before it gets copied. |
| **`npm link` and nvm**     | The link is tied to the current Node version. Re-run after switching, or use `pnpm start ../my-new-app` from inside this repo.                                                   |
| **Testable without a TTY** | The prompt state machine lives outside the UI (`src/flow.ts`) because `useInput` needs a TTY. `pnpm test` drives the whole flow without rendering.                               |
| **Clean failure**          | A failed run removes the directory it created. `Ctrl+C` leaves a partial tree alone rather than deleting it silently.                                                            |

## Commands

|                         |                                   |
| ----------------------- | --------------------------------- |
| `create-lesa-app <dir>` | create a project                  |
| `--template <path>`     | point at a template explicitly    |
| `--help` · `--version`  | usage · version                   |
| `pnpm test`             | step-machine and derivation tests |
| `pnpm type-check`       | `tsc --noEmit`                    |
| `pnpm bake-intro`       | re-bake the ASCII wordmark frames |

<div align="center">

MIT © [LESANF](https://github.com/LESANF)

</div>
