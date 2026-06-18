# Design Tokens — Redrise

> Paleta visual consolidada. Consultar este arquivo antes de alterar cores, sombras, raios ou ícones em qualquer tela do app.

## Versão final dos tokens principais

```css
:root {
  /* Core brand */
  --primary: #8C1F28;
  --primary-hover: #741923;
  --primary-active: #5C131B;
  --primary-soft: #F8ECEE;

  /* Viewport externa */
  --viewport: #22191A;
  --viewport-deep: #1A1212;
  --viewport-glow: #3B2F2F;

  /* App container */
  --app: #FBF8F3;
  --app-border: #D6C6B3;
  --app-shadow: rgba(26, 18, 18, 0.32);

  /* Sidebar */
  --sidebar: #F5F1EA;
  --sidebar-hover: #EFE5D8;
  --sidebar-active-soft: #F1D8DC;
  --sidebar-active: #8C1F28;
  --sidebar-border: #E3D7C8;

  /* Surfaces */
  --surface: #FFFFFF;
  --surface-warm: #FBF8F3;
  --surface-muted: #F5F1EA;
  --surface-hover: #EFE5D8;
  --surface-selected: #F8ECEE;

  /* Text */
  --text: #3B2F2F;
  --text-secondary: #5A4745;
  --text-muted: #806E69;
  --text-disabled: #BFAE9D;
  --text-inverse: #FFFFFF;

  /* Borders */
  --border: #E3D7C8;
  --border-strong: #D6C6B3;
  --divider: #EFE5D8;

  /* Premium accent */
  --premium: #C9A227;
  --premium-hover: #A98417;
  --premium-soft: #FFF8E1;
  --premium-border: #E9D585;

  /* AI / Insight accent */
  --ai: #6A3F55;
  --ai-soft: #EFE4EA;
  --ai-border: #D8B9C8;

  /* Status */
  --success: #3F6B4F;
  --success-soft: #E8F1EA;
  --warning: #A98417;
  --warning-soft: #FFF8E1;
  --danger: #8C1F28;
  --danger-soft: #F8ECEE;
  --info: #5A4745;
  --info-soft: #F5F1EA;

  /* Icons */
  --icon-default: #806E69;
  --icon-strong: #3B2F2F;
  --icon-active: #8C1F28;
  --icon-premium: #C9A227;
  --icon-muted: #BFAE9D;

  /* Radius */
  --radius-app: 28px;
  --radius-panel: 20px;
  --radius-card: 16px;
  --radius-button: 12px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-app: 0 24px 80px rgba(26, 18, 18, 0.32);
  --shadow-card: 0 1px 2px rgba(59, 47, 47, 0.06), 0 12px 32px rgba(59, 47, 47, 0.06);
  --shadow-popover: 0 18px 48px rgba(59, 47, 47, 0.18);
  --shadow-focus: 0 0 0 4px rgba(140, 31, 40, 0.18);
}
```

## Decisão visual final

| Elemento | Cor |
|---|---|
| Viewport externa | `#22191A` |
| App container | `#FBF8F3` |
| Sidebar | `#F5F1EA` |
| Texto principal | `#3B2F2F` |
| CTA principal | `#8C1F28` |
| Cards | `#FFFFFF` |
| Bordas | `#E3D7C8` |
| Dourado premium | `#C9A227` |
| AI/Insight | `#6A3F55` |
| Hover suave | `#EFE5D8` |
| Selecionado suave | `#F8ECEE` |

## Regra de ouro

Dourado não deve ser usado como botão principal nem como texto pequeno sobre fundo claro. Ele aparece como detalhe: ícone, linha lateral, badge, selo, gráfico ou destaque de plano.

## Gold / Premium Tokens

