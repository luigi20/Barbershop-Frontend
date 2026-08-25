# ARCHITECTURE.md — BarberPro Frontend

> Última atualização: 2026-08-17
> Baseado em análise direta do código-fonte. Nenhuma inferência não comprovada.

---

## Stack

| Camada          | Tecnologia            | Versão   | Status                                |
| --------------- | --------------------- | -------- | ------------------------------------- |
| Framework       | Next.js (App Router)  | 16.3.0   | CONFIRMADO                            |
| Biblioteca UI   | React                 | 19.2.8   | CONFIRMADO                            |
| Linguagem       | TypeScript (strict)   | ^5       | CONFIRMADO                            |
| Estilização     | TailwindCSS           | ^4       | CONFIRMADO                            |
| Utilitários CSS | clsx + tailwind-merge | ^2 / ^3  | CONFIRMADO                            |
| Animações       | Motion (motion/react) | ^13.1.0  | CONFIRMADO                            |
| Ícones          | Lucide React          | ^1.30.0  | CONFIRMADO                            |
| Formulários     | React Hook Form + Zod | ^7 / ^4  | CONFIRMADO — instalado, não utilizado |
| Data/Hora       | Day.js                | ^1.11.21 | CONFIRMADO — instalado, não utilizado |
| HTTP Client     | —                     | —        | CONFIRMADO: não existe                |
| Estado Global   | —                     | —        | CONFIRMADO: não existe                |
| Backend         | NestJS + PostgreSQL   | —        | A CONFIRMAR (repositório separado)    |

---

## App Router

**CONFIRMADO:** O projeto utiliza o **App Router** do Next.js 16 com toda a estrutura em `src/app/`.

### Route Groups

```
src/app/
├── (auth)/        # Sem DashboardShell — páginas de autenticação
├── (dashboard)/   # Com DashboardShell — área logada
└── (public)/      # PLANEJADO — vazio
```

### Rota Raiz

```ts
// src/app/page.tsx — CONFIRMADO
redirect("/dashboard"); // sem guard de autenticação
```

---

## Organização das Pastas

```
src/
├── app/        # Rotas e layouts (App Router)
├── components/ # Componentes por domínio de feature
├── data/
│   └── mocks/  # Dados estáticos simulando API
├── lib/        # Utilitários compartilhados (cn)
└── types/      # Interfaces e tipos TypeScript
```

### Pastas ausentes — PLANEJADO

| Pasta          | Status                        |
| -------------- | ----------------------------- |
| src/services/  | PLANEJADO — sem implementação |
| src/hooks/     | PLANEJADO — sem implementação |
| src/contexts/  | PLANEJADO — sem implementação |
| src/providers/ | PLANEJADO — sem implementação |
| src/store/     | PLANEJADO — sem implementação |

---

## Server e Client Components

**CONFIRMADO:** Separação via diretiva `"use client"` no topo dos arquivos interativos.

| Arquivo                                 | Tipo             |
| --------------------------------------- | ---------------- |
| app/(dashboard)/dashboard/page.tsx      | Server Component |
| app/(dashboard)/agenda/page.tsx         | Server Component |
| app/(dashboard)/servicos/page.tsx       | Server Component |
| app/(dashboard)/layout.tsx              | Server Component |
| app/layout.tsx                          | Server Component |
| components/layout/dashboard-shell.tsx   | Client Component |
| components/appointments/agenda-view.tsx | Client Component |
| components/services/services-view.tsx   | Client Component |

**Padrão:** Pages são Server Components finos (metadata + render). Toda interatividade fica nos componentes Client.

---

## Componentes Principais

### DashboardShell — components/layout/dashboard-shell.tsx

**CONFIRMADO:** 303 linhas.

- Sidebar desktop fixa (260px)
- Header sticky com notificações e avatar
- Mobile drawer com overlay
- Bottom navigation mobile
- Rota ativa via usePathname()
- Estado: mobileMenuOpen (useState)

### AgendaView — components/appointments/agenda-view.tsx

**CONFIRMADO:** 1.236 linhas. Monólito com toda a agenda.

- Navegação por data
- Filtro por profissional
- Lista e modais de agendamento
- Criação de agendamento (formulário nativo FormEvent)
- Utilitários internos: dateToKey, timeToMinutes, addMinutes, formatDate, formatCurrency

### ServicesView — components/services/services-view.tsx

**CONFIRMADO:** 893 linhas. CRUD completo em memória.

- Busca e filtro (all/active/inactive)
- Modal criar/editar
- Toggle ativo/inativo

### Sub-componentes — components/appointments/

**CONFIRMADO:** 6 arquivos com 0 bytes. Placeholders não importados.

- appointment-card.tsx, appointment-details.tsx, appointment-form.tsx
- calendar-header.tsx, daily-calendar.tsx, weekly-calendar.tsx

---

## Types

**CONFIRMADO:** Em src/types/.

- appointment.ts: Appointment, AppointmentStatus
- professional.ts: Professional
- service.ts: Service
- auth.ts: VAZIO (0 bytes)

Types locais (não exportados, dentro dos componentes):

- AgendaView: NewAppointmentForm
- ServicesView: ServiceFilter, ServiceForm

---

## Gerenciamento de Estado

**CONFIRMADO:** Estado 100% local via useState + useMemo. Sem estado global.

| Mecanismo               | Status                    |
| ----------------------- | ------------------------- |
| useState + useMemo      | CONFIRMADO — único padrão |
| Context API             | CONFIRMADO: não existe    |
| Zustand / Redux / Jotai | CONFIRMADO: não instalado |
| React Query / SWR       | CONFIRMADO: não instalado |

---

## Design System

**CONFIRMADO:** CSS Custom Properties em src/app/globals.css.

Variáveis principais:

- --background: #090909
- --primary: #d39a32 (dourado — cor de marca)
- --primary-soft: rgba(211, 154, 50, 0.12)
- --surface, --surface-secondary, --surface-hover
- --border, --border-soft
- --muted, --muted-foreground
- --success: #4caf73
- --danger: #ef5350

Tema: dark-only fixo (sem prefers-color-scheme).
Fontes: Geist Sans + Geist Mono via next/font/google.
Utilitário: cn() em lib/utils.ts (clsx + tailwind-merge).

---

## Convenções

**CONFIRMADO pelo código:**

| Convenção          | Regra                             |
| ------------------ | --------------------------------- |
| Arquivos           | kebab-case.tsx                    |
| Componentes        | PascalCase, named exports         |
| Pages Next.js      | PascalCase, default exports       |
| Interfaces/Types   | PascalCase                        |
| Utilitários        | camelCase                         |
| Constantes mágicas | UPPER_SNAKE_CASE                  |
| Path alias         | @/ → src/                         |
| Ordem de imports   | libs externas → internos via @/   |
| Barrel exports     | Não utilizados (sem index.ts)     |
| IDs                | crypto.randomUUID()               |
| Formatação         | Prettier (Husky pre-commit)       |
| Commits            | Conventional Commits (commitlint) |
| Segredos           | Secretlint no lint-staged         |
