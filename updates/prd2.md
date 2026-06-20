# Update 2.0 - App-Wide Language Consistency

> Test-first update. Do not promote to production until the full bundle is validated with the rest of Update 2.0 scope.

## Problem

- New accounts default to `English-US` in Settings > Personal Information.
- Some authenticated screens still show mixed English/Portuguese copy because several components use literal text instead of the i18n provider.
- The app must use the profile language saved in Supabase as the single source for authenticated UI language.

## Current Target

- The default language for unauthenticated leads (sign-up/sign-in flow) is English.
- Settings > Personal Information controls the app language through `profiles.language`.
- The authenticated app must render visible UI text through i18n keys wherever practical.
- Changing language in Settings > Personal Information and saving must update the shell, Dashboard, Settings, and other visible app sections.
- Browser `localStorage` must not be the source of truth for the selected language.

## Scope For This Update

- Wire `I18nProvider` to the loaded Supabase profile language.
- Expand i18n keys for Dashboard, shared dashboard blocks, Settings details, Active Sessions, Plans, Flow list, Agent list, Analytics, and common controls.
- Keep database values and user-generated names unchanged.
- Keep AuthFlow copy as current public unauthenticated copy unless a later auth-copy update is approved.
- Migrate all remaining `localStorage` usage to Supabase persistence. The only exception is `app:sidebar:collapsed` (UI-only preference that does not affect data consistency).

### Technical Term Translation Table

- All visible technical terms must be translated to Portuguese when the profile language is PT-BR. Reference mapping:
  - `dashboard` → painel de informações
  - `health check` → nível de saúde
  - `workspace` → área de trabalho
  - `flow` → fluxo
  - `agent` → agente
  - `task` → tarefa
  - `analytics` → analytics
  - `plan` → plano
  - `session` → sessão
  - `audit log` → registro de auditoria
  - `API keys` → chaves de API
  - `team members` → membros da equipe
  - `personal information` → informações pessoais
- The full term table should be maintained as an i18n glossary (e.g. `src/i18n/terms.json` or equivalent) so translators and developers share one reference.
- Do not translate live data: values returned from Supabase queries, integration payloads, agent run outputs, user-generated names, database records, or API responses. Only translate the app's own architectural copy (UI labels, headings, buttons, tooltips, empty states, error messages, status labels).

### Settings > Personal Information Field Map

- Field labels must be translated per the table below when profile language is PT-BR.
- Rename the field `Gender` to `Biological Gender` (PT-BR: `Gênero Biológico`) in both languages.
- Fields `Username` and `Email Address` must be read-only (locked for editing) in the UI.
- Fix the initial render flicker: the page must open with data in its correct final state. Currently, on first render, `username` briefly appears in the `first name` field and `time zone` shows `America/Sao Paulo` before correcting to UTC based on the informed location. This intermediate flash must be eliminated — data should load atomically and display the correct values from the first paint.

| English label | PT-BR label |
|---|---|
| First Name | Primeiro Nome |
| Middle Name | Nome do Meio |
| Last Name | Último Nome |
| Username | Nome de Usuário |
| Biological Gender | Gênero Biológico |
| Birth Date | Data de Nascimento |
| Email Address | Endereço de Email |
| Language | Idioma |

### Deep Copy Pass (Auxiliary / Wizard / Sidebar)

- Beyond primary screens, convert remaining literal copy in:
  - Auxiliary/legacy shared blocks (e.g. `team-members-card.tsx` and similar helper cards).
  - Wizard steps and modals (Create Flow, Create Workspace, Review steps).
  - Sidebar status labels, contextual block titles, empty states, and tooltip text.
  - Topbar subtitle text, breadcrumb labels, and action button captions.
- Skeleton/loading placeholders and error-state messages visible to the user.
- Toast notification titles and descriptions.
- Dropdown/popover menu item labels.
- Empty-state illustrations and call-to-action text.
- Button labels across the entire app (e.g. `Save` → `Salvar`, `Cancel` → `Cancelar`, `Create` → `Criar`, `Edit` → `Editar`, `Delete` → `Excluir`, `Submit` → `Enviar`, `Back` → `Voltar`, `Next` → `Próximo`, `Confirm` → `Confirmar`).
- Wizard step fields, labels, placeholders, and helper text (Create Flow, Create Workspace, Review steps).
- Sidebar status labels, contextual block titles, and all sidebar-visible text must be connected to Supabase (not hardcoded) and wired to i18n keys for translation.
- Dropdown menu labels and role/status selectors must be translated (e.g. `admin/member/viewer` → `admin/membro/visualizador`).
- Member invitation role dropdown must include a new top option `Staff` (→ `Gestão` in PT-BR), placed above the existing `admin` option. The full order becomes: `Staff` / `admin` / `member` / `viewer`.
- Add corresponding i18n keys for all dropdown and select options found across the app.

