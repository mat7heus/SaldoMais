# 💰 SaldoMais

Uma aplicação web moderna e intuitiva para **gestão de finanças pessoais**, desenvolvida com tecnologias web puras (HTML, CSS, JavaScript vanilla). Organize seu orçamento mensal, acompanhe suas despesas por categoria e visualize seus gastos de forma clara através de gráficos interativos.

![Interface do SaldoMais](https://i.imgur.com/gaFCELE.jpeg)

---

## 📋 Sobre o Projeto

SaldoMais é pensada para ajudar você a:
- ✅ Definir e gerir um orçamento mensal
- ✅ Registrar despesas por categorias personalizáveis
- ✅ Visualizar a distribuição dos gastos em gráficos
- ✅ Acompanhar o saldo disponível em tempo real
- ✅ Gerenciar dados localmente (sem a necessidade de um servidor)

---

## 🚀 Características

### Dashboard
- Visão geral completa do seu orçamento
- Exibição do mês atual
- Resumo de gastos e saldo disponível
- Gráfico mostrando distribuição por categoria
- Status de cada categoria (dentro ou fora do orçamento)

### Lançamentos
- Adição rápida de despesas
- Seleção de categoria
- Descrição da transação
- Registro automático, após o lançamento
- Lista de todos os lançamentos do mês

### Categorias
- Criar novas categorias personalizadas
- Definir limite de gastos por categoria
- Editar e atualizar categorias existentes
- Gerenciar suas necessidades financeiras

### Interface
- 🎨 Design moderno com tema escuro (para conforto da sua visão)
- 📱 Responsivo e amigável
- ⚡ Performance otimizada
- 🇧🇷 Interface em português (Brasil)
- 🔔 Notificações visuais de ações

---

## 💻 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização com variáveis CSS e design responsivo
- **JavaScript (Vanilla)** - Lógica da aplicação sem dependências
- **LocalStorage** - Persistência de dados no navegador
- **Chart.js** - Visualização de dados em gráficos

---

## 📦 Instalação

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para carregar bibliotecas externas)

### Como Usar

1. **Clone ou baixe o projeto**
   ```bash
   git clone https://github.com/seu-usuario/SaldoMais.git
   cd SaldoMais
   ```

2. **Abra a aplicação**
   - Duplo clique no arquivo `index.html`
   - Ou arraste `index.html` para o seu navegador

3. **Comece a usar!**
   - Defina seu orçamento mensal
   - Crie categorias de gastos
   - Registre suas despesas
   - Acompanhe seus gastos no dashboard

---

## 🗂️ Estrutura do Projeto

```
SaldoMais/
├── index.html          # Página principal da aplicação
├── css/
│   └── index.css       # Estilos e layout
├── js/
│   └── index.js        # Lógica da aplicação
└── README.md           # Este arquivo
```

---

## 🎯 Como Funciona

### Armazenamento de Dados
Todos os dados são armazenados **localmente no seu navegador** usando `localStorage`, garantindo:
- 🔒 Privacidade
- 💾 Dados persistentes entre sessões
- ⚡ Carregamento rápido

### Estrutura de Dados
```javascript
// Categorias (com ID e limite de gastos)
saldomain_categorias: [
  { id, nome, limite }
]

// Orçamentos mensais
saldomain_orcamentos: [
  { mes, ano, valor }
]

// Lançamentos de despesas
saldomain_lancamentos: [
  { id, desc, valor, categoria, data }
]
```

---

## 📊 Funcionalidades Detalhadas

### Dashboard
- Defina o orçamento total para o mês
- Visualize graficamente como seus gastos são distribuídos
- Acompanhe o status de cada categoria
- Limpe os dados do mês atual quando necessário

### Lançamentos
- Registre uma nova despesa
- Escolha a categoria mais apropriada
- Adicione uma descrição (opcional)
- Veja o histórico completo de transações

### Categorias
- Personalize suas categorias de gastos
- Defina limites individuais por categoria
- Receba alertas quando ultrapassar o limite
- Adapte às suas necessidades financeiras

---

## ⚙️ Scripts e Funções Principais

### Funções Principais (js/index.js)
- `init()` - Inicializa a aplicação
- `renderDashboard()` - Atualiza o dashboard
- `adicionarLancamento()` - Registra uma despesa
- `criarCategorias()` - Gerencia categorias
- `navegar()` - Controla navegação entre telas
- `formatarMoeda()` - Formata valores em reais

---

## 🎨 Personalização

### Cores Personalizadas
Edite as variáveis CSS em `css/index.css`:
```css
:root {
  --bg: #0b0b0c;           /* Cor de fundo principal */
  --accent: #f59e0b;       /* Cor de destaque */
  --danger: #ef4444;       /* Cor de alerta */
  --ok: #22c55e;           /* Cor de sucesso */
}
```

### Adicionar Categorias Padrão
Em `js/index.js`, modifique a função `criarCategorias()` para incluir suas categorias iniciais.

---

## 📱 Compatibilidade

| Navegador | Suporte |
|-----------|---------|
| Chrome    | ✅ Completo |
| Firefox   | ✅ Completo |
| Safari    | ✅ Completo |
| Edge      | ✅ Completo |
| Opera     | ✅ Completo |

---

## 💡 Dicas de Uso

1. **Backup de Dados**: Como os dados ficam no navegador, use ferramentas de dev para exportar seu localStorage periodicamente, se for o caso.
2. **Orçamento Realista**: Defina orçamentos baseados no seu histórico de gastos, a ideia do SaldoMais é te ajudar a se organizar. :)
3. **Categorias Claras**: Use nomes de categorias que façam sentido para seu contexto e a sua forma de se organizar.
4. **Revisão Mensal**: Revise seus gastos regularmente para identificar padrões e melhorar o seu fluxo financeiro.

---

## 🐛 Conhecidas Limitações

- Dados são armazenados apenas no navegador local (não sincroniza entre dispositivos)
- Limite de armazenamento depende do navegador (geralmente até 10MB)
- Sem autenticação ou usuário - qualquer pessoa com acesso ao navegador pode ver os dados

---

## 🚀 Possíveis Melhorias Futuras

- [ ] Exportação de relatórios (PDF/Excel)

---

## 📝 Licença

Este projeto é de **código aberto** e disponível sob a licença GPL v3.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novas features
- Melhorar a documentação
- Enviando pull requests

---

## 📧 Contato

Para dúvidas, sugestões ou reportar problemas, abra uma issue no repositório.

---

**💰 Comece a controlar seu dinheiro agora com o SaldoMais!**
