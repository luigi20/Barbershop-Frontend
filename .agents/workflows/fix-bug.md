---
description: fix-bug
---

# Fix Bug

Corrija um bug do projeto seguindo um processo de investigação, implementação,
validação e revisão.

## Etapa 1 — Contexto

Leia primeiro:

- AGENTS.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md

Leia também:

- docs/API.md se o problema envolver comunicação com backend
- docs/AUTH.md se envolver autenticação ou sessão

Não altere código nesta etapa.

## Etapa 2 — Investigação

Use a skill `bug-fix`.

Analise o comportamento relatado e determine:

- comportamento esperado
- comportamento atual
- arquivos envolvidos
- fluxo que leva ao problema
- causa raiz mais provável

Não faça refactor enquanto estiver apenas investigando.

Se a causa não estiver clara ou o problema envolver múltiplos arquivos,
use o MCP `openai-codex` como segunda análise.

Peça ao Codex para investigar a causa raiz sem modificar arquivos.

Compare a análise do Agent com a análise do Codex antes de implementar.

## Etapa 3 — Plano da correção

Antes de modificar código, apresente resumidamente:

1. causa encontrada
2. arquivos que serão modificados
3. correção proposta
4. possíveis impactos

Se a solução exigir mudança arquitetural, pare e peça aprovação.

Caso contrário, prossiga.

## Etapa 4 — Implementação

Implemente a menor alteração capaz de corrigir a causa raiz.

Respeite AGENTS.md.

Não:

- faça refactors não relacionados
- instale dependências sem necessidade
- altere contratos da API sem confirmação
- introduza `any` sem justificativa
- modifique código fora do escopo do bug

## Etapa 5 — Validação

Execute:

npm run lint
npm run lint:prettier:check
npm run build

Se existirem testes relevantes, execute-os também.

Se algum comando falhar:

1. determine se a falha foi causada pela alteração
2. corrija se estiver relacionada
3. não esconda falhas preexistentes

## Etapa 6 — Code review

Use a skill `code-review`.

Revise o git diff procurando:

- regressões
- efeitos colaterais
- problemas de tipagem
- duplicação
- código morto
- estados incorretos
- condições de corrida
- problemas assíncronos

Para bugs complexos, use também o MCP `openai-codex`
para uma segunda revisão do diff.

Corrija problemas diretamente relacionados encontrados na revisão.

## Etapa 7 — Documentação

Atualize docs/ somente se a correção alterar:

- arquitetura
- autenticação
- integração com API
- uma decisão técnica
- o estado significativo de uma funcionalidade

Não atualize documentação por ajustes triviais.

## Resultado

Ao finalizar, informe:

- causa raiz
- solução aplicada
- arquivos modificados
- validações executadas
- resultado do build
- riscos ou observações restantes