# PRD — Atualização#3: Login, Sign Up, Active Sessions e Loading Inteligente

## 1. Problema

- O Sign In e Sign Up compartilham o mesmo componente (`auth-flow.tsx`) mas o Sign Up não tem as mesmas melhorias visuais e de UX.
- O Sign Up não oferece opções OAuth (GitHub, Google, Microsoft) — apenas e-mail/senha.
- O toggle de senha com dois ícones afeta ambos os fluxos.
- As regras de senha no Sign Up precisam de visual consistente com os tokens.
- A tela de loading não distingue entre verificação de credenciais (Sign In) e criação de conta (Sign Up).

## 2. Objetivo

- Alinhar o Sign Up com os mesmos padrões visuais e de UX do Sign In: tokens, OAuth, toggle senha, loading.
- Adicionar provedores OAuth (GitHub, Google, Microsoft) no Sign Up para reduzir fricção de cadastro.
- Manter as regras de senha existentes com visual aprimorado.
- Unificar a experiência visual entre Sign In e Sign Up.

## 3. Usuários / atores envolvidos

- Usuário existente que retorna ao app com sessão lembrada.
- Usuário existente que retorna sem sessão lembrada (precisa logar novamente).
- Usuário novo que faz login após convite.
- Usuário OAuth (GitHub, Google, Microsoft) que escolhe lembrar ou não o acesso.
- Administrador que gerencia sessões ativas em Settings > Active Sessions.

## 4. Solução proposta

### 4.1 Remember Me — Fluxo completo

**Ao fazer login com e-mail/senha + Remember Me marcado:**
1. Login é realizado via Supabase Auth.
2. Dados da sessão são coletados: browser (User-Agent), SO (extrair do User-Agent), país (via IP ou configuração do usuário), IP (header ou API), data/hora atual.
3. Sessão é gravada na tabela `active_sessions` com: `user_id`, `browser`, `os`, `country`, `ip`, `logged_at`, `current=true`.
4. Se já existir sessão com os mesmos parâmetros (`browser + os + country + ip`), não criar duplicata — apenas atualizar `logged_at` e marcar como `current=true`.

**Ao retornar ao app (fechar e reabrir navegador, desligar e ligar computador, etc.):**
1. App verifica se existe sessão em `active_sessions` com `current=true` para o `user_id` atual.
2. Se existir → pula o Sign In e abre o app diretamente (Dashboard).
3. Se não existir → mostra o Sign In normalmente.

**Ao clicar em "Logoff" na Sidebar:**
1. Sessão atual é removida de `active_sessions` (`current=false` ou DELETE).
2. Usuário é redirecionado para o Sign In.

**Ao fechar navegador/sem Logoff:**
1. A sessão NÃO é excluída (localStorage/Supabase mantém).
2. Ao reabrir, o app detecta a sessão e entra automaticamente.

### 4.2 OAuth — Dialog "Remember this access?"

**Ao logar via GitHub/Google/Microsoft:**
1. Login OAuth é realizado via Supabase Auth.
2. Após sucesso, exibir dialog: "Remember this access?" com botões "Yes" e "No".
3. Se "Yes": coletar dados da sessão e gravar em `active_sessions` (mesmo fluxo do Remember Me).
4. Se "No": não gravar sessão. Usuário precisará logar novamente na próxima vez.
5. Dialog deve usar estilo do app (Card, botões primário/secundário).

### 4.3 Active Sessions — Dados coletados

| Campo | Descrição | Fonte |
|---|---|---|
| `browser` | Nome do browser (Chrome, Firefox, Safari, Edge, etc.) | User-Agent string |
| `os` | Sistema operacional (Windows, macOS, Linux, iOS, Android) | User-Agent string |
| `country` | País (conforme Settings > Personal Information > Location) | Campo `location` do perfil ou API de geolocalização por IP |
| `ip` | Endereço IP público | Header `x-forwarded-for` ou API (ex: `ipapi.co`) |
| `logged_at` | Data/hora do login | `new Date().toISOString()` |

### 4.4 Tela de Loading Inteligente

