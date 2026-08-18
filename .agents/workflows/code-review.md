---
description: code-review
---

# Code Review

Faça uma revisão técnica das alterações atuais.

Não modifique código inicialmente.

## Etapa 1 — Contexto

Leia:

- AGENTS.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md

Use a skill `code-review`.

## Etapa 2 — Diff

Analise o git diff.

Determine:

- objetivo aparente das alterações
- arquivos afetados
- comportamento alterado

## Etapa 3 — Revisão

Procure especificamente:

- bugs
- regressões
- erros de TypeScript
- uso desnecessário de any
- problemas de estado React
- dependências incorretas em useEffect
- chamadas duplicadas
- condições de corrida
- tratamento inadequado de erros
- código duplicado
- abstrações desnecessárias
- problemas de performance relevantes
- acessibilidade
- responsividade
- violações de AGENTS.md

Ignore preferências puramente estéticas sem impacto técnico.

## Etapa 4 — Segunda revisão

Se a alteração for média ou grande,
use o MCP `openai-codex`.

Peça ao Codex para revisar o mesmo diff independentemente.

Compare os achados.

Não trate uma hipótese como bug confirmado.

## Etapa 5 — Classificação

Classifique cada achado como:

CRÍTICO
Pode provocar falha, perda de dados, vulnerabilidade ou regressão grave.

IMPORTANTE
Problema real que deveria ser corrigido antes de merge.

MELHORIA
Não bloqueia a implementação, mas pode melhorar qualidade.

## Etapa 6 — Resultado

Apresente primeiro os problemas encontrados.

Para cada problema informe:

- severidade
- arquivo
- trecho ou região
- motivo
- impacto
- correção recomendada

Se não encontrar problemas relevantes, diga explicitamente.

Não altere arquivos até receber autorização,
a menos que o usuário tenha solicitado revisão + correção.
