<div align="center">

<img src="https://i.imgur.com/gNzlTGO.png" alt="SaldoMais" width="80" height="80" style="border-radius:18px;" />

# SaldoMais

**Gastos claros, decisões inteligentes.**

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zero deps](https://img.shields.io/badge/build-zero_dependências-22c55e?style=flat-square)
![localStorage](https://img.shields.io/badge/storage-localStorage-f59e0b?style=flat-square)
![Dark theme](https://img.shields.io/badge/tema-dark_only-1a1a1e?style=flat-square&logoColor=white)
![License](https://img.shields.io/badge/licença-GPL_v3-blue?style=flat-square)

</div>

---

Aplicação web de **gestão de finanças pessoais** construída com HTML, CSS e JavaScript puro. Permite definir orçamentos mensais, categorizar despesas, acompanhar gastos em tempo real, usar calculadoras financeiras e exportar relatórios em PDF — tudo sem backend, com dados persistidos via `localStorage`.

![Interface do SaldoMais](https://i.imgur.com/clRi211.png)

---

## 📋 Sobre o Projeto

SaldoMais cobre o ciclo básico de controle financeiro pessoal:
- ✅ Definir e gerenciar um orçamento mensal
- ✅ Registrar despesas por categorias personalizáveis
- ✅ Visualizar a distribuição dos gastos em gráficos
- ✅ Acompanhar o saldo disponível em tempo real
- ✅ Calcular projeções financeiras com 8 calculadoras integradas
- ✅ Exportar relatório mensal em PDF com layout dark estilizado
- ✅ Exportar e importar backup completo dos dados em JSON
- ✅ Navegar entre telas com atalhos de teclado (`Alt+1` a `Alt+4`)
- ✅ Dados armazenados localmente — sem servidor, sem conta de usuário

---

## 🚀 Características

### Dashboard
- Visão geral do orçamento: total, gasto e disponível
- Barra de progresso de consumo do orçamento
- Gráfico de distribuição dos gastos por categoria
- Status individual de cada categoria (dentro/fora do limite)

### Lançamentos
- Registro rápido de despesas por categoria
- Validação de limite por categoria antes de confirmar o lançamento
- Histórico completo de transações do mês
- Exclusão individual de lançamentos

### Categorias
- Criação de categorias com cor personalizada
- Distribuição percentual do orçamento por categoria via sliders
- Edição e exclusão de categorias existentes

### Calculadoras Financeiras

8 calculadoras independentes para projeções e simulações:

| Calculadora | O que calcula |
|---|---|
| Juros Compostos | Rendimento de investimento ao longo do tempo |
| CDB / CDI | Projeção de rendimento em renda fixa |
| Aporte por Meta | Quanto investir mensalmente para atingir um objetivo |
| Dividend Yield | Retorno em dividendos de um ativo |
| Financiamento Price | Parcelas e custo total de um financiamento |
| Rotativo do Cartão | Custo real do crédito rotativo |
| À Vista vs Parcelado | Comparativo de custo real entre as opções |
| Quitar Dívida | Tempo e custo para quitação de uma dívida |

### Exportação PDF
- Gera um relatório mensal em PDF com layout dark, correspondente ao tema da aplicação
- Inclui: cabeçalho com logo, resumo financeiro (3 cards), barra de progresso, tabela de categorias e tabela de lançamentos
- Download automático com nome `SaldoMais-AAAA-MM.pdf`

### Backup e Restauração
- Exporta todos os dados (categorias, orçamentos e lançamentos) em um arquivo `.json`
- Importa um backup para restaurar dados em qualquer dispositivo
- Download automático com nome `SaldoMais-backup-AAAA-MM-DD.json`

### Interface
- 🎨 Tema escuro (dark mode nativo)
- 📱 Responsivo e adaptado para mobile
- ⚡ Performance otimizada — sem bundler, sem build step
- 🇧🇷 Interface em português (Brasil)
- 🔔 Notificações visuais de ações
- ⌨️ Atalhos de teclado para navegação rápida (`Alt+1` a `Alt+4`)

---

## 💻 Stack

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica |
| CSS3 | Layout, variáveis CSS e animações |
| JavaScript (Vanilla) | Lógica da aplicação sem frameworks |
| localStorage | Persistência de dados no navegador |
| Chart.js | Gráfico de pizza interativo |
| jsPDF | Geração de PDF client-side |
| Lucide Icons | Ícones SVG via CDN |

---

## 📦 Instalação

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet (para carregar bibliotecas via CDN)

### Como Usar

1. **Clone o repositório**
   ```bash
   git clone https://github.com/mat7heus/SaldoMais.git
   cd SaldoMais
   ```

2. **Abra a aplicação**
   - Duplo clique no arquivo `index.html`
   - Ou arraste `index.html` para o navegador

3. **Comece a usar**
   - Defina seu orçamento mensal
   - Crie categorias de gastos
   - Registre suas despesas
   - Acompanhe no dashboard

> Não é necessário servidor local. O arquivo `index.html` pode ser aberto diretamente no navegador.

---

## 🗂️ Estrutura do Projeto

```
SaldoMais/
├── index.html          # Entrada da aplicação (SPA)
├── css/
│   └── index.css       # Estilos globais e variáveis CSS
├── js/
│   ├── core.js         # Constantes, DOM, storage, utils, modais, navegação
│   ├── lancamentos.js  # Orçamento, transações e render de lançamentos
│   ├── categorias.js   # CRUD de categorias, render e sliders de percentual
│   ├── dashboard.js    # renderDashboard, resumo financeiro e gráfico
│   ├── calculadoras.js # 8 calculadoras financeiras (puras + UI)
│   ├── backup.js       # Exportar e importar backup JSON
│   ├── pdf.js          # Helpers e geração do relatório PDF
│   └── app.js          # Orquestração: renderAll, setupButtons, init()
└── README.md
```

> Os arquivos são carregados via `<script defer>` em ordem no `index.html`. Como o projeto roda via `file://` sem bundler, cada arquivo compartilha o escopo global — `core.js` deve sempre ser o primeiro.

---

## 🎯 Como Funciona

### Armazenamento de Dados

Todos os dados ficam no `localStorage` do navegador sob as seguintes chaves:

```javascript
// Categorias
saldomain_categorias: [
  { id, nome, percentual, cor_hex }
]

// Orçamentos mensais
saldomain_orcamentos: [
  { id, mes_referencia, valor_total }
]

// Lançamentos
saldomain_lancamentos: [
  { id, id_orcamento, id_categoria, valor, descricao }
]
```

> Dados não sincronizam entre dispositivos e não há autenticação — qualquer pessoa com acesso ao navegador pode visualizá-los.

---

## 📊 Funcionalidades Detalhadas

### Dashboard
- Defina o orçamento total para o mês
- Visualize graficamente como os gastos são distribuídos por categoria
- Acompanhe o status de cada categoria
- Limpe os dados do mês atual quando necessário
- Exporte o relatório mensal em PDF

### Lançamentos
- Registre uma nova despesa vinculada a uma categoria
- Escolha a categoria mais apropriada
- Adicione uma descrição
- Veja o histórico completo de transações do mês

### Categorias
- Personalize suas categorias de gastos
- Defina o percentual do orçamento para cada categoria
- Receba alertas quando ultrapassar o limite
- Adapte conforme suas necessidades financeiras

### Backup e Restauração
- Exporte todos os dados (categorias, orçamentos e lançamentos) como arquivo `.json` pelo Dashboard
- Importe um backup para restaurar dados em outro dispositivo ou navegador
- Formato aberto — o arquivo pode ser inspecionado ou editado manualmente

### Atalhos de Teclado
| Atalho | Ação |
|---|---|
| `Alt+1` | Ir para Dashboard |
| `Alt+2` | Ir para Lançamentos |
| `Alt+3` | Ir para Categorias |
| `Alt+4` | Ir para Calculadoras |

---

## ⚙️ Funções Principais

### `js/core.js`
| Função | Responsabilidade |
|---|---|
| `formatarMoeda()` | Formata valores em BRL |
| `confirmar(msg)` | Modal de confirmação (retorna Promise) |
| `editarCategoriaNome()` | Modal de edição de nome (retorna Promise) |
| `withLoadingDelay(fn)` | Exibe loading e executa `fn` após delay |
| `navegar()` | Controla a navegação entre telas |

### `js/lancamentos.js`
| Função | Responsabilidade |
|---|---|
| `adicionarLancamento()` | Valida e registra uma despesa |
| `deletarLancamento(id)` | Remove um lançamento |
| `resetarMes()` | Limpa todos os lançamentos do mês |
| `renderLancamentos()` | Lista os lançamentos do mês |
| `salvarOrcamentoHandler()` | Salva o orçamento mensal |

### `js/categorias.js`
| Função | Responsabilidade |
|---|---|
| `adicionarNovaCategoria()` | Cria uma nova categoria |
| `abrirEditorCategoria(id)` | Edita o nome de uma categoria |
| `deletarCategoria(id)` | Remove categoria e seus lançamentos |
| `atualizarPercentual()` | Sincroniza slider + input + total |
| `salvarPercentuaisEm()` | Persiste os percentuais dos sliders |

### `js/dashboard.js`
| Função | Responsabilidade |
|---|---|
| `renderDashboard()` | Atualiza o dashboard completo |
| `renderResumoGeral()` | Cards de resumo financeiro |
| `renderGrafico()` | Gráfico de distribuição por categoria |

### `js/calculadoras.js`
| Função | Responsabilidade |
|---|---|
| `calcJurosCompostos()` | Lógica pura de juros compostos |
| `calcularJurosCompostos()` | UI da calculadora de juros compostos |
| *(+ 7 pares equivalentes)* | Uma função pura + uma de UI por calculadora |

### `js/pdf.js`
| Função | Responsabilidade |
|---|---|
| `exportarPDF()` | Orquestra a geração e download do PDF |
| `pdfCabecalho()` | Desenha o cabeçalho do relatório |
| `pdfCardsResumo()` | Cards de resumo financeiro no PDF |
| `pdfTabelaCategorias()` | Tabela de categorias no PDF |
| `pdfTabelaLancamentos()` | Tabela de lançamentos no PDF |

### `js/app.js`
| Função | Responsabilidade |
|---|---|
| `init()` | Inicializa a aplicação |
| `renderAll()` | Renderiza todas as telas exceto dashboard |
| `renderComplete()` | `renderAll()` + `renderDashboard()` |
| `setupButtons()` | Registra listeners dos botões globais |
| `setupEventDelegation()` | Event delegation para listas e sliders |

---

## 🎨 Personalização

### Variáveis de cor (`css/index.css`)

```css
:root {
  --bg: #0b0b0c;       /* fundo principal */
  --accent: #f59e0b;   /* destaque (âmbar) */
  --danger: #ef4444;   /* erro / limite excedido */
  --ok: #22c55e;       /* dentro do orçamento */
  --warn: #f97316;     /* aviso / gasto parcial */
}
```

### Categorias iniciais

Em `js/categorias.js`, modifique a função `criarCategorias()` para incluir categorias pré-definidas ao inicializar a aplicação.

---

## 📱 Compatibilidade

| Navegador | Suporte |
|---|---|
| Chrome    | ✅ Completo |
| Firefox   | ✅ Completo |
| Safari    | ✅ Completo |
| Edge      | ✅ Completo |
| Opera     | ✅ Completo |

---

## 💡 Dicas de Uso

1. **Backup de Dados**: Use os botões **Exportar Backup** e **Importar Backup** no Dashboard para salvar e restaurar seus dados como arquivo `.json`. Isso permite transferir dados entre dispositivos ou navegadores.
2. **Orçamento Realista**: Defina orçamentos com base no seu histórico de gastos — o SaldoMais é uma ferramenta de organização, não de projeção mágica.
3. **Categorias Claras**: Use nomes de categorias objetivos e alinhados com o seu contexto financeiro.
4. **Revisão Mensal**: Revise os gastos periodicamente para identificar padrões e ajustar o orçamento do próximo mês.

---

## 🐛 Limitações Conhecidas

- Dados ficam apenas no navegador local — sem sincronização entre dispositivos
- Limite de armazenamento do `localStorage` varia por navegador (~5–10 MB)
- Sem autenticação — qualquer pessoa com acesso ao navegador pode ver os dados

---

## 🚀 Possíveis Melhorias Futuras

- [x] Exportação de relatórios em PDF
- [ ] Edição de lançamentos — atualmente só é possível excluir
- [ ] Média diária de gastos — card no dashboard com gasto médio por dia (total gasto ÷ dias passados no mês)
- [ ] Projeção de fim de mês — estimativa de saldo final com base no ritmo atual de gastos
- [ ] Últimos lançamentos no dashboard — widget com os 3–5 gastos mais recentes sem precisar navegar para a tela de Lançamentos
- [ ] Ferramenta de inserção de gastos fixos — cadastro de despesas recorrentes mensais aplicadas automaticamente

---

## 📝 Licença

Distribuído sob a licença **GPL v3**.

---

## 🤝 Contribuições

Pull requests são bem-vindos. Para mudanças maiores, abra uma issue primeiro para alinhar o escopo antes de desenvolver.

---

## 📧 Contato

Dúvidas, sugestões ou problemas? Abra uma issue no repositório.

---

**💰 Comece a controlar seu dinheiro agora com o SaldoMais!**
