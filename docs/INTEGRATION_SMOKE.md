# Smoke test de integração BarberPro — 2026-10-02

## Contratos conectados

`POST /api/auth/signup` encaminha para `POST /auth/signup`: o backend responde 201 com texto simples; o BFF aceita esse formato e devolve JSON 201. O timeout dessa chamada é 30 segundos por depender de geocodificação externa.

**CONFIRMADO no código:** Browser chama apenas `/api/*` same-origin. O BFF lê tokens de cookies HttpOnly e chama NestJS com `Authorization: Bearer`. `entity_id` vem do access token; bodies de gestão são validados com Zod e não aceitam escolha de tenant, ID ou campos globais fora de seus contratos.

| Browser/BFF                          | Backend                                                                       | Identificador/body relevante                                               |
| ------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `POST /api/auth/signin`              | `POST /auth/signin`                                                           | BFF guarda `login_token` em cookie HttpOnly                                |
| `POST /api/auth/select-entity`       | `POST /auth/select-entity`                                                    | Bearer e `body.login_token` iguais; browser envia apenas `entity_id`       |
| refresh interno do BFF               | `POST /auth/refreshtoken`                                                     | Bearer e `body.refresh_token` iguais; grava novos access e refresh         |
| `POST /api/auth/logout`              | `POST /auth/logout`                                                           | access no Bearer, refresh corrente no body; limpeza local sempre           |
| `GET /api/auth/me`                   | `GET /me_profile`                                                             | inclui `email`; sem credenciais no JSON                                    |
| `PUT /api/auth/profile`              | `PUT /auth/change_profile`                                                    | `name`, `phone`, `photo_url`, `birth_date` parciais; email somente leitura |
| `GET/PUT /api/entity/current`        | `GET/PUT /entity/current`                                                     | tenant da sessão; PUT exige campos de endereço existentes                  |
| `GET/POST /api/members`              | `GET /entity_membership/get_all`, `POST /entity_membership/create`            | create exige senha inicial; `mfa_required=false`                           |
| `GET/PUT /api/members/:profileId`    | `GET /entity_membership/get_one?profile_id=`, `PUT /entity_membership/update` | update envia `profile_id`, `roles`, `status` locais                        |
| `GET/POST /api/customers`            | `GET /entity_customer/get_all`, `POST /entity_customer/create`                | create exige senha inicial; `mfa_required=false`                           |
| `GET/PUT /api/customers/:customerId` | `GET /entity_customer/get_one?customer_id=`, `PUT /entity_customer/update`    | update envia `customer_id`, `notes`, `status` locais                       |
| `GET/POST /api/services`             | `GET /service/get_all`, `POST /service/create`                                | preço string decimal; duração inteiro; sem `entity_id`                     |
| `GET/PUT /api/services/:id`          | `GET /service/get_one/:id`, `PUT /service/update/:id`                         | status `ativo`/`inativo` para reativar/desativar                           |

**CONFIRMADO no source:** o signup ainda pode gravar `Entity.type` como `BARBERSHOP`/`BARBEARIA`/`barbershop`, enquanto o DTO de update aceita `barbearia`/`studio`. O BFF normaliza esses valores legados para `barbearia` no PUT. Não altera o tenant.

**CONFIRMADO no wrapper:** a chamada original é repetida uma única vez após 401; 403, 404 e 409 não disparam refresh. Após uma rotação bem-sucedida, access e refresh são substituídos juntos mesmo se o retry da operação devolver erro. Tokens nunca são devolvidos ao browser.

## Evidência executada

**CONFIRMADO:** frontend Next em `http://localhost:3000`, backend Nest em `http://localhost:3333`, `API_URL` local aponta para esse backend. GET `/login` respondeu 200. Sem cookies, as rotas BFF de Profile, Entity, Members, Customers, Services e seus detalhes responderam 401. O backend respondeu 401 para rotas protegidas sem Bearer.

**CONFIRMADO:** operações autenticadas e gravações de Profile, Entity, Members e Customers foram exercitadas com conta local de smoke. O estado da migration P2 ainda não foi confirmado.

## Roteiro manual final

Use uma conta de teste autorizada. Abra DevTools → Network para conferir método, status e resposta; não copie tokens para o console ou documentação. Faça os passos no mesmo tenant e confirme os IDs retornados.

