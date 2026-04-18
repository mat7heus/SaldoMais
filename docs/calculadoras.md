# Calculadoras Financeiras

> **Objetivo:** Documentar as 8 calculadoras financeiras do SaldoMais — fórmulas matemáticas utilizadas, parâmetros de entrada, estrutura de retorno, edge cases tratados e o padrão de separação entre lógica pura e UI.

---

## Padrão de arquitetura

Cada calculadora é implementada em dois níveis:

1. **Função pura (`calcXxx`)** — recebe apenas números, sem acesso ao DOM. Determinística e testável isoladamente.
2. **Função de UI (`calcularXxx`)** — lê os inputs do DOM via `parseBRCalc()`, valida os dados, chama a função pura e injeta o HTML de resultado.

Esse padrão permite testar as fórmulas sem depender do browser e facilita reutilizar a lógica matemática em outros contextos (ex: PDF, testes futuros).

### Parser de entrada

```javascript
parseBRCalc(str: string): number
```

Aceita números no formato brasileiro (`1.000,50`) ou americano (`1000.50`). A lógica detecta qual separador decimal foi usado com base na posição relativa de `.` e `,`.

---

## 1. Juros Compostos

**Função:** `calcJurosCompostos(capital, aporte, taxaAnual, periodo)`

Simula a evolução de um investimento com capital inicial, aportes mensais opcionais e taxa anual.

### Fórmula

A taxa mensal equivalente é derivada da taxa anual via equivalência de juros compostos:

```
i_mensal = (1 + taxaAnual)^(1/12) - 1
```

A cada mês `m`:
```
saldo_m = saldo_(m-1) * (1 + i) + aporte
```

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `capital` | number | R$ |
| `aporte` | number | R$ (0 se não houver) |
| `taxaAnual` | number | decimal (ex: 0.12 para 12%) |
| `periodo` | number | meses |

### Retorno

```typescript
{
  saldo: number,          // montante final
  totalInvestido: number, // capital + (aporte * periodo)
  totalJuros: number,     // saldo - totalInvestido
  linhas: Array<{
    mes: number,
    aporte: number,
    jurosMes: number,     // juros gerados naquele mês
    montante: number      // saldo acumulado ao final do mês
  }>
}
```

---

## 2. Simulador CDB / CDI

**Função:** `calcCDBCDI(valor, taxaCDI, percentual, prazo)`

Calcula o rendimento líquido de um CDB pós-fixado indexado ao CDI.

### Fórmula

```
taxaEfetiva_aa = taxaCDI * (percentual / 100) / 100
taxaDiaria     = (1 + taxaEfetiva_aa)^(1/252) - 1
rendBruto      = valor * ((1 + taxaDiaria)^prazo - 1)
```

O IR é calculado com a tabela regressiva do imposto de renda para renda fixa:

| Prazo (dias corridos) | Alíquota |
|---|---|
| ≤ 180 | 22,5% |
| 181 – 360 | 20,0% |
| 361 – 720 | 17,5% |
| > 720 | 15,0% |

```
ir       = rendBruto * aliquota
valorLiq = valor + rendBruto - ir
```

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `valor` | number | R$ |
| `taxaCDI` | number | % a.a. (ex: 10.5) |
| `percentual` | number | % do CDI (ex: 110) |
| `prazo` | number | dias corridos |

### Retorno

```typescript
{
  rendBruto: number,
  ir: number,
  valorLiq: number,
  aliquota: number  // decimal, ex: 0.20 para 20%
}
```

---

## 3. Aporte para Meta

**Função:** `calcAporteMeta(meta, prazo, taxaMensal)`

Calcula o valor de aporte mensal necessário para atingir um objetivo financeiro no prazo definido, dado um retorno mensal esperado.

### Fórmula

PMT (Payment) de anuidade ordinária (pagamentos ao final do período):

```
PMT = meta * i / ((1 + i)^n - 1)
```

Onde `i` é a taxa mensal e `n` é o número de meses.

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `meta` | number | R$ |
| `prazo` | number | meses |
| `taxaMensal` | number | decimal (ex: 0.01 para 1%) |

### Retorno

```typescript
{
  pmt: number,           // aporte mensal necessário
  totalAportado: number, // pmt * prazo
  totalJuros: number     // meta - totalAportado (juros que o investimento gera)
}
```

---

## 4. Renda de Dividendos

**Função:** `calcDividendYield(patrimonio, yieldAnual)`

Estima a renda passiva gerada por um patrimônio com base no dividend yield anual declarado.

### Fórmula

```
rendaAnual  = patrimonio * (yieldAnual / 100)
rendaMensal = rendaAnual / 12
```

Cálculo simples sem considerar reinvestimento ou variação do patrimônio.

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `patrimonio` | number | R$ |
| `yieldAnual` | number | % (ex: 8.0) |

### Retorno

```typescript
{
  rendaAnual: number,
  rendaMensal: number
}
```

---

## 5. Financiamento (Tabela Price)

**Função:** `calcFinanciamentoPrice(pv, taxaMensal, n)`

Calcula parcelas constantes de um financiamento pelo método Price (amortização francesa).

### Fórmula

```
parcela = PV * i / (1 - (1 + i)^-n)
```

