# AUTH.md — BarberPro Frontend

> Última atualização: 2026-08-19
> Baseado em análise direta do código-fonte e contratos confirmados pelo backend.

---

## Status Atual

**CONFIRMADO: Autenticação não está implementada.**

Nenhum mecanismo de autenticação ou autorização existe no código atual.
Este documento registra o que existe, o que foi planejado como estrutura, e o que ainda é desconhecido.

---

## O Que Existe Hoje

### Estrutura de Rotas de Auth — PLANEJADO

Os Route Groups e páginas foram criados como placeholders, mas estão todos vazios:

| Arquivo                      | Bytes | Status                   |
| ---------------------------- | ----- | ------------------------ |
| app/(auth)/login/page.tsx    | 0     | PLANEJADO — vazio        |
| app/(auth)/cadastro/page.tsx | 0     | PLANEJADO — vazio        |
| app/(auth)/mfa/              | —     | PLANEJADO — sem page.tsx |
| app/(auth)/select-entity/    | —     | PLANEJADO — sem page.tsx |
| components/auth/             | —     | PLANEJADO — pasta vazia  |
| types/auth.ts                | 0     | PLANEJADO — vazio        |

### Rota Raiz — CONFIRMADO

```ts
// src/app/page.tsx
redirect("/dashboard"); // redirect direto, sem verificação de sessão
```

Qualquer visitante acessa /dashboard sem nenhuma verificação.

### Middleware — CONFIRMADO AUSENTE

Não existe `middleware.ts` ou `middleware.tsx` na raiz nem em `src/`.
Sem middleware, não há como proteger rotas no nível do servidor.

---

## O Que Não Existe

**CONFIRMADO como ausente:**

| Item                    | Status            |
| ----------------------- | ----------------- |
| NextAuth / Auth.js      | Não instalado     |
| JWT handling            | Não implementado  |
| Cookies de sessão       | Não implementados |
| Context de autenticação | Não existe        |
| Guards de rota          | Não existem       |
| middleware.ts           | Não existe        |
| Refresh de token        | Não implementado  |
| Logout                  | Não implementado  |

---

## Fluxo Planejado — PLANEJADO (inferido pela estrutura de pastas)

A estrutura de rotas sugere a intenção de um fluxo:

```
/login → /mfa → /select-entity → /dashboard
```

Esta inferência é baseada exclusivamente na existência das pastas.
Nenhum contrato, fluxo ou implementação foi encontrado no código.

---

## Estratégia de Auth — Contratos Confirmados

### Fluxo geral — CONFIRMADO

```
/login
  ↓ POST /auth/signin  →  challenge token + lista de entidades
/select-entity
  ↓ POST /auth/select-entity  →  mfa_token  (se MFA exigido)
                               ou  access_token + refresh_token
/mfa  (se mfa_required: true)
  ↓ A CONFIRMAR
/dashboard
```

### Tipos de token — CONFIRMADO

| Token           | Quando gerado                                                  | Uso                                                              |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `login_token`   | Resposta de `/auth/signin`                                     | Challenge token. Usado como Bearer em `/auth/select-entity`      |
| `mfa_token`     | Resposta de `/auth/select-entity` quando `mfa_required: true`  | A CONFIRMAR                                                      |
| `access_token`  | Resposta de `/auth/select-entity` quando `mfa_required: false` | Token de acesso às rotas protegidas. Expira em 1 hora.           |
| `refresh_token` | Resposta de `/auth/select-entity` quando `mfa_required: false` | Usado pelo BFF para renovar o `access_token`. Expira em 30 dias. |

### Multi-tenant — CONFIRMADO

- O backend retorna uma lista de `entities` no login.
- Cada entidade tem: `id` (UUID), `entity_name` (string), `roles` (array de strings).
- O usuário deve selecionar uma entidade antes de obter o `access_token`.

### Armazenamento de tokens — CONFIRMADO

| Item                                           | Status                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Biblioteca de auth (NextAuth, Auth.js, custom) | Custom                                                                   |
| Armazenamento (cookie httpOnly, localStorage)  | HttpOnly cookie server-side apenas                                       |
| Estratégia de refresh de token                 | Automático via BFF wrapper (`withAuthRoute`). Retries limitados a 1 vez. |
| Roles e permissões (uso no frontend)           | A CONFIRMAR                                                              |
| Integração MFA (endpoint, validação)           | A CONFIRMAR                                                              |

---

## Ação Necessária Antes de Implementar

Antes de qualquer implementação de auth:

1. Confirmar a estratégia com o backend (NestJS).
2. Definir contratos: endpoint de login, formato do token, estrutura de sessão.
3. Definir o tipo de autenticação (JWT stateless vs session).
4. Criar types/auth.ts com as interfaces reais.
5. Implementar middleware.ts para proteção das rotas.
6. Adicionar Context ou estado de sessão antes de construir os componentes.
