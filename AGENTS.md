# Agent instructions

## Git

**Never push to the remote unless the user explicitly asks you to.**

**Always run `pnpm check` before opening a PR.** Fix any failures first — do not open or update a pull request until it passes locally.

## Planning

When creating a plan, always review **Vercel best practices** first and align the plan with them. Read the relevant skills before drafting:

- `vercel-react-best-practices` — React/Next.js performance patterns
- `nextjs` / `next-best-practices` — App Router, RSC, caching, data fetching
- Other Vercel skills as needed (e.g. `vercel-functions`, `cdn-caching`, `env-vars`)

Call out in the plan where recommendations follow or diverge from those guides.

## Project

Next.js 16 explorer for Tempo MPP sessions (TIP-1034 channels). Postgres via Prisma 7, TIDX sync via cron, charts with Recharts.

## Commands

```bash
pnpm dev          # local server
pnpm sync         # fetch channel logs (dev server must be running)
pnpm check        # biome + tsc + knip
pnpm db:push      # apply Prisma schema to Neon
pnpm db:sql       # apply prisma/sql/aggregates.sql (rollup tables) to Neon
pnpm db:prep      # one-off: nullable unused columns before reclaim
pnpm db:reclaim   # one-off: drop unused columns, VACUUM FULL (pause cron)
```

Node **20.20.0** (`.nvmrc`), pnpm **9.15.0** (`packageManager` in `package.json`).

After every major feature: `pnpm check`, then agent-browser on the local UI when there is a visible surface.

## Environment

Required at app startup. Copy `.env.example` to `.env.local`.

| Variable         | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `DATABASE_URL`   | Neon Postgres (from `vercel env pull`)       |
| `CRON_SECRET`    | Protects `/api/cron/sync`                    |
| `TEMPO_API_KEY`  | Tempo Indexer API (`tempo:sk:...`)           |
| `TEMPO_RPC_URL`  | Optional; defaults to `https://rpc.tempo.xyz` |

Do not require `DISCORD_ALERTS_WEBHOOK_URL`.

## Conventions

- shadcn primitives in `src/components/ui/` — add via CLI, don’t hand-copy
- Dark-only; brand colors `#00ADB5` / `#393E46` only when color is needed
- Minimal UI — prefer whitespace and typography over decoration
- **Never use `biome-ignore`** — fix the underlying issue instead (e.g. use `next/image` for remote images, add `remotePatterns` in `next.config.ts`)
- **viem + Tempo first** — `Abis`/`Addresses`/`decodeEventLog`/`client.channel.getStates` before any custom ABI or RPC code; no `mppx` in this repo
- Review Vercel React / Next.js skills before changing UI or data fetching
