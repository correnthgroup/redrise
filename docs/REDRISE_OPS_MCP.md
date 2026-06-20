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
- `check_vercel_status`: inspects the configured `APP_BASE_URL` production alias.
- `deploy_supabase_function`: deploys allowlisted Supabase Edge Functions. Current allowlist: `invite-member`.
- `check_supabase_status`: lists Supabase Edge Functions.
- `graph_status`: checks whether `graphify-out/graph.json` exists.
- `append_memory_note`: appends a short note to an allowlisted memory file.

## Safety Rules

- The MCP does not run arbitrary shell commands.
- Supabase function deploy is allowlisted.
- Vercel deploy uses prebuilt output to avoid the remote `npm install` project setting.
- Vercel deploy runs from a temporary non-git directory so Vercel does not block CLI deployments because of local Git author attribution.
- Memory writes are limited to known `memory/*.md` files.
- It does not run destructive git, Supabase, or Vercel commands.

## Current Vercel Context

The current operating target is a fresh GitHub/Vercel/Supabase setup owned through `integration@correnth.com`.

Normal Vercel deploys should use the repository connection once the new Vercel project is linked to:

```text
https://github.com/correnthintegration/redrise.git
```

If remote project settings ever diverge from this repository, verify they match:

- Install Command: `corepack yarn install --frozen-lockfile`
- Build Command: `corepack yarn build`
- Output Directory: `dist`

The MCP prebuilt deploy path remains available as a fallback, not the primary CI/CD path.
