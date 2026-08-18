---
name: implement-feature
description: Implementa novas funcionalidades respeitando a arquitetura e os padrões existentes do projeto.
---

# Implement Feature

Antes de implementar:

1. Leia AGENTS.md.
2. Analise funcionalidades semelhantes existentes.
3. Identifique os arquivos que serão afetados.
4. Identifique contratos de API envolvidos.
5. Crie um plano curto de implementação.

## Implementação

Sempre reutilize padrões existentes antes de criar novos.

Priorize:

- componentes existentes
- helpers existentes
- services existentes
- types existentes

Evite duplicação.

Não altere contratos externos sem necessidade.

## Validação

Depois da implementação:

- execute lint
- execute TypeScript
- execute testes relevantes
- revise o diff

## Finalização

Informe:

- o que foi criado
- arquivos alterados
- decisões tomadas
- pontos que ainda precisam de atenção