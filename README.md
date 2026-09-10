# create-lesa-app

A small CLI that turns the [lesa Expo template](#the-template) into a new project:
it asks two or three questions, derives every identifier from one slug, copies the
template's git-tracked files, and makes the first commit.

```
  ┌  create-lesa-app
  │
  │  ◇ App name
  │    레사앱
  │
  │  ◇ Slug
  │    lesa-app
  │
  │  ◆ Apple Team ID
  │    ▌
  │    optional · iOS only · Enter to skip
  │
  └  Enter skip or continue · Esc cancel
```

## The template

**This CLI does not contain the template — it copies one from a local folder.**
The template repository is not public yet, so unless you already have a copy this
tool has nothing to work with. It looks for one in this order:

1. `--template <path>`
2. `$LESA_TEMPLATE_DIR`
3. a sibling `lesa-expo-template` directory next to this package

Copying is driven by `git ls-files` in the template, so build output and local
state (`ios/`, `android/`, `.env`, stores) are excluded by definition — and a
**new template file must be `git add`ed before it will be copied.**

## Usage

```bash
pnpm install
npm link                    # once — puts `create-lesa-app` on your PATH

create-lesa-app my-new-app
```

```
create-lesa-app <dir> [options]

  --template <path>   template directory (see above)
  -h, --help          show usage
  -v, --version       print the version
```

`npm link` is tied to the current Node version (nvm) — re-run it after switching.
Without linking, run `pnpm start ../my-new-app` from inside this repo.

## What it asks

|                             |                                                                      |
| --------------------------- | -------------------------------------------------------------------- |
| **App name**                | any language. Lowercase ASCII doubles as the slug                    |
| **Slug**                    | asked only when the name is not a valid slug (`^[a-z][a-z0-9-]*$`)   |
| **Name on the home screen** | asked only when the name _is_ ASCII, so you can fix casing. Optional |
| **Apple Team ID**           | optional, iOS only. Skipped → Xcode automatic signing                |

Korean and Japanese names are never romanized automatically — the transliteration
is lossy and this value becomes the Xcode project name, the scheme and
`PRODUCT_NAME`. So a non-ASCII name is kept as the display name and a slug is
asked separately.

## What it derives

Everything comes from the slug. `production` gets no suffix.

| field                  | development                                       | preview               | production    |
| ---------------------- | ------------------------------------------------- | --------------------- | ------------- |
| `name` · `slug`        | `<slug>` (all environments)                       |                       |               |
| `displayName`          | the non-ASCII name, or what you typed, else empty |                       |               |
| `scheme`               | `<slug>-dev`                                      | `<slug>-preview`      | `<slug>`      |
| `bundleId` · `package` | `com.<slug*>.development`                         | `com.<slug*>.preview` | `com.<slug*>` |
| version                | `0.0.1` / build `1`                               |                       |               |

`<slug*>` is the slug **with hyphens removed**: Android package names allow only
letters, digits and underscores separated by periods, so `lesa-app` becomes
`com.lesaapp`. URL schemes do allow hyphens, so those keep them (`lesa-app-dev`).

## What it does not ask

|                            | why                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| API / OTA URLs             | not known at creation time. The template ships a `.invalid` production API on purpose so an unconfigured production build fails loudly |
| universal link hosts       | needs a domain and an AASA file first                                                                                                  |
| Android signing            | release signing is a keystore _file_ plus Gradle env vars — nothing exists yet                                                         |
| icons, splash, `firebase/` | binary assets a CLI cannot invent                                                                                                      |

Everything else the project must fill in is marked `TODO(앱)` in the generated
code; the closing screen prints the `grep` for it.

## Scripts

|                    |                                                       |
| ------------------ | ----------------------------------------------------- |
| `pnpm start <dir>` | run without linking                                   |
| `pnpm test`        | step-machine and derivation tests — no TTY needed     |
| `pnpm type-check`  | `tsc --noEmit`                                        |
| `pnpm bake-intro`  | re-bake `assets/*.asciimtn` → `src/assets/intro.json` |

## Layout

```
src/derive.ts        slug → every field (pure)
src/flow.ts          prompt step machine (pure — testable without a TTY)
src/apply.ts         env-candidates.ts substitution · .env
src/copy.ts          copies `git ls-files` only
src/create.ts        orchestration + cleanup on failure
src/ui.tsx           the ink prompt
src/intro.tsx        ASCII wordmark
src/index.tsx        entry — argument parsing, template lookup, render
bin/                 registers the tsx loader (Node cannot run .tsx directly)
```

The prompt state machine lives outside the UI on purpose: `useInput` needs a TTY,
so anything inside it cannot be tested. `pnpm test` drives the whole flow without
rendering.

If the run fails partway, the directory it created is removed — except after
Ctrl+C, where a partial tree is left alone rather than silently deleted.

## License

MIT