| Token | Cor | Uso |
|---|---|---|
| gold-50 | `#FFF8E1` | Fundo de dica, badge premium |
| gold-100 | `#F8EFCF` | Highlight suave |
| gold-200 | `#E9D585` | Borda premium |
| gold-300 | `#D9BC4A` | Ícone premium |
| gold-400 | `#C9A227` | Accent premium |
| gold-500 | `#A98417` | Texto em badge dourada |
| gold-600 | `#80620F` | Texto escuro sobre gold-soft |

## Layout: viewport + app container

```css
body {
  background:
    radial-gradient(circle at top left, #3B2F2F 0%, transparent 32%),
    radial-gradient(circle at bottom right, #421016 0%, transparent 28%),
    #22191A;
  color: #3B2F2F;
}

.app-shell {
  background: #FBF8F3;
  border: 1px solid rgba(214, 198, 179, 0.7);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(26, 18, 18, 0.32);
  overflow: hidden;
}
```

## Sidebar

```css
.sidebar {
  background: #F5F1EA;
  border-right: 1px solid #E3D7C8;
}

.sidebar-item {
  color: #3B2F2F;
}

.sidebar-item svg {
  color: #806E69;
}

.sidebar-item:hover {
  background: #EFE5D8;
}

.sidebar-item[data-active="true"] {
  background: #8C1F28;
  color: #FFFFFF;
}

.sidebar-item[data-active="true"] svg {
  color: #FFFFFF;
}
```

## Settings / menus centrais

```css
.settings-panel {
  background: #FFFFFF;
  border: 1px solid #E3D7C8;
  border-radius: 20px;
}

.settings-panel-header {
  background: #FBF8F3;
  border-bottom: 1px solid #E3D7C8;
}

.settings-nav-item:hover {
  background: #F5F1EA;
}

.settings-nav-item[data-active="true"] {
  background: #F8ECEE;
  color: #8C1F28;
}
```

## Ícones

Biblioteca: `lucide-react`. Estilo: outline, traço fino/médio, sem preenchimento pesado.

| Estado | Cor |
|---|---|
| Ícone padrão | `#806E69` |
| Ícone forte | `#3B2F2F` |
| Ícone ativo | `#8C1F28` |
| Ícone em menu ativo | `#FFFFFF` |
| Ícone premium | `#C9A227` |
| Ícone desabilitado | `#BFAE9D` |
| Ícone de dica | `#A98417` |
| Ícone de AI/insight | `#6A3F55` |

| Uso | Tamanho |
|---|---|
| Sidebar | 19–20px |
| Botões | 16px |
| Cards | 18px |
| Dicas | 18px |
| Empty states | 40–56px |
| Topbar | 18–20px |
| Configurações | 18px |

## Dicas / mensagens orientativas

### Dica premium

```css
.tip-premium {
  background: #FFF8E1;
  border: 1px solid #E9D585;
  color: #3B2F2F;
}

.tip-premium svg {
  color: #C9A227;
}
```

### Dica operacional

```css
.tip-default {
  background: #F5F1EA;
  border: 1px solid #E3D7C8;
  color: #5A4745;
}

.tip-default svg {
  color: #806E69;
}
```

### Dica de AI

```css
.tip-ai {
  background: #EFE4EA;
  border: 1px solid #D8B9C8;
  color: #3B2F2F;
}

.tip-ai svg {
  color: #6A3F55;
}
```

## Cards

### Card padrão

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E3D7C8;
  border-radius: 16px;
  color: #3B2F2F;
  box-shadow: 0 1px 2px rgba(59, 47, 47, 0.06), 0 12px 32px rgba(59, 47, 47, 0.06);
}
```

### Card secundário

```css
.card-muted {
  background: #FBF8F3;
  border: 1px solid #E3D7C8;
}
```

### Card ativo

```css
.card-active {
  background: #FFFFFF;
  border: 1px solid #8C1F28;
  box-shadow: 0 0 0 4px rgba(140, 31, 40, 0.12);
}
```

### Card premium

```css
.card-premium {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 100%);
  border: 1px solid #E9D585;
  box-shadow: 0 1px 2px rgba(59, 47, 47, 0.06), 0 16px 40px rgba(201, 162, 39, 0.10);
}
```

Uso: plano pago, feature especial, insight relevante, upgrade, relatório estratégico.

## Botões

### Primário

```css
.button-primary {
  background: #8C1F28;
  color: #FFFFFF;
  border: 1px solid #8C1F28;
  border-radius: 12px;
}

