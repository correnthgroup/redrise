# Redrise Ops MCP

`redrise-ops` is a local MCP server for operational tasks in this repository.

It wraps the existing CLIs instead of replacing them:

- Yarn/Corepack for validation and build.
- Supabase CLI for Edge Function deployment and status checks.
- Memory files for post-change notes.

## Start Command

```powershell
corepack yarn mcp:redrise-ops
```

## Tools

- `validate_all`: runs lint, typecheck, unit tests, build, and optionally E2E.
- `build_frontend`: runs `corepack yarn build`.
- `deploy_supabase_function`: deploys allowlisted Supabase Edge Functions. Current allowlist: `invite-member`.
- `check_supabase_status`: lists Supabase Edge Functions.
- `graph_status`: checks whether `graphify-out/graph.json` exists.
- `append_memory_note`: appends a short note to an allowlisted memory file.

## Safety Rules

- The MCP does not run arbitrary shell commands.
- Supabase function deploy is allowlisted.
- Memory writes are limited to known `memory/*.md` files.
- It does not run destructive git or Supabase commands.

## Current Render Context

The current operating target is Render, in the `Redrise` project/workspace connected to:

```text
https://github.com/correnthgroup/redrise.git
```

Render deploy configuration lives in `render.yaml`.

Expected static site settings:

- Build Command: `corepack enable && corepack yarn install --frozen-lockfile && corepack yarn build`
- Publish Directory: `dist`
- Runtime: static
- Service name: `redrise`
