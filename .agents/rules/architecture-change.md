---
trigger: model_decision
description: Modificação na arquitetura
---

# Architecture Change Rules

Esta regra se aplica a qualquer alteração que introduza ou modifique:

- arquitetura de pastas;
- gerenciamento global de estado;
- biblioteca HTTP;
- autenticação;
- design system;
- estratégia de cache;
- camada de services;
- providers globais;
- dependências estruturais;
- padrões utilizados em várias features.

Antes de implementar:

1. leia @docs/ARCHITECTURE.md;
2. leia @docs/DECISIONS.md;
3. analise a implementação existente;
4. determine se a mudança realmente exige alteração arquitetural;
5. apresente um plano;
6. apresente vantagens, impactos e alternativas;
7. aguarde aprovação explícita do usuário.

Não implemente a mudança arquitetural antes da aprovação.

Depois de aprovada e implementada:

- atualizar @docs/ARCHITECTURE.md quando necessário;
- registrar a decisão em @docs/DECISIONS.md;
- atualizar @docs/CURRENT_STATE.md quando o estado do projeto mudar.