.button-primary:hover {
  background: #741923;
  border-color: #741923;
}

.button-primary:active {
  background: #5C131B;
  border-color: #5C131B;
}
```

### Secundário

```css
.button-secondary {
  background: #FFFFFF;
  color: #3B2F2F;
  border: 1px solid #D6C6B3;
}

.button-secondary:hover {
  background: #F5F1EA;
}
```

### Botão premium discreto

```css
.button-premium {
  background: #FFF8E1;
  color: #80620F;
  border: 1px solid #E9D585;
}

.button-premium:hover {
  background: #F8EFCF;
}
```

### Ghost

```css
.button-ghost {
  background: transparent;
  color: #5A4745;
}

.button-ghost:hover {
  background: #F5F1EA;
  color: #3B2F2F;
}
```

## Badges

| Badge | Fundo | Texto | Uso |
|---|---|---|---|
| Primary | `#F8ECEE` | `#8C1F28` | Ativo, selecionado |
| Premium | `#FFF8E1` | `#80620F` | Plano, destaque, recurso premium |
| AI | `#EFE4EA` | `#6A3F55` | Sugestão de IA |
| Neutro | `#F5F1EA` | `#5A4745` | Status comum |
| Sucesso | `#E8F1EA` | `#3F6B4F` | Concluído |
| Alerta | `#FFF8E1` | `#A98417` | Pendente, atenção |
| Erro | `#F8ECEE` | `#8C1F28` | Falha, bloqueio |

```css
.badge {
  border-radius: 999px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  padding: 4px 8px;
}
```

## Inputs e campos

```css
.input {
  background: #FFFFFF;
  color: #3B2F2F;
  border: 1px solid #D6C6B3;
  border-radius: 12px;
}

.input::placeholder {
  color: #A99487;
}

.input:hover {
  border-color: #BFAE9D;
}

.input:focus {
  border-color: #8C1F28;
  box-shadow: 0 0 0 4px rgba(140, 31, 40, 0.14);
  outline: none;
}

.input[aria-invalid="true"] {
  border-color: #8C1F28;
  background: #FFFDF9;
}
```

## Topbar

```css
.topbar {
  background: rgba(251, 248, 243, 0.92);
  border-bottom: 1px solid #E3D7C8;
  backdrop-filter: blur(12px);
}
```

## Tabelas e listas

```css
.table {
  background: #FFFFFF;
  border: 1px solid #E3D7C8;
  border-radius: 16px;
}

.table thead {
  background: #F5F1EA;
  color: #5A4745;
}

.table tbody tr {
  border-bottom: 1px solid #EFE5D8;
}

.table tbody tr:hover {
  background: #FBF8F3;
}

.table tbody tr[data-selected="true"] {
  background: #F8ECEE;
}
```

## Estados do sistema

| Estado | Cor principal | Fundo suave |
|---|---|---|
| Sucesso | `#3F6B4F` | `#E8F1EA` |
| Atenção | `#A98417` | `#FFF8E1` |
| Erro | `#8C1F28` | `#F8ECEE` |
| Informação | `#5A4745` | `#F5F1EA` |
| AI / Insight | `#6A3F55` | `#EFE4EA` |
| Premium | `#C9A227` | `#FFF8E1` |

## Canvas / área operacional

