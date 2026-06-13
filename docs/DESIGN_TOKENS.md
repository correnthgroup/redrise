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
