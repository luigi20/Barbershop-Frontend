# API.md — BarberPro Frontend

> Última atualização: 2026-08-19
> Baseado em análise direta do código-fonte e contratos confirmados pelo backend.

---

## Status Atual

**CONFIRMADO: Não existe comunicação HTTP real.**

O frontend não faz nenhuma requisição de rede. Todos os dados são provenientes de mocks estáticos importados diretamente nos componentes.

---

## Biblioteca HTTP

**CONFIRMADO: Axios não está instalado.**

O `package.json` não contém Axios, fetch wrappers, SWR, React Query, ou qualquer biblioteca de requisição HTTP.

Nenhum arquivo de cliente HTTP base foi encontrado no projeto.

---

## Mocks Existentes

**CONFIRMADO:** Dados estáticos em `src/data/mocks/`.

| Arquivo                | Conteúdo                                           | Status                                           |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------ |
| mocks/agenda.ts        | professionals[], services[], initialAppointments[] | CONFIRMADO — em uso                              |
| mocks/services.ts      | initialServices[] (5 serviços)                     | CONFIRMADO — em uso                              |
| mocks/customers.ts     | initialCustomers[] (10 clientes)                   | CONFIRMADO — em uso                              |
| mocks/dashboard.ts     | dashboardStats, nextAppointments[]                 | CONFIRMADO — criado, não usado pelos componentes |
| mocks/appoiments.ts    | —                                                  | CONFIRMADO — vazio (0 bytes, typo no nome)       |
| mocks/professionals.ts | —                                                  | CONFIRMADO — vazio (0 bytes)                     |

### Como os dados chegam aos componentes

```ts
// Importação direta — CONFIRMADO
import {
  initialAppointments,
  professionals,
  services,
} from "@/data/mocks/agenda";
import { initialServices } from "@/data/mocks/services";
```

O `DashboardPage` (`app/(dashboard)/dashboard/page.tsx`) declara seus dados como literais JavaScript inline, sem usar os arquivos de mock.

---

## Camada de Serviços

**CONFIRMADO: Não existe.**

| Pasta                        | Status                  |
| ---------------------------- | ----------------------- |
| src/services/                | CONFIRMADO: não existe  |
| HTTP interceptors            | CONFIRMADO: não existe  |
| Tratamento de erros HTTP     | CONFIRMADO: não existe  |
| Loading states de rede       | CONFIRMADO: não existe  |
| Variáveis de ambiente (.env) | CONFIRMADO: não existem |

---

## Integração com Backend

### URL Base — CONFIRMADO

```
http://localhost:3333
```

- **Sem** prefixo global `/api` ou `/v1`.
- Backend: NestJS + PostgreSQL (repositório separado).

---

## Endpoints Confirmados

### POST /auth/signin

**CONFIRMADO** — Realiza o login inicial do usuário.

**Request body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "login_token": "string",
  "requires_entity_selection": true,
  "entities": [
    {
      "id": "string",
      "entity_name": "string",
      "roles": ["string"]
    }
  ]
}
```

> O `login_token` retornado é um **challenge token** (não é o access token final).
> Deve ser usado como `Bearer` no próximo passo (`/auth/select-entity`).

---

### POST /auth/select-entity

**CONFIRMADO** — Seleciona a entidade (barbearia) com a qual o usuário deseja operar.

**Authorization:** `Bearer <challenge-token>` (o `login_token` retornado pelo `/auth/signin`)

**Request body:**

```json
{
  "login_token": "string",
  "entity_id": "UUID"
}
```

**Response — caso MFA exigido:**

```json
{
  "mfa_required": true,
  "mfa_token": "string"
}
```

**Response — caso sem MFA:**

```json
{
  "mfa_required": false,
  "access_token": "string",
  "refresh_token": "string"
}
```

> ⚠️ **Problema confirmado no backend:** o controller de `/auth/select-entity` executa o service mas **não retorna seu resultado**. A resposta pode chegar sem body. Ver `CURRENT_STATE.md` para detalhes.

---

## Itens Ainda A CONFIRMAR

| Item                                          | Status                                                           |
| --------------------------------------------- | ---------------------------------------------------------------- |
| Demais endpoints (agenda, clientes, serviços) | A CONFIRMAR                                                      |
| Formato dos DTOs de domínio                   | A CONFIRMAR                                                      |
| CORS configurado                              | A CONFIRMAR                                                      |
| Estratégia de refresh de token                | CONFIRMADO — BFF intercepta 401 e chama POST /auth/refreshtoken. |

---

## Endpoints de Autenticação (Refresh)

### POST /auth/refreshtoken (Backend)

**CONFIRMADO** — Utilizado pelo BFF para renovar o `access_token` expirado.

**Authorization:** `Bearer <refresh_token>`

**Request body:**

```json
{
  "refresh_token": "string"
}
```

**Response:**

```json
{
  "access_token": "string"
}
```

> ⚠️ O backend atual não rotaciona o `refresh_token`. Ele retorna apenas o novo `access_token`. O BFF substitui o cookie de `access_token` transparente para o cliente. O `refresh_token` é mantido até expirar.

---

## Endpoints de Profile

### GET /api/auth/me (BFF)

**CONFIRMADO** — Retorna o profile do usuário logado, lendo o `access_token` do cookie HttpOnly.

**Response:**
Retorna o objeto `MeProfile`.

### GET /me_profile (Backend)

**CONFIRMADO** — Retorna os dados do perfil do usuário autenticado no backend.

**Authorization:** `Bearer <access_token>`

**Response:**

```json
{
  "id": "string",
  "identity_id": "string",
  "name": "string",
  "photo": "string | null",
  "phone": "string | null",
  "roles": ["string"],
  "created_at": "ISO date string",
  "updated_at": "ISO date string"
}
```

---

## Plano de Integração — A CONFIRMAR

Antes de integrar demais módulos:

1. Criar variáveis de ambiente (.env.local, .env.example) com `NEXT_PUBLIC_API_URL=http://localhost:3333`.
2. Criar cliente HTTP base (Axios instance com interceptors de Authorization).
3. Criar pasta `src/services/` com os services por domínio.
4. Substituir mocks pelos services reais progressivamente.
5. Implementar tratamento de erros e loading states.
6. Adicionar React Query ou SWR para cache e sincronização (A CONFIRMAR — decisão pendente).
