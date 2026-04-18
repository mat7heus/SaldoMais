<div align="center">

<img src="https://i.imgur.com/gNzlTGO.png" alt="SaldoMais" width="72" height="72" style="border-radius:16px;margin-bottom:12px;" />

# Documentação Técnica — SaldoMais

**Gastos claros, decisões inteligentes.**

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zero deps](https://img.shields.io/badge/build-zero_dependências-22c55e?style=flat-square)
![localStorage](https://img.shields.io/badge/storage-localStorage-f59e0b?style=flat-square)
![Dark theme](https://img.shields.io/badge/tema-dark_only-1a1a1e?style=flat-square&logoColor=white)
![Docs](https://img.shields.io/badge/docs-7_documentos-f59e0b?style=flat-square)

</div>

> [!NOTE]
> Documentação interna voltada para desenvolvedores. Para uma visão geral do projeto, funcionalidades e stack, consulte o [README.md](../README.md) na raiz do repositório.

> [!TIP]
> Prefere uma interface visual? Abra [index.html](index.html) no navegador para navegar pela documentação com o design do SaldoMais.

---

## Índice

| # | Documento | O que cobre |
|:---:|---|---|
| 1 | [arquitetura.md](arquitetura.md) | Modelo de execução, escopo global, ordem de carregamento, fluxo de inicialização e padrões de design recorrentes |
| 2 | [modulos.md](modulos.md) | Os 8 módulos JS — responsabilidades, assinaturas de funções e contratos de interface |
| 3 | [dados.md](dados.md) | Schema das entidades no `localStorage`, relacionamentos, invariantes e formato de backup |
| 4 | [calculadoras.md](calculadoras.md) | Fórmulas matemáticas, parâmetros, retornos e edge cases das 8 calculadoras financeiras |
| 5 | [design-system.md](design-system.md) | Tokens CSS, componentes de UI, animações, responsividade e z-index |
| 6 | [funcionalidades.md](funcionalidades.md) | Regras de negócio e fluxos técnicos detalhados de cada feature |
| 7 | [contribuindo.md](contribuindo.md) | Setup do ambiente, convenções, guias para estender o projeto e depuração |

---

## Por onde começar

| Se você... | Leia primeiro |
|---|---|
| É novo no projeto | [arquitetura.md](arquitetura.md) — entenda o modelo de execução antes de qualquer módulo |
| Vai modificar uma feature | [funcionalidades.md](funcionalidades.md) (regras) + [modulos.md](modulos.md) (contratos) |
| Vai alterar dados ou storage | [dados.md](dados.md) — obrigatório antes de qualquer mudança de schema |
| Vai criar UI nova | [design-system.md](design-system.md) — tokens e componentes corretos |
| Vai adicionar uma calculadora | [contribuindo.md → nova calculadora](contribuindo.md#adicionando-uma-nova-calculadora) |
| Vai depurar um problema | [contribuindo.md → depuração](contribuindo.md#depuração) |
