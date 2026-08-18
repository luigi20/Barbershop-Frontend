<!-- BEGIN:nextjs-agent-rules -->

# Projeto

Aplicação SaaS de gestão de barbearias (BarberPro).

Stack confirmada: Next.js · React · TypeScript · TailwindCSS.
Backend separado: NestJS · PostgreSQL (repositório externo).

Documentação técnica em: docs/

# Regras de Comportamento

## Antes de qualquer alteração

- Ler docs/ARCHITECTURE.md para entender a estrutura atual.
- Ler docs/CURRENT_STATE.md para saber o que está implementado, parcial ou vazio.
- Ler docs/API.md antes de qualquer trabalho relacionado a dados ou integração.
- Ler docs/AUTH.md antes de qualquer trabalho relacionado a autenticação.
- Verificar se já existe componente equivalente antes de criar um novo.
- Verificar se já existe type ou interface antes de criar um novo.

## Durante a implementação

- Sempre utilizar TypeScript. Nunca usar `any` sem justificativa explícita.
- Preservar os padrões de nomenclatura existentes (kebab-case para arquivos, PascalCase para componentes).
- Reutilizar o utilitário `cn()` de `lib/utils.ts` para composição de classes Tailwind.
- Manter o padrão de named exports para componentes.
- Não inventar endpoints, contratos de API ou formatos de dados sem confirmar com o backend.
- Não introduzir bibliotecas novas sem necessidade clara e aprovação.
- Não fazer grandes refactors sem necessidade identificada.
- Não implementar autenticação, serviços HTTP ou estado global sem um plano aprovado.

## Sobre dados e API

- Enquanto não houver integração real, usar os mocks em `src/data/mocks/`.
- Não inventar dados, endpoints ou DTOs que não possam ser confirmados.
- Não remover mocks sem substituí-los por integração real.

## Sobre estado

- Manter estado local com useState quando o escopo for o próprio componente.
- Não introduzir estado global sem necessidade clara e decisão registrada em docs/DECISIONS.md.

## Mudanças arquiteturais

- Para qualquer mudança que afete arquitetura, criar um plano antes de implementar.
- Aguardar aprovação explícita antes de executar mudanças arquiteturais.

# Validação Obrigatória

Depois de qualquer alteração de código:

```
npm run lint
npm run lint:prettier:check
npm run build
```

Revisar o git diff antes de finalizar.

# Processo para Features Grandes

1. Ler a documentação relevante em docs/.
2. Analisar a implementação atual dos arquivos envolvidos.
3. Identificar todos os arquivos que serão afetados.
4. Criar plano de implementação.
5. Aguardar aprovação se houver mudança arquitetural.
6. Implementar.
7. Executar lint e build.
8. Revisar o diff.

# Notação de Estado

Ao documentar ou comunicar sobre o projeto, usar sempre:

- **CONFIRMADO:** comportamento comprovado pelo código atual.
- **PLANEJADO:** estrutura existente mas não implementada.
- **A CONFIRMAR:** informação que não pode ser determinada pelo frontend.

Nunca transformar inferência em fato documentado.

# Processo de Atualização de Documentação

Quando uma alteração significativa for realizada:

1. Avaliar se a documentação relevante precisa de atualização.
   - Arquitetura → docs/ARCHITECTURE.md
   - Estado atual → docs/CURRENT_STATE.md
   - API e contratos → docs/API.md
   - Autenticação → docs/AUTH.md
   - Decisões arquiteturais → docs/DECISIONS.md
2. Identificar as informações precisas que mudaram.
3. Atualizar apenas o necessário, mantendo clareza e precisão.
4. Verificar se a atualização reflete a realidade atual do código.

Não atualizar documentação por mudanças triviais.

<!-- END:nextjs-agent-rules -->

