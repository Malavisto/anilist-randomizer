# Newcomer Guide

## What this project is

Anilist Randomizer is a small **Next.js App Router** application that asks for an AniList username, fetches that user's anime list from AniList's GraphQL API, and shows one random entry.

## Project structure

- `src/app/`: Next.js app shell and route entry points (`layout.tsx`, `page.tsx`, global styles).
- `src/components/`: UI components, including the main feature component `anime-randomizer.tsx`.
- `src/components/ui/`: reusable primitive components (Button, Input, Card).
- `src/lib/`: small shared utilities (`cn` className merger helper).
- `public/`: static assets.
- Root config/deployment files:
  - `next.config.ts`: static export mode.
  - `tailwind.config.ts`: Tailwind scanning and theme extension.
  - `Dockerfile`, `nginx.conf`, `compose.yml`: containerized static hosting.

## Runtime flow

1. `src/app/page.tsx` renders `<AnimeRandomizer />`.
2. `AnimeRandomizer` stores username/loading/error/result in React state.
3. On submit, it sends a GraphQL POST request to `https://graphql.anilist.co`.
4. It flattens all list entries and picks one random anime.
5. It renders title/cover/metadata and sanitizes the API description text.

## Important implementation details

- This app is currently **client-driven**: API calls happen directly from the browser.
- AniList description HTML is sanitized with `sanitize-html` before rendering.
- UI is styled with Tailwind classes and lightweight component primitives.
- The app is configured for `next export`, then served as static files behind Nginx.

## Good next steps for contributors

1. Add automated tests (unit tests for randomizer logic, component tests for form states).
2. Move AniList requests behind a server route to improve reliability and error handling.
3. Add stricter typing around API nullability and optional fields.
4. Improve UX: retry state, username persistence, and filter options (status/genre).
5. Document local + production deploy paths in README with architecture notes.
