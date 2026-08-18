---
description: sync-docs
---

# Sync Project Documentation

Sincronize a documentação técnica com o estado atual da codebase.

Não implemente features e não faça refactors.

## Etapa 1 — Contexto

Leia:

- AGENTS.md
- docs/ARCHITECTURE.md
- docs/CURRENT_STATE.md
- docs/API.md
- docs/AUTH.md
- docs/DECISIONS.md

## Etapa 2 — Mudanças

Analise o git diff e as alterações recentes relevantes.

Determine se houve mudança em:

- arquitetura
- funcionalidades implementadas
- autenticação
- API
- gerenciamento de estado
- dependências importantes
- decisões técnicas

## Etapa 3 — Atualização

Atualize somente documentos realmente afetados.

Use:

CONFIRMADO
para comportamento comprovado pela codebase.

PLANEJADO
para estrutura prevista mas ainda não implementada.

A CONFIRMAR
quando não houver evidência suficiente.

Nunca transforme intenção em implementação existente.

## CURRENT_STATE.md

Atualize funcionalidades que passaram de:

PLANEJADO → CONFIRMADO

ou que tiveram seu comportamento significativamente alterado.

Remova pendências apenas quando estiverem realmente resolvidas.

## ARCHITECTURE.md

Atualize somente quando existir mudança estrutural real.

## API.md

Atualize quando integrações HTTP, contratos ou padrões de acesso a dados mudarem.

## AUTH.md

Atualize quando autenticação ou sessão mudar.

## DECISIONS.md

Registre somente decisões técnicas relevantes e duradouras.

Não registre detalhes triviais de implementação.

## Resultado

Informe:

- documentos modificados
- informações adicionadas
- informações removidas ou atualizadas
- itens que continuam A CONFIRMAR