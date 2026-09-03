# AUTH.md — BarberPro Frontend

> Última atualização: 2026-08-27.

## Sessão atual

- **CONFIRMADO:** fluxo existente: `/cadastro → /login → /select-entity → /dashboard → /login`.
- **CONFIRMADO:** signup, signin, select-entity, refresh, Profile e logout passam pelo BFF.
- **CONFIRMADO:** signup cria conta e empresa com endereço, informa sucesso e redireciona para `/login`; não autentica automaticamente.
- **CONFIRMADO:** o formulário envia a URL de `photo` informada visivelmente pelo usuário porque o DTO atual exige uma string; não há upload, URL inventada ou valor oculto.
- **CONFIRMADO:** `access_token` e `refresh_token` são cookies HttpOnly com path `/`.
- **CONFIRMADO:** `challenge_token` e `mfa_token` usam cookie HttpOnly restrito a `/api/auth`.
- **CONFIRMADO:** `entities_hint` contém apenas a lista de entidades e é lido pelo Server Component de seleção.
- **CONFIRMADO:** `withAuthRoute` tenta refresh quando access está ausente ou quando o backend retorna 401 e repete a operação uma vez.
- **CONFIRMADO:** `proxy.ts` apenas verifica presença de cookies; backend/BFF validam a sessão.

## Proteção do challenge token

- **CONFIRMADO:** `login_token` é armazenado como `challenge_token` HttpOnly pelo BFF de signin e não integra a resposta pública.
- **CONFIRMADO:** o browser envia somente `entity_id`; o BFF de select-entity lê o challenge cookie e o usa como bearer e no body exigido pelo backend.

## Logout

- **CONFIRMADO:** o browser chama somente `POST /api/auth/logout`.
- **CONFIRMADO:** o BFF lê access/refresh, tenta `POST /auth/logout` com refresh automático e sempre limpa a sessão local.
- **CONFIRMADO:** remove `access_token`, `refresh_token`, `challenge_token`, `mfa_token` e `entities_hint`, além de refresh legado em `/api` e `/api/auth`.
- **CONFIRMADO:** a interface redireciona para `/login` após sucesso e evita cliques duplicados.
- **BLOQUEADO:** o backend aceita refresh revogado porque não valida persistência/`revoked_at`; a limpeza local não oferece garantia de revogação server-side.

## MFA

- **CONFIRMADO:** MFA não faz parte do signup e `mfa_required` inicia como `false`; configuração e confirmação de MFA permanecem fora desta feature.
- **CONFIRMADO:** select-entity já armazena `mfa_token` em cookie HttpOnly quando recebe `mfa_required: true` e direciona para `/mfa`.
- **CONFIRMADO:** não existe página nem Route Handler MFA.
- **BLOQUEADO:** a sequência e os contratos exatos de generate/validate/confirm/request para concluir o login são ambíguos; nenhuma implementação deve inventá-los.

## Profile e autorização

- **CONFIRMADO:** `GET /api/auth/me` alimenta `useCurrentUser` e `DashboardShell`.
- **BLOQUEADO:** edição completa segura exige `birth_date`, que não é retornado pelo GET nem pela resposta do PUT.
- **PLANEJADO:** RBAC completo não faz parte deste sprint; o backend continua sendo autoridade.