```css
.canvas {
  background:
    linear-gradient(#E3D7C8 1px, transparent 1px),
    linear-gradient(90deg, #E3D7C8 1px, transparent 1px),
    #FBF8F3;
  background-size: 32px 32px;
  background-opacity: 0.35;
}

.canvas-node {
  background: #FFFFFF;
  border: 1px solid #D6C6B3;
  border-radius: 16px;
  color: #3B2F2F;
}

.canvas-node[data-selected="true"] {
  border-color: #8C1F28;
  box-shadow: 0 0 0 4px rgba(140, 31, 40, 0.12);
}

.edge {
  stroke: #BFAE9D;
}

.edge-active {
  stroke: #8C1F28;
}
```

---

## Autenticação — Padrão visual

As telas de autenticação seguem a identidade premium do app: viewport escura, card claro/quente, textos em marrom profundo, CTA vinho e detalhes dourados discretos.

### Telas cobertas

- Sign in
- Sign up
- Forgot password / Recuperar senha
- Reset password / Criar nova senha
- Confirm e-mail
- Auth callback
- Loading de autenticação
- Erro de autenticação
- Sessão expirada

### Direção visual

A autenticação transmite: segurança, clareza, confiança, premium, baixa fricção, controle.

**Regra visual:**Viewport escura e sofisticada. Card de autenticação claro e quente. CTA principal vinho. Textos em marrom profundo. Dourado apenas como detalhe premium.

### Tokens de autenticação

```css
:root {
  /* Auth viewport */
  --auth-viewport-bg: #22191A;
  --auth-viewport-bg-deep: #1A1212;
  --auth-viewport-glow-primary: #3B2F2F;
  --auth-viewport-glow-brand: #421016;

  /* Auth card */
  --auth-card-bg: #FBF8F3;
  --auth-card-surface: #FFFFFF;
  --auth-card-border: #D6C6B3;
  --auth-card-shadow: 0 24px 80px rgba(26, 18, 18, 0.34);

  /* Auth text */
  --auth-title: #3B2F2F;
  --auth-body: #5A4745;
  --auth-muted: #806E69;
  --auth-disabled: #BFAE9D;
  --auth-inverse: #FFFFFF;

  /* Auth actions */
  --auth-primary: #8C1F28;
  --auth-primary-hover: #741923;
  --auth-primary-active: #5C131B;
  --auth-primary-soft: #F8ECEE;

  /* Auth premium */
  --auth-premium: #C9A227;
  --auth-premium-soft: #FFF8E1;
  --auth-premium-border: #E9D585;

  /* Auth fields */
  --auth-input-bg: #FFFFFF;
  --auth-input-border: #D6C6B3;
  --auth-input-hover: #BFAE9D;
  --auth-input-focus: #8C1F28;
  --auth-input-placeholder: #A99487;

  /* Auth states */
  --auth-success: #3F6B4F;
  --auth-success-soft: #E8F1EA;
  --auth-warning: #A98417;
  --auth-warning-soft: #FFF8E1;
  --auth-danger: #8C1F28;
  --auth-danger-soft: #F8ECEE;
  --auth-info: #5A4745;
  --auth-info-soft: #F5F1EA;

  /* Auth radius */
  --auth-radius-card: 28px;
  --auth-radius-panel: 20px;
  --auth-radius-input: 12px;
  --auth-radius-button: 12px;
}
```

### Viewport da autenticação

Viewport externa escura com gradientes suaves e premium.

```css
.auth-viewport {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, #3B2F2F 0%, transparent 34%),
    radial-gradient(circle at bottom right, #421016 0%, transparent 30%),
    #22191A;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}
```

### Container de autenticação

Formulário em card central claro/quente, com borda sutil e sombra premium.

```css
.auth-card {
  width: 100%;
  max-width: 440px;
  background: #FBF8F3;
  border: 1px solid rgba(214, 198, 179, 0.78);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(26, 18, 18, 0.34);
  padding: 32px;
}

.auth-card-wide {
  max-width: 520px;
}
```

### Logo e cabeçalho

