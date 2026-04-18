# Módulos JavaScript

> **Objetivo:** Documentar cada um dos 8 módulos JavaScript do projeto — suas responsabilidades, funções públicas (globais), contratos de entrada/saída e comportamentos relevantes para quem precisa modificar ou estender o código.

---

## `js/core.js`

Fundação do projeto. Define constantes globais, referências DOM, acesso ao storage e utilitários usados por todos os demais módulos. **Deve ser carregado primeiro.**

### Constantes

| Constante | Tipo | Descrição |
|---|---|---|
| `MESES` | `string[]` | Nomes dos meses em pt-BR, índice 0-based |
| `PDF_COLORS` | `object` | Paleta de cores RGB para o relatório PDF |
| `STORAGE` | `object` | Chaves do `localStorage` (`categorias`, `orcamentos`, `lancamentos`) |

### Referências DOM

Capturadas no carregamento via `getElementById`. Elementos críticos:

| Variável | ID no DOM |
|---|---|
| `orcamentoInput` | `#orcamentoInput` |
| `valorInput` | `#valorInput` |
| `desc` | `#desc` |
| `categoriaSelect` | `#categoriaSelect` |
| `listaLancamentos` | `#listaLancamentos` |
| `listaCategorias` | `#listaCategorias` |
| `categoriasStatus` | `#categoriasStatus` |
| `grafico` | `#grafico` (canvas do Chart.js) |

### Funções de storage

```javascript
get(key: string): any[]
// Lê e parseia JSON do localStorage. Retorna [] se ausente ou inválido.

set(key: string, val: any): void
// Serializa e persiste no localStorage.
```

### Funções utilitárias

```javascript
formatarMoeda(valor: number): string
// Formata como BRL usando Intl.NumberFormat pt-BR.
// Ex: 1500.5 → "R$ 1.500,50"

desformatarMoeda(texto: string): number
// Converte string formatada de volta para number.
// Ex: "R$ 1.500,50" → 1500.5

notificar(msg: string): void
// Exibe toast de notificação por 2500ms.

confirmar(msg: string): Promise<boolean>
// Abre modal de confirmação. Resolve com true (confirmou) ou false (cancelou).

editarCategoriaNome(nomeAtual: string): Promise<string | null>
// Abre modal com input pré-preenchido. Resolve com o novo nome ou null se cancelado.

mostrarLoading(): void
// Exibe o overlay de loading. Auto-oculta após 1500ms.

ocultarLoading(): void
// Remove o overlay de loading imediatamente.

withLoadingDelay(fn: Function, delay?: number): void
// Exibe loading e executa fn após delay (padrão: 100ms).

atualizarDataMes(): void
// Preenche #mesAtualText com "Mês de Ano" (ex: "Abril de 2026").
```

### Funções de setup

```javascript
setupModals(): void
// Registra os listeners de clique nos botões dos modais.
// Deve ser chamado uma única vez em init().

navegar(): void
// Registra onclick em todos os [data-screen] para troca de tela ativa.
```

---

## `js/lancamentos.js`

Gerencia orçamentos mensais e transações (lançamentos). Depende de `core.js`.

### Funções auxiliares

```javascript
mesAtual(): string
// Retorna a referência do mês corrente no formato "YYYY-MM".
// Ex: "2026-04"

orcamentoAtual(): object | undefined
// Busca o orçamento cujo mes_referencia === mesAtual().
// Retorna undefined se não existir orçamento para o mês.
```

### Handlers de ação

```javascript
salvarOrcamentoHandler(): void
// Lê orcamentoInput, valida (> 0), cria ou atualiza o orçamento do mês.
// Persiste e chama renderComplete().

adicionarLancamento(): void
// Lê desc, valorInput e categoriaSelect.
// Validações: orçamento definido, descrição preenchida, valor > 0,
// total da categoria não excede o limite (valor_total * percentual / 100).
// Persiste e chama renderComplete().

deletarLancamento(id: number): Promise<void>
// Abre modal de confirmação. Se confirmado, remove o lançamento por id e chama renderComplete().

resetarMes(): Promise<void>
// Abre modal de confirmação. Remove todos os lançamentos do orçamento atual
// e zera o valor_total do orçamento. Chama renderComplete().
```

### Funções de render

```javascript
renderSelect(): void
// Reconstrói as <option> do #categoriaSelect com as categorias do storage.

renderOrcamentoInput(): void
// Preenche #orcamentoInput com o valor formatado do orçamento atual.
// Limpa o input se não houver orçamento.

renderLancamentos(): void
// Reconstrói #listaLancamentos com os lançamentos do mês atual.
// Exibe empty state se não houver orçamento ou lançamentos.
// Cada item tem data-action="deletar-lancamento" e data-id para event delegation.
```

