# M0.4 Dashboard P5 — checklist de runtime

**CONFIRMADO:** integração frontend implementada em código. **A CONFIRMAR:** smoke com backend P5 e contas reais; nenhum item abaixo foi executado em runtime.

## Administrador

- [ ] 1. Entrar com conta de administrador.
- [ ] 2. Abrir `/dashboard`.
- [ ] 3. Confirmar 200 em `/api/dashboard/summary`.
- [ ] 4. Confirmar 200 em `/api/dashboard/upcoming?limit=5`.
- [ ] 5. Confirmar 200 em `/api/dashboard/timeseries?from=YYYY-MM-DD&to=YYYY-MM-DD` após summary.
- [ ] 6. Confirmar ausência de requisição desnecessária a operations.
- [ ] 7. Comparar os cards com os valores reais de summary.
- [ ] 8. Conferir receita de atendimentos concluídos em BRL.
- [ ] 9. Conferir próximos atendimentos reais, inclusive nomes e preço snapshot.
- [ ] 10. Conferir barras e contagens reais do gráfico.
- [ ] 11. Recarregar a página e conferir os mesmos dados.

## Recepcionista

- [ ] 12. Entrar com conta de recepcionista.
- [ ] 13. Confirmar 200 em `/api/dashboard/operations`.
- [ ] 14. Confirmar 200 em `/api/dashboard/upcoming?limit=5`.
- [ ] 15. Confirmar que summary não é requisitado.
- [ ] 16. Confirmar que timeseries não é requisitado.
- [ ] 17. Confirmar que nenhuma receita global aparece.

## Vazios

- [ ] 18. Em dia sem appointments, conferir contagens zero reais.
- [ ] 19. Com upcoming vazio, conferir a mensagem de lista vazia.
- [ ] 20. Com timeseries zerada, conferir estado vazio e ausência de divisão por zero.

## Timezone

- [ ] 21. Conferir horários de upcoming na timezone retornada pelo próprio endpoint, especialmente na fronteira do dia UTC.
- [ ] 22. Conferir labels de timeseries com a data civil correta, inclusive em fronteira de mês.

## Falhas independentes

- [ ] 23. Simular falha em upcoming e confirmar que os cards permanecem visíveis.
- [ ] 24. Simular falha em timeseries e confirmar que summary permanece visível.

## Roles sem Dashboard administrativo

- [ ] Entrar como barbeiro e cliente; confirmar que “Início” não aparece na navegação e que abrir `/dashboard` diretamente não mostra métricas administrativas.