| Elemento | Cor |
|---|---|
| Símbolo/logo em card claro | `#8C1F28` ou `#3B2F2F` |
| Símbolo/logo em viewport escura | `#FFFFFF` |
| Detalhe premium opcional | `#C9A227` |

O logo não deve usar dourado como cor principal. O dourado aparece apenas como pequeno detalhe, linha, ponto, selo ou borda.

```css
.auth-title {
  color: #3B2F2F;
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.auth-subtitle {
  color: #5A4745;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}
```

### Inputs de autenticação

Campos claros, com borda quente e foco vinho.

```css
.auth-input {
  width: 100%;
  background: #FFFFFF;
  color: #3B2F2F;
  border: 1px solid #D6C6B3;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 14px;
  line-height: 22px;
}

.auth-input::placeholder {
  color: #A99487;
}

.auth-input:hover {
  border-color: #BFAE9D;
}

.auth-input:focus {
  border-color: #8C1F28;
  box-shadow: 0 0 0 4px rgba(140, 31, 40, 0.14);
  outline: none;
}

.auth-input[aria-invalid="true"] {
  border-color: #8C1F28;
  background: #FFFDF9;
}

.auth-label {
  color: #3B2F2F;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.auth-hint {
  color: #806E69;
  font-size: 13px;
  line-height: 20px;
}

.auth-error {
  color: #8C1F28;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}
```

### Botões de autenticação

#### Botão principal

Uso: Entrar, Criar conta, Enviar link, Confirmar, Redefinir senha, Continuar.

```css
.auth-button-primary {
  width: 100%;
  background: #8C1F28;
  color: #FFFFFF;
  border: 1px solid #8C1F28;
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}

.auth-button-primary:hover {
  background: #741923;
  border-color: #741923;
}

.auth-button-primary:active {
  background: #5C131B;
  border-color: #5C131B;
}

.auth-button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(140, 31, 40, 0.20);
}
```

#### Botão secundário

Uso: Voltar para entrar, Usar outro e-mail, Reenviar código, Cancelar.

```css
.auth-button-secondary {
  width: 100%;
  background: #FFFFFF;
  color: #3B2F2F;
  border: 1px solid #D6C6B3;
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.auth-button-secondary:hover {
  background: #F5F1EA;
}
```

#### Botão OAuth / SSO

```css
.auth-oauth-button {
  width: 100%;
  background: #FFFFFF;
  color: #3B2F2F;
  border: 1px solid #D6C6B3;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.auth-oauth-button:hover {
  background: #F5F1EA;
  border-color: #BFAE9D;
}

.auth-oauth-button svg {
  width: 18px;
  height: 18px;
}
```

### Links de autenticação

Links usam vinho, com hover mais escuro.

```css
.auth-link {
  color: #8C1F28;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  color: #741923;
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

Uso: Criar conta, Já tenho uma conta, Esqueci minha senha, Reenviar e-mail, Voltar para entrar.

### Divisor visual

Para separar login por e-mail de OAuth.

```css
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #806E69;
  font-size: 12px;
  line-height: 16px;
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #E3D7C8;
}
```

Texto: "ou continue com"

### Checkbox "lembrar-me"

```css
.auth-checkbox {
  accent-color: #8C1F28;
}

.auth-checkbox-label {
  color: #5A4745;
  font-size: 14px;
  line-height: 20px;
}
```

Texto recomendado: "Manter-me conectado"

### Tela Sign in

Estrutura: Logo → Título → Subtítulo → E-mail → Senha → Linha: Manter-me conectado / Esqueci minha senha → Botão Entrar → Divisor → OAuth → Link para criar conta.

| Elemento | Cor |
|---|---|
| Viewport | `#22191A` |
| Card | `#FBF8F3` |
| Título | `#3B2F2F` |
| Subtítulo | `#5A4745` |
| Inputs | `#FFFFFF` |
| Borda input | `#D6C6B3` |
| Focus | `#8C1F28` |
| Botão Entrar | `#8C1F28` |
| Links | `#8C1F28` |

