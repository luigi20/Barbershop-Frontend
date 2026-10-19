# M0.3 — Checklist manual de Agenda P4

**A CONFIRMAR:** executar após receber os DTOs P4 e concluir a integração. Registrar status HTTP, resposta e evidência sem copiar tokens.

## Administrador e recepcionista

- [ ] 1. Abrir Agenda vazia.
- [ ] 2. Listar agendamentos existentes.
- [ ] 3. Mudar o período e confirmar novo GET no intervalo exibido.
- [ ] 4. Abrir Novo agendamento.
- [ ] 5. Selecionar cliente real por `customer_id`.
- [ ] 6. Selecionar serviço ativo real por `service.id`.
- [ ] 7. Selecionar barbeiro ativo por `profile_id`.
- [ ] 8. Consultar slots reais para data, profissional e serviço.
- [ ] 9. Conferir estado vazio quando não houver slots.
- [ ] 10. Criar agendamento em slot retornado pelo backend.
- [ ] 11. Recarregar e confirmar persistência.
- [ ] 12. Abrir detalhe real.
- [ ] 13. Reagendar para outro slot válido.
- [ ] 14. Simular 409 por slot reservado em outra sessão; conferir mensagem, limpeza do slot e nova consulta.
- [ ] 15. Cancelar com `ConfirmDialog` e conferir status retornado.
- [ ] 16. Concluir outro agendamento e conferir status retornado.

## Barbeiro

- [ ] 17. Visualizar somente a própria Agenda.
- [ ] 18. Não visualizar agendamentos de outro profissional.
- [ ] 19. Não ver ações de criar, reagendar, cancelar ou concluir.

## Timezone e persistência

- [ ] 20. Conferir horários no timezone da Entity, inclusive perto da mudança de dia UTC.
- [ ] 21. Recarregar e confirmar os agendamentos.
- [ ] 22. Confirmar que nenhuma criação depende de estado local temporário.

**CONFIRMADO no código atual:** cliente não vê o link da Agenda e recebe estado restrito ao acessar `/agenda` diretamente. **A CONFIRMAR:** autorização do backend e todos os fluxos P4 acima em runtime.

## Estado após integração P4

**CONFIRMADO:** a Agenda consulta o BFF real por dia local da Entity, mostra loading/erro/vazio e recarrega ao trocar a data. A seleção de profissional é filtro local apenas para administrador/recepcionista; barbeiro não envia `professional_profile_id` e depende do escopo aplicado pelo backend. Não há filtro de serviço na listagem.

**CONFIRMADO:** criação e reagendamento enviam exatamente o `starts_at` do slot retornado por availability. Conflito 409 limpa o slot e consulta novamente. Detalhe, cancelamento e conclusão usam as respostas reais; a listagem é atualizada por nova consulta.

**A CONFIRMAR:** executar todos os itens acima contra o backend P4 com sessões de administrador, recepcionista e barbeiro, incluindo autorização do GET de timezone para barbeiro. Nenhum item foi marcado como executado.
