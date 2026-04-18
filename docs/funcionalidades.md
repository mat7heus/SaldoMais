# Funcionalidades

> **Objetivo:** Documentar o comportamento técnico de cada funcionalidade do SaldoMais — regras de negócio, validações, fluxos de dados e side effects relevantes para quem vai modificar, depurar ou estender uma feature específica.

---

## Orçamento mensal

**Localização:** Dashboard (`section#dashboard`) → formulário `.dashboard-setup`  
**Módulo responsável:** `js/lancamentos.js`

O orçamento define o valor total disponível para o mês corrente. Funciona como âncora de todos os cálculos financeiros do período.

### Fluxo de criação/atualização

1. Usuário digita o valor no `#orcamentoInput` (com máscara BRL aplicada em tempo real)
2. Clica em "Salvar Orçamento" → chama `salvarOrcamentoHandler()`
3. `desformatarMoeda()` converte a string para number
4. Busca orçamentos existentes para `mesAtual()` (formato `"YYYY-MM"`)
5. **Upsert:** se existe registro para o mês, atualiza `valor_total`; se não existe, cria novo com `id: Date.now()`
6. Persiste e chama `renderComplete()`

### Regras

- Valor deve ser `> 0`
- Apenas um orçamento por mês (identificado por `mes_referencia`)
- Atualizar o orçamento não recalcula nem remove lançamentos existentes — lançamentos que estavam dentro do limite podem passar a exceder após uma redução do orçamento

---

## Lançamentos (Despesas)

**Localização:** Tela `section#lancamentos`  
**Módulo responsável:** `js/lancamentos.js`

### Fluxo de adição

1. Preenche descrição (`#desc`), valor (`#valorInput`) e categoria (`#categoriaSelect`)
2. Clica em "Adicionar Despesa" → `adicionarLancamento()`
3. Validações em sequência (aborta na primeira falha):
   - Orçamento do mês deve existir
   - Descrição não pode estar vazia
   - Valor deve ser `> 0`
   - `total_gasto_na_categoria + novo_valor <= limite_da_categoria`
4. Cria o objeto `{ id, id_orcamento, id_categoria, valor, descricao }` e adiciona ao array
5. Limpa os inputs, persiste e chama `renderComplete()`

### Cálculo do limite por categoria

```javascript
const limite = orcamento.valor_total * categoria.percentual / 100;
const gastoAtual = lancamentos
  .filter(l => l.id_categoria === cat.id && l.id_orcamento === orcamento.id)
  .reduce((s, l) => s + l.valor, 0);
```

Se `gastoAtual + novoValor > limite`, o lançamento é rejeitado com `notificar("Limite excedido nesta categoria")`.

### Exclusão

`deletarLancamento(id)` abre modal de confirmação. Se confirmado, remove o lançamento por `id` do array e persiste.

### Limpeza do mês

`resetarMes()` remove **todos** os lançamentos do orçamento atual e zera `valor_total` do orçamento. Ação irreversível (com modal de confirmação).

---

## Categorias

**Localização:** Tela `section#categorias`  
**Módulo responsável:** `js/categorias.js`

### Seed inicial

Na primeira execução (`criarCategorias()`), 6 categorias são criadas automaticamente. A função é idempotente — não executa se já existirem categorias no storage.

### Adição de categoria

- Nome: obrigatório, único (case-insensitive), máx. 30 caracteres (limitado pelo `maxlength` do input)
- Cor: hex escolhido pelo `<input type="color">`, padrão `#f59e0b`
- `percentual` inicial: 0 — o usuário deve ajustar nos sliders
- Após adicionar, os campos são limpos e a cor retorna ao padrão

### Edição do nome

`abrirEditorCategoria(catId)` abre o modal de edição com o nome atual pré-preenchido. Rejeita se o novo nome for idêntico ao atual ou duplicar outro existente.

### Exclusão

A exclusão cascateia: remove a categoria **e** todos os lançamentos com aquele `id_categoria`. Modal de confirmação exibe aviso explícito sobre a remoção em cascata.

### Gerenciamento de percentuais

Os sliders e inputs numéricos são sincronizados via `atualizarPercentual()` a cada evento `input`. O totalizador muda de cor dinamicamente:
- Verde (`--ok`): total === 100%
- Laranja (`--warn`): total < 100%
- Vermelho (`--danger`): total > 100%

`salvarPercentuaisEm(container)` rejeita o salvamento se o total não for exatamente 100%.

**Dois containers distintos** renderizam o editor de percentuais:
- `#listaCategorias` — tela `section#configuracoes` (sem ações de editar/deletar)
- `#categoriasListaEditor` — tela `section#categorias` (com ações de editar/deletar)

O event delegation em `app.js` trata cada container separadamente para distinguir as ações de salvar.

---

## Dashboard

**Localização:** Tela `section#dashboard` (tela inicial)  
**Módulo responsável:** `js/dashboard.js`

O dashboard é completamente reconstruído a cada chamada de `renderDashboard()` — não há atualizações parciais.

### Comportamento sem orçamento

Se `orcamentoAtual()` retornar `undefined` ou `valor_total <= 0`, exibe um empty state no lugar dos cards e não renderiza gráfico nem barras de status.

