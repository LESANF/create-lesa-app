# create-lesa-app

Create a new project from the [lesa Expo SDK 57 template](../lesa-expo-template).

```bash
pnpm install
npm link          # once — puts `create-lesa-app` on your PATH

create-lesa-app my-new-app        # from anywhere
```

The template is found in this order: `--template <path>` → `LESA_TEMPLATE_DIR`
→ `lesa-expo-template` next to this repo. Siblings need no flag.

`npm link` is tied to the current node version (nvm); re-run it after switching.
Without linking: `pnpm start ../my-new-app`.

It asks 2–3 questions, copies the template's git-tracked files, substitutes
`env-candidates.ts`, writes `.env` if you gave an Apple Team ID, and makes an
initial commit.

```
◆ 01 NAME  ──  ○ 02 SLUG  ──  ○ 03 TEAM  ──  ○ 04 READY

? App name         마이앱        ← any language
    ├─ ASCII  →    reused as the slug, step 02 is skipped
    └─ other  →    ? Slug          myapp
? Apple Team ID  (optional, Enter to skip)
```

Everything else is derived from the slug — schemes, bundle ids, Android
packages, versions. See the summary on step 04 before it writes anything.

## Scripts

| | |
|---|---|
| `pnpm start <dir>` | run the CLI without linking |
| `pnpm test` | step machine + derivation regression tests (no TTY needed) |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm bake-intro` | re-bake `assets/*.asciimtn` → `src/assets/intro.json` |

## Layout

```
src/derive.ts        slug → every field (pure)
src/flow.ts          prompt step machine (pure — testable without a TTY)
src/apply.ts         env-candidates.ts substitution · .env
src/copy.ts          copies `git ls-files` only
src/create.ts        orchestration + cleanup on failure
src/ui.tsx           the ink prompt
src/intro.tsx        ASCII wordmark, plays once then freezes
src/index.tsx        entry — arg parsing, template lookup, render
bin/                 registers the tsx loader (node can't run .tsx directly)
```

**The substitution contract lives in the template**, not here:
[`docs/cli.md`](../lesa-expo-template/docs/cli.md). Change a field in
`env-candidates.ts` and you change both.