Microcopy: "Entrar" / "Acesse sua conta para continuar." / "E-mail" / "Senha" / "Manter-me conectado" / "Esqueci minha senha" / "Não tem uma conta? Criar conta"

### Tela Sign up

Estrutura: Logo → Título → Subtítulo → Nome → E-mail profissional → Senha → Confirmar senha → Aceite de termos → Botão Criar conta → Link para entrar.

| Elemento | Cor |
|---|---|
| Destaque de e-mail profissional | `#FFF8E1` |
| Borda do aviso | `#E9D585` |
| Texto do aviso | `#80620F` |
| Botão Criar conta | `#8C1F28` |
| Erro de domínio inválido | `#8C1F28` |
| Fundo erro | `#F8ECEE` |

Aviso premium:

```css
.auth-notice-premium {
  background: #FFF8E1;
  border: 1px solid #E9D585;
  color: #80620F;
  border-radius: 12px;
  padding: 12px 14px;
}
```

Microcopy: "Criar conta" / "Comece criando seu acesso." / "Nome" / "E-mail profissional" / "Senha" / "Confirmar senha" / "Concordo com os Termos e a Política de Privacidade" / "Já tem uma conta? Entrar"

### Tela Forgot password / Recuperar senha

Estrutura: Logo → Título → Texto explicativo → Campo de e-mail → Botão Enviar link → Link Voltar para entrar.

| Elemento | Cor |
|---|---|
| Card | `#FBF8F3` |
| Texto explicativo | `#5A4745` |
| Campo e-mail | `#FFFFFF` |
| Botão | `#8C1F28` |
| Link voltar | `#8C1F28` |

Microcopy: "Recuperar senha" / "Informe seu e-mail e enviaremos um link para redefinir sua senha." / "E-mail" / "Enviar link de recuperação" / "Voltar para entrar"

Após envio: "Verifique seu e-mail" / "Se houver uma conta vinculada a este endereço, enviaremos um link de recuperação."

### Tela Reset password / Criar nova senha

Estrutura: Logo → Título → Nova senha → Confirmar nova senha → Regras de senha → Botão Redefinir senha.

| Estado | Fundo | Texto |
|---|---|---|
| Requisito pendente | `#F5F1EA` | `#806E69` |
| Requisito atendido | `#E8F1EA` | `#3F6B4F` |
| Requisito inválido | `#F8ECEE` | `#8C1F28` |

Microcopy: "Criar nova senha" / "Digite uma nova senha segura para acessar sua conta." / "Nova senha" / "Confirmar nova senha" / "Redefinir senha"

### Tela Confirm e-mail

Estrutura: Ícone/check → Título → Texto explicativo → E-mail informado → Botão Abrir e-mail / Reenviar → Link Trocar e-mail.

| Elemento | Cor |
|---|---|
| Ícone principal | `#C9A227` ou `#8C1F28` |
| Fundo do ícone | `#FFF8E1` ou `#F8ECEE` |
| Título | `#3B2F2F` |
| Texto | `#5A4745` |
| Botão principal | `#8C1F28` |
| Botão secundário | `#FFFFFF` |

Microcopy: "Confirme seu e-mail" / "Enviamos um link de confirmação para:" / "Reenviar e-mail" / "Usar outro e-mail" / "Voltar para entrar"

### Auth callback / Processando autenticação

Estrutura: Logo → Spinner → Título → Texto auxiliar.

| Elemento | Cor |
|---|---|
| Card | `#FBF8F3` |
| Spinner | `#8C1F28` |
| Título | `#3B2F2F` |
| Texto | `#806E69` |

```css
.auth-spinner {
  border: 3px solid #E3D7C8;
  border-top-color: #8C1F28;
  border-radius: 999px;
}
```

Microcopy: "Validando acesso" / "Estamos confirmando suas credenciais."

Para convite: "Validando convite" / "Estamos preparando seu acesso."