---

## `js/categorias.js`

CRUD de categorias, gerenciamento de percentuais e seed inicial. Depende de `core.js`.

### Setup

```javascript
criarCategorias(): void
// Idempotente — só executa se o storage de categorias estiver vazio.
// Insere 6 categorias padrão com percentuais e cores pré-definidos.
```

**Categorias padrão:**

| Nome | Percentual | Cor |
|---|---|---|
| Custos fixos | 30% | `#f59e0b` |
| Conforto | 5% | `#22c55e` |
| Metas | 11% | `#ef4444` |
| Prazeres | 24% | `#3b82f6` |
| Liberdade financeira | 25% | `#a855f7` |
| Conhecimento | 5% | `#f97316` |

### Funções de gerenciamento

```javascript
adicionarNovaCategoria(): void
// Lê #novaCategoriaNome e #novaCategoriaCor.
// Validações: nome não vazio, nome único (case-insensitive).
// Cria com percentual 0. Persiste e chama renderComplete().

abrirEditorCategoria(catId: number): Promise<void>
// Abre modal de edição com o nome atual.
// Validações: nome diferente do atual, nome único.
// Persiste e chama renderComplete().

deletarCategoriaConfirm(catId: number): Promise<void>
// Modal de confirmação antes de chamar deletarCategoria().

deletarCategoria(catId: number): void
// Remove a categoria do storage e todos os lançamentos vinculados a ela.
// Chama renderComplete(). Sem modal — use deletarCategoriaConfirm para fluxo com UX.
```

### Sliders de percentual

```javascript
atualizarPercentual(catId: number, valor: string, container: Element): void
// Sincroniza todos os [data-cat-id=catId] (slider + input numérico + preview de texto)
// dentro do container com o novo valor (clamped 0-100).
// Atualiza o totalizador [id^="totalPercentual"] com a soma atual.

salvarPercentuaisEm(container: Element): void
// Lê todos os .percentual-slider dentro do container.
// Valida que a soma seja exatamente 100%.
// Persiste os novos percentuais e chama renderAll() + renderCategoriasLista().
```

### Funções de render

```javascript
renderCategorias(): void
// Reconstrói #listaCategorias com o editor de sliders de percentual.
// Renderizado na tela "configuracoes" (section#configuracoes).

renderCategoriasLista(): void
// Reconstrói #categoriasListaEditor com:
//   - Editor de sliders de percentual
//   - Lista de categorias com botões Editar e Remover
// Renderizado na tela "categorias" (section#categorias).
```

---

## `js/dashboard.js`

Renderiza o dashboard: cards de resumo financeiro, gráfico de distribuição e barras de status por categoria. Depende de `core.js`, `lancamentos.js` e `categorias.js`.

```javascript
renderDashboard(): void
// Ponto de entrada único do dashboard.
// Se não houver orçamento definido, exibe empty state.
// Caso contrário, chama renderResumoGeral(), renderiza barras de status
// por categoria e chama renderGrafico().

renderResumoGeral(cats, lanc, o): void
// Constrói os cards de resumo em #resumoGeral:
//   - Total Disponível (valor_total do orçamento)
//   - Total Gasto (soma de todos os lançamentos) com barra de progresso
//   - Disponível (valor_total - totalGasto) — verde se positivo, vermelho se negativo
//   - Card de alerta (opcional) se alguma categoria exceder o limite

renderGrafico(cats, lanc, o): void
// Instancia ou recria o gráfico doughnut via Chart.js em window.graficoChart.
// Destrói a instância anterior se existir (window.graficoChart.destroy()).
// Dados: percentual de cada categoria sobre o total gasto.
// Se totalGasto === 0, distribui igualmente entre todas as categorias.
// Legenda customizada em #grafico-legenda (não usa a legenda nativa do Chart.js).
```

**Lógica de cor das barras de status:**

| Condição | Cor |
|---|---|
| `percentualGasto > 100%` | `#ef4444` (vermelho) |
| `percentualGasto > 80%` | `#fb923c` (laranja) |
| `else` | `#22c55e` (verde) |

---

## `js/calculadoras.js`

8 calculadoras financeiras. Cada uma tem uma **função matemática pura** (sem acesso ao DOM) e uma **função de UI** (lê inputs, valida, chama a pura e renderiza o resultado).

### Função auxiliar de parsing

