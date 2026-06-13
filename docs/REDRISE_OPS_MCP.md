# Redrise Ops MCP

`redrise-ops` is a local MCP server for operational tasks in this repository.

It wraps the existing CLIs instead of replacing them:

- Yarn/Corepack for validation and build.
- Vercel CLI for production deployment.
- Supabase CLI for Edge Function deployment and status checks.
- Memory files for post-change notes.

## Start Command

```powershell
corepack yarn mcp:redrise-ops
```

## Tools

- `validate_all`: runs lint, typecheck, unit tests, build, and optionally E2E.
- `build_frontend`: runs `corepack yarn build`.
- `prepare_vercel_prebuilt`: creates `.vercel/output` from `dist`.
- `deploy_frontend_prebuilt`: deploys `.vercel/output` with `vercel deploy --prebuilt --prod --yes --force`.
- `check_vercel_status`: inspects `https://redrise-app.vercel.app`.
- `deploy_supabase_function`: deploys allowlisted Supabase Edge Functions. Current allowlist: `invite-member`.
- `check_supabase_status`: lists Supabase Edge Functions.
- `graph_status`: checks whether `graphify-out/graph.json` exists.
- `append_memory_note`: appends a short note to an allowlisted memory file.

## Safety Rules

- The MCP does not run arbitrary shell commands.
- Supabase function deploy is allowlisted.
- Vercel deploy uses prebuilt output to avoid the remote `npm install` project setting.
- Memory writes are limited to known `memory/*.md` files.
- It does not run destructive git, Supabase, or Vercel commands.

## Current Vercel Context

Normal Vercel deploys can still fail because the remote project settings currently show:

- Install Command: `npm install`
- Build Command: `npm run build`

Until that is changed in Vercel, prefer the MCP prebuilt deploy path.
