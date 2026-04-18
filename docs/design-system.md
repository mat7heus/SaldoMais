# Design System

> **Objetivo:** Documentar os tokens de design (variáveis CSS), os componentes de UI reutilizáveis, as convenções de estilo e o comportamento responsivo — referência para manter consistência visual ao criar ou modificar telas no SaldoMais.

---

## Tokens de cor

Definidos como CSS custom properties em `:root` em `css/index.css`. Toda a interface usa exclusivamente essas variáveis — não há valores de cor hardcoded fora delas (exceto nos elementos inline do `index.html` e nos helpers de PDF que operam com RGB).

```css
:root {
  /* Backgrounds */
  --bg:     #0b0b0c;                   /* fundo principal da aplicação */
  --bg-2:   rgba(255,255,255,0.03);    /* camada levemente elevada (sidebar, cabeçalho) */
  --card:   rgba(255,255,255,0.04);    /* fundo de cards e painéis */
  --border: rgba(255,255,255,0.08);    /* bordas de todos os elementos */

  /* Tipografia */
  --text:   #f5f5f5;   /* texto primário */
  --muted:  #a1a1aa;   /* texto secundário, labels, legendas */

  /* Semântica */
  --accent: #f59e0b;   /* âmbar — destaque, botão primário, slider thumb */
  --danger: #ef4444;   /* vermelho — erro, limite excedido, botão destrutivo */
  --warn:   #fb923c;   /* laranja — alerta, gasto parcial, valor acima de 80% */
  --ok:     #22c55e;   /* verde — sucesso, dentro do orçamento, disponível positivo */
}
```

**Paleta para PDF** (`PDF_COLORS` em `core.js`): mesmos conceitos em RGB para uso com jsPDF.

---

## Tipografia

Fonte única: **Inter** (Google Fonts), pesos 400, 500 e 600.

| Contexto | Tamanho | Peso |
|---|---|---|
| Título de tela (`h2`) | 28px | 600 |
| Subtítulo de seção (`h3`) | 18px | 600 |
| Label de input | 14px | 500 |
| Texto de card | 14px | 400 |
| Valor de stat card | 24px | 700 |
| Helper / legenda | 12px | 400 |
| Atalho de teclado (`kbd`) | 10px | 400 |

---

## Layout

### Estrutura principal

```
.app (display: flex; height: 100vh)
  ├── aside.sidebar    (width: 230px, fixo)
  └── main.content     (flex: 1, overflow-y: auto)
```

A sidebar usa `backdrop-filter: blur(20px)` sobre `--bg-2`, criando o efeito de vidro fosco. Não há scroll na sidebar — o conteúdo dela é sempre visível.

### Grid de dashboard

`.dashboard-content` usa `grid-template-columns: 1.2fr 1fr` para o gráfico (maior) e o painel de status de categorias (menor). Colapsa para coluna única em `@media (max-width: 768px)`.

### Grid de calculadoras

`.calc-grid` usa `grid-template-columns: 1fr 1fr`. Colapsa para coluna única em `@media (max-width: 900px)`.

---

## Componentes

### Card

```css
.card {
  background: var(--card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  transition: all 0.25s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.15);
}
```

Eleva levemente no hover via `translateY`. Usado como container para formulários, painéis e seções do dashboard.

---

### Stat Card

```css
.stat-card   /* container com flexbox coluna */
.stat-label  /* texto em uppercase, --muted, 13px */
.stat-value  /* valor principal, 24px, bold */
.stat-bar    /* barra de progresso (fundo) */
.stat-bar-fill /* preenchimento com gradiente accent→warn */
.stat-subtitle /* texto auxiliar, 12px, --muted */
```

O card de "Disponível" tem `border-color` e `background` dinâmicos aplicados inline: verde se positivo, vermelho se negativo.

---

### Botões

| Classe | Aparência | Uso |
|---|---|---|
| `.btn-primary` | `--accent`, texto preto | Ação principal |
| `.btn-danger` | `--danger`, texto branco | Ação destrutiva |
| `.btn-export-pdf` | Transparente, borda amber, texto amber | Exportar PDF |
| `.btn-backup` | Transparente, borda sutil, texto `--muted` | Backup/restore |
| `.btn-salvar-percentuais` | `--accent`, bold | Salvar percentuais |
| `.btn-adicionar-cat` | `--accent`, bold | Adicionar categoria |
| `.btn-editar-cat` | `--accent`, texto preto | Editar categoria |
| `.btn-deletar-cat` | `--danger`, texto branco | Remover categoria |

O seletor base `button` já tem `background: var(--accent)` — os modificadores sobrescrevem com `!important` onde necessário.

