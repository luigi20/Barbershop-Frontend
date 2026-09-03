# API.md — BarberPro Frontend

> Última atualização: 2026-08-27. Contratos abaixo vêm do código atual ou da baseline de backend fornecida para o sprint.

## Regras de integração

- **CONFIRMADO:** Browser chama somente Route Handlers Next.js same-origin.
- **CONFIRMADO:** Route Handlers usam `http.server.ts`; rotas autenticadas reutilizam `withAuthRoute`.
- **CONFIRMADO:** `API_URL` é server-only. Não existe `NEXT_PUBLIC_API_URL`.
- **BLOQUEADO:** tokens não podem ser retornados ao browser, enviados em props, query strings ou logs.

## Auth e Profile

- **CONFIRMADO:** `POST /auth/signup`, `POST /auth/signin`, `POST /auth/select-entity`, `POST /auth/refreshtoken`, `POST /auth/logout` e `GET /me_profile` estão representados na BFF atual.
- **CONFIRMADO:** `POST /auth/signup` recebe `{ email, name, password, entity_name, birth_date, phone, photo, entity_type, document, zip_code, street, number, complement?, neighborhood, city, state, country }`; somente `complement` é opcional e `entity_type` usa `BARBERSHOP` no fluxo atual.
- **CONFIRMADO:** o backend cria a conta, a empresa e seu endereço e realiza o geocoding server-side; o frontend não envia latitude/longitude nem consulta serviço de CEP.
- **CONFIRMADO:** a resposta atual de sucesso do backend é a string `"Usuário cadastrado com sucesso"`; o BFF responde ao browser com sucesso normalizado e nenhum login automático é realizado.
- **CONFIRMADO:** `GET /api/auth/me` retorna `{ id, identity_id, name, photo, phone, roles, created_at, updated_at }` sem tokens.
- **CONFIRMADO:** `PUT /auth/change_profile` exige `{ name, photo_url, birth_date, phone }`.
- **BLOQUEADO:** `GET /me_profile` e a resposta de change_profile não fornecem `birth_date`; o frontend não pode preservar com segurança esse campo obrigatório em uma edição.
- **BLOQUEADO:** `POST /auth/refreshtoken` não consulta revogação persistida/`revoked_at`.

## MFA

- **CONFIRMADO:** MFA não faz parte do signup; a conta é criada com `mfa_required=false` e qualquer configuração de MFA pertence a uma feature separada.
- **CONFIRMADO:** endpoints informados: `POST /auth/generatemfa`, `/auth/validatemfa`, `/auth/mfa/confirm` e `/auth/mfarequest`.
- **BLOQUEADO:** contratos necessários ao login ainda são insuficientes: email no body, token também no body versus bearer, endpoint/ordem corretos e payload final de sessão não estão definidos de forma inequívoca.

## Leituras multi-tenant utilizáveis

### `GET /entity_customer/get_all`

- **CONFIRMADO:** exposto ao browser somente como `GET /api/customers`; o Route Handler usa `withAuthRoute` e não aceita `entity_id`.
- **CONFIRMADO:** usa `req.auth.entity_id`; roles backend administrador ou recepcionista.
- **CONFIRMADO:** retorna `{ entity_name, profile_name, phone, photo, notes, status, created_at, updated_at }[]`.
- **CONFIRMADO:** não retorna IDs, email, birth_date nem métricas de agenda/receita.
- **BLOQUEADO:** create/update não devem ser integrados por aceitarem `entity_id` do body sem isolamento confiável.

### `GET /entity_membership/get_all`

- **PLANEJADO:** integração read-only de Equipe/Memberships.
- **CONFIRMADO:** usa `req.auth.entity_id`; roles backend administrador ou recepcionista.
- **CONFIRMADO:** retorna `{ entity_name, profile_name, phone, photo, roles, status, created_at, updated_at }[]`.
- **CONFIRMADO:** não retorna IDs para operações subsequentes.
- **BLOQUEADO:** create/update não devem ser integrados pelo mesmo problema multi-tenant.

### Plan

- **PLANEJADO:** integração read-only de Plan.
- **CONFIRMADO:** `GET /plan/get_all` e `GET /plan/get_one/:id` retornam `{ id, name, price, description, max_members, max_appointments, max_customers, active }`.
- **CONFIRMADO:** get_all inclui planos ativos e inativos; filtro `active === true` pode ser apenas apresentação.
- **BLOQUEADO:** quotas não são aplicadas e não devem ser simuladas no frontend.

## APIs não integráveis nesta execução

- **BLOQUEADO:** Entity/Address: leitura por ID não força Entity da sessão, view model não retorna `name`, update depende de SuperUser quebrado e Address tem inconsistência de criação.
- **BLOQUEADO:** Subscription: IDs/isolamento/status/validação de plano são insuficientes.
- **BLOQUEADO:** Appointment, Schedule, Payment e Finance não possuem API HTTP utilizável.
- **BLOQUEADO:** Service não possui camada HTTP utilizável.
