# TASK_LOG

> Current/future task record only. Past chronological implementation details were removed by request.

## Current Production Snapshot

- Official URL: `https://redrise.github.io`.
- Current production deployment: GitHub Pages.
- Production status: deployment enabled at the GitHub Pages technical URL; `redrise.github.io` requires a controlled GitHub account/org named `redrise` and repo `redrise.github.io`.
- Backend: Supabase project `vsaropewydcjsvplpugx`.
- GitHub repository: `https://github.com/correnthgroup/redrise.git`.
- Package manager: Yarn through Corepack.
- Deploy path: GitHub Pages workflow.
- Workspace root is now `D:\studio\redrise`; legacy briefing/framework/backlog folders are not active guidance.

## Current App Snapshot

- Auth is Supabase e-mail/password.
- Sign Up suppresses Supabase's automatic session and returns to Sign In.
- OAuth is archived for future provider setup.
- E-mail confirmation is archived for future sender/SMTP/template setup.
- Profiles, active sessions, and team members are Supabase-backed.
- Flow/Tasks member dropdowns use Settings > Team Members data.
- Settings > Plans is not billing yet.

## Last Verified Baseline

- `corepack yarn lint` passed.
- `corepack yarn typecheck` passed.
- `corepack yarn test` passed.
- `corepack yarn build` passed.
- `corepack yarn test:e2e tests/settings.spec.ts tests/workspaces.spec.ts --workers=1` passed with 8/8 tests after stabilizing Settings shortcuts with `data-testid`.
- `C:\Python314\python.exe -m graphify update .` produced 1193 nodes, 1270 edges, and 201 communities after Update 2.0 i18n changes.

## Next Tasks

- **PRD3 (Update 3.0)**: Resolve Settings menu definitively. 4 phases: Critical Fixes, High-Priority Gaps, Quality/Polish, i18n Completion. See `updates/prd3.md`.
- Keep docs and memory current/future only; do not re-add historical implementation archives as active guidance.
- Finish the remaining Update 2.0 deep-copy conversion outside the current PRD2 test-bundle scope before production deployment.
- Refresh `graphify-out` for the latest PRD2 code changes when the local `graphify` CLI/interpreter path is available again.
- Execute `updates/update1.4_colors.md` only if the future auth visual update is approved.
- Implement real Stripe billing only after plan matrix, checkout, webhook, and permission matrix are approved.
- Re-enable OAuth only after official provider credentials exist.
- Re-enable e-mail confirmation only after official transactional e-mail setup exists.
- Keep GitHub Pages, Supabase Auth redirects, and app allowed origins aligned with `https://redrise.github.io`.
