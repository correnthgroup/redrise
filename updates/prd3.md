# Update 3.0 - Settings Menu: Definitive Resolution

> Test-first update. All changes must pass lint/typecheck/test/build/E2E before production promotion.

## Problem

The Settings menu has 8 sub-pages with inconsistent quality: some are fully functional with Supabase integration, others are non-functional placeholders or have critical gaps.

### Current State

| Sub-page | Supabase | i18n | Status |
|----------|----------|------|--------|
| Personal Info | Full | Full | Working (base64 avatar, no email change) |
| Change Password | None | Full | Broken -- form submits nothing |
| Active Sessions | Full | Full | Working (no real-time refresh) |
| API Keys | Full | ~95% | Working (plaintext secrets, no delete) |
| Integrations | Create only | ~80% | Partial (fake test, no management) |
| Team Members | Full | Full | Working (no remove, aggressive polling) |
| Plans | None | Full | Placeholder -- no real billing |
| Audit Log | Read only | ~90% | Working (no pagination, hardcoded labels) |

## Scope

### UI - Settings Navigation (CONCLUIDO)

- [x] Remover header bar (`Back` button) de `settings-page.tsx` para sub-páginas.
- [x] Adicionar botão `← Back` individual em cada sub-página da Settings.
- [x] `Personal Information`: botão `← Back` no footer esquerdo, oposto ao `Save Changes`.
- [x] `Change Password`: botão `Cancel` renomeado para `← Back`, vinculado a `onBack`.
- [x] `Active Sessions`: botões `← Back` e `Refresh` no footer (esquerda/direita).
- [x] `API Keys`: botão `← Back` no footer esquerdo, `New Key` no footer direito.
- [x] `Integration Setup`: botão `← Back` no wizard step navigation funcional (step 1 → Settings, steps 2-4 → step anterior).
- [x] `Team Members`: botão `← Back` no footer esquerdo.
- [x] `Plans`: botão `← Back` abaixo do grid, canto esquerdo.
- [x] `Audit Log`: botão `← Back` no footer esquerdo.
- [x] Todos os botões `← Back` usam mesma classe: `<Button variant="outline" size="sm">` com `<ArrowLeft>` + `t('common.back')`.
- [x] `typecheck`, `lint` e `test` passando (7/7).

### Members List Features (CONCLUIDO)

- [x] Modal "Add Member" atualizado: opções de permissão → Owner, Board, Member, Viewer.
- [x] Owner mapeado para `owner`, Board para `admin`, Member para `member`, Viewer para `viewer` no Supabase.
- [x] Verificação de e-mail: busca na tabela `profiles` com debounce 500ms.
- [x] Mensagem se e-mail já cadastrado: "E-mail already registered. Invite them to join." (verde `#2F5D5A`).
- [x] Mensagem se e-mail não cadastrado: "E-mail not yet registered. Invite them to join." (cinza).
- [x] Mensagens em PT-BR: "E-mail já cadastrado. Convide-o para se juntar." / "E-mail ainda não cadastrado. Convide-o para se juntar."
- [x] Paginação PAGE_SIZE=7 já existente com botões Previous/Next.
- [x] Função `checkEmailExists()` adicionada em `team-members.ts`.
- [x] `typecheck`, `lint` e `test` passando.

### Demais fases

- [PENDENTE] Instruções detalhadas das próximas fases serão passadas separadamente.

## Validation Required Before Production

1. `corepack yarn lint` -- zero errors.
2. `corepack yarn typecheck` -- zero errors.
3. `corepack yarn test` -- all tests pass.
4. `corepack yarn build` -- successful production build.
5. Manual testing of each sub-page.
6. Playwright E2E: extend `tests/settings.spec.ts`.
7. PT-BR language test: switch language, verify all labels translate.