---

### Inputs e Selects

```css
input, select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
}
input:focus, select:focus {
  border-color: rgba(245,158,11,0.5);
  box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
  background: rgba(255,255,255,0.05);
}
```

O foco usa um anel amber sutil. Em mobile (`@media (max-width: 768px)`), `font-size: 16px` é aplicado para evitar zoom automático do iOS.

---

### Barras de progresso

Dois componentes de barra distintos:

**`.stat-bar` / `.stat-bar-fill`** — no stat card de "Total Gasto":
```css
.stat-bar-fill {
  background: linear-gradient(90deg, var(--accent), var(--warn));
  transition: width 0.4s ease;
}
```

**`.barra` / `.barra-fill`** — nas barras de status por categoria:
```css
/* cor aplicada inline, calculada dinamicamente */
/* verde < 80% | laranja 80-100% | vermelho > 100% */
```

---

### Slider de percentual

```css
.percentual-slider {
  -webkit-appearance: none;
  height: 6px;
  background: rgba(255,255,255,0.08);
}
.percentual-slider::-webkit-slider-thumb {
  width: 16px; height: 16px;
  background: var(--accent);
  box-shadow: 0 2px 8px rgba(245,158,11,0.4);
}
```

Estilos cross-browser para `::-webkit-slider-thumb` e `::-moz-range-thumb`. O thumb cresce no hover (`scale(1.2)`) com sombra mais intensa.

---

### Toast de notificação

```css
.notification-toast {
  position: fixed;
  bottom: 20px; right: 20px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  opacity: 0; transform: translateY(20px);
  transition: all 0.3s ease;
}
.notification-toast.show {
  opacity: 1; transform: translateY(0);
}
```

Aparece no canto inferior direito com fade + slide. Desaparece após 2500ms via `setTimeout` em `notificar()`.

---

### Modais

Os dois modais (`#confirmModal` e `#editarCategoriaModal`) compartilham `.confirm-modal`:

```css
.confirm-modal {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  z-index: 9997;
}
.confirm-modal.show {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

O container interno (`.confirm-container`) é um card com `max-width: 400px` e `box-shadow` profundo.

---

### Loading overlay

```css
.loading-overlay {
  position: fixed; inset: 0;
  background: linear-gradient(135deg, #0b0b0c 0%, #1a1a1e 50%, #0b0b0c 100%);
  z-index: 9999;
  opacity: 0; pointer-events: none;
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.loading-overlay.show {
  opacity: 1; pointer-events: auto;
}
```

Contém logo animado (`logoFloat` — sobe e desce), anel spinner rotacionando (`spinRing`) e texto com ellipsis animado (`dotAnimation`).

---

## Animações

| Nome | Uso | Comportamento |
|---|---|---|
| `spinRing` | Anel do loading | Rotação 360° infinita, 2s linear |
| `logoFloat` | Logo do loading | TranslateY -8px + scale 1.05, 3s ease-in-out |
| `fadeInOut` | Texto do loading | Opacidade 0.6→1→0.6, 1.5s |
| `dotAnimation` | Ellipsis do loading | `content` steps: '' → '.' → '..' → '...' |
| `fadeSlideIn` | Resultado das calculadoras | opacity 0→1, translateY 10px→0, 0.28s |
| `fadeSlideOut` | Fechamento do resultado | opacity 1→0, translateY 0→-8px, 0.2s |

---

## Responsividade

| Breakpoint | Mudanças |
|---|---|
| `≤ 900px` | `.dashboard-grid` e `.calc-grid` colapsam para 1 coluna |
| `≤ 768px` | Sidebar oculta (posição fixed, translateX -100%), mobile header exibido, `.dashboard-content` colapsa para 1 coluna, `.nav-shortcut` oculto, `font-size: 16px` nos inputs |

**Mobile header** (`#hamburgerBtn` + logo) fica fixo no topo com `height: 56px`. O conteúdo principal tem `padding-top: 72px` para não ficar sob o header.

**Sidebar mobile:** abre via `.sidebar.open` (translateX 0) com overlay `#sidebarOverlay` bloqueando o conteúdo. Fecha ao clicar no overlay ou em qualquer `.nav-btn`.

---

## Z-index

| Elemento | z-index |
|---|---|
| `.loading-overlay` | 9999 |
| `.notification-toast` | 9998 |
| `.confirm-modal` | 9997 |
| `.sidebar` (mobile) | 200 |
| `.mobile-header` | 100 |
| `.sidebar-overlay` | 99 |
| `.calc-table th` (sticky) | 1 |