**Ao abrir o app (antes de decidir se mostra Sign In ou Dashboard):**

Exibir tela de loading com mensagem animada:

```
Please wait, we are checking the credentials.
```

↓ (animação de transição)

```
Please wait, we are verifying the session.
```

↓ (animação de transição)

```
Please wait, we are loading your workspace.
```

**Regras:**
- "Please wait," permanece fixo no início.
- O restante da frase muda com animação (fade ou slide).
- Mensagens aparecem em sequência conforme cada etapa é concluída.
- Se a verificação for rápida, mostrar apenas a última mensagem.
- Se houver erro, parar na mensagem relevante e mostrar erro.

## 5. User stories

### Sign In
- Como usuário, quero ver "Credenciais inválidas" ao falhar no login, para saber que devo rever e-mail ou senha sem expor se o e-mail existe.
- Como usuário, quero ver "Signing in..." com spinner no botão durante o login, para saber que algo está acontecendo.
- Como usuário, quero que o ícone de mostrar/ocultar senha funcione com um único ícone, para não confundir a interface.
- Como usuário, quero que o checkbox "Remember Me" tenha visual consistente com o resto do app.
- Como usuário, quero ver botões de GitHub, Google e Microsoft lado a lado antes dos campos de e-mail/senha, para escolher o provedor de login mais rápido.
- Como usuário, quero que o painel de login use as cores e tipografia do app, para parecer um produto único.

### Sign Up
- Como usuário novo, quero ver botões de GitHub, Google e Microsoft no cadastro, para criar conta sem preencher formulário.
- Como usuário novo, quero ver as regras de senha com indicadores visuais (check/uncheck), para saber o que falta cumprir.
- Como usuário novo, quero ver "Creating account..." com spinner durante o cadastro, para saber que algo está acontecendo.
- Como usuário novo, quero que após o cadastro, apareça uma mensagem de confirmação por e-mail clara e visualmente adequada.

### Active Sessions e Loading
- Como usuário, quero que ao marcar "Remember Me" e logar, minha sessão seja gravada para que eu entre automaticamente na próxima vez.
- Como usuário, quero que ao retornar ao app com sessão lembrada, eu entre direto sem precisar logar novamente.
- Como usuário, quero que ao fechar o navegador sem Logoff, minha sessão permaneça ativa para que eu entre automático ao reabrir.
- Como usuário, quero que ao clicar em Logoff, minha sessão seja excluída para que eu precise logar na próxima vez.
- Como usuário OAuth, quero que após logar via GitHub/Google/Microsoft, apareça um dialog perguntando se quero lembrar esse acesso.
- Como usuário, quero que na tela de loading eu veja o que está sendo verificado (credenciais, sessão, workspace) para não ficar em dúvida.
- Como administrador, quero ver em Settings > Active Sessions o browser, SO, país, IP e data/hora de cada sessão.

## 6. Escopo

### Dentro do escopo

- Fix toggle senha: CSS `input::-ms-reveal { display: none }` em `index.css` (afeta Sign In e Sign Up).
- Loading state no botão: spinner + "Signing in..." (Sign In) ou "Creating account..." (Sign Up) durante requisição.
- Tela de loading criativa com mensagens animadas (checking credentials → verifying session → loading workspace).
- **Sign Up**: adicionar botões OAuth (GitHub, Google, Microsoft) lado a lado antes dos campos.
- **Sign Up**: estilizar indicadores de regras de senha com tokens (check verde, uncheck cinza).
- **Sign Up**: mensagem de confirmação pós-cadastro estilizada com tokens.
- **Sign Up**: link "I already have an account" estilizado.
- Remember Me funcional: criar sessão em `active_sessions` ao logar com checkbox marcado.
- Deduplicação de sessão: não criar duplicata se `browser + os + country + ip` já existir.
- Auto-login: ao abrir app, verificar sessão existente e redirecionar para Dashboard se válida.
- Cancelamento no Logoff: excluir sessão ao clicar em Logoff na Sidebar.
- Dialog OAuth: "Remember this access?" com Yes/No após login via GitHub/Google/Microsoft.
- Coleta de dados: browser, OS, country, IP, logged_at.
- Settings > Active Sessions: exibir dados coletados (browser, SO, país, IP, data/hora).
- Alinhamento visual do painel de login/cadastro com tokens de `docs/DESIGN_TOKENS.md`.
- Estilização do checkbox "Remember Me" com tokens.
- Estilização dos botões OAuth com tokens.
- Layout row para provedores OAuth lado a lado.
- Refinamento de espaçamento, tipografia e estados hover/focus.