1. Login em `/login`: signin 200, browser não recebe `login_token` no JSON.
2. Select Entity: escolher Entity real; `/api/auth/select-entity` 200, cookies de sessão HttpOnly.
3. Profile GET: `/perfil` carrega `/api/auth/me` 200 com email correto.
4. Profile UPDATE: alterar telefone/nome; PUT 200, reload reflete Profile atualizado e email permanece igual.
5. Entity GET: `/configuracoes` carrega Entity da sessão.
6. Entity UPDATE: administrador altera um campo e salva; PUT 200, mesmo `id` e tenant.
7. Members LIST: `/equipe` retorna `profile_id` para cada membro.
8. Members DETAIL: selecionar membro pelo `profile_id`; GET 200.
9. Members CREATE: criar membro de teste com senha inicial; POST 201, `profile_id` real.
10. Members UPDATE/deactivate: alterar roles/status local; PUT 200. Recepcionista não promove administrador; outro tenant recebe 404/403.
11. Customers LIST: `/clientes` retorna `customer_id` real.
12. Customers DETAIL: selecionar cliente pelo `customer_id`; GET 200.
13. Customers CREATE: criar cliente de teste com senha inicial; POST 201, `customer_id` real.
14. Customers UPDATE/deactivate: mudar notes/status; PUT 200, Identity/Profile global preservados.
15. Services LIST: `/servicos` lista dados reais, incluindo ativos e inativos.
16. Services CREATE: criar `Corte Smoke` com preço `35.00` e 45 minutos; POST 201, ID real.
17. Services UPDATE: editar preço/duração; PUT 200, ID e Entity estáveis.
18. Services deactivate/reactivate: status `inativo` e depois `ativo`; PUT 200, registro continua na lista.
19. Logout: `/api/auth/logout` 200, todos os cookies locais removidos; refresh antigo rejeitado pelo backend.

Refresh automático: com access vencido e refresh válido, requisitar `/api/auth/me`. Deve haver uma única chamada a `/auth/refreshtoken` por tentativa, resposta com dois tokens novos, dois cookies substituídos e um único retry do GET original. Repetir com 403/404/409: nenhuma chamada a refresh. Se falhar, registrar status e mensagem do backend sem expor tokens.

## Resultado do smoke local autenticado

**CONFIRMADO em 2026-10-02:** uma conta local de teste percorreu signup (201), signin (200), select entity (200), Profile GET/PUT (200), Entity GET/PUT (200), Members list/detail (200), create (201), deactivate (200), duplicidade (409), Customers list (200), create (201), detail (200), deactivate (200), e logout (200). Depois do logout, Profile GET respondeu 401. A lista de Members trouxe `profile_id`, e create/detail de Customers usaram `customer_id`. Profile e Entity conservaram seus IDs no update. Um membro barbeiro recebeu 403 ao tentar criar Service.

**CONFIRMADO no BFF:** refresh por cookie access ausente e por resposta 401 devolveram 200 na requisição original; em ambos os casos o cookie de refresh foi substituído. O access foi restaurado no caso de token inválido. Respostas 403, 404 e 409 preservaram o cookie de refresh. O access JWT pode ser byte a byte igual se o backend emitir dois tokens no mesmo segundo; a verificação decisiva da rotação é o refresh e a execução bem-sucedida da operação repetida.

**BLOQUEADO no backend local:** Services list/create/detail responderam 500 `Internal server error`. `docker logs nest-app` registrou `PrismaClientValidationError: Unknown argument entity_id` na consulta de Service. O contêiner está executando um Prisma Client gerado antes do schema P2. A migration P2 também precisa ser verificada antes de retomar o smoke; nenhuma migration foi aplicada nesta rodada. Para concluir os passos 15 a 18, reconstruir o backend com Prisma Client atualizado, verificar/aplicar a migration P2 no ambiente adequado e repetir list/create/detail/update/deactivate/reactivate. Não tratar esses 500 como erro de contrato do frontend.

**A CONFIRMAR manualmente:** navegação visual no navegador, persistência após reload, isolamento entre duas Entities e revogação do refresh antigo pelo backend. Os testes HTTP desta rodada executaram os fluxos pelo BFF, sem interação visual.

## Limites

**A CONFIRMAR:** se houver linhas globais antigas na tabela Service, a migration P2 não pode ser aplicada automaticamente. Agenda, Availability, MFA, Google e Dashboard permanecem fora deste teste.
