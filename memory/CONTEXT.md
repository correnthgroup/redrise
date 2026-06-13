# CONTEXT

## Project

- **Name**: `Redrise`
- **Purpose**: `Workspace-first SaaS for flows, tasks, agents, analytics and operational control.`
- **Owner**: `Redscale`
- **Source of truth**: `D:\REDSCALE\_PLANROOT\` (Planroot framework)

## Reference

- The visual + structural reference used to scaffold this app is `D:\REDSCALE\__ARQUITETURA\app`.
- The current imported base keeps the prototype stack: `Vite 8 + React 19 + TypeScript + Tailwind v4 + Radix-based shadcn-style UI`.
- The app is now managed with `yarn` via `corepack`.
- Fonts: global default is `Segoe UI` first, then system fallbacks.

## Global product rules

- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: visible read-only fields must use a distinct background by default; current reference color is `#eef2f6`.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: changes should happen after explicit actions by default, not in real time, except Flow and specific future Settings/Tasks exceptions.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: Settings > Personal Information language changes must translate all app-visible copy.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: editable field placeholders use the same gray tone, currently `#d5d5d5`.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: required fields should match the Tasks > New Task required-field formatting.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: app typography defaults to Segoe UI unless an exception is explicit.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: mojibake is forbidden in all languages.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: dropdowns that select Member List must read the current Settings > Member List source.
- Source `D:\REDSCALE\_REDRISE\Atualizacao#1.pdf`: dropdown layout should follow Settings > Personal Information > Language.
- Product memory: `memory/TECHNICAL.md` documents current app behavior, cross-screen dependencies, and planned Settings > Plans/team permission changes in PT-BR.

## Core decisions

See `DECISIONS.md`.
