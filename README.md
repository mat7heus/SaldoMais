# 💰 SaldoMais — Gastos claros, decisões inteligentes.

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

### Interface
- 🎨 Tema escuro (dark mode nativo)
- 📱 Responsivo e adaptado para mobile
- ⚡ Performance otimizada — sem bundler, sem build step
- 🇧🇷 Interface em português (Brasil)
- 🔔 Notificações visuais de ações

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
   git clone https://github.com/seu-usuario/SaldoMais.git
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
│   └── index.js        # Toda a lógica da aplicação
└── README.md
```

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

---

## ⚙️ Funções Principais (`js/index.js`)

| Função | Responsabilidade |
|---|---|
| `init()` | Inicializa a aplicação |
| `renderDashboard()` | Atualiza o dashboard |
| `renderGrafico()` | Renderiza o gráfico de distribuição |
| `adicionarLancamento()` | Valida e registra uma despesa |
| `renderLancamentos()` | Lista os lançamentos do mês |
| `criarCategoria()` | Cria ou atualiza uma categoria |
| `exportarPDF()` | Gera e baixa o relatório mensal em PDF |
| `navegar()` | Controla a navegação entre telas |
| `formatarMoeda()` | Formata valores em BRL |

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

Em `js/index.js`, modifique a função `criarCategoria()` para incluir categorias pré-definidas ao inicializar a aplicação.

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

1. **Backup de Dados**: Os dados ficam no navegador local. Use as ferramentas de dev (DevTools → Application → localStorage) para inspecionar ou exportar os dados se necessário.
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
