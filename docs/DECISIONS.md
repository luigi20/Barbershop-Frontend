# DECISIONS.md — BarberPro Frontend

> Última atualização: 2026-08-17
> Registra apenas decisões comprovadas pelo código atual.
> Decisões futuras ou não comprovadas são marcadas como A CONFIRMAR.

---

## Convenção de Notação

- **CONFIRMADO:** Decisão aplicada e verificada no código.
- **A CONFIRMAR:** Decisão mencionada ou implícita, mas sem evidência suficiente no código atual.

---

## Decisões de Framework e Linguagem

### Next.js App Router — CONFIRMADO
O projeto usa o App Router do Next.js 16 (não o Pages Router).
Toda a estrutura está em `src/app/` com layouts, route groups e Server Components.

### TypeScript com strict mode — CONFIRMADO
```json
// tsconfig.json
"strict": true
```
Uso de `any` é proibido sem justificativa explícita.

### React Compiler habilitado — CONFIRMADO
```ts
// next.config.ts
reactCompiler: true
```
Memoização automática ativada. Reduz a necessidade de `useMemo` e `useCallback` manuais.

---

## Decisões de Estilização

### TailwindCSS v4 — CONFIRMADO
Utilitários Tailwind como camada principal de estilização.
Sem CSS Modules, sem Styled Components, sem Emotion.

### Design tokens via CSS Custom Properties — CONFIRMADO
Paleta e tokens definidos em `globals.css` como variáveis CSS.
Usado por todos os componentes via `var(--token)`.
Tema dark-only fixo — sem alternância light/dark.

### Utilitário cn() — CONFIRMADO
```ts
// lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
Padrão adotado para composição condicional de classes Tailwind.

### Fontes via next/font — CONFIRMADO
Geist Sans + Geist Mono carregadas via `next/font/google`.

---

## Decisões de Componentes

### Named exports para componentes — CONFIRMADO
Componentes de feature são exportados como named exports.
Default exports são usados apenas em pages (exigência do Next.js).

### Organização por domínio (feature-based) — CONFIRMADO
```
components/
├── appointments/
├── services/
├── auth/
└── layout/
```

### Formulários com HTML nativo + FormEvent — CONFIRMADO (estado atual)
Os formulários implementados usam `FormEvent<HTMLFormElement>` sem `react-hook-form`.
Esta é a abordagem atual, não necessariamente uma decisão permanente.
`react-hook-form` + `zod` estão instalados para uso futuro.

### Animações com Motion — CONFIRMADO
`motion/react` (Framer Motion v2) usado em AgendaView e ServicesView.
Padrão: `AnimatePresence` + `LayoutGroup` + `MotionConfig reducedMotion="user"`.

---

## Decisões de Qualidade e Processo

### Conventional Commits — CONFIRMADO
Enforçado via commitlint + commitizen no fluxo de commits.
```
feat:, fix:, docs:, chore:, refactor:, style:, test:
```

### Husky para Git Hooks — CONFIRMADO
- pre-commit: Prettier check + lint-staged (secretlint)
- commit-msg: commitlint

### Secretlint — CONFIRMADO
Varredura automática de segredos em todos os arquivos antes do commit.
Previne vazamento de tokens, chaves de API e credenciais.

### CI via GitHub Actions — CONFIRMADO
Dois workflows ativos em pull_request:
- `linting.yaml`: Prettier, ESLint, Commitlint
- `testes.yaml`: Jest (npm test) — PROBLEMA: Jest não instalado, CI vai falhar

---

## Decisões A Confirmar

| Decisão | Motivo da incerteza |
|---|---|
| Biblioteca de estado global | Nenhuma instalada — escolha futura pendente |
| Biblioteca de requisições HTTP | Nenhuma instalada — Axios mencionado no AGENTS.md original mas não instalado |
| Estratégia de autenticação | Backend não analisado |
| React Query ou SWR | Não instalado, decisão pendente |
| Estrutura de testes | Jest referenciado no CI mas não instalado |
| Monorepo ou repositórios separados | Backend em repositório separado — estrutura não confirmada |
