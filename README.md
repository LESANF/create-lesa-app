**English** · [한국어](README.ko.md)

# create-lesa-app

Launcher for the lesa Expo template. Asks two or three questions, derives every
identifier from one slug, copies the template and makes the first commit.

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

> **It does not contain the template.** It copies one from a local folder, and
> that repository is not public yet — without a copy there is nothing to work
> with. Lookup order: `--template <path>` → `$LESA_TEMPLATE_DIR` → a sibling
> `lesa-expo-template` folder.

## What one slug becomes

|                        | development                 | preview               | production    |
| ---------------------- | --------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` — all environments |                       |               |
| `scheme`               | `<slug>-dev`                | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development`   | `com.<slug*>.preview` | `com.<slug*>` |
| version                | `0.0.1` build `1`           |                       |               |

`<slug*>` drops hyphens — Android package names allow only letters, digits and
underscores between periods, so `lesa-app` → `com.lesaapp`. URL schemes keep them.

A non-ASCII app name is kept as the home-screen name and a slug is asked
separately; it is never romanized, because that value becomes the Xcode project
name, the scheme and `PRODUCT_NAME`.

## Not asked

API and OTA URLs, universal-link hosts, Android signing, icons and `firebase/`
files — none of them are knowable at creation time. Everything the project must
fill in is marked `TODO(앱)`, and the closing screen prints the `grep` for it.

## Notes

- Copying is driven by `git ls-files` in the template, so build output and local
  state are excluded by definition — **a new template file must be `git add`ed
  before it gets copied.**
- `npm link` is tied to the current Node version (nvm); re-run after switching.
  Or run `pnpm start ../my-new-app` from inside this repo.
- The prompt state machine lives outside the UI (`src/flow.ts`) because
  `useInput` needs a TTY. `pnpm test` drives the whole flow without rendering.
- A failed run removes the directory it created. Ctrl+C leaves it alone.

`--help` · `--version` · `pnpm test` · `pnpm type-check` · `pnpm bake-intro`.

MIT
