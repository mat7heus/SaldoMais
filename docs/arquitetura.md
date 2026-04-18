# Arquitetura

> **Objetivo:** Descrever como o SaldoMais é estruturado internamente — organização dos módulos, modelo de escopo, ordem de carregamento, fluxo de inicialização e padrões de design recorrentes no codebase.

---

## Modelo de execução

O SaldoMais é uma **Single Page Application (SPA) sem framework e sem bundler**. Todo o JavaScript é carregado via tags `<script defer>` no `index.html` e compartilha o **escopo global (`window`)** — não há módulos ES, CommonJS ou similar. Funções definidas em um arquivo são acessíveis em todos os outros.

Isso tem uma implicação direta: **a ordem de carregamento dos scripts importa**.

```html
<script src="./js/core.js"        defer></script>
<script src="./js/lancamentos.js" defer></script>
<script src="./js/categorias.js"  defer></script>
<script src="./js/dashboard.js"   defer></script>
<script src="./js/calculadoras.js"defer></script>
<script src="./js/backup.js"      defer></script>
<script src="./js/pdf.js"         defer></script>
<script src="./js/app.js"         defer></script>
```

`core.js` deve ser sempre o primeiro — ele define as constantes (`STORAGE`, `PDF_COLORS`, `MESES`), as referências DOM e as funções utilitárias usadas por todos os outros. `app.js` deve ser o último — ele chama `init()`, que depende de funções definidas nos demais arquivos.

---

## Dependências entre módulos

```
core.js
  ├── lancamentos.js
  ├── categorias.js
  ├── dashboard.js
  ├── calculadoras.js
  ├── backup.js
  └── pdf.js
          └── app.js  (orquestra todos)
```

Nenhum módulo importa outro explicitamente — a dependência é implícita via escopo global. Se uma função de `lancamentos.js` chama `formatarMoeda()`, ela assume que `core.js` já foi executado antes.

---

## Fluxo de inicialização

`app.js` termina com a chamada direta a `init()`, que executa na ordem:

```
init()
  ├── mostrarLoading()          — exibe spinner de carregamento
  ├── criarCategorias()         — seed de categorias padrão (só na primeira execução)
  ├── setupModals()             — registra listeners dos modais (confirm + editar categoria)
  ├── setupButtons()            — registra listeners dos botões principais + máscaras de moeda
  ├── setupEventDelegation()    — event delegation para listas dinâmicas
  ├── navegar()                 — registra listeners de navegação entre telas
  ├── setupMobileMenu()         — hamburger + overlay do menu mobile
  ├── atualizarDataMes()        — preenche o texto "Abril de 2026" no header
  └── renderComplete()          — renderiza todas as telas e o dashboard
```

---

## Padrão de renderização

Todo estado de UI deriva do `localStorage`. Não há estado em memória que precise ser sincronizado — quando um dado muda, o padrão é:

1. Ler do storage
2. Modificar o array
3. Persistir no storage
4. Chamar `renderComplete()` (ou `renderAll()`) para reconstruir toda a UI

```
renderComplete()
  ├── renderAll()
  │     ├── renderSelect()           — popula o <select> de categorias no form de lançamentos
  │     ├── renderLancamentos()      — lista de transações do mês
  │     ├── renderOrcamentoInput()   — preenche o input de orçamento com o valor salvo
  │     ├── renderCategorias()       — editor de sliders de percentual
  │     └── renderCategoriasLista()  — lista com ações de editar/remover categorias
  └── renderDashboard()             — cards de resumo + gráfico + barras de status
```

Esse padrão de re-render total é deliberado: simplicidade sobre performance. O volume de dados é pequeno (dezenas a centenas de registros), então reconstruir o HTML a cada operação é aceitável.

---

## Padrão `withLoadingDelay`

Operações que modificam dados são envolvidas em `withLoadingDelay(fn, delay?)`. Ela exibe o spinner e executa `fn` após o delay (padrão: 100ms), criando feedback visual mesmo quando a operação é instantânea.

```javascript
withLoadingDelay(() => {
  set(STORAGE.lancamentos, lista);
  renderComplete();
});
```

O spinner tem auto-hide de 1500ms (`mostrarLoading` chama `setTimeout(ocultarLoading, 1500)`).

---

## Padrão de modais baseados em Promise

Os dois modais (`confirmModal` e `editarCategoriaModal`) usam uma Promise manual em vez de `window.confirm`. O painel armazena um `_resolve` no elemento DOM:

```javascript
function confirmar(msg) {
  return new Promise(resolve => {
    modal._resolve = result => {
      modal.classList.remove("show");
      modal._resolve = null;
      resolve(result);
    };
    modal.classList.add("show");
  });
}
```

Quando o usuário clica em Confirmar ou Cancelar, `modal._resolve(true/false)` é chamado e a Promise resolve. Isso permite `async/await` em funções como `deletarLancamento` e `abrirEditorCategoria`.

---

## Event delegation

Elementos de lista são renderizados dinamicamente (não existem no DOM no momento do `setupButtons`), então os listeners são registrados no container pai com `data-action` para identificar a ação:

```html
<button data-action="deletar-lancamento" data-id="1234567">...</button>
```

```javascript
listaLancamentos.addEventListener("click", e => {
  const btn = e.target.closest("[data-action='deletar-lancamento']");
  if (btn) deletarLancamento(Number(btn.dataset.id));
});
```

O mesmo padrão é usado para sliders de percentual (`percentual-slider`, `percentual-input`) e ações de categoria (`editar-categoria`, `deletar-categoria`).

---

## Navegação entre telas

Todas as telas são `<section class="screen">` no DOM o tempo todo. A navegação consiste em remover/adicionar a classe `active` — não há roteamento, hash de URL ou recriação de DOM.

```javascript
document.querySelectorAll("[data-screen]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.screen).classList.add("active");
  };
});
```

Ao navegar para `dashboard` ou `categorias`, as respectivas funções de render são chamadas para refletir dados atualizados.

---

## Atalhos de teclado

Registrados com `keydown` no `document` em `app.js`:

| Atalho | Ação |
|--------|------|
| `Alt+1` | Dashboard |
| `Alt+2` | Lançamentos |
| `Alt+3` | Categorias |
| `Alt+4` | Calculadoras |

Em `calculadoras.js`, `Enter` dentro de um input dispara o cálculo do card correspondente via mapeamento `inputId → função`.

---

## Bibliotecas externas (CDN)

| Biblioteca | Versão | Global exposto | Uso |
|---|---|---|---|
| Chart.js | latest | `Chart` | Gráfico doughnut no dashboard |
| jsPDF | 2.5.1 | `window.jspdf` | Geração de PDF client-side |
| Lucide | latest | `lucide` | Ícones SVG — renderizados via `lucide.createIcons()` |
| Inter (Google Fonts) | — | — | Tipografia |

Lucide precisa ser chamado manualmente após cada render que injeta ícones via `<i data-lucide="...">`. Isso acontece ao final de toda função de render que produz HTML com ícones.
