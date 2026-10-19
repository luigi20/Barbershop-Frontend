# M0 — Checklist manual de runtime

Execute com backend P3, conta administradora e contas com uma e várias Entities. Registre resultado e evidência por item. Nenhum item abaixo foi executado nesta etapa.

## Auth

- [ ] 1. Login com uma Entity: seleção automática e dashboard.
- [ ] 2. Login com múltiplas Entities: `/select-entity` permanece acessível e mostra as opções.
- [ ] 3. Acesso direto a `/select-entity` sem contexto: redireciona para `/login`.
- [ ] 4. Seleção de Entity válida: sessão criada e dashboard.
- [ ] 5. Access expirado: refresh de access e refresh cookies e retry único.
- [ ] 6. Logout: cookies limpos e retorno ao login.

## Availability

- [ ] 7. Abrir Configurações como administrador; outras roles não veem controles P3.
- [ ] 8. Entity com timezone `null`: aviso e horários indisponíveis.
- [ ] 9. Definir timezone IANA, confirmando a escolha.
- [ ] 10. Recarregar e verificar persistência do timezone.
- [ ] 11. Criar expediente e salvar em uma única operação PUT.
- [ ] 12. Salvar múltiplos períodos no mesmo dia.
- [ ] 13. Tentar períodos sobrepostos: erro sem gravação.
- [ ] 14. Selecionar barbeiro ativo por `profile_id`.
- [ ] 15. Configurar jornada e limpar com `periods: []`.
- [ ] 16. Tentar jornada fora do expediente: erro.
- [ ] 17. Criar bloqueio em horário da Entity.
- [ ] 18. Editar bloqueio e conferir horário da Entity.
- [ ] 19. Remover bloqueio via ConfirmDialog.
- [ ] 20. Recarregar e verificar persistência de expediente, jornada e bloqueios.

**A CONFIRMAR:** todos os itens de runtime. **BLOQUEADO:** MFA, fora de M0.1/M0.2.
