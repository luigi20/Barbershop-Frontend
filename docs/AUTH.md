# AUTH.md — BarberPro Frontend

> Última atualização: 2026-08-17
> Baseado em análise direta do código-fonte.

---

## Status Atual

**CONFIRMADO: Autenticação não está implementada.**

Nenhum mecanismo de autenticação ou autorização existe no código atual.
Este documento registra o que existe, o que foi planejado como estrutura, e o que ainda é desconhecido.

---

## O Que Existe Hoje

### Estrutura de Rotas de Auth — PLANEJADO

Os Route Groups e páginas foram criados como placeholders, mas estão todos vazios:

| Arquivo | Bytes | Status |
|---|---|---|
| app/(auth)/login/page.tsx | 0 | PLANEJADO — vazio |
| app/(auth)/cadastro/page.tsx | 0 | PLANEJADO — vazio |
| app/(auth)/mfa/ | — | PLANEJADO — sem page.tsx |
| app/(auth)/select-entity/ | — | PLANEJADO — sem page.tsx |
| components/auth/ | — | PLANEJADO — pasta vazia |
| types/auth.ts | 0 | PLANEJADO — vazio |

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

| Item | Status |
|---|---|
| NextAuth / Auth.js | Não instalado |
| JWT handling | Não implementado |
| Cookies de sessão | Não implementados |
| Context de autenticação | Não existe |
| Guards de rota | Não existem |
| middleware.ts | Não existe |
| Refresh de token | Não implementado |
| Logout | Não implementado |

---

## Fluxo Planejado — PLANEJADO (inferido pela estrutura de pastas)

A estrutura de rotas sugere a intenção de um fluxo:

```
/login → /mfa → /select-entity → /dashboard
```

Esta inferência é baseada exclusivamente na existência das pastas.
Nenhum contrato, fluxo ou implementação foi encontrado no código.

---

## Estratégia de Auth — A CONFIRMAR

| Item | Status |
|---|---|
| Biblioteca de auth (NextAuth, Auth.js, custom) | A CONFIRMAR |
| Tipo de token (JWT, session, opaque) | A CONFIRMAR |
| Armazenamento (cookie httpOnly, localStorage) | A CONFIRMAR |
| Estratégia MFA | A CONFIRMAR |
| Multi-tenant (select-entity) | A CONFIRMAR |
| Roles e permissões | A CONFIRMAR |
| Integração com o backend NestJS | A CONFIRMAR |

---

## Ação Necessária Antes de Implementar

Antes de qualquer implementação de auth:

1. Confirmar a estratégia com o backend (NestJS).
2. Definir contratos: endpoint de login, formato do token, estrutura de sessão.
3. Definir o tipo de autenticação (JWT stateless vs session).
4. Criar types/auth.ts com as interfaces reais.
5. Implementar middleware.ts para proteção das rotas.
6. Adicionar Context ou estado de sessão antes de construir os componentes.
