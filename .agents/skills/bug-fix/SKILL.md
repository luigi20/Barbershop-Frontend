---
name: bug-fix
description: Investiga e corrige bugs buscando a causa raiz e evitando refactors desnecessários. Use quando houver comportamento incorreto, erro ou regressão.
---

# Bug Fix

## Regra principal

Não altere código imediatamente.

Primeiro determine a causa raiz.

## Investigação

1. Identifique o comportamento esperado.
2. Identifique o comportamento atual.
3. Localize os arquivos envolvidos.
4. Trace o fluxo da funcionalidade.
5. Verifique estados e efeitos.
6. Verifique chamadas HTTP.
7. Verifique tipos.
8. Verifique possíveis efeitos colaterais.

## Correção

Prefira a menor mudança que resolva a causa raiz.

Evite:

- refactors desnecessários
- novas dependências sem necessidade
- alterações de arquitetura
- duplicação de lógica

## Validação

Após modificar o código:

1. Execute lint.
2. Execute verificação TypeScript.
3. Execute testes relacionados, se existirem.
4. Revise o git diff.

## Relatório final

Informe:

- causa do bug
- arquivos modificados
- solução aplicada
- possíveis impactos
- testes executados
