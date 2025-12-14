# Instruções de Teste - Correções de Dashboard e Histórico de Conversas

## Problemas Corrigidos

### 1. Erro "organization_id not found in MessageEntity"

**Causa**: Os serviços de dashboard (`dashboard-charts.service.ts` e `dashboard-statistics.service.ts`) estavam tentando filtrar mensagens diretamente por `organization_id`, mas esse campo só existe em `SessionEntity`.

**Solução**: Modificados os serviços para usar `createQueryBuilder` com JOIN na tabela de sessões:

```typescript
const query = this.messageRepository
  .createQueryBuilder('m')
  .leftJoin('sessions', 's', 's.id = m.session_id')
  .where('s.organization_id = :orgId', { orgId: user.organization_id });
```

### 2. Histórico de Conversas Vazio

**Causa**: As sessões estavam sendo criadas sem o campo `organization_id`, fazendo com que o filtro por organização não retornasse resultados.

**Solução**:

- Adicionado `organization_id` ao DTO `CreateSessionIfNotExistsDto`
- Atualizado `CreateSessionIfNotExistsService` para incluir `organization_id`
- Modificados `QuestionService` e `AttendantService` para passar `organization_id`

## Passos para Testar

### 1. Aplicar a Migração

Execute a migração para atualizar sessões existentes:

```bash
# No diretório split-ai
psql -U seu_usuario -d seu_banco < migrations/update_sessions_organization_id.sql
```

### 2. Reiniciar o Backend

```bash
# No diretório split-ai
bun run start:dev
```

### 3. Testes no Frontend

#### Teste 1: Dashboard para Usuário com Role "user"

1. Faça login com um usuário de role "user"
2. Acesse a dashboard
3. Verifique se:
   - Os gráficos carregam sem erros
   - As estatísticas aparecem corretamente
   - Não há erro de "organization_id not found"

#### Teste 2: Histórico de Conversas

1. Com usuário "user" ou "admin"
2. Acesse Conversas > Histórico
3. Verifique se:
   - As conversas aparecem na lista
   - É possível visualizar detalhes de cada conversa
   - Os filtros funcionam corretamente

#### Teste 3: Nova Conversa de Chat

1. Inicie uma nova conversa de chat
2. Envie algumas mensagens
3. Volte ao histórico e verifique se a nova conversa aparece

## Logs de Debug

Os seguintes logs foram adicionados temporariamente para debug:

### Em `ListSessionsService`:

- User info (id, role, organization_id)
- Tipo de filtro aplicado
- Resultados encontrados

Para ver os logs:

```bash
# No terminal do backend
tail -f logs/application.log | grep "ListSessions"
```

## Verificação no Banco de Dados

### Verificar sessões com organization_id:

```sql
SELECT
  COUNT(*) as total,
  COUNT(organization_id) as with_org,
  COUNT(*) - COUNT(organization_id) as without_org
FROM sessions;
```

### Verificar mensagens por organização:

```sql
SELECT
  s.organization_id,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(m.id) as total_messages
FROM sessions s
LEFT JOIN messages m ON m.session_id = s.id
GROUP BY s.organization_id;
```

## Rollback (se necessário)

Se houver problemas, reverta as mudanças:

1. Git checkout nos arquivos modificados
2. Restart do backend
3. Não é necessário reverter a migração SQL pois ela só preenche campos NULL

## Arquivos Modificados

### Backend (split-ai):

- `src/components/Dashboard/Charts/dashboard-charts.service.ts`
- `src/components/Dashboard/Statistics/dashboard-statistics.service.ts`
- `src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.dto.ts`
- `src/components/Session/CreateSessionIfNotExists/create-session-if-not-exists.service.ts`
- `src/components/AIChat/Question/question.service.ts`
- `src/components/AIChat/Attendant/attendant.service.ts`
- `src/components/Conversation/ListSessions/list-sessions.service.ts` (logs de debug)
- `migrations/update_sessions_organization_id.sql` (novo arquivo)

## Status Final

✅ Erro de `organization_id` em MessageEntity corrigido
✅ Sessões agora incluem `organization_id` ao serem criadas
✅ Migração criada para atualizar sessões existentes
✅ Logs de debug adicionados para troubleshooting
