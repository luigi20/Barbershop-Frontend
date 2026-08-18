# CURRENT_STATE.md — BarberPro Frontend

> Última atualização: 2026-08-17
> Retrato fiel do estágio atual do projeto, baseado na análise do código.

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

## Módulos Não Iniciados

| Módulo        | Indicação de existência                       |
| ------------- | --------------------------------------------- |
| Clientes      | Link na sidebar, sem rota criada              |
| Financeiro    | Link na sidebar, sem rota criada              |
| Configurações | Link na sidebar, sem rota criada              |
| Autenticação  | Estrutura de pastas criada, sem implementação |

---

## Integrações Ausentes

**CONFIRMADO como ausente:**

| Integração                             | Status                  |
| -------------------------------------- | ----------------------- |
| Comunicação HTTP com backend           | Não implementada        |
| Autenticação e sessão                  | Não implementada        |
| Gerenciamento de estado global         | Não implementado        |
| Persistência de dados (além do reload) | Não implementada        |
| Testes (Jest)                          | Jest não instalado      |
| Variáveis de ambiente                  | Nenhum .env configurado |

---

## Problemas Técnicos Conhecidos

| #   | Problema                                                                     | Severidade | Localização                             |
| --- | ---------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| 1   | Sem autenticação — /dashboard acessível diretamente                          | CRÍTICO    | app/page.tsx                            |
| 2   | CI de testes falha — npm test não existe no package.json, Jest não instalado | CRÍTICO    | .github/workflows/testes.yaml           |
| 3   | AgendaView é monólito de 1.236 linhas                                        | ALTO       | components/appointments/agenda-view.tsx |
| 4   | Dashboard usa dados inline em vez dos mocks                                  | ALTO       | app/(dashboard)/dashboard/page.tsx      |
| 5   | Dois arquivos de serviços com dados duplicados (agenda.ts e services.ts)     | ALTO       | data/mocks/                             |
| 6   | Validação silenciosa nos formulários (sem feedback visual de erro)           | MÉDIO      | agenda-view.tsx, services-view.tsx      |
| 7   | Usuário "Emmanuel Noleto" hardcoded no DashboardShell                        | MÉDIO      | components/layout/dashboard-shell.tsx   |
| 8   | Typo no nome do arquivo appoiments.ts (falta "n")                            | BAIXO      | data/mocks/appoiments.ts                |
| 9   | react-hook-form, zod e dayjs instalados mas não usados                       | BAIXO      | package.json                            |

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
