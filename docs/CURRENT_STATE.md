# CURRENT_STATE.md — BarberPro Frontend

> Última atualização: 2026-08-19
> Retrato fiel do estágio atual do projeto, baseado na análise do código e contratos confirmados pelo backend.
> Inclui implementação da fundação de autenticação (feat/auth-login-integration).

---

## Módulos Implementados

Funcionam com dados mockados em memória. Sem integração com API real.

### Dashboard — CONFIRMADO: Funcional (dados inline)

- Localização: `app/(dashboard)/dashboard/page.tsx`
- Cards de métricas (Faturamento, Agendamentos, Clientes, Ticket médio)
- Gráfico de barras (visual estático — valores hardcoded)
- Lista de próximos horários
- Resumo de serviço mais vendido e agenda do dia
- **Problema:** dados declarados como literais JavaScript no próprio arquivo da página, ignorando os arquivos de mock em `data/mocks/dashboard.ts`

### Agenda — CONFIRMADO: Funcional (dados mockados)

- Localização: `components/appointments/agenda-view.tsx`
- Navegação por data (anterior/próximo/hoje) com animações
- Filtro por profissional
- Visualização da lista de agendamentos do dia
- Modal de detalhes do agendamento com atualização de status
- Modal de criação de novo agendamento
- Estado gerenciado localmente via useState
- IDs gerados via crypto.randomUUID()
- **Dados persistem apenas em memória** — reiniciar a página perde tudo

### Serviços — CONFIRMADO: Funcional (dados mockados)

- Localização: `components/services/services-view.tsx`
- Lista com busca textual e filtro (all/active/inactive)
- Cards com informações de serviço (nome, descrição, duração, preço)
- Modal de criação e edição
- Toggle de ativo/inativo
- Stats calculadas (total, ativos, preço médio, duração média)
- **Dados persistem apenas em memória**

### Clientes — CONFIRMADO: Funcional (dados mockados)

- Localização: `components/clients/clients-view.tsx`
- 4 componentes com responsabilidades separadas: `clients-view`, `client-card`, `client-form-modal`, `client-detail-drawer`
- Rota: `/clientes` em `app/(dashboard)/clientes/page.tsx`
- Busca por nome ou telefone
- Filtro por status (todos/ativos/inativos)
- Cards de clientes com avatar (iniciais), status, telefone, stats de agendamento e gasto
- Modal criar/editar cliente (bottom-sheet mobile / centrado desktop)
- Drawer lateral de detalhes do cliente (slide-in desktop / bottom-sheet mobile)
- Stats: total, ativos, agendamentos acumulados, receita acumulada
- Estado vazio com mensagem contextual
- IDs gerados via crypto.randomUUID()
- **Dados persistem apenas em memória** — reiniciar a página perde alterações

### Shell de Navegação — CONFIRMADO: Implementado

- Localização: `components/layout/dashboard-shell.tsx`
- Sidebar desktop (260px, fixa)
- Header sticky com notificações (badge visual) e avatar
- Mobile drawer (overlay)
- Bottom navigation mobile
- Rotas: Dashboard, Agenda, Clientes, Serviços, Financeiro, Configurações

---

## Módulos Parciais

### Mocks de Dados

- `data/mocks/agenda.ts` — professionals, services, initialAppointments: CONFIRMADO em uso
- `data/mocks/services.ts` — initialServices (5 serviços): CONFIRMADO em uso
- `data/mocks/customers.ts` — initialCustomers (10 clientes): CONFIRMADO em uso
- `data/mocks/dashboard.ts` — stats e appointments: CRIADO mas não consumido pelos componentes

---

## Módulos Vazios (Placeholders)

### Arquivos com 0 bytes confirmados

**Sub-componentes de Appointments (6 arquivos):**