Tabela de amortização (por parcela `k`):
```
juros_k = saldo_(k-1) * i
amort_k = parcela - juros_k
saldo_k = max(0, saldo_(k-1) - amort_k)
```

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `pv` | number | R$ (valor financiado) |
| `taxaMensal` | number | decimal (ex: 0.015 para 1,5%) |
| `n` | number | número de parcelas |

### Retorno

```typescript
{
  parcela: number,
  totalPago: number,
  totalJuros: number,
  linhas: Array<{
    parcela: number,    // número da parcela (1-based)
    prestacao: number,  // valor da parcela (constante)
    amort: number,      // amortização do principal
    juros: number,      // juros da parcela
    saldo: number       // saldo devedor após a parcela
  }>
}
```

---

## 6. Rotativo do Cartão de Crédito

**Função:** `calcRotativoCartao(divida, taxaMensal, pagamento)`

Simula a evolução de uma dívida no rotativo do cartão com pagamento fixo mensal.

### Fórmula

A cada mês:
```
juros     = saldo * taxaMensal
pag       = min(pagamento, saldo + juros)  // não paga mais do que a dívida total
novoSaldo = max(0, saldo + juros - pag)
```

### Edge case crítico

Se `pagamento <= juros do primeiro mês`, a dívida nunca será quitada (saldo cresce infinitamente). A função detecta isso e retorna `{ impossivel: true, jurosPrimeiro }` sem simular.

### Limitações da simulação

- Máximo de 1200 iterações (100 anos). Se atingido, `maxAtingido: true`.
- A tabela de resultado contém apenas os primeiros 24 meses para não sobrecarregar o DOM.

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `divida` | number | R$ |
| `taxaMensal` | number | decimal (ex: 0.15 para 15%) |
| `pagamento` | number | R$ por mês |

### Retorno

```typescript
// Caso impossível:
{ impossivel: true, jurosPrimeiro: number }

// Caso normal:
{
  meses: number,
  totalPago: number,
  totalJuros: number,
  maxAtingido: boolean,
  linhas: Array<{
    mes: number,
    saldo: number,
    juros: number,
    pag: number,
    novoSaldo: number
  }>
}
```

---

## 7. À Vista vs Parcelado

**Função:** `calcAVistaVsParcelado(avista, parcelaValor, nParcelas, taxaMensal)`

Compara o custo real de pagar à vista versus parcelado, considerando o custo de oportunidade do capital (rendimento mensal caso o dinheiro fique investido).

### Fórmula

O valor presente (PV) das parcelas futuras, descontado pela taxa de rendimento:

```
PV_parcelas = parcelaValor * (1 - (1 + i)^-n) / i
```

Se `PV_parcelas < avista`: parcelado é mais vantajoso (o capital rende mais do que o custo implícito das parcelas).

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `avista` | number | R$ |
| `parcelaValor` | number | R$ por parcela |
| `nParcelas` | number | número de parcelas (mín. 2) |
| `taxaMensal` | number | decimal (taxa do investimento) |

### Retorno

```typescript
{
  pvParcelas: number,       // valor presente das parcelas
  totalParcelado: number,   // parcelaValor * nParcelas
  parceladoMelhor: boolean, // true se PV < avista
  diferenca: number         // |pvParcelas - avista|
}
```

---

## 8. Vale a Pena Quitar a Dívida?

**Função:** `calcQuitarDivida(saldo, taxaDivida, parcelas, desconto, disponivel, taxaInvest)`

Compara dois cenários: quitar a dívida antecipadamente (com desconto) vs. manter o dinheiro investido pelo mesmo período.

### Fórmula

```
saldoDesconto  = saldo * (1 - desconto / 100)
pmtOriginal    = saldo * taxaDivida / (1 - (1+taxaDivida)^-parcelas)
totalOriginal  = pmtOriginal * parcelas
rendPerdido    = disponivel * ((1 + taxaInvest)^parcelas - 1)
```

**Cenário A** — Quitação total (disponivel >= saldoDesconto):
```
economia = totalOriginal - saldoDesconto
```

**Cenário B** — Quitação parcial (disponivel < saldoDesconto):
```
novoSaldo  = saldoDesconto - disponivel
pmtNovo    = novoSaldo * taxaDivida / (1 - (1+taxaDivida)^-parcelas)
totalNovo  = pmtNovo * parcelas
economia   = totalOriginal - (disponivel + totalNovo)
```

A recomendação é `quitarMelhor = economia > rendPerdido`.

### Parâmetros

| Parâmetro | Tipo | Unidade |
|---|---|---|
| `saldo` | number | R$ (saldo devedor atual) |
| `taxaDivida` | number | decimal (taxa mensal da dívida) |
| `parcelas` | number | parcelas restantes |
| `desconto` | number | % de desconto para quitação antecipada |
| `disponivel` | number | R$ disponível para quitar |
| `taxaInvest` | number | decimal (taxa mensal do investimento) |

### Retorno

```typescript
{
  saldoDesconto: number,
  economia: number,
  rendimentoPerdido: number,
  cenario: 'A' | 'B',
  infoCenario: string,      // descrição textual do cenário
  diferenca: number,        // |economia - rendimentoPerdido|
  quitarMelhor: boolean
}
```
