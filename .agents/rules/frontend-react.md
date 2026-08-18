---
trigger: glob
globs: src/**/*.ts src/**/*.tsx
---

# Frontend React / Next.js Rules

Estas regras se aplicam a alterações no frontend TypeScript e React.

## Componentes

- Preserve a separação existente entre Server Components e Client Components.
- Não adicione `"use client"` sem necessidade.
- Prefira Server Components quando não houver necessidade de estado, efeitos ou APIs do browser.
- Preserve named exports para componentes de feature.
- Verifique se existe componente equivalente antes de criar um novo.

## TypeScript

- Não usar `any` sem justificativa explícita.
- Reutilizar types existentes antes de criar novos.
- Não duplicar interfaces que representem o mesmo domínio.

## React

- Não usar useEffect para estado que possa ser derivado diretamente.
- Verificar dependências de effects cuidadosamente.
- Evitar estado duplicado.
- Evitar requisições duplicadas.
- Não criar estado global para dados locais de componente.

## UI

- Utilizar os design tokens existentes.
- Utilizar `cn()` para composição condicional de classes.
- Preservar responsividade.
- Preservar acessibilidade existente.
- Evitar valores de cor hardcoded quando existir token equivalente.