### Cards de resumo (`renderResumoGeral`)

| Card | Valor | Variação visual |
|---|---|---|
| Total Disponível | `valor_total` | Sempre neutro |
| Total Gasto | Soma dos lançamentos | Barra de progresso (accent→warn) |
| Disponível | `valor_total - totalGasto` | Verde se ≥ 0, vermelho se < 0 |
| Atenção (opcional) | Count de categorias acima do limite | Aparece somente se count > 0 |

### Gráfico de distribuição (`renderGrafico`)

- Tipo: doughnut (Chart.js)
- Dados: percentual de cada categoria sobre o **total gasto** (não sobre o orçamento)
- Se `totalGasto === 0`: distribui igualmente entre todas as categorias (para exibir o gráfico vazio mas colorido)
- Instância anterior é destruída antes de criar a nova (`window.graficoChart.destroy()`)
- Legenda customizada em `#grafico-legenda` — a legenda nativa do Chart.js é desabilitada (`legend: { display: false }`)

### Barras de status por categoria

Renderizadas diretamente em `renderDashboard()` no elemento `#categoriasStatus`. Cor definida por threshold:

```
percentualGasto = (gasto / limite) * 100
> 100% → vermelho | > 80% → laranja | else → verde
```

A barra é limitada a `min(percentualGasto, 100)` para não transbordar o container visualmente, mesmo que o gasto exceda o limite.

---

## Exportação de PDF

**Módulo responsável:** `js/pdf.js`  
**Disparo:** botão `#btnExportPdf`

### Pré-condições

- Orçamento do mês deve existir com `valor_total > 0`
- `window.jspdf` deve estar disponível (carregado via CDN)

### Estrutura do documento

O PDF é gerado em A4 portrait (210×297mm) com fundo escuro (#0b0b0c), espelhando o tema da aplicação. As seções são renderizadas de cima para baixo com controle manual de `y` (coordenada vertical). Nova página é adicionada automaticamente quando `y > H - 26` na tabela de lançamentos.

**Seções:**
1. Cabeçalho — logo (via fetch), nome, tagline, mês/ano
2. Cards de resumo — orçamento, gasto, disponível + barra de progresso
3. Título de seção "Categorias"
4. Tabela de categorias — zebra striping, cor semântica nos valores
5. Título de seção "Lançamentos" (se houver lançamentos)
6. Tabela de lançamentos — ordenada por categoria, paginação automática
7. Rodapé — em todas as páginas, com data/hora de exportação

**Nome do arquivo:** `SaldoMais-YYYY-MM.pdf`

---

## Backup e Restauração

**Módulo responsável:** `js/backup.js`  
**Disparo:** botões `#btnExportBackup` (exportar) e `#inputImportBackup` (importar via `change`)

### Exportação

Serializa o estado completo de `categorias`, `orcamentos` e `lancamentos` com metadados (`_versao`, `_exportado_em`). O arquivo é criado como `Blob` e baixado via `<a>` temporário + `URL.createObjectURL`. O objeto URL é revogado imediatamente após o clique.

**Nome do arquivo:** `SaldoMais-backup-YYYY-MM-DD.json`

### Importação

1. Usuário seleciona arquivo `.json`
2. `FileReader.readAsText()` lê o conteúdo
3. `JSON.parse()` — lança exceção se inválido, capturada pelo `try/catch`
4. Valida presença das chaves `categorias`, `orcamentos`, `lancamentos`
5. Sobrescreve o storage completamente (sem merge)
6. Chama `renderComplete()`
7. `e.target.value = ""` — reseta o input para permitir reimportar o mesmo arquivo

**Atenção:** a importação não valida a estrutura interna dos objetos — um backup corrompido ou editado manualmente pode introduzir dados inconsistentes sem erro visível.

---

## Atalhos de teclado

Registrados via `document.addEventListener('keydown')` em `app.js` e `calculadoras.js`.

| Atalho | Comportamento |
|---|---|
| `Alt+1` | Navega para Dashboard |
| `Alt+2` | Navega para Lançamentos |
| `Alt+3` | Navega para Categorias |
| `Alt+4` | Navega para Calculadoras |
| `Enter` (em input/select dentro de `.calc-card`) | Dispara o cálculo do card correspondente |

A navegação por `Alt+número` simula um clique no `.nav-btn[data-screen]`, acionando o mesmo fluxo da navegação por clique (inclusive re-render de dashboard ou categorias conforme a tela destino).

O atalho de `Enter` nas calculadoras usa um mapeamento `inputId → função` para identificar qual calculadora está no contexto do `.calc-card` mais próximo do input focado.

---

## Máscara de moeda

Aplicada em dois contextos:

1. **`setupCurrencyMask(el)`** — aplicada explicitamente em `#orcamentoInput` e `#valorInput`
2. **Listener global** em `document` — aplicada em qualquer `.input-moeda` (usado nos campos das calculadoras)

O algoritmo:
1. Remove tudo que não é dígito
2. Limita a 11 dígitos (máximo: R$ 999.999.999,99)
3. Divide por 100 e formata com `Intl.NumberFormat pt-BR`

Isso simula o comportamento de digitação da direita para a esquerda (como terminais de pagamento).
