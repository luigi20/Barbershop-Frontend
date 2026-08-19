---
name: implement-feature
description: Implementa novas funcionalidades respeitando a arquitetura e os padrões existentes do projeto.
---

## Etapa 0 — Git

Antes de qualquer modificação, execute:

git branch --show-current
git status --short

Se a branch atual for `main`:

- não modifique nenhum arquivo;
- informe que uma branch de feature deve ser criada;
- sugira um nome no padrão `feat/<nome>`;
- aguarde o usuário criar ou autorizar a criação da branch.

Se existirem alterações não commitadas que não pertençam à tarefa atual,
informe antes de prosseguir.

Nunca faça automaticamente:

- git push
- git merge
- git rebase
- git reset
- git clean

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