- components/appointments/appointment-card.tsx
- components/appointments/appointment-details.tsx
- components/appointments/appointment-form.tsx
- components/appointments/calendar-header.tsx
- components/appointments/daily-calendar.tsx
- components/appointments/weekly-calendar.tsx

**Mocks sem dados (3 arquivos):**

- data/mocks/appoiments.ts (typo: falta "n")
- data/mocks/customers.ts
- data/mocks/professionals.ts

**Auth (4 itens):**

- app/(auth)/login/page.tsx
- app/(auth)/cadastro/page.tsx
- app/(auth)/mfa/ (sem page.tsx)
- app/(auth)/select-entity/ (sem page.tsx)
- components/auth/ (pasta vazia)
- types/auth.ts

**Route Group público:**

- app/(public)/ (pasta vazia)

---

## Autenticação — CONFIRMADO: IMPLEMENTADA

### Fundação HTTP (CONFIRMADO: implementada)

| Arquivo                              | Responsabilidade                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/http.server.ts`             | Wrapper fetch server-only com timeout, body seguro e HttpError tipado                                                        |
| `src/services/auth.client.ts`        | Chamadas same-origin do browser para Route Handlers                                                                          |
| `src/app/api/auth/signin/route.ts`   | BFF Route Handler — valida, chama NestJS, seta cookie HttpOnly, retorna resposta segura                                      |
| `src/types/auth.ts`                  | Types confirmados: SignInRequest, AuthEntity, SignInBackendResponse, SignInClientResponse, LoginFormValues, ApiErrorResponse |
| `src/components/auth/login-form.tsx` | Formulário com react-hook-form + zod, loading, erros e acessibilidade                                                        |
| `src/app/(auth)/login/page.tsx`      | Server Component com metadata SEO                                                                                            |
| `.env.local` / `.env.example`        | `API_URL=http://localhost:3333` — server-only, sem NEXT_PUBLIC_                                                              |

### Estratégia de tokens — CONFIRMADO

- `login_token` armazenado em cookie `HttpOnly, SameSite=Lax, MaxAge=300, Path=/api/auth`
- O browser **nunca** recebe o `login_token` — apenas `requires_entity_selection` e `entities`
- `access_token` e `refresh_token` armazenados em cookies HttpOnly com path `/`

### O que ainda não existe

| Item                     | Status    |
| ------------------------ | --------- |
| MFA page + Route Handler | PLANEJADO |
| RBAC                     | PLANEJADO |

### Integração de Profile e Refresh Automático — CONFIRMADO

- `GET /api/auth/me` — BFF Route Handler que obtém os dados do backend. Envolto no `withAuthRoute`.
- Centralização do Refresh: `withAuthRoute` intercepta o erro 401, renova o token acessando `/auth/refreshtoken`, atualiza o cookie `access_token` e repete a chamada uma única vez. Tokens nunca chegam ao browser.
- O `refresh_token` está disponível com `path: "/"`.
- Hook `useCurrentUser` — Reativo para estado global de profile nos Client Components.
- `DashboardShell` utiliza a foto, o nome e a role do usuário.

### Logout — CONFIRMADO

- `POST /api/auth/logout` lê os cookies HttpOnly e tenta revogar a sessão em
  `POST /auth/logout` no backend.
- O fluxo reutiliza `withAuthRoute`, incluindo refresh automático quando o
  `access_token` estiver expirado.
- A limpeza local ocorre mesmo se o backend estiver indisponível.
- São removidos os cookies `access_token`, `refresh_token`, `challenge_token`,
  `mfa_token` e `entities_hint`.
- Versões legadas de `refresh_token` nos paths `/api` e `/api/auth` também são
  removidas.
- A ação “Sair” está disponível na sidebar e no drawer móvel, com loading e
  bloqueio de clique duplicado, seguida de redirecionamento para `/login`.
- **A CONFIRMAR:** o backend ainda deve garantir que tokens revogados sejam
  rejeitados pelo serviço de refresh.

---

