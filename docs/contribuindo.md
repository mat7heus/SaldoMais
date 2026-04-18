# Contribuindo

> **Objetivo:** Orientar desenvolvedores sobre como configurar o ambiente de desenvolvimento, entender as convenções do projeto e adicionar novas funcionalidades de forma consistente com a arquitetura existente.

---

## Setup do ambiente

Não há dependências de build, npm ou bundler. O projeto roda diretamente no browser.

```bash
git clone https://github.com/mat7heus/SaldoMais.git
cd SaldoMais
```

Abra `index.html` diretamente no browser (duplo clique ou arraste) ou sirva via HTTP local:

```bash
# Python 3
python3 -m http.server 8080

# Node (npx)
npx serve .
```

O protocolo `file://` funciona para a maioria das funcionalidades, mas o **cabeçalho do PDF** faz uma requisição `fetch` para buscar o logo — isso falha em `file://` por restrições de CORS. Use um servidor HTTP local se precisar testar a geração de PDF com o logo.

---

## Estrutura de arquivos

```
SaldoMais/
├── index.html          # Único arquivo HTML — estrutura do app e carregamento de scripts
├── css/
│   └── index.css       # Todos os estilos da aplicação
├── js/
│   ├── core.js         # Fundação: constantes, DOM refs, storage, utils, modais, navegação
│   ├── lancamentos.js  # Orçamentos e transações
│   ├── categorias.js   # CRUD de categorias e percentuais
│   ├── dashboard.js    # Dashboard e gráfico
│   ├── calculadoras.js # 8 calculadoras financeiras
│   ├── backup.js       # Exportar/importar JSON
│   ├── pdf.js          # Geração de relatório PDF
│   └── app.js          # Orquestração e inicialização
└── docs/               # Documentação técnica
```

---

## Convenções do projeto

### JavaScript

- **Sem módulos ES** — o projeto usa escopo global. Funções são acessíveis entre arquivos porque todos compartilham `window`. Não use `import`/`export`.
- **Ordem de carregamento importa** — `core.js` deve ser o primeiro. `app.js` deve ser o último. Ao adicionar um novo arquivo, insira a tag `<script defer>` no `index.html` na posição correta.
- **Nomenclatura em camelCase e português** — variáveis, funções e comentários seguem o padrão do restante do código. Ex: `adicionarLancamento`, `renderCategoriasLista`.
- **Separadores de seção** — use o padrão `// ─── NOME DA SEÇÃO ───` para demarcar grupos de funções dentro de um arquivo.
- **Render total** — ao modificar dados no storage, chame `renderComplete()` no final (ou `renderAll()` se não precisar atualizar o dashboard). Não faça atualizações parciais de DOM fora das funções de render.

### CSS

- **Use variáveis CSS** — nunca hardcode cores. Consulte os tokens em `design-system.md`.
- **border-radius padrão:** 14px para cards/containers, 10px para inputs/botões, 8px para elementos menores.
- **Transições:** 0.2s–0.25s ease para a maioria dos elementos interativos.
- **backdrop-filter: blur(20px)** nos panels elevados (cards, sidebar, modais).

### HTML

- Novos elementos interativos dinâmicos devem usar `data-action` + `data-id` para event delegation em vez de `onclick` inline (exceto nas calculadoras, que já usam `onclick` diretamente por simplicidade).
- Ícones Lucide: use `<i data-lucide="nome-do-icone" size="N"></i>`. Lembre de chamar `lucide.createIcons()` após injetar HTML com ícones.

---

## Adicionando uma nova tela

1. Crie um `<section id="nova-tela" class="screen">` em `index.html`
2. Adicione um botão de navegação na `.sidebar-nav`:
   ```html
   <button data-screen="nova-tela" class="nav-btn" title="Descrição (Alt+N)">
     <span class="nav-icon"><i data-lucide="icone"></i></span>
     <span class="nav-label">Nome</span>
     <kbd class="nav-shortcut">Alt+N</kbd>
   </button>
   ```
3. Registre o atalho `Alt+N` no mapeamento em `app.js`:
   ```javascript
   const screenMap = { '1': 'dashboard', '2': 'lancamentos', '3': 'categorias', '4': 'calculadoras', 'N': 'nova-tela' };
   ```
4. Se a tela precisar de re-render na navegação, adicione o hook em `navegar()` em `core.js`:
   ```javascript
   if(btn.dataset.screen === "nova-tela") renderNovaTela();
   ```

---

## Adicionando uma nova calculadora

1. Crie a **função matemática pura** em `calculadoras.js`:
   ```javascript
   function calcMinhaCalc(param1, param2) {
     // lógica sem acesso ao DOM
     return { resultado1, resultado2 };
   }
   ```

2. Crie a **função de UI** em `calculadoras.js`:
   ```javascript
   function calcularMinhaCalc() {
     const param1 = parseBRCalc(document.getElementById('mc-param1').value);
     if (param1 <= 0) { notificar('Mensagem de erro'); return; }
     const r = calcMinhaCalc(param1, param2);
     document.getElementById('mc-cards').innerHTML = `...`;
     mostrarResultado('mc-resultado');
     if (window.lucide) lucide.createIcons();
   }
   ```

3. Adicione o HTML do card em `index.html` dentro do `.calc-grid` correspondente:
   ```html
   <div class="calc-card">
     <div class="calc-card-header">...</div>
     <div class="input-group">...</div>
     <button onclick="calcularMinhaCalc()" class="btn-primary" ...>Calcular</button>
     <div id="mc-resultado" class="calc-result" style="display:none;">
       <div class="calc-result-cards" id="mc-cards"></div>
     </div>
   </div>
   ```

4. Se quiser que `Enter` dispare o cálculo, adicione ao mapeamento em `calculadoras.js`:
   ```javascript
   const calcMap = [
     ...
     ['mc-param1', calcularMinhaCalc],
   ];
   ```

---

## Modificando o schema de dados

**Antes de qualquer alteração no schema, considere:**
- Backups existentes de usuários ficarão incompatíveis se você renomear ou remover campos
- A importação de backup não valida estrutura interna — dados antigos serão carregados silenciosamente com campos faltando

Se precisar evoluir o schema:
1. Mantenha compatibilidade com os campos existentes
2. Adicione novos campos com valor default (os registros antigos não os terão)
3. Atualize `_versao` no formato de backup
4. Documente a mudança em `docs/dados.md`

---

## Depuração

Todos os dados estão acessíveis no DevTools do browser:

```javascript
// Ver categorias
JSON.parse(localStorage.getItem('saldomain_categorias'))

// Ver orçamentos
JSON.parse(localStorage.getItem('saldomain_orcamentos'))

// Ver lançamentos
JSON.parse(localStorage.getItem('saldomain_lancamentos'))

// Limpar tudo (apaga todos os dados)
localStorage.clear()
```

O gráfico Chart.js é acessível via `window.graficoChart` para inspeção ou destruição manual.

Erros de render são capturados pelo `try/catch` em `renderAll()` e `init()` — verifique o console para mensagens de erro silenciosas.

---

## Testes

O projeto não tem suite de testes automatizados. As funções matemáticas puras (`calcJurosCompostos`, `calcCDBCDI`, etc.) são candidatas naturais a testes unitários — elas não têm efeitos colaterais e retornam objetos determinísticos.

Para rodar funções puras manualmente no console:

```javascript
calcJurosCompostos(1000, 200, 0.12, 12)
// → { saldo: ..., totalInvestido: ..., totalJuros: ..., linhas: [...] }
```