### Fora do escopo

- Configuração de OAuth no Supabase (Google, Microsoft) — depende de credenciais do provedor.
- API de geolocalização por IP — usar campo `location` do perfil ou fallback.
- Confirm Code (será tratado em PR separado).
- Settings gerais (PR separado).
- Mudanças na estrutura da tabela `active_sessions` (apenas adicionar campos se necessário).
- Alterações na lógica de RLS.

## 7. Decisões de implementação

- **Mensagens de erro**: manter erro genérico "Credenciais inválidas" para falha de login. Para Sign Up, usar mensagens do Supabase Auth (e-mail já existe, etc.).
- **Loading state no botão**: Sign In mostra "Signing in...", Sign Up mostra "Creating account...". Ambos com spinner e `disabled`.
- **Tela de loading**: componente `LoadingScreen` com array de mensagens e intervalo de transição (ex: 1.5s cada). Usar `useState` + `useEffect` com `setInterval`. Animação: `opacity` fade entre mensagens.
- **Sign Up — OAuth**: adicionar botões GitHub, Google, Microsoft antes dos campos, mesmo layout do Sign In.
- **Sign Up — Regras de senha**: manter lógica existente. Visual: indicador verde (regra atendida) ou cinza (não atendida) com tokens `--success` / `--text-disabled`.
- **Sign Up — Mensagem pós-cadastro**: exibir card estilizado com ícone de confirmação e texto "Account created. Check your email and confirm your address before signing in." Botão "Back to Sign In".
- **Sign Up — Validação**: e-mail obrigatório, nome obrigatório, senha deve atender todas as regras antes de habilitar botão.
- **Remember Me (e-mail/senha)**:
  - Após login com sucesso e `rememberMe=true`, chamar `saveRememberedSession()` com dados coletados.
  - Antes de gravar, verificar se já existe sessão com mesmos `browser + os + country + ip`. Se existir, atualizar `logged_at`.
  - Usar `user-agent` para extrair browser e SO. Usar biblioteca leve (ex: `ua-parser-js`) ou parsing manual.
  - País: usar `location` do perfil do usuário (`profiles.location`). Se não houver, usar "Unknown".
  - IP: em produção, vem do header `x-forwarded-for` (Vercel). Em desenvolvimento, usar API `ipapi.co` ou fallback.
- **Auto-login**:
  - No `App.tsx`, ao carregar sessão do Supabase, verificar se existe linha em `active_sessions` com `current=true` para o `user.id`.
  - Se existir → carregar perfil e mostrar `AppShell`.
  - Se não existir → mostrar `AuthFlow`.
- **Cancelamento no Logoff**:
  - No callback de Logoff do `AppShell`, chamar `revokeCurrentSession()` que define `current=false` ou DELETE na linha.
  - Depois chamar `supabase.auth.signOut()`.
- **Dialog OAuth**:
  - Após login OAuth com sucesso, mostrar `Dialog` do Radix com título "Remember this access?" e botões "Yes" / "No".
  - "Yes": gravar sessão em `active_sessions` (mesmo fluxo do Remember Me).
  - "No": fechar dialog e redirecionar para Dashboard sem gravar.
- **Deduplicação**:
  - Usar constraint ou lógica upsert: `INSERT ... ON CONFLICT (user_id, browser, os, country, ip) DO UPDATE SET logged_at = NOW(), current = true`.
  - Se a tabela não suportar constraint, usar lógica de SELECT antes de INSERT.
- **Visual**: consultar `docs/DESIGN_TOKENS.md` para todas as cores.
- **Fix toggle senha**: CSS `input::-ms-reveal { display: none }` em `index.css`.

