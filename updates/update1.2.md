# Atualização#2

## Objetivo

- Implementar a primeira versão do submenu `Settings > Plans` sem ativar cobrança real ainda.
- Adicionar aviso de acesso ativo em `Settings > Personal Information`.
- Melhorar o mecanismo de equipe para reconhecer e-mails que já têm perfil no app sem expor busca aberta de usuários.
- Proteger a arquitetura atual contra alterações que quebrem perfil, membros, dropdowns, convites, navegação e planos.

## Implementado Agora

- `Settings > Plans` foi adicionado como novo submenu em Settings.
- A tela Plans mostra três colunas: `Free`, `Business` e `Corporate`.
- O conteúdo dos planos usa placeholders para limites, preços e benefícios até a configuração definitiva.
- `Business` e `Corporate` têm CTA `Join Now`.
- O CTA ainda não inicia pagamento real; ele mostra aviso de que o checkout Stripe está pronto para configuração futura.
- A tela Plans já reconhece retorno futuro com `?checkout=success` e mostra aviso para reiniciar o app.
- O aviso de sucesso mostra o texto: `Restart the app for the new features to take effect.`
- O aviso tem botão `Restart Now`, que recarrega o app na origem.
- `Settings > Personal Information` agora mostra `Active access: Admin/Member/Viewer`.
- Clicar no texto de acesso abre popover explicando o que aquele acesso permite.
- O popover tem botão `Details`, que leva para `Settings > Plans`.
- `invite-member` agora procura, no backend, se o e-mail convidado já existe em `profiles`.
- Se o e-mail já tem perfil, a função cria ou atualiza o membro com `member_user_id` preenchido e status `active`.
- Se o e-mail não tem perfil, a função mantém o fluxo de convite por e-mail com status `invited`.
- A função bloqueia convite do próprio e-mail para evitar rebaixar o papel da própria conta.

## Solução Para Riscos Ao Alterar

- Adotamos uma camada de contrato leve, complementar à arquitetura atual.
- Perfil continua centralizado em `src/lib/user-profile.ts` e na tabela `profiles`.
- Membros continuam centralizados em `src/lib/team-members.ts`, `loadTeamMembers()` e `useTeamMemberOptions()`.
- Dropdowns de membros em Flow e Tasks continuam lendo Settings > Team Members como fonte única.
- Plans não libera recurso pago por estado local; por enquanto só informa e prepara o caminho de checkout.
- Pagamento real ficará condicionado a backend Stripe, webhook e persistência Supabase.
- O aviso de acesso é informativo e não substitui permissões reais de backend/RLS.
- Convite de usuário existente usa busca exata no backend, evitando busca aberta que poderia vazar e-mails.
- A navegação de Settings continua usando o estado interno atual com botão Back preservado.

## Ainda Pendente

- Definir matriz real dos planos Free, Business e Corporate.
- Definir preços e limites reais por plano.
- Criar backend Stripe para checkout.
- Criar webhook Stripe para confirmar pagamento.
- Criar tabela definitiva de assinatura/plano no Supabase.
- Definir matriz real de permissões por plano e por papel: Admin, Member, Viewer.
- Decidir se usuário existente deve ser adicionado direto ou aceitar convite antes de entrar na equipe.
- Adicionar aviso visual quando o convite foi registrado mas o e-mail não saiu por rate limit do Supabase.

## Validação Esperada

- `corepack yarn lint`
- `corepack yarn typecheck`
- `corepack yarn test`
- `corepack yarn build`
- `corepack yarn test:e2e`

## Status De Deploy

- Edge Function `invite-member` foi publicada no Supabase remoto.
- Frontend foi validado localmente com build e E2E completos.
- Frontend foi publicado em produção via Vercel Build Output API/prebuilt.
- A URL oficial `https://redrise-app.vercel.app` aponta para deployment `dpl_BkpB7XcJUbtqC4edKWEdzBEW5oQZ`, status `Ready`.
- O projeto Vercel remoto ainda mostra `Install Command npm install` e `Build Command npm run build`; deploys normais podem continuar falhando até isso ser corrigido no dashboard ou via API autorizada.
- Workaround atual de deploy: rodar `corepack yarn build`, gerar `.vercel/output` a partir de `dist`, e publicar com `vercel deploy --prebuilt --prod --yes --force`.

## MCP Redrise Ops

- Criado MCP próprio do app: `redrise-ops`.
- Start command: `corepack yarn mcp:redrise-ops`.
- O MCP encapsula operações seguras sobre Yarn/Corepack, Vercel CLI, Supabase CLI, memória e graphify status.
- Ferramentas iniciais: `validate_all`, `build_frontend`, `prepare_vercel_prebuilt`, `deploy_frontend_prebuilt`, `check_vercel_status`, `deploy_supabase_function`, `check_supabase_status`, `graph_status`, `append_memory_note`.
- O MCP não roda comandos shell arbitrários.
- O MCP usa deploy prebuilt para evitar o problema atual do projeto Vercel remoto ainda configurado com npm.
- Documentação: `docs/REDRISE_OPS_MCP.md`.
