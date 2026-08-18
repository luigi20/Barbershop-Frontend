---
description: new-feature
---

# New Feature

Implemente uma nova funcionalidade respeitando a arquitetura,
documentação e padrões existentes do BarberPro.

## Etapa 1 — Entender o projeto

Leia:

- AGENTS.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md

Se a feature envolver dados:

- docs/API.md

Se envolver autenticação:

- docs/AUTH.md

Se envolver decisão arquitetural existente:

- docs/DECISIONS.md

## Etapa 2 — Analisar implementação existente

Use a skill `implement-feature`.

Antes de escrever código:

1. encontre funcionalidades semelhantes
2. encontre componentes reutilizáveis
3. encontre types existentes
4. identifique os arquivos envolvidos
5. identifique dependências da feature
6. confirme de onde os dados devem vir

Não invente endpoints ou DTOs.

Se depender de uma informação de backend não disponível,
marque-a como A CONFIRMAR e pare nessa parte.

## Etapa 3 — Segunda análise

Para features médias ou grandes, use o MCP `openai-codex`.

Peça ao Codex para:

- analisar os arquivos envolvidos
- identificar riscos
- sugerir a menor arquitetura compatível com o projeto
- verificar possíveis reutilizações

Não peça ao Codex para implementar ainda.

## Etapa 4 — Plano

Crie um plano curto contendo:

- objetivo
- arquivos que serão criados
- arquivos que serão modificados
- types envolvidos
- fluxo de dados
- possíveis impactos
- validação necessária

Se houver mudança arquitetural,
pare e aguarde aprovação explícita.

Se não houver mudança arquitetural,
prossiga.

## Etapa 5 — Implementação

Implemente seguindo AGENTS.md.

Priorize:

- componentes existentes
- types existentes
- funções utilitárias existentes
- padrões existentes da codebase

Evite:

- abstrações prematuras
- código duplicado
- dependências desnecessárias
- alterações fora do escopo

## Etapa 6 — Validação

Execute:

npm run lint
npm run lint:prettier:check
npm run build

Execute testes relevantes caso existam.

## Etapa 7 — Review

Use a skill `code-review`.

Revise:

- comportamento
- tipagem
- edge cases
- acessibilidade
- responsividade
- performance
- regressões
- código duplicado

Use o MCP `openai-codex` como segunda revisão em features importantes.

## Etapa 8 — Memória técnica

Se a implementação modificar significativamente o projeto:

- atualize docs/CURRENT_STATE.md
- atualize docs/API.md se houver nova integração
- atualize docs/AUTH.md se houver mudança de autenticação
- atualize docs/ARCHITECTURE.md se houver mudança estrutural
- registre decisão relevante em docs/DECISIONS.md

Mude PLANEJADO para CONFIRMADO somente quando houver implementação real.

## Resultado

Informe:

- o que foi implementado
- arquivos criados
- arquivos modificados
- decisões tomadas
- validações executadas
- itens ainda A CONFIRMAR
