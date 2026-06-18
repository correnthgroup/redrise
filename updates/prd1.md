# Paleta de Cores para SaaS com Logo Quente

## 1. Contexto do logo

O logo utiliza uma paleta quente, terrosa e energética:

| Função            |       Cor |
| ----------------- | --------: |
| Amarelo do logo   | `#FCAF2D` |
| Laranja claro     | `#EA8F2B` |
| Laranja principal | `#E26F27` |
| Marrom / cobre    | `#A04D1F` |
| Texto do logo     | `#A04D1F` |

Essa família cromática comunica calor, construção, energia, clareza e proximidade. Por isso, a interface do SaaS não precisa necessariamente seguir a recomendação comum de "contraste frio, profundo e tecnológico".

A direção recomendada é uma interface **clara, quente, sofisticada e organizada**, usando tons escuros apenas para destaque e não como base visual dominante.

---

# 2. Direção visual recomendada

A proposta visual é:

```txt
Logo quente e marcante
+
Interface clara e sofisticada
+
Sidebar clara
+
Cards claros como padrão
+
Cards escuros apenas para destaque
+
Botões no marrom/cobre do logo
+
Amarelo e laranja como acentos pontuais
```

Essa abordagem mantém o logo como centro da identidade e evita que o SaaS fique com aparência genérica de fintech, dashboard corporativo ou software B2B azul-esverdeado.

---

# 3. Paleta principal do SaaS

## Background geral

```txt
Background / Warm Off-White
#FAF6EF
```

## Sidebar clara

```txt
Sidebar / Warm Sand
#F3E8D8
```

## Cards padrão

```txt
Surface / Ivory
#FFFDF8
```

## Cards escuros de destaque

```txt
Surface Dark / Deep Brown
#3A2A22
```

## Texto principal

```txt
Text Primary / Warm Charcoal
#241A16
```

## Texto secundário

```txt
Text Secondary / Muted Taupe
#7A6A5D
```

## Bordas e divisores

```txt
Border / Warm Neutral
#E4D7C7
```

---

# 4. Cores de ação e destaque

## Botão principal

```txt
Primary / Logo Brown
#A04D1F
```

## Hover do botão principal

```txt
Primary Hover / Dark Copper
#7F3C18
```

## Accent luminoso

```txt
Premium Accent / Logo Yellow
#FCAF2D
```

## Accent laranja

```txt
Accent / Logo Orange
#E26F27
```

## Contraste frio opcional

```txt
Cool Support / Muted Teal
#2F5D5A
```

---

# 5. Design tokens em CSS

```css
:root {
  /* Logo */
  --logo-yellow: #FCAF2D;
  --logo-orange-light: #EA8F2B;
  --logo-orange: #E26F27;
  --logo-brown: #A04D1F;

  /* App base */
  --background: #FAF6EF;
  --sidebar: #F3E8D8;
  --surface: #FFFDF8;
  --surface-dark: #3A2A22;

  /* Text */
  --text-primary: #241A16;
  --text-secondary: #7A6A5D;
  --text-inverse: #FFF7ED;
  --text-inverse-muted: #D8C6B3;

  /* Borders */
  --border: #E4D7C7;

  /* Actions */
  --primary: #A04D1F;
  --primary-hover: #7F3C18;
  --accent: #E26F27;
  --premium: #FCAF2D;

  /* Optional cool support */
  --cool-support: #2F5D5A;

  /* Status */
  --success: #2F7D4F;
  --warning: #D9822B;
  --error: #B42318;
  --info: #2F5D5A;
}
```

---

# 6. Resumo final

A recomendação final é:

```txt
Interface clara
Sidebar clara
Cards claros como padrão
Cards escuros somente para destaque
Botão principal no marrom/cobre do logo
Amarelo e laranja apenas como acentos
Teal frio apenas como apoio secundário
```

Essa direção gera uma identidade mais própria, mais coesa com o logo e menos genérica para um SaaS.