```javascript
parseBRCalc(str: string): number
// Converte string de número no formato brasileiro para float.
// Suporta: "1.000,50" → 1000.5 | "1000.50" → 1000.5 | "1000,5" → 1000.5
```

### Funções matemáticas puras

```javascript
calcJurosCompostos(capital, aporte, taxaAnual, periodo)
// taxaAnual em decimal (ex: 0.12 para 12%)
// Converte taxa anual para mensal: taxa = (1 + taxaAnual)^(1/12) - 1
// Retorna: { saldo, totalInvestido, totalJuros, linhas[] }
// linhas[]: { mes, aporte, jurosMes, montante }

calcCDBCDI(valor, taxaCDI, percentual, prazo)
// taxaCDI em % a.a. (ex: 10.5), percentual em % (ex: 110), prazo em dias corridos
// Calcula taxa efetiva anual = taxaCDI * percentual / 100 / 100
// Usa base 252 dias úteis para taxa diária
// IR regressivo: ≤180d → 22.5% | ≤360d → 20% | ≤720d → 17.5% | >720d → 15%
// Retorna: { rendBruto, ir, valorLiq, aliquota }

calcAporteMeta(meta, prazo, taxaMensal)
// taxaMensal em decimal (ex: 0.01 para 1%)
// Fórmula PMT de anuidade: pmt = meta * i / ((1+i)^n - 1)
// Retorna: { pmt, totalAportado, totalJuros }

calcDividendYield(patrimonio, yieldAnual)
// yieldAnual em % (ex: 8.0)
// Retorna: { rendaAnual, rendaMensal }

calcFinanciamentoPrice(pv, taxaMensal, n)
// taxaMensal em decimal
// Fórmula Price: parcela = pv * i / (1 - (1+i)^-n)
// Gera tabela de amortização completa
// Retorna: { parcela, totalPago, totalJuros, linhas[] }
// linhas[]: { parcela, prestacao, amort, juros, saldo }

calcRotativoCartao(divida, taxaMensal, pagamento)
// Simula mês a mês até zerar o saldo (máx. 1200 iterações)
// Se pagamento <= juros do primeiro mês: retorna { impossivel: true, jurosPrimeiro }
// linhas[]: primeiros 24 meses { mes, saldo, juros, pag, novoSaldo }
// Retorna: { meses, totalPago, totalJuros, linhas, maxAtingido }

calcAVistaVsParcelado(avista, parcelaValor, nParcelas, taxaMensal)
// Calcula o valor presente das parcelas: PV = parcela * (1 - (1+i)^-n) / i
// parceladoMelhor = pvParcelas < avista
// Retorna: { pvParcelas, totalParcelado, parceladoMelhor, diferenca }

calcQuitarDivida(saldo, taxaDivida, parcelas, desconto, disponivel, taxaInvest)
// Cenário A: disponivel >= saldoDesconto → quitação total
// Cenário B: disponivel < saldoDesconto → quitação parcial, recalcula PMT do saldo restante
// Compara economia (juros evitados) vs rendimentoPerdido (disponivel investido pelo mesmo período)
// Retorna: { saldoDesconto, economia, rendimentoPerdido, cenario, infoCenario, diferenca, quitarMelhor }
```

### Funções de UI

Cada `calcularXxx()` corresponde a uma calculadora. Padrão:
1. Lê os inputs com `parseBRCalc()` ou `parseInt()`
2. Valida os campos obrigatórios (chama `notificar()` e retorna em caso de erro)
3. Chama a função matemática pura
4. Injeta o HTML de resultado no DOM
5. Chama `mostrarResultado(id)` para animar a exibição

```javascript
mostrarResultado(id: string): void
// Exibe o elemento com animação fadeSlideIn.
// Injeta o header com botão "Fechar" se ainda não existir.
// O botão "Fechar" aplica fadeSlideOut e oculta o elemento.
```

---

## `js/backup.js`

Exportação e importação do estado completo da aplicação. Depende de `core.js`.

```javascript
exportarBackup(): void
// Serializa { _versao: 1, _exportado_em, categorias, orcamentos, lancamentos }
// Cria um Blob JSON e dispara download via <a> temporário.
// Nome do arquivo: SaldoMais-backup-YYYY-MM-DD.json

importarBackup(e: Event): void
// Lê o arquivo via FileReader.
// Valida presença das chaves categorias, orcamentos, lancamentos.
// Sobrescreve o storage completamente e chama renderComplete().
// Reseta e.target.value para permitir reimportar o mesmo arquivo.
```

**Formato do arquivo de backup:**

```json
{
  "_versao": 1,
  "_exportado_em": "2026-04-18T12:00:00.000Z",
  "categorias": [...],
  "orcamentos": [...],
  "lancamentos": [...]
}
```

