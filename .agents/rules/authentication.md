---
trigger: model_decision
description: Regras da autenticação
---

# Authentication Rules

Qualquer trabalho relacionado a autenticação, sessão, MFA, tokens,
seleção de entidade ou proteção de rotas deve começar lendo:

@docs/AUTH.md
@docs/API.md
@docs/CURRENT_STATE.md

## Regra fundamental

Nunca inferir comportamento de autenticação apenas pela existência
de pastas, páginas ou componentes.

Distinguir sempre:

CONFIRMADO
PLANEJADO
A CONFIRMAR

## Antes de implementar

Confirme:

- endpoint utilizado;
- request body;
- response body;
- tipos de token;
- armazenamento da sessão;
- expiração;
- refresh, caso exista;
- fluxo MFA, caso exista;
- seleção de entidade, caso exista;
- regras de redirect;
- logout.

Não criar uma arquitetura de autenticação baseada em suposição.

## Segurança

Não:

- registrar tokens em logs;
- expor secrets;
- armazenar secrets no frontend;
- colocar credenciais em código;
- enfraquecer validações existentes para facilitar desenvolvimento.

Mudanças significativas no fluxo de autenticação exigem plano antes da implementação.

Após uma implementação confirmada, atualizar:

@docs/AUTH.md
@docs/CURRENT_STATE.md
