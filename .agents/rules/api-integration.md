---
trigger: model_decision
description: Regras da integração da API
---

# API Integration Rules

Antes de trabalhar com comunicação de dados, leia:

@docs/API.md
@docs/CURRENT_STATE.md

## Contratos

Nunca invente:

- endpoint
- HTTP method
- request body
- response body
- DTO
- query params
- headers
- status codes

Quando o contrato do backend não estiver disponível, marque como:

A CONFIRMAR

e informe ao usuário que o contrato precisa ser fornecido ou analisado no backend.

## Implementação

Antes de criar uma nova camada HTTP:

1. procure implementação equivalente existente;
2. procure types existentes;
3. confirme o contrato backend;
4. siga o padrão HTTP adotado pelo projeto.

Não introduza Axios, TanStack Query, SWR ou outra biblioteca sem necessidade comprovada e decisão aprovada.

## Mocks

Enquanto determinada integração não existir:

- preservar mocks existentes;
- não remover mocks até existir substituição funcional;
- não confundir comportamento mockado com comportamento confirmado do backend.

## Documentação

Quando uma integração real for implementada, atualizar:

@docs/API.md

e, quando relevante:

@docs/CURRENT_STATE.md