## Módulos Não Iniciados

| Módulo        | Indicação de existência          |
| ------------- | -------------------------------- |
| Financeiro    | Link na sidebar, sem rota criada |
| Configurações | Link na sidebar, sem rota criada |

---

## Integrações Ausentes / Status HTTP

**CONFIRMADO como ausente ou parcial:**

| Integração                             | Status                                              |
| -------------------------------------- | --------------------------------------------------- |
| Comunicação HTTP com backend           | PARCIAL — apenas POST /auth/signin via BFF          |
| Autenticação e sessão                  | PARCIAL — login implementado, sem proteção de rotas |
| Gerenciamento de estado global         | Não implementado                                    |
| Persistência de dados (além do reload) | Não implementada nos módulos de domínio             |
| Testes (Jest)                          | Jest não instalado                                  |
| Variáveis de ambiente                  | `.env.local` e `.env.example` criados               |

**CONFIRMADO — Backend disponível:**

| Item           | Valor                              |
| -------------- | ---------------------------------- |
| URL base       | `http://localhost:3333`            |
| Prefixo global | Nenhum (`/api`, `/v1` ausentes)    |
| Contratos auth | Ver `docs/API.md` e `docs/AUTH.md` |

---

## Problemas Técnicos Conhecidos

| #   | Problema                                                                                                                                     | Severidade | Localização                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| 1   | Sem autenticação — /dashboard acessível diretamente                                                                                          | CRÍTICO    | app/page.tsx                            |
| 2   | CI de testes falha — npm test não existe no package.json, Jest não instalado                                                                 | CRÍTICO    | .github/workflows/testes.yaml           |
| 3   | **[BACKEND CONFIRMADO]** Controller de `/auth/select-entity` executa o service mas não retorna seu resultado — resposta pode chegar sem body | CRÍTICO    | Backend NestJS — repositório separado   |
| 4   | AgendaView é monólito de 1.236 linhas                                                                                                        | ALTO       | components/appointments/agenda-view.tsx |
| 5   | Dashboard usa dados inline em vez dos mocks                                                                                                  | ALTO       | app/(dashboard)/dashboard/page.tsx      |
| 6   | Dois arquivos de serviços com dados duplicados (agenda.ts e services.ts)                                                                     | ALTO       | data/mocks/                             |
| 7   | Validação silenciosa nos formulários (sem feedback visual de erro)                                                                           | MÉDIO      | agenda-view.tsx, services-view.tsx      |
| 8   | Typo no nome do arquivo appoiments.ts (falta "n")                                                                                            | BAIXO      | data/mocks/appoiments.ts                |
| 9   | react-hook-form, zod e dayjs instalados mas não usados                                                                                       | BAIXO      | package.json                            |

---

## Pendências Estruturais

| Pendência        | Descrição                                   |
| ---------------- | ------------------------------------------- |
| middleware.ts    | Necessário para proteger rotas autenticadas |
| src/services/    | Camada de integração HTTP ausente           |
| src/hooks/       | Hooks customizados ausentes                 |
| src/contexts/    | Context de autenticação e sessão ausentes   |
| types/auth.ts    | Types de autenticação ausentes              |
| .env.example     | Variáveis de ambiente não documentadas      |
| Testes           | Nenhuma suite de testes configurada         |
| Error boundaries | Sem tratamento de erros de renderização     |
| not-found.tsx    | Sem página 404                              |
| error.tsx        | Sem página de erro global                   |

---

## Dependências Instaladas Não Utilizadas

**CONFIRMADO:** As seguintes dependências estão no package.json mas não foram encontradas em uso em nenhum arquivo:

| Dependência         | Uso esperado                    |
| ------------------- | ------------------------------- |
| react-hook-form     | Formulários com validação       |
| @hookform/resolvers | Integração com Zod              |
| zod                 | Validação de schemas            |
| dayjs               | Formatação/manipulação de datas |
