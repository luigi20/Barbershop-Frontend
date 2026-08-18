# API.md — BarberPro Frontend

> Última atualização: 2026-08-17
> Baseado em análise direta do código-fonte.

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
| mocks/dashboard.ts     | dashboardStats, nextAppointments[]                 | CONFIRMADO — criado, não usado pelos componentes |
| mocks/appoiments.ts    | —                                                  | CONFIRMADO — vazio (0 bytes, typo no nome)       |
| mocks/customers.ts     | —                                                  | CONFIRMADO — vazio (0 bytes)                     |
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

**A CONFIRMAR:** O backend (NestJS + PostgreSQL) é um repositório separado e não foi analisado.

| Item                               | Status      |
| ---------------------------------- | ----------- |
| URL base da API                    | A CONFIRMAR |
| Endpoints disponíveis              | A CONFIRMAR |
| Formato dos DTOs                   | A CONFIRMAR |
| Autenticação HTTP (Bearer, Cookie) | A CONFIRMAR |
| Versão da API (v1, v2)             | A CONFIRMAR |
| CORS configurado                   | A CONFIRMAR |

Não devem ser inventados endpoints ou formatos de request/response antes de confirmar com o backend.

---

## Plano de Integração — A CONFIRMAR

Antes de integrar a API:

1. Confirmar URL base e estrutura de endpoints com o backend.
2. Criar variáveis de ambiente (.env.local, .env.example).
3. Criar cliente HTTP base (Axios instance com interceptors).
4. Criar pasta src/services/ com os services por domínio.
5. Substituir mocks pelos services reais progressivamente.
6. Implementar tratamento de erros e loading states.
7. Adicionar React Query ou SWR para cache e sincronização (A CONFIRMAR — decisão pendente).