## 8. Decisões de teste

- **Testes obrigatórios**: lint, typecheck, unit tests, build, E2E (smoke auth + settings + sessions).
- **Casos de teste — Login e-mail/senha**:
  - Login com credenciais inválidas → exibe "Credenciais inválidas".
  - Login com sucesso sem Remember Me → redireciona para Dashboard, SEM criar sessão.
  - Login com sucesso COM Remember Me → redireciona para Dashboard, CRIA sessão em `active_sessions`.
  - Login com Remember Me quando sessão já existe → ATUALIZA `logged_at`, não cria duplicata.
- **Casos de teste — Sign Up e-mail/senha**:
  - Cadastro com e-mail já existente → exibe erro do Supabase (genérico).
  - Cadastro com sucesso → exibe mensagem "Account created. Check your email."
  - Cadastro com senha fraca → regras não atendidas, botão desabilitado.
  - Cadastro com todas as regras de senha atendidas → botão habilitado.
- **Casos de teste — Sign Up OAuth**:
  - Cadastro via GitHub/Google/Microsoft → redireciona para OAuth.
  - Após retorno OAuth → dialog "Remember this access?" aparece.
- **Casos de teste — Auto-login**:
  - Abrir app com sessão ativa → pula Sign In, vai direto para Dashboard.
  - Abrir app sem sessão → mostra Sign In.
  - Fechar navegador e reabrir → sessão persiste, entra automático.
- **Casos de teste — Logoff**:
  - Clicar em Logoff → sessão é removida de `active_sessions`.
  - Próximo acesso → mostra Sign In.
- **Casos de teste — OAuth**:
  - Login via GitHub → dialog "Remember this access?" aparece.
  - Escolher "Yes" → sessão criada em `active_sessions`.
  - Escolher "No" → sessão NÃO criada.
  - Login via Google → mesmo fluxo.
  - Login via Microsoft → mesmo fluxo.
- **Casos de teste — Active Sessions**:
  - Settings > Active Sessions mostra browser, SO, país, IP, data/hora.
  - Sessão duplicada (mesmo browser/SO/país/IP) não é criada.
- **Casos de teste — Loading**:
  - Tela de loading mostra mensagens em sequência: credentials → session → workspace.
  - Animação de transição entre mensagens funciona.
  - Após loading, redireciona corretamente.
- **Comandos de validação**:
  - `corepack yarn lint`
  - `corepack yarn typecheck`
  - `corepack yarn test`
  - `corepack yarn build`
  - `corepack yarn test:e2e`

## 9. Critérios de aceite

- [ ] Toggle de senha mostra apenas um ícone, sem duplicidade do botão nativo (Sign In e Sign Up).
- [ ] Botão "Sign in" mostra spinner + "Signing in..." durante carregamento.
- [ ] Botão "Sign up" mostra spinner + "Creating account..." durante cadastro.
- [ ] Sign Up mostra botões OAuth (GitHub, Google, Microsoft) antes dos campos.
- [ ] Sign Up mostra regras de senha com indicadores visuais (verde/cinza).
- [ ] Sign Up exibe mensagem de confirmação pós-cadastro estilizada.
- [ ] Tela de loading mostra mensagens animadas em sequência antes de decidir Sign In ou Dashboard.
- [ ] Remember Me cria sessão em `active_sessions` ao logar com checkbox marcado.
- [ ] Sessão duplicada (mesmos parâmetros) não é criada — apenas `logged_at` é atualizado.
- [ ] Auto-login funciona: app com sessão ativa pula Sign In e vai para Dashboard.
- [ ] Fechar navegador não cancela sessão — ao reabrir, entra automático.
- [ ] Logoff exclui sessão — próximo acesso mostra Sign In.
- [ ] Dialog OAuth aparece após login via GitHub/Google/Microsoft.
- [ ] "Yes" no dialog cria sessão; "No" não cria.
- [ ] Settings > Active Sessions mostra: browser, SO, país, IP, data/hora.
- [ ] Painel de login/cadastro usa cores e tipografia de `docs/DESIGN_TOKENS.md`.
- [ ] Checkbox "Remember Me" estilizado com tokens.
- [ ] Botões OAuth lado a lado antes dos campos de e-mail/senha.
- [ ] Todos os comandos de validação passam sem erro.

