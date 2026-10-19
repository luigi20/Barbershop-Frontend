# CURRENT_STATE.md — BarberPro Frontend

> Atualização M0.6: **CONFIRMADO:** Agenda administrativa inicia em Próximos, consultando uma vez o intervalo do início do dia civil atual da Entity até o início do dia 30 dias depois. Hoje e Calendário preservam a consulta por dia; as listas agrupam por data e abrem o detalhe P4. O Calendário destaca, quando disponíveis, datas encontradas na consulta de Próximos, sem requisições por dia. Dashboard vincula próximos atendimentos ao detalhe e abre o fluxo real de novo agendamento. **PLANEJADO:** paginação por cursor para históricos grandes; não faz parte do MVP. **A CONFIRMAR:** usabilidade visual e runtime autenticado no piloto.

> Atualização M0.4: **CONFIRMADO:** Dashboard P5 integrado em código. Administrador consome summary, upcoming e timeseries; recepcionista consome operations e upcoming. A tela exibe contagens, receita operacional, próximos atendimentos e gráfico com dados P5, sem valores inline ou mock de Dashboard. **A CONFIRMAR:** runtime com backend P5 e contas reais; veja [P5_DASHBOARD_MANUAL_CHECKLIST.md](./P5_DASHBOARD_MANUAL_CHECKLIST.md). Top Services e Financeiro não fazem parte desta entrega.

> Atualização M0.3: **CONFIRMADO:** Agenda usa listagem, disponibilidade, detalhe, criação, reagendamento, cancelamento e conclusão via BFF P4; o mock de Agenda não alimenta mais a tela. Datas da listagem são convertidas do dia local da Entity para instantes. **A CONFIRMAR:** runtime com backend e permissões por role, especialmente leitura de timezone por barbeiro. A seção histórica abaixo permanece como registro da baseline anterior.

> Atualização M0: **CONFIRMADO:** o bug de navegação multi-Entity foi corrigido usando `entities_hint` na página; o challenge JWT continua restrito ao BFF. Availability P3 está integrada em `/configuracoes/horarios` para administrador, com fuso da Entity, expediente, jornadas por `profile_id` e bloqueios. **A CONFIRMAR:** checklist de auth e Availability com backend real. **BLOQUEADO:** MFA.

> Atualização 2026-10-02: P0/P1/P2 foram conectados ao BFF para Profile, Entity, Members, Customers e Services. As seções abaixo registram a auditoria histórica de 2026-09-04 e não descrevem os contratos atuais desses módulos. Consulte [INTEGRATION_SMOKE.md](./INTEGRATION_SMOKE.md) para o estado e o roteiro atuais.

> Última atualização: 2026-09-04. O código atual do frontend é a autoridade deste documento.

## Estado confirmado

- **CONFIRMADO:** branch de trabalho `feat/members-list`.
- **CONFIRMADO:** signup, signin, seleção de entidade, cookies HttpOnly, refresh automático, `/api/auth/me`, `useCurrentUser`, proteção por `proxy.ts` e logout existem.
- **CONFIRMADO:** signup usa três etapas e cobre dados pessoais, empresa e endereço conforme o contrato atual de `POST /auth/signup`; o backend realiza o geocoding.
- **CONFIRMADO:** `photo` é obrigatória no contrato e, sem upload disponível, é coletada como URL visível e obrigatória; nenhum valor é fabricado pelo frontend.
- **CONFIRMADO:** MFA não faz parte do signup e a criação inicia com `mfa_required=false`.
- **CONFIRMADO:** `DashboardShell` usa nome, foto e primeira role do Profile real.
- **CONFIRMADO:** `/clientes` lista dados reais read-only por `GET /api/customers`, com loading, erro, vazio e busca compatível com o contrato.
- **CONFIRMADO:** `/perfil` exibe foto, nome, telefone, data de nascimento e roles em modo somente leitura, usando a integração existente de Profile.
- **BLOQUEADO:** edição de Profile enquanto `ProfileRepository.update` atualizar incorretamente Identity e não persistir Profile de forma confiável.
- **CONFIRMADO:** `/equipe` lista Memberships reais em modo read-only por `GET /api/members`, com busca e filtros locais.
- **CONFIRMADO:** não existe tela de detalhes de membro ou planos.
- **CONFIRMADO:** Dashboard usa respostas P5; Financeiro não possui rota implementada. O estado atual de Agenda e Serviços está descrito nas atualizações acima.
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
- **CONFIRMADO:** listagem de Memberships integrada sem enviar `entity_id` pelo browser.
- **PLANEJADO:** Plan somente se houver área real; nenhuma UI foi encontrada na auditoria.

## Roadmap restante real

- **BLOQUEADO:** integrar MFA até existir contrato inequívoco do fluxo de login.
- **BLOQUEADO:** tornar `/perfil` editável até `ProfileRepository.update` persistir Profile corretamente, sem atualizar Identity indevidamente.
- **BLOQUEADO:** Password Reset permanece sem integração nesta branch.
- **BLOQUEADO:** Google permanece sem integração nesta branch.
- **BLOQUEADO:** detalhes de Membership enquanto a listagem não retornar `profile_id` ou outro identificador de domínio adequado.
- **BLOQUEADO:** criação e atualização de Membership por riscos cross-tenant, privilege escalation, repositories de update e contrato incompleto.
- **PLANEJADO:** integrar Plan read-only quando existir consumidor real no produto.
- **BLOQUEADO:** integração real de Agenda até existir backend HTTP utilizável para Appointment/Schedule.
- **BLOQUEADO:** integração real de Serviços até existir API HTTP utilizável para Service.
- **BLOQUEADO:** integração real de Financeiro até existir backend HTTP utilizável para Payment/Finance.

## Mocks

- **CONFIRMADO:** `agenda.ts` e `services.ts` permanecem em uso e devem ser preservados porque não há API integrável.
- **CONFIRMADO:** `customers.ts` foi preservado, mas não alimenta mais `/clientes`; nenhum mock foi removido.
- **CONFIRMADO:** o mock `dashboard.ts` sem consumidores foi removido após a integração P5.
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