### Team Members Dropdown (NewWorkspace / NewFlow)

- Both `Dashboard > NewWorkspace` and `Flow > NewFlow` must include a dropdown to select current Team Members.
- The Members dropdown must follow the established pattern: checkbox-based multi-select with a `Select All` option as the first item.
- `Select All` must be translated when profile language changes (PT-BR: `Selecionar Todos`).
- The dropdown must pull members from the Team Members source via `loadTeamMembers()` or `useTeamMemberOptions()`.

### Settings > Plans Translation

- The Plans page (`src/components/blocks/pages/plans-page.tsx`) currently does not respond to language changes. All visible copy on this screen must be wired to i18n keys and update when the profile language is changed.

### Agents Menu Translation

- The Agents menu must translate `Default Agent` → `Agente Padrão` when profile language is PT-BR.
- The `Agent Details` block must be fully wired to i18n keys and respond to language changes.

### Analytics Cards Translation

- The information displayed inside the cards of the Analytics menu must be wired to i18n keys and translate when the profile language changes.

### Team Members Dropdown in Create Flows / Workspaces

- Dashboard > New Workspace must include a dropdown to select current Team Members.
- Flow > New Flow must include a dropdown to select current Team Members.
- The dropdown must source data from Settings > Team Members (via `loadTeamMembers()` or `useTeamMemberOptions()`).
- The dropdown must follow the established pattern documented in the project (multi-select with member names, consistent with the team member picker used elsewhere in the app).

### Required Name Field

- In `Dashboard > NewWorkspace`, the `Name` field must be required.
- In `Flow > NewFlow`, the `Name` field must be required.

### Settings > TeamMembers Function Dropdown

- When editing a member (pencil icon), the `Function` field must be a dropdown with the following options in order: `Staff`, `Member`, `Viewer`.
- The options must be translatable when profile language changes (PT-BR: `Gestão`, `Membro`, `Visualizador`).

### Settings > PersonalInformation Location Search

- The `Location` field must support typing a country name and performing an autocomplete search against a worldwide list of countries.
- Connect the autocomplete to a country data source: use the app's own `redrise-ops` MCP, a REST API (e.g. REST Countries), or a local JSON list — whichever is most practical.
- The field must remain visually normal (white background, standard input style). Do not apply gray/read-only styling to this field.

## Test Build Status

- Implemented in the test bundle: profile-language source of truth, Dashboard copy, Dashboard shared operational cards, AppShell loading/subtitles, Settings shortcuts, Personal Information access notice, Active Sessions, Team Members list/add/edit, API Keys, Audit Log, Change Password, Plans, Flow list, Agent list, Analytics, Create Flow, Create Workspace, and Review Workspace.
- Added E2E coverage: `profile language controls dashboard and settings copy`.
- Updated existing E2E smoke/navigation/workspace selectors to tolerate English or Portuguese while language changes are tested.
- Previous preview deployment details were retired during the `integration@correnth.com` GitHub/Vercel/Supabase reset.

## Remaining Before Production

- Convert remaining authenticated literal copy in `src/components/blocks/pages/create-task-page.tsx`.
- Convert remaining authenticated literal copy in `src/components/blocks/pages/flow-builder-page.tsx`.
- Convert remaining authenticated literal copy in `src/components/blocks/pages/agent-detail-page.tsx`.
- Review auxiliary/legacy shared blocks that are not primary Settings entry points, including `team-members-card.tsx`.
- Build and maintain the i18n glossary for technical term translation (dashboard → painel de informações, etc.).
- Convert deep copy: wizard steps, sidebar status, toasts, dropdown menus, empty states, skeleton placeholders, and error messages.
- Decide whether unauthenticated AuthFlow copy should remain English-only or get a pre-profile language selector/browser-locale fallback in a separate auth-copy update.
- Re-run full validation after the remaining literal-copy pass before any production deployment.

## Validation Required Before Production

- `corepack yarn lint`.
- `corepack yarn typecheck`.
- `corepack yarn test`.
- `corepack yarn build`.
- Targeted or full Playwright E2E covering language selection and Dashboard/Settings copy.
- Preview/test deployment only; production deployment waits until Update 2.0 is approved as a whole.