Para OAuth: "Conectando sua conta" / "Aguarde enquanto concluímos a autenticação."

### Tela de erro de autenticação

Estrutura: Ícone de alerta → Título → Mensagem → Botão tentar novamente → Link voltar para entrar.

| Elemento | Cor |
|---|---|
| Fundo alerta | `#F8ECEE` |
| Borda alerta | `#DFAEB5` |
| Ícone alerta | `#8C1F28` |
| Texto alerta | `#3B2F2F` |
| Botão tentar novamente | `#8C1F28` |

Microcopy: "Não foi possível concluir o acesso" / "O link pode ter expirado ou as credenciais não foram aceitas." / "Tentar novamente" / "Voltar para entrar"

### Sessão expirada

| Elemento | Cor |
|---|---|
| Fundo aviso | `#FFF8E1` |
| Borda aviso | `#E9D585` |
| Ícone | `#C9A227` |
| Texto | `#3B2F2F` |
| Botão | `#8C1F28` |

Microcopy: "Sua sessão expirou" / "Entre novamente para continuar com segurança." / "Entrar novamente"

### Padrão de alertas na autenticação

#### Sucesso

```css
.auth-alert-success {
  background: #E8F1EA;
  border: 1px solid rgba(63, 107, 79, 0.24);
  color: #3F6B4F;
}
```

#### Atenção

```css
.auth-alert-warning {
  background: #FFF8E1;
  border: 1px solid #E9D585;
  color: #80620F;
}
```

#### Erro

```css
.auth-alert-danger {
  background: #F8ECEE;
  border: 1px solid #DFAEB5;
  color: #8C1F28;
}
```

#### Informação

```css
.auth-alert-info {
  background: #F5F1EA;
  border: 1px solid #E3D7C8;
  color: #5A4745;
}
```

### Ícones nas telas de autenticação

Usar ícones outline, com traço limpo.

| Tela | Ícone |
|---|---|
| Sign in | `LogIn` |
| Sign up | `UserPlus` |
| Recuperar senha | `KeyRound` |
| Confirmar e-mail | `MailCheck` |
| Reset password | `LockKeyhole` |
| Auth callback | `LoaderCircle` |
| Erro | `TriangleAlert` |
| Sessão expirada | `ClockAlert` |
| Segurança | `ShieldCheck` |

```css
.auth-icon { color: #8C1F28; }
.auth-icon-premium { color: #C9A227; }
.auth-icon-muted { color: #806E69; }
.auth-icon-danger { color: #8C1F28; }
```

### Layout responsivo autenticação

#### Desktop

Card central com 400–520px de largura. Viewport escura visível ao redor. Padding externo de 32px.

#### Mobile

Viewport continua escura. Card pode ocupar quase toda a largura. Padding externo de 16px. Radius reduzido para 20px.

```css
@media (max-width: 640px) {
  .auth-viewport {
    padding: 16px;
  }

  .auth-card {
    border-radius: 20px;
    padding: 24px;
  }
}
```

### Decisão final para autenticação

| Elemento | Cor |
|---|---|
| Viewport externa | `#22191A` |
| Glow premium | `#3B2F2F` |
| Card auth | `#FBF8F3` |
| Input/card interno | `#FFFFFF` |
| Texto principal | `#3B2F2F` |
| Texto secundário | `#5A4745` |
| Texto discreto | `#806E69` |
| CTA principal | `#8C1F28` |
| CTA hover | `#741923` |
| Borda quente | `#D6C6B3` |
| Dourado premium | `#C9A227` |
| Alerta suave | `#FFF8E1` |
| Erro suave | `#F8ECEE` |
| Sucesso suave | `#E8F1EA` |

**Regra final:** A tela de autenticação deve parecer segura e premium antes de parecer colorida. O CTA principal deve ser vinho. O dourado deve ser detalhe, nunca base. O card deve ser claro/quente. A viewport deve ser escura e sofisticada.
