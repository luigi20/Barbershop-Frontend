# ARCHITECTURE.md — BarberPro Frontend

> Última atualização: 2026-09-03.

## Stack

- **CONFIRMADO:** Next.js 16.3 com App Router, React 19.2, TypeScript strict e TailwindCSS 4.
- **CONFIRMADO:** Motion, Lucide, React Hook Form, Zod, Day.js, `clsx` e `tailwind-merge` estão instalados.
- **CONFIRMADO:** não há estado global nem biblioteca de cache de requisições.
- **A CONFIRMAR:** implementação interna do backend NestJS/PostgreSQL, fora deste repositório.

## Arquitetura de comunicação

```text
Browser → Next.js Route Handlers (BFF) → NestJS
```

- **CONFIRMADO:** Client Components chamam apenas endpoints same-origin em `/api/*`.
- **CONFIRMADO:** `src/lib/http.server.ts` é o único cliente base do backend e é protegido por `server-only`.
- **CONFIRMADO:** `src/lib/auth-route.server.ts` centraliza access token, refresh automático e um único retry para Route Handlers autenticados.
- **CONFIRMADO:** access, refresh, challenge e MFA tokens pertencem à camada server/BFF e devem permanecer em cookies HttpOnly.
- **BLOQUEADO:** chamadas diretas do browser ao NestJS ou armazenamento de tokens em JavaScript violam a fronteira de segurança adotada.

## App Router e sessão

- **CONFIRMADO:** `src/app/(auth)` contém cadastro, login e seleção de entidade.
- **CONFIRMADO:** o cadastro mantém estado local em três etapas e envia o contrato completo, incluindo endereço, somente ao Route Handler `/api/auth/signup`; geocoding permanece no backend.
- **CONFIRMADO:** `src/app/(dashboard)` aplica `DashboardShell` às páginas privadas.
- **CONFIRMADO:** a raiz `/` redireciona para `/login`.
- **CONFIRMADO:** `src/proxy.ts` protege as rotas privadas por presença de cookie de access ou refresh; a validação efetiva continua no BFF/backend.
- **CONFIRMADO:** `GET /api/auth/me` alimenta uma única instância de `useCurrentUser`, compartilhada pelo layout autenticado entre `DashboardShell` e `/perfil`.
- **CONFIRMADO:** logout é feito por `POST /api/auth/logout`, com revogação remota best-effort e limpeza local incondicional.
- **BLOQUEADO:** MFA de login depende de um contrato HTTP inequívoco para concluir o fluxo.
- **PLANEJADO:** RBAC completo não está implementado; o backend permanece autoridade de autorização.

## Estrutura de pastas

```text
src/
├── app/          # pages, layouts e Route Handlers BFF
├── components/   # componentes organizados por domínio
├── data/mocks/   # dados sem backend integrável
├── hooks/        # hooks client-side, incluindo useCurrentUser
├── lib/          # utilitários e infraestrutura server-only
├── services/     # clientes same-origin usados pelo browser
└── types/        # contratos TypeScript compartilhados
```

- **CONFIRMADO:** páginas são Server Components finos quando possível; interatividade fica em Client Components.
- **CONFIRMADO:** componentes usam named exports, arquivos kebab-case e `cn()` para composição condicional de classes.
- **CONFIRMADO:** estado de feature permanece local com `useState`/`useMemo`.

## Fronteiras de domínio

- **CONFIRMADO:** autenticação e leitura de Profile possuem integração BFF.
- **CONFIRMADO:** Clientes possui integração read-only isolada pela Entity da sessão através do BFF.
- **CONFIRMADO:** Dashboard não possui integração de domínio utilizável e preserva dados inline.
- **BLOQUEADO:** integração real de Agenda depende de backend HTTP utilizável para Appointment/Schedule.
- **BLOQUEADO:** integração real de Serviços depende de API HTTP utilizável para Service.
- **BLOQUEADO:** integração real de Financeiro depende de backend HTTP utilizável para Payment/Finance.
- **PLANEJADO:** Memberships pode integrar leitura isolada pela Entity da sessão.
- **PLANEJADO:** Plan pode integrar leitura quando houver UI/necessidade real.
- **BLOQUEADO:** escrita de Customer/Membership, Entity/Address, Subscription, SuperUser e quotas de Plan dependem de correções/contratos do backend.
