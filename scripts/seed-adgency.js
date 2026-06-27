/**
 * ============================================================
 * REDRISE — Seed Script: ADGency (Caso de Uso 2 — Comercial)
 * ============================================================
 *
 * COMO USAR:
 *  1. Abra https://www.redrise.app/ (deve estar logado)
 *  2. Abra DevTools (F12) → aba Console
 *  3. Cole este script INTEIRO e pressione Enter
 *  4. Se pedir a "anon key", veja instruções abaixo
 *
 * PARA OBTER A ANON KEY (se necessário):
 *  - DevTools → Network → qualquer request para .supabase.co
 *  - Clique no request → Headers → procure "apikey"
 *  - Copie o valor longo e cole no prompt
 *
 * O que este script cria:
 *  ✓ Workspace: ADGency (saúde: healthy)
 *  ✓ Flow: Lead → Proposta → Pedido (status: running)
 *  ✓ 5 FlowCards no canvas (pipeline n1→n2→n3→n4→n5)
 *  ✓ 4 FlowEdges (conexões animadas)
 *  ✓ 5 Tasks com prompts reais do caso de uso
 *  ✓ Card "Criar Pedido" com approvers obrigatórios
 */

;(async () => {
  'use strict'

  // ════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════

  const rand = (n = 5) => {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join('')
  }
  const rid = p => p + rand()
  const ts  = () => new Date().toISOString()

  // ════════════════════════════════════════════════════════
  //  SUPABASE CLIENT — try app module first, fallback to manual
  // ════════════════════════════════════════════════════════

  let supabase

  // Attempt 1: import the app's existing Supabase client
  try {
    const m = await import('/src/lib/supabase.ts')
    supabase = m.supabase
    console.log('[seed] ✓ Connected via app module')
  } catch (_) {
    // Attempt 2: find URL from network, ask for anon key
    console.log('[seed] App module import failed, using manual setup...')

    const res = performance.getEntriesByType('resource')
    const hit = res.find(e => /supabase\.co/.test(e.name))
    if (!hit) {
      console.error('[seed] ❌ Cannot detect Supabase URL. Make sure you are logged in.')
      return
    }
    const base = new URL(hit.name).origin

    let key = window.__SEED_ANON_KEY
    if (!key) {
      key = prompt(
        'Cole a SUPABASE ANON KEY:\n\n' +
        '(DevTools → Network → request .supabase.co → Headers → apikey)'
      )
    }
    if (!key) { console.error('[seed] Aborted — no key.'); return }
    window.__SEED_ANON_KEY = key

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    supabase = createClient(base, key)
    console.log('[seed] ✓ Connected via manual setup')
  }

  // ════════════════════════════════════════════════════════
  //  AUTH CHECK
  // ════════════════════════════════════════════════════════

  const { data: { user }, error: ae } = await supabase.auth.getUser()
  if (ae || !user) {
    console.error('[seed] ❌ Not authenticated. Log in at redrise.app first.')
    return
  }
  console.log(`[seed] Auth: ${user.email} (${user.id.slice(0, 8)}…)`)

  // ════════════════════════════════════════════════════════
  //  CHECK EXISTING
  // ════════════════════════════════════════════════════════

  const { data: wsExist } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('name', 'ADGency')
    .eq('user_id', user.id)
    .limit(1)

  let WS_ID
  if (wsExist?.length) {
    const ok = confirm(
      `ADGency já existe (ID: ${wsExist[0].id}).\n\n` +
      'OK → adicionar cards e tasks a ele\n' +
      'Cancelar → abortar'
    )
    if (!ok) { console.log('[seed] Aborted.'); return }
    WS_ID = wsExist[0].id
    console.log(`[seed] Using existing workspace: ${WS_ID}`)
  }

  // ════════════════════════════════════════════════════════
  //  1. WORKSPACE
  // ════════════════════════════════════════════════════════

  if (!WS_ID) {
    WS_ID = rid('w')
    console.log('[seed] Creating workspace ADGency...')
    const { error } = await supabase.from('workspaces').insert({
      id: WS_ID,
      user_id: user.id,
      name: 'ADGency',
      mission: 'Transformar leads em propostas e pedidos com controle, aprovação e rastreabilidade.',
      status: 'healthy',
      flows: 0,
      created_at: ts(),
      updated_at: ts(),
    })
    if (error) { console.error('[seed] ❌ workspace:', error.message); return }

    await supabase.from('workspace_members').insert({
      id: rid('wm'), workspace_id: WS_ID, user_id: user.id,
      role: 'owner', invited_by: user.id,
    })
    console.log(`[seed] ✓ Workspace: ${WS_ID}`)
  }

  // ════════════════════════════════════════════════════════
  //  2. FLOW
  // ════════════════════════════════════════════════════════

  const FL_ID = rid('f')
  console.log('[seed] Creating flow...')
  const { error: fe } = await supabase.from('flows').insert({
    id: FL_ID,
    user_id: user.id,
    workspace_id: WS_ID,
    name: 'Lead → Proposta → Pedido',
    status: 'running',
    approval_status: 'not_requested',
    is_official: false,
    source_type: 'user',
    members: [user.id],
    created_by_user_id: user.id,
    primary_responsible_user_id: user.id,
    created_at: ts(),
    updated_at: ts(),
  })
  if (fe) { console.error('[seed] ❌ flow:', fe.message); return }

  await supabase.rpc('increment_workspace_flows', { ws_id: WS_ID }).catch(() =>
    supabase.from('workspaces').select('flows').eq('id', WS_ID).single()
      .then(r => r.data && supabase.from('workspaces').update({ flows: (r.data.flows ?? 0) + 1 }).eq('id', WS_ID))
  )
  console.log(`[seed] ✓ Flow: ${FL_ID}`)

  // ════════════════════════════════════════════════════════
  //  3. FLOW CARDS (5 nós no canvas)
  // ════════════════════════════════════════════════════════

  const CARDS = [
    { nid: 'n1', label: 'Identificar Lead',             x: 0,    y: 100, approve: false },
    { nid: 'n2', label: 'Validar Cliente',              x: 300,  y: 100, approve: false },
    { nid: 'n3', label: 'Consultar Produtos e Estoque', x: 600,  y: 100, approve: false },
    { nid: 'n4', label: 'Gerar Proposta',               x: 900,  y: 100, approve: false },
    { nid: 'n5', label: 'Criar Pedido',                 x: 1200, y: 100, approve: true  },
  ]

  const AGENT = 'Default Agent'

  const cardRows = CARDS.map((c, i) => ({
    id: rid('c'),
    flow_id: FL_ID,
    node_id: c.nid,
    label: c.label,
    instructions: '',
    members: [],
    agents: [AGENT],
    approvers: c.approve ? [user.id] : [],
    run_order: i + 1,
    execution_policy: 'sequential',
    position_x: c.x,
    position_y: c.y,
    created_at: ts(),
    updated_at: ts(),
  }))

  const { error: ce } = await supabase.from('flow_cards').insert(cardRows)
  if (ce) { console.error('[seed] ❌ cards:', ce.message); return }
  console.log(`[seed] ✓ ${cardRows.length} cards`)

  // ════════════════════════════════════════════════════════
  //  4. FLOW EDGES (pipeline n1→n2→n3→n4→n5)
  // ════════════════════════════════════════════════════════

  const edgeData = [
    ['n1','n2'], ['n2','n3'], ['n3','n4'], ['n4','n5']
  ]
  const edgeRows = edgeData.map(([s, t], i) => ({
    id: rid('e'), flow_id: FL_ID, edge_id: `e${i+1}`,
    source: s, target: t, animated: true, created_at: ts(),
  }))

  const { error: ee } = await supabase.from('flow_edges').insert(edgeRows)
  if (ee) { console.error('[seed] ❌ edges:', ee.message); return }
  console.log(`[seed] ✓ ${edgeRows.length} edges`)

  // ════════════════════════════════════════════════════════
  //  5. TASKS (1 por card, com prompts reais)
  // ════════════════════════════════════════════════════════

  const TASKS = [
    {
      card: 'n1', qp: 1, title: 'Identificar Lead no CRM',
      brief: 'Buscar lead ou empresa informada pelo usuário no CRM.',
      objective: 'Localizar o lead, seu histórico, estágio do funil e contexto comercial.',
      prompt: `Busque no CRM o lead ou empresa informado pelo usuário.

Retorne:
- Nome do lead / empresa
- Responsável pelo contato
- Estágio do funil
- Histórico de interações
- Última objeção registrada
- Origem do lead
- Próximos passos já registrados

Se houver duplicidade de cadastro, sinalize antes de prosseguir.`,
      priority: 'medium', path: 'mock_integration',
    },
    {
      card: 'n2', qp: 1, title: 'Validar Cadastro no ERP',
      brief: 'Verificar dados cadastrais, crédito e pendências no ERP.',
      objective: 'Garantir que o cliente está apto a receber proposta comercial.',
      prompt: `Consulte o cadastro do cliente no ERP usando CNPJ, CPF ou razão social.

Verifique:
- Status cadastral (ativo, inativo, bloqueado)
- Limite de crédito disponível
- Pendências comerciais ou fiscais
- Dados fiscais necessários para proposta (IE, IM, regime tributário)

Não exponha dados sensíveis desnecessários.`,
      priority: 'medium', path: 'mock_integration',
    },
    {
      card: 'n3', qp: 1, title: 'Consultar Produtos, Preço e Estoque',
      brief: 'Checar disponibilidade, preço e condições comerciais.',
      objective: 'Garantir que os produtos da proposta existem e estão disponíveis.',
      prompt: `Com base na oportunidade do CRM e nos produtos solicitados, consulte:
- Preço atual de cada item
- Estoque disponível
- Condições comerciais (desconto máximo, promoção ativa)

Indique:
- Produtos indisponíveis e alternativas equivalentes
- Prazo estimado de reposição se aplicável
- Impacto no valor total da proposta`,
      priority: 'medium', path: 'mock_integration',
    },
    {
      card: 'n4', qp: 1, title: 'Gerar Proposta Comercial',
      brief: 'Montar documento estruturado com itens, preço e condições.',
      objective: 'Produzir proposta profissional e completa para aprovação.',
      prompt: `Gere uma proposta comercial em formato estruturado:

1. Dados do cliente (razão social, CNPJ, contato)
2. Itens da proposta (produto, quantidade, valor unitário, subtotal)
3. Valor total
4. Desconto sugerido (se aplicável)
5. Validade da proposta (ex: 15 dias)
6. Condições de pagamento
7. Observações comerciais

Se o desconto sugerido superar a política do processo (ex: > 10%), solicite aprovação do Manager antes de finalizar.`,
      priority: 'medium', path: 'mock_integration',
    },
    {
      card: 'n5', qp: 1, title: 'Criar Pedido no ERP',
      brief: 'Registrar pedido após aprovação e gerar documentação.',
      objective: 'Formalizar a venda no ERP e preparar comunicação ao cliente.',
      prompt: `Após aprovação explícita do responsável, crie o pedido no ERP com:
- Itens aprovados na proposta
- Condições de pagamento acordadas
- Dados de entrega

Depois:
- Registre a atividade no CRM
- Gere um rascunho de e-mail com a proposta em PDF
- Notifique o time no canal apropriado

Não envie o e-mail sem nova aprovação.`,
      priority: 'high', path: 'mock_integration',
    },
  ]

  const taskCount = { ok: 0, fail: 0 }

  for (const t of TASKS) {
    const tid = rid('t')
    const cardId = cardRows.find(c => c.node_id === t.card)?.id ?? null
    const { error } = await supabase.from('tasks').insert({
      id: tid,
      user_id: user.id,
      workspace_id: WS_ID,
      flow_id: FL_ID,
      flow_card_id: cardId,
      queue_position: t.qp,
      title: t.title,
      brief: t.brief,
      objective: t.objective,
      prompt: t.prompt,
      documents: [],
      team_members: [],
      agent_id: null,
      priority: t.priority,
      status: 'backlog',
      execution_path: t.path,
      run_order: TASKS.indexOf(t) + 1,
      schedule_start: null, schedule_end: null, schedule_time: null,
      recurrence: 'occasionally',
      recurrence_days: [], recurrence_monthly_days: [],
      created_at: ts(), updated_at: ts(),
    })
    if (error) { console.error(`[seed] ❌ task "${t.title}":`, error.message); taskCount.fail++ }
    else { console.log(`[seed]   ✓ ${t.title}`); taskCount.ok++ }
  }

  // ════════════════════════════════════════════════════════
  //  RESULT
  // ════════════════════════════════════════════════════════

  console.log('\n╔══════════════════════════════════════╗')
  console.log('║   ADGency seed — COMPLETE            ║')
  console.log('╠══════════════════════════════════════╣')
  console.log(`║  Workspace:  ${WS_ID}`)
  console.log(`║  Flow:       ${FL_ID}`)
  console.log(`║  Cards:      ${cardRows.length}`)
  console.log(`║  Edges:      ${edgeRows.length}`)
  console.log(`║  Tasks:      ${taskCount.ok} ok, ${taskCount.fail} fail`)
  console.log('╚══════════════════════════════════════╝')
  console.log('\nRecarregue a página para ver as mudanças.')
  console.log('Navegue: Dashboard → ADGency → Flow → Lead → Proposta → Pedido')
  console.log('Abra o Flow Builder para ver os 5 cards no canvas.')
})()
