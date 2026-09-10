<div align="center">

# create-lesa-app

Launcher for the lesa Expo template.<br/>
One slug in — schemes, bundle ids, Android packages and a first commit out.

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/versions/v57.0.0/)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)
[![expo-router](https://img.shields.io/badge/expo--router-57-000020?style=flat-square&logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![Reanimated](https://img.shields.io/badge/Reanimated-4.5-FF6B6B?style=flat-square)](https://docs.swmansion.com/react-native-reanimated/)<br/>
[![Uniwind](https://img.shields.io/badge/Uniwind-1.11-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://uniwind.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)](https://zustand.docs.pmnd.rs)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[English](README.md) · [한국어](README.ko.md)

**⚗️ Everything here is experimental. Built for me (LESA).**

</div>

> [!WARNING]
> **This is mine.** It is shaped around my taste and my workflow, and every
> choice in it is experimental. No stability, no backwards compatibility, no
> support — the structure changes without notice.
>
> Read it, borrow from it. But **do not ship it as-is** — verify it yourself.

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
> **The template is not bundled.** This CLI copies one from a local folder, and
> that repository is not public yet. Lookup order:
> `--template <path>` → `$LESA_TEMPLATE_DIR` → a sibling `lesa-expo-template`.

<br/>

## Derived from one slug

| field                  | development                  | preview               | production    |
| ---------------------- | ---------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — every environment |                       |               |
| `scheme`               | `<slug>-dev`                 | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development`    | `com.<slug*>.preview` | `com.<slug*>` |
| version                | `0.0.1` build `1`            |                       |               |

`<slug*>` drops hyphens. Android package names allow only letters, digits and
underscores between periods, so `lesa-app` becomes `com.lesaapp` — URL schemes
do allow hyphens and keep them.

A name that is not lowercase ASCII becomes the display name, and a slug is asked
separately. It is never romanized: that value ends up as the Xcode project name,
the scheme and `PRODUCT_NAME`, and transliteration loses too much.

<br/>

## Not asked

API and OTA urls, universal-link hosts, Android signing, icons, `firebase/`
files. None are knowable at creation time. Every spot the project has to fill in
is marked `TODO(앱)`, and the closing screen prints the `grep` for it.

<br/>

## Notes

- **Stage new template files.** Copying is driven by `git ls-files`, so build
  output and local state are excluded by definition — and a file you just created
  is not copied until it is `git add`ed.
- **`npm link` follows your Node version.** Re-run it after switching with nvm,
  or skip linking and run `pnpm start ../my-new-app` from this repo.
- **The prompt is testable without a TTY.** `useInput` needs one, so the step
  machine lives in `src/flow.ts` instead. `pnpm test` drives the whole flow.
- **Failures clean up.** A failed run deletes the directory it created. `Ctrl+C`
  leaves a partial tree alone rather than removing it silently.

<br/>

## Commands

|                         |                                   |
| ----------------------- | --------------------------------- |
| `create-lesa-app <dir>` | create a project                  |
| `--template <path>`     | point at a template explicitly    |
| `--help` · `--version`  | usage · version                   |
| `pnpm test`             | step machine and derivation tests |
| `pnpm type-check`       | `tsc --noEmit`                    |
| `pnpm bake-intro`       | re-bake the ASCII wordmark frames |

<br/>

## License

MIT — use it however you like.
