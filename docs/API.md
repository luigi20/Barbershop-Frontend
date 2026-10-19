# API.md — BarberPro Frontend

> Atualização M0.4: **CONFIRMADO:** Dashboard P5 integrado em código via `GET /api/dashboard/operations`, `/summary`, `/upcoming?limit=5` e `/timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD`. O client usa contratos P5 com `service_name_snapshot`, `price_snapshot`, receita decimal em string, `date` civil e timezone da resposta. Admin não chama operations; recepcionista não chama summary ou timeseries. **A CONFIRMAR:** respostas e RBAC em runtime com backend P5.

> Atualização M0.3: **CONFIRMADO:** BFF de Appointments expõe `GET/POST /api/appointments`, `GET /api/appointments/availability`, `GET /api/appointments/[id]` e `PUT /api/appointments/[id]/{reschedule,cancel,complete}`. A lista envia `from`/`to` como instantes com offset/Z e limita o intervalo a 31 × 24h. A criação aceita somente `customer_id`, `professional_profile_id`, `service_id`, `starts_at` e `notes?`; reagendamento aceita `starts_at` e `professional_profile_id?`; cancelamento aceita `reason?`; conclusão não envia body. `withAuthRoute` mantém refresh único somente em 401. **A CONFIRMAR:** respostas e autorização em runtime com backend P4. As seções históricas abaixo não descrevem o contrato P4.

> Atualização M0.2: **CONFIRMADO:** o BFF expõe `GET/PUT /api/availability/timezone`, `GET/PUT /api/availability/business-hours`, `GET/PUT /api/availability/professionals/[profileId]/hours`, `GET/POST /api/availability/professionals/[profileId]/blocks` e `PUT/DELETE /api/availability/professionals/[profileId]/blocks/[blockId]`. Usa access token server-side, refresh e um retry somente em 401; 403/404/409 são repassados sem refresh. `profileId` vem de Members; nenhum `entity_id` é enviado pelo browser. Hours usa `{ periods: [{ weekday, start_time, end_time }] }` com PUT de substituição completa. Blocks exige `from` e `to` com offset ou Z. **A CONFIRMAR:** respostas e persistência em runtime contra o backend P3.

> Atualização 2026-10-02: os contratos P0/P1/P2 atuais do BFF estão em [INTEGRATION_SMOKE.md](./INTEGRATION_SMOKE.md). As descrições abaixo são a baseline histórica de 2026-09-04.

> Última atualização: 2026-09-04. Contratos abaixo vêm do código atual ou da baseline de backend fornecida para o sprint.

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
- **CONFIRMADO:** `GET /api/auth/me` retorna `{ id, identity_id, name, photo, phone, roles, birth_date, created_at, updated_at }` sem tokens; não retorna `email` nem `status`.
- **CONFIRMADO:** `PUT /auth/change_profile` exige `{ name, photo_url, birth_date, phone }`.
- **BLOQUEADO:** `PUT /auth/change_profile` não deve ser integrado enquanto `ProfileRepository.update` atualizar incorretamente Identity e não executar persistência confiável do Profile.
- **BLOQUEADO:** `created_at` pode refletir `updated_at` devido a um bug conhecido no backend e não deve sustentar funcionalidade importante.
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

- **CONFIRMADO:** integração read-only de Equipe/Memberships exposta ao browser como `GET /api/members`.
- **CONFIRMADO:** usa `req.auth.entity_id`; roles backend administrador ou recepcionista.
- **CONFIRMADO:** retorna `{ entity_name, profile_name, phone, photo, roles, status, created_at, updated_at }[]`.
- **CONFIRMADO:** não retorna `profile_id`, `entity_id`, `membership_id`, email ou birth_date.
- **BLOQUEADO:** detalhes não possuem identificador de domínio adequado para navegação/operações subsequentes.
- **BLOQUEADO:** create/update não devem ser integrados por riscos cross-tenant, privilege escalation de roles, repositories de update e contrato incompleto.

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
