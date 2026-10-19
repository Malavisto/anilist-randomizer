# AniList Randomizer

Pick a random anime from an AniList account. This project is not affiliated with AniList or AniChart.

## Development

Use Node.js 22.18+ (CI and Docker use Node 24) and the pnpm version pinned in `package.json`. Install pnpm with `npm install --global pnpm@10.34.7`, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The page is in `src/app/page.tsx`, the UI in `src/components/anime-randomizer.tsx`, and AniList requests and selection in `src/lib/anilist.ts`.

```sh
pnpm test
pnpm typecheck
pnpm build
```

Tests use Node's built-in test runner. There is no linter. `pnpm build` creates a static site in `out/`; `next start` is not supported for static exports. Serve `out/` with a static web server to preview production output.

## Dependency maintenance

Renovate runs on Monday mornings, South African time, and waits seven days after a release. Routine updates are grouped; major updates stay separate so a broken upgrade does not block other updates. Lockfile maintenance runs weekly.

All updates, including majors, can merge automatically once the required `App checks` and `Container checks` pass. CI runs on `renovate/**` branch pushes as well as PRs. Renovate merges passing branches directly, avoiding a PR for successful updates; failed updates can still create a PR that needs attention. The Dependency Dashboard remains available for visibility and retries.

Builds and regression tests catch many upgrade failures, but cannot guarantee that every major update preserves runtime behavior. Updates that break checks remain unmerged.

Use pnpm and commit `pnpm-lock.yaml`; do not generate `package-lock.json`. CI and Docker use frozen installs.

## Hosting

The app calls AniList directly from the browser. There is no server or secret configuration. Vercel is connected to the repository and provides preview builds. The repository also contains optional GitHub Pages and Docker publishing workflows; both were manually disabled at the October 2026 maintenance audit. CI builds and smoke-tests Docker without publishing it.

The Docker image serves `out/` with nginx. `compose.yml` contains an example Traefik setup. The Docker/Traefik deployment strips `/anilist-randomizer` and expects root-relative `/_next/` asset paths, so `next.config.ts` deliberately has no `basePath`.

GitHub Pages at a project subpath requires separate asset routing or a build configured for that subpath. Check both hosting targets before changing `basePath`, nginx routing, or Traefik labels. The optional Pages workflow must be configured for its actual hosting URL before re-enabling it.