A validação de importação verifica apenas a existência das três chaves — não valida estrutura interna dos objetos.

---

## `js/pdf.js`

Geração do relatório mensal em PDF via jsPDF. Depende de `core.js` e `lancamentos.js`.

### Helper de drawing

```javascript
pdfHelpers(doc: jsPDF): object
// Retorna um objeto com métodos utilitários para estilizar o documento:
//   bg(rgb[])         — define cor de preenchimento
//   pen(rgb[], w)     — define cor e espessura de linha
//   color(rgb[])      — define cor de texto
//   bold(size)        — fonte helvetica bold + tamanho
//   normal(size)      — fonte helvetica normal + tamanho
//   rrect(x,y,w,h,r,fill,stroke) — retângulo com bordas arredondadas
//   hexToRgb(hex)     — converte "#rrggbb" para [r, g, b]
```

### Funções de seção

```javascript
pdfCabecalho(doc, { W, M, o }): Promise<void>
// Async — tenta buscar o logo via fetch. Se falhar, ignora silenciosamente.
// Desenha fundo do cabeçalho, linha de destaque amber, logo (se disponível),
// nome do app, tagline, título e mês/ano do relatório.

pdfCardsResumo(doc, { W, M, CW, o, totalGasto, totalRestante, pct, y }): number
// Desenha 3 cards (orçamento, gasto, disponível) e barra de progresso.
// Retorna o novo valor de y após a seção.

pdfSectionTitle(doc, { W, M, label, y }): number
// Título de seção com linha divisória. Retorna novo y.

pdfTabelaCategorias(doc, { M, CW, cats, lancs, o, y }): number
// Tabela com zebra striping: categoria, % alocado, valor alocado, gasto, disponível.
// Cor de gasto: danger se excedeu, warn caso contrário.
// Retorna novo y.

pdfTabelaLancamentos(doc, { W, H, M, CW, cats, lancs, totalGasto, y }): number
// Lançamentos ordenados por nome de categoria.
// Adiciona nova página automaticamente quando y > H - 26.
// Rodapé com total e contagem de lançamentos.
// Retorna novo y.

pdfRodape(doc, { W, H, M }): void
// Itera todas as páginas e adiciona rodapé com data/hora de exportação.
```

### Orquestrador

```javascript
exportarPDF(): Promise<void>
// Valida: orçamento definido, jsPDF carregado.
// Configura documento A4 portrait, fundo escuro (#0b0b0c).
// Chama as funções de seção em ordem: cabecalho → cards → categorias → lançamentos → rodapé.
// Salva como SaldoMais-YYYY-MM.pdf.
```

**Dimensões do documento (mm):**
- `W = 210`, `H = 297` (A4)
- `M = 18` (margem lateral)
- `CW = 174` (largura útil = W - 2*M)

---

## `js/app.js`

Orquestração geral: conecta todos os módulos, registra eventos e inicializa a aplicação. **Deve ser carregado por último.**

```javascript
renderAll(): void
// Chama: renderSelect, renderLancamentos, renderOrcamentoInput,
//        renderCategorias, renderCategoriasLista.
// Envolto em try/catch — erros logam no console mas não travam o app.

renderComplete(): void
// renderAll() + renderDashboard().

setupButtons(): void
// Registra listeners para:
//   salvarOrcamento, limparMes, addLancamento,
//   btnExportPdf, btnExportBackup, inputImportBackup,
//   btnAdicionarCategoria, logoBtnSidebar
// Aplica setupCurrencyMask em orcamentoInput e valorInput.

setupCurrencyMask(el: HTMLElement): void
// Listener de "input" que formata em tempo real como BRL.
// Permite apenas dígitos, máximo de 11 dígitos (R$ 999.999.999,99).
// Também registrado globalmente para todos os .input-moeda nas calculadoras.

setupEventDelegation(): void
// Configura event delegation em:
//   #listaLancamentos    → deletar-lancamento
//   #categoriasListaEditor → salvar-percentuais-categorias, editar-categoria, deletar-categoria,
//                            percentual-slider, percentual-input
//   #listaCategorias     → salvar-percentuais, percentual-slider, percentual-input

setupMobileMenu(): void
// Hamburger (#hamburgerBtn) abre a sidebar (.sidebar.open) e exibe overlay (#sidebarOverlay).
// Overlay e cada .nav-btn fecham o menu se window.innerWidth <= 768.

init(): void
// Sequência de bootstrap completa. Chamado diretamente ao final do arquivo.
```
