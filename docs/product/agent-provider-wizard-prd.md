# PRD: Agent Provider Wizard And Agent Board Actions

## Goal

- Make `New Agent` configure a real AI provider connection before creating the Agent.
- Let users choose OpenAI, Anthropic, Google, or OpenRouter in the first wizard step.
- Store the selected provider/method and link the Agent to a persisted provider connection.
- Add per-Agent quick actions in the Agent board using a compact FAB-style menu.
- Improve completion feedback so final action buttons show an updating state instead of appearing static.

## Scope

- `New Agent` becomes a four-step wizard:
- Step 1: Basic Info and Provider.
- Step 2: Connection Method / Credentials.
- Step 3: Connection Test.
- Step 4: Review.
- Provider choices: OpenAI, Anthropic, Google, OpenRouter.
- Anthropic, Google, and OpenRouter require an API key in Step 2.
- OpenAI supports three methods: ChatGPT Pro/Plus (Browser), ChatGPT Pro/Plus (Headless), and API.
- OpenAI API requires an API key.
- OpenAI Browser/Headless establish a Redrise runtime connection profile without an API key in this slice.
- Connection tests run through Supabase Edge Function `agent-provider-test`.
- Provider connections persist as `integrations` rows with `category = agent_provider`.
- Agents store provider, auth method, provider connection id, and connection status.
- Only the organization `Admin` role can configure, create, rename, or delete Agents.
- Non-Admin roles attempting to create/configure an Agent see a pop-up: `Contate o Administrador da Organização` / `Contact the Organization Administrator`.
- Agents configured by Admin are available for use across the organization to all roles except `Viewer`.
- `Viewer` can see permitted reporting surfaces but must not use Agents to execute work.
- Agent List cards get a right-side FAB menu with: View Details, Rename, Delete.
- Delete requires typing `DELETE` before the action is effective.
- Final/confirm action buttons should show an “updating” state while processing.

## Out Of Scope

- Full OAuth/login automation for ChatGPT Browser/Headless.
- Browser automation runtime execution for ChatGPT sessions.
- Provider-specific model catalog management.
- Billing or plan enforcement for provider choice.
- Secrets vault migration beyond existing Supabase-backed integration storage.

## UX Requirements

- Step 1 has only `Name` as required input and provider buttons beneath it.
- If the current user is not an organization Admin, opening New Agent must not show the wizard; it shows the administrator contact pop-up instead.
- Provider buttons show a recognizable local logo/mark next to provider name.
- Step 2 changes based on provider/method.
- Step 3 must provide a clear test button and success/error result.
- Step 4 summarizes Agent name, provider, method, connection status, and model.
- Final create button displays an updating/loading label while the Agent is being created.
- Agent List actions use the existing compact `+`/FAB pattern used elsewhere in the app.
- Rename should update the Agent in place and refresh the list state.
- Delete should not run unless the user types `DELETE` exactly.
- Rename/Delete actions appear only for Admin users.
- View Details remains available for any role that can use/view the Agent.

## Data Requirements

- Add nullable Agent columns:
- `provider_connection_id text` references `integrations(id)` by convention.
- `provider_auth_method text` stores `api`, `chatgpt_browser`, or `chatgpt_headless`.
- `provider_connection_status text` stores `untested`, `connected`, or `error`.
- Existing `agents.provider` remains the provider id.
- Existing `agents.model` remains the selected/default model label.
- Persist provider credential/config in `integrations.config` for `agent_provider` category.
- Admin-created Agents should use the active organization owner context as `agents.user_id`, not the individual invited Admin account id.
- Agent catalog loading should return organization Agents to all active non-Viewer roles.
- Agent management writes should remain Admin-only.

## Validation

- Run `corepack yarn lint`.
- Run `corepack yarn build`.
- Run `corepack yarn test:e2e` when implementation changes navigation/authenticated workflows.
- Smoke `agent-provider-test` without logging or exposing API keys.