## 10. Riscos e dependências

- **Risco**: User-Agent parsing pode falhar em browsers/exoticos. **Mitigação**: usar fallback "Unknown browser" / "Unknown OS".
- **Risco**: IP pode não estar disponível em desenvolvimento local. **Mitigação**: usar API pública ou fallback "127.0.0.1".
- **Risco**: País pode não estar preenchido no perfil. **Mitigação**: usar "Unknown" como fallback.
- **Risco**: Supabase Auth pode retornar erros diferentes dos esperados. **Mitigação**: usar mensagens genéricas como fallback.
- **Risco**: Dialog OAuth pode não aparecer se o Supabase redirecionar antes do callback. **Mitigação**: usar state param ou detectar retorno OAuth no `App.tsx`.
- **Dependência**: Supabase Auth (projeto `ndfsselzilmdzywcdyoo`).
- **Dependência**: Tabela `active_sessions` deve ter campos: `user_id`, `browser`, `os`, `country`, `ip`, `logged_at`, `current`. Adicionar campos se necessário via migration.
- **Dependência**: Configuração de OAuth no Supabase para Google e Microsoft.
- **Dependência**: `docs/DESIGN_TOKENS.md` para cores.

## 11. Notas para agentes

- Contexto mínimo para executar issues derivadas deste PRD:
  - Auth Flow fica em `src/components/auth/auth-flow.tsx` (contém Sign In e Sign Up).
  - CSS do Auth Flow fica em `src/components/auth/auth-flow.module.css`.
  - CSS global fica em `src/index.css`.
  - Design tokens ficam em `docs/DESIGN_TOKENS.md`.
  - Sessões lembradas ficam em `src/lib/user-profile.ts` (função `saveRememberedSession`).
  - Tabela `active_sessions` no Supabase (já existe da Atualização#1).
  - Perfil do usuário fica em `src/lib/user-profile.ts` (função `loadUserProfile`).
  - Logoff fica no `AppShell` via callback do `Sidebar`.
  - Evento `redrise:profile-updated` atualiza Sidebar e Dashboard.
  - Para User-Agent parsing: usar biblioteca leve ou parsing manual com regex.
  - Para IP: em produção, ler header `x-forwarded-for`. Em dev, usar fallback.
  - Para dialog OAuth: usar `Dialog` do Radix (já disponível em `src/components/ui/dialog.tsx`).
  - Para loading animado: usar `useState` + `useEffect` + `setInterval` com array de mensagens.
  - **A ordem no Sign In**: provedores OAuth → divider "or" → Email → Password → Remember Me → Error → Submit.
  - **A ordem no Sign Up**: provedores OAuth → divider "or" → Full Name → Email → Password (com regras visuais) → Error → Submit → Link "I already have an account".
  - Para Google: `supabase.auth.signInWithOAuth({ provider: 'google' })`.
  - Para Microsoft: `supabase.auth.signInWithOAuth({ provider: 'azure' })`.
  - Rode `corepack yarn lint`, `corepack yarn typecheck`, `corepack yarn test`, `corepack yarn build` antes de entregar.
  - Se encontrar bloqueio, pare e explique objetivamente.
  - Ao finalizar, entregue: resumo das alterações, arquivos alterados, validações executadas, riscos remanescentes.

## Referência visual

- Paleta consolidada: `docs/DESIGN_TOKENS.md`
- Consultar este arquivo antes de alterar cores, sombras, raios ou ícones.

## Graphify

- Grafo do projeto gerado em `graphify-out/graph.json`.
- 956 nós, 987 arestas, 181 comunidades.
- God Nodes: `compilerOptions`, `logAuditEvent()`, `App.tsx`, `supabase`.
- Comunidades relevantes: Auth & Routing, Auth Flow, Profiles & Sessions.
