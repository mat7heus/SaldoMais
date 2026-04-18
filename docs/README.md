# Documentação Técnica — SaldoMais

Documentação interna voltada para desenvolvedores. Para uma visão geral do projeto, funcionalidades e stack, consulte o [README.md](../README.md) na raiz do repositório.

---

## Índice

| Documento | O que cobre |
|---|---|
| [arquitetura.md](arquitetura.md) | Modelo de execução, escopo global, ordem de carregamento, fluxo de inicialização e padrões de design recorrentes |
| [modulos.md](modulos.md) | Documentação de todos os 8 módulos JS — responsabilidades, assinaturas de funções e contratos |
| [dados.md](dados.md) | Schema das entidades no `localStorage`, relacionamentos, regras de integridade e formato de backup |
| [calculadoras.md](calculadoras.md) | Fórmulas matemáticas, parâmetros, retornos e edge cases das 8 calculadoras financeiras |
| [design-system.md](design-system.md) | Tokens CSS, componentes de UI, animações, responsividade e z-index |
| [funcionalidades.md](funcionalidades.md) | Regras de negócio e fluxos técnicos detalhados de cada feature |
| [contribuindo.md](contribuindo.md) | Setup do ambiente, convenções, guias para estender o projeto e depuração |

---

## Por onde começar

- **Novo no projeto?** Leia [arquitetura.md](arquitetura.md) primeiro — ele explica como as peças se encaixam antes de entrar em qualquer módulo específico.
- **Vai mexer em uma feature?** Consulte [funcionalidades.md](funcionalidades.md) para entender as regras de negócio e [modulos.md](modulos.md) para o contrato das funções envolvidas.
- **Vai alterar dados ou storage?** Leia [dados.md](dados.md) antes de qualquer mudança de schema.
- **Vai criar UI nova?** Consulte [design-system.md](design-system.md) para usar os tokens e componentes corretos.
- **Vai adicionar uma calculadora?** Siga o guia em [contribuindo.md](contribuindo.md#adicionando-uma-nova-calculadora).
