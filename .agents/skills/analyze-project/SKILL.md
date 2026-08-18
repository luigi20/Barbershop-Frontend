---
name: analyze-project
description: Analisa a arquitetura e estrutura de um projeto existente antes de implementar mudanças. Use ao conhecer uma codebase ou investigar como uma funcionalidade está organizada.
---

# Analyze Project

Antes de sugerir qualquer alteração, analise o projeto existente.

## Objetivos

Identifique:

- stack
- estrutura de diretórios
- arquitetura
- gerenciamento de estado
- comunicação com APIs
- autenticação
- componentes compartilhados
- padrões de código existentes
- bibliotecas importantes

## Processo

1. Leia o AGENTS.md.
2. Leia package.json.
3. Analise a estrutura de src/.
4. Localize serviços de API.
5. Localize autenticação.
6. Localize types e interfaces.
7. Localize componentes compartilhados.

Não altere arquivos durante esta análise.

## Resultado

Apresente:

- arquitetura encontrada
- arquivos mais importantes
- dependências principais
- padrões usados
- pontos que exigem atenção