# Modelos de Dados

> **Objetivo:** Documentar as estruturas de dados persistidas no `localStorage`, os relacionamentos entre entidades, as chaves de acesso, as regras de integridade e o formato do arquivo de backup — tudo que um desenvolvedor precisa saber antes de manipular dados no SaldoMais.

---

## Camada de persistência

O SaldoMais não tem backend. Todos os dados ficam no `localStorage` do navegador sob o domínio/origem que serve os arquivos. Dados são perdidos se o usuário limpar o armazenamento do navegador ou abrir o app em outro dispositivo sem importar backup.

**Limite prático:** O `localStorage` suporta ~5–10 MB dependendo do navegador. Para o volume esperado (dezenas de categorias, centenas de lançamentos), esse limite não é uma preocupação real.

### Acesso via helpers

```javascript
const get = key => JSON.parse(localStorage.getItem(key)) || [];
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
```

`get` sempre retorna um array — nunca `null`. Se o item não existir ou o JSON for inválido, retorna `[]`.

---

## Chaves do `localStorage`

Definidas em `core.js` como `STORAGE`:

| Constante | Chave | Entidade |
|---|---|---|
| `STORAGE.categorias` | `saldomain_categorias` | Categorias de gasto |
| `STORAGE.orcamentos` | `saldomain_orcamentos` | Orçamentos mensais |
| `STORAGE.lancamentos` | `saldomain_lancamentos` | Transações registradas |

---

## Entidades

### Categoria

```typescript
{
  id: number,          // timestamp Unix gerado no momento da criação (Date.now() + índice)
  nome: string,        // nome único (case-insensitive), máx. 30 caracteres
  percentual: number,  // inteiro 0-100, representa % do orçamento alocado a esta categoria
  cor_hex: string      // cor hexadecimal, ex: "#f59e0b"
}
```

**Invariantes:**
- A soma dos `percentual` de todas as categorias deve ser `100` para que os limites por categoria sejam calculados corretamente. O app impede salvar percentuais que não somem 100.
- `nome` é único (comparação case-insensitive). O app rejeita duplicatas na criação e edição.
- Novas categorias criadas pelo usuário recebem `percentual: 0` — o usuário deve ajustar manualmente os sliders.

---

### Orçamento

```typescript
{
  id: number,                 // timestamp Unix gerado na criação
  mes_referencia: string,     // formato "YYYY-MM", ex: "2026-04"
  valor_total: number         // valor em reais (float), ex: 5000.00
}
```

**Invariantes:**
- Existe no máximo um orçamento por `mes_referencia`. Se o usuário salvar o orçamento num mês que já tem registro, o `valor_total` é atualizado (upsert).
- `resetarMes()` zera `valor_total` para `0` mas não remove o registro — o orçamento do mês ainda existe, mas com valor zero.

---

### Lançamento

```typescript
{
  id: number,               // timestamp Unix gerado na criação
  id_orcamento: number,     // FK → Orçamento.id
  id_categoria: number,     // FK → Categoria.id
  valor: number,            // valor em reais (float), sempre > 0
  descricao: string         // texto livre, obrigatório, sem limite de tamanho imposto
}
```

**Invariantes:**
- `id_orcamento` referencia o orçamento do mês em que o lançamento foi criado.
- Ao deletar uma categoria, todos os lançamentos com aquele `id_categoria` são removidos em cascata.
- Não existe edição de lançamento — apenas exclusão e recriação.

---

## Relacionamentos

```
Categoria (1) ──── (N) Lançamento
Orçamento (1) ──── (N) Lançamento
```

Não há foreign key enforced — as relações são resolvidas em memória nas funções de render e cálculo, sempre via `find()` ou `filter()` nos arrays lidos do storage.

**Exemplo de join para calcular gasto por categoria:**

```javascript
const o = orcamentoAtual();
const cats = get(STORAGE.categorias);
const lanc = get(STORAGE.lancamentos).filter(l => l.id_orcamento === o.id);

cats.forEach(c => {
  const limite = o.valor_total * c.percentual / 100;
  const gasto  = lanc
    .filter(l => l.id_categoria === c.id)
    .reduce((s, l) => s + l.valor, 0);
});
```

---

## Uso de `Date.now()` como ID

Todos os IDs são gerados via `Date.now()` no momento da criação. Isso garante unicidade na prática (sem concorrência num app single-user), mas não é um UUID. O risco de colisão existe se dois registros forem criados no mesmo milissegundo — nas categorias padrão isso é contornado com `Date.now() + índice`.

---

## Formato do arquivo de backup

O backup exportado é um JSON com envelope de metadados:

```json
{
  "_versao": 1,
  "_exportado_em": "2026-04-18T14:30:00.000Z",
  "categorias": [
    { "id": 1713369600000, "nome": "Custos fixos", "percentual": 30, "cor_hex": "#f59e0b" }
  ],
  "orcamentos": [
    { "id": 1713369601000, "mes_referencia": "2026-04", "valor_total": 5000 }
  ],
  "lancamentos": [
    { "id": 1713369602000, "id_orcamento": 1713369601000, "id_categoria": 1713369600000, "valor": 150, "descricao": "Mercado" }
  ]
}
```

**Validação na importação:** apenas verifica se as chaves `categorias`, `orcamentos` e `lancamentos` existem no JSON. Não valida estrutura interna dos objetos.

**Comportamento:** a importação sobrescreve completamente o storage — não faz merge. Dados existentes são perdidos.

---

## Isolamento de dados por mês

O app não filtra dados históricos por padrão — todos os lançamentos de todos os meses ficam no mesmo array. O isolamento acontece sempre que se filtra por `id_orcamento`:

```javascript
// Apenas lançamentos do mês atual:
get(STORAGE.lancamentos).filter(l => l.id_orcamento === orcamentoAtual().id)
```

Isso significa que `get(STORAGE.lancamentos)` cresce indefinidamente com o tempo. Não há mecanismo de arquivamento ou limpeza automática de meses antigos — apenas o backup/restore e o `resetarMes()` (que afeta somente o mês atual).
