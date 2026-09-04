# CURRENT_STATE.md — BarberPro Frontend

> Última atualização: 2026-09-03. O código atual do frontend é a autoridade deste documento.

## Estado confirmado

- **CONFIRMADO:** branch de trabalho `feat/profile-management`.
- **CONFIRMADO:** signup, signin, seleção de entidade, cookies HttpOnly, refresh automático, `/api/auth/me`, `useCurrentUser`, proteção por `proxy.ts` e logout existem.
- **CONFIRMADO:** signup usa três etapas e cobre dados pessoais, empresa e endereço conforme o contrato atual de `POST /auth/signup`; o backend realiza o geocoding.
- **CONFIRMADO:** `photo` é obrigatória no contrato e, sem upload disponível, é coletada como URL visível e obrigatória; nenhum valor é fabricado pelo frontend.
- **CONFIRMADO:** MFA não faz parte do signup e a criação inicia com `mfa_required=false`.
- **CONFIRMADO:** `DashboardShell` usa nome, foto e primeira role do Profile real.
- **CONFIRMADO:** `/clientes` lista dados reais read-only por `GET /api/customers`, com loading, erro, vazio e busca compatível com o contrato.
- **CONFIRMADO:** `/perfil` exibe foto, nome, telefone, data de nascimento e roles em modo somente leitura, usando a integração existente de Profile.
- **BLOQUEADO:** edição de Profile enquanto `ProfileRepository.update` atualizar incorretamente Identity e não persistir Profile de forma confiável.
- **CONFIRMADO:** não existe tela de equipe/memberships ou planos.
- **CONFIRMADO:** Agenda e Serviços usam mocks; Dashboard usa dados inline; Financeiro não possui rota implementada.
- **CONFIRMADO:** `src/services/auth.client.ts`, `src/hooks/use-current-user.ts`, `src/lib/http.server.ts` e `src/lib/auth-route.server.ts` existem.

## Problemas encontrados na auditoria

- **CONFIRMADO:** a documentação anterior ainda afirmava que services, hooks e cliente HTTP não existiam, embora já estejam implementados.
- **CONFIRMADO:** a documentação anterior simultaneamente descrevia auth implementada e listava seus arquivos como vazios/ausentes.
- **CONFIRMADO:** a raiz já redireciona para `/login`, não para dashboard desprotegido.
- **CONFIRMADO:** a auditoria encontrou exposição de `login_token` ao JavaScript; a correção removeu o token da resposta pública, props e body do browser.
- **CONFIRMADO:** `useCurrentUser` é estado local por instância do hook, não estado global.
- **CONFIRMADO:** métricas e ações mockadas incompatíveis foram removidas de `/clientes`; a resposta real não oferece IDs nem dados de agenda/receita.

## Roadmap desta execução

- **CONFIRMADO:** logout existente foi preservado e validado; limpeza local é incondicional.
- **BLOQUEADO:** MFA enquanto email/token/body/bearer e resposta final do fluxo de login não estiverem documentados sem ambiguidade.
- **CONFIRMADO:** `GET /me_profile` retorna `birth_date`, incluindo valor nulo.
- **BLOQUEADO:** edição de Profile devido à falha de persistência em `ProfileRepository.update`.
- **CONFIRMADO:** a listagem de Clientes usa `GET /entity_customer/get_all` através do BFF, sem enviar `entity_id` pelo browser.
- **PLANEJADO:** Memberships apenas se houver UI atual; nenhuma UI foi encontrada na auditoria.
- **PLANEJADO:** Plan somente se houver área real; nenhuma UI foi encontrada na auditoria.

## Roadmap restante real

- **BLOQUEADO:** integrar MFA até existir contrato inequívoco do fluxo de login.
- **BLOQUEADO:** tornar `/perfil` editável até `ProfileRepository.update` persistir Profile corretamente, sem atualizar Identity indevidamente.
- **BLOQUEADO:** Password Reset permanece sem integração nesta branch.
- **BLOQUEADO:** Google permanece sem integração nesta branch.
- **PLANEJADO:** integrar Memberships read-only quando existir tela/navegação aprovada.
- **PLANEJADO:** integrar Plan read-only quando existir consumidor real no produto.
- **BLOQUEADO:** integração real de Agenda até existir backend HTTP utilizável para Appointment/Schedule.
- **BLOQUEADO:** integração real de Serviços até existir API HTTP utilizável para Service.
- **BLOQUEADO:** integração real de Financeiro até existir backend HTTP utilizável para Payment/Finance.

## Mocks

- **CONFIRMADO:** `agenda.ts` e `services.ts` permanecem em uso e devem ser preservados porque não há API integrável.
- **CONFIRMADO:** `customers.ts` foi preservado, mas não alimenta mais `/clientes`; nenhum mock foi removido.
- **CONFIRMADO:** `dashboard.ts` existe, mas a página usa dados inline.
- **CONFIRMADO:** `appoiments.ts` e `professionals.ts` são placeholders vazios.

## Bloqueios do backend

- **BLOQUEADO:** refresh não valida `revoked_at`; logout remoto não garante revogação efetiva até expiração.
- **BLOQUEADO:** Entity corrente e Entity/Address update não possuem contrato/isolamento seguro.
- **BLOQUEADO:** Membership create/update e Customer create/update aceitam `entity_id` sem isolamento multi-tenant confiável.
- **BLOQUEADO:** Subscription não possui isolamento e contrato suficientes.
- **BLOQUEADO:** `SuperUserGuard` depende de `is_superuser`, que não é transferido para `req.auth`.
- **BLOQUEADO:** Appointment, Schedule, Payment e Finance não possuem backend HTTP utilizável.
- **BLOQUEADO:** Service possui apenas modelo mínimo, sem camada HTTP utilizável.
- **BLOQUEADO:** limites de Plan são informativos; quotas não são aplicadas pelo backend.
