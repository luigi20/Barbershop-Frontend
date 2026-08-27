# AUTH.md — BarberPro Frontend

> Última atualização: 2026-08-19
> Baseado em análise direta do código-fonte e contratos confirmados pelo backend.

---

## Status Atual

**CONFIRMADO:** signup, signin, seleção de entidade, cookies HttpOnly de access e
refresh, refresh automático, profile autenticado, proteção de rotas privadas e
logout estão implementados no frontend.

**PLANEJADO:** MFA e autorização por roles não estão implementados.

---

## O Que Existe Hoje

**CONFIRMADO:**

- Páginas de cadastro, login e seleção de entidade.
- Route Handlers BFF para signup, signin, select-entity, profile e logout.
- `src/proxy.ts` protegendo as rotas privadas.
- `withAuthRoute` centralizando refresh automático e retry único.
- Cookies de sessão HttpOnly, sem exposição de access ou refresh ao browser.
- Profile real consumido pelo `DashboardShell`.

---

## O Que Não Existe

**CONFIRMADO como ausente:**

| Item                    | Status           |
| ----------------------- | ---------------- |
| NextAuth / Auth.js      | Não instalado    |
| Context de autenticação | Não existe       |
| MFA                     | Não implementado |
| RBAC                    | Não implementado |

---

## Fluxo Atual — CONFIRMADO

```
/cadastro → /login → /select-entity → /dashboard → /login (logout)
```

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

## Logout — CONFIRMADO

```text
DashboardShell
  → POST /api/auth/logout (Next.js BFF)
  → POST /auth/logout (NestJS)
  → limpeza local incondicional
  → /login
```

- O browser chama apenas o BFF e não acessa `access_token` ou `refresh_token`.
- O BFF lê ambos os tokens dos cookies HttpOnly.
- `withAuthRoute` renova o access expirado e repete a revogação uma única vez.
- Falhas de rede ou indisponibilidade do backend não impedem a limpeza local.
- São removidos `access_token`, `refresh_token`, `challenge_token`, `mfa_token`
  e `entities_hint`, incluindo refresh tokens legados nos paths `/api` e
  `/api/auth`.
- A interface bloqueia cliques repetidos enquanto o logout está em andamento.

**A CONFIRMAR:** O backend ainda precisa garantir que seu fluxo de refresh
respeite tokens já revogados. Essa garantia não pertence ao frontend.
