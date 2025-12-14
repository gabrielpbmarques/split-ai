# Implementação de Histórico de Conversas - Split-AI + MAIA Frontend

## 📋 Resumo Executivo

Implementar funcionalidade de histórico de conversas no sistema MAIA, permitindo:

1. **Ver conversa** no modal de relatório - acessar transcript completo da sessão
2. **Página de histórico** - listar e filtrar todas as conversas por agente/usuário/período

---

## 🔧 Backend (Split-AI) - Ajustes Necessários

### 1. Ajustes no Modelo de Dados

#### 1.1 Adicionar `organization_id` em `SessionEntity`

```sql
-- Migration: add_organization_id_to_sessions.sql
ALTER TABLE sessions
ADD COLUMN organization_id UUID NULL;

-- Popular com dados existentes (via agent ou user)
UPDATE sessions s
SET organization_id = COALESCE(
  (SELECT organization_id FROM agents WHERE id = s.agent_id),
  (SELECT organization_id FROM users WHERE id = s.user_id)
);

-- Criar índice para performance
CREATE INDEX idx_sessions_organization ON sessions(organization_id);
CREATE INDEX idx_sessions_user_agent ON sessions(user_id, agent_id);
```

```typescript
// src/entities/session.entity.ts
@Column({ type: 'uuid', nullable: true })
organization_id: string | null;
```

#### 1.2 Garantir Persistência de Mensagens

**IMPORTANTE**: Atualmente o sistema não está salvando as mensagens no banco. É necessário criar:

```typescript
// src/components/AIChat/RecordChatMessage/record-chat-message.service.ts
@Injectable()
export class RecordChatMessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async recordUserMessage(
    sessionId: string,
    userId: string,
    agentId: string,
    message: string,
  ): Promise<void> {
    await this.messageRepository.create({
      session_id: sessionId,
      user_id: userId,
      agent_id: agentId,
      from: 'user',
      message,
    });
  }

  async recordAgentMessage(
    sessionId: string,
    userId: string,
    agentId: string,
    message: string,
  ): Promise<void> {
    await this.messageRepository.create({
      session_id: sessionId,
      user_id: userId,
      agent_id: agentId,
      from: 'agent',
      message,
    });
  }
}
```

**Integrar nos fluxos existentes:**

```typescript
// src/components/AIChat/Question/question.service.ts
// DEPOIS de criar a sessão:
await this.recordChatMessageService.recordUserMessage(
  session.id,
  user.id,
  agent.id,
  question,
);

// DEPOIS de receber resposta completa:
const fullResponse = chunks.join('');
await this.recordChatMessageService.recordAgentMessage(
  session.id,
  user.id,
  agent.id,
  fullResponse,
);
```

```typescript
// src/components/AIChat/Attendant/attendant.service.ts
// Similar ao Question, salvar pergunta e resposta
```

---

### 2. Novos Endpoints Necessários

#### 2.1 Listar Sessões

**GET `/conversation/sessions`**

- Query params: `agent_id`, `user_id`, `start_date`, `end_date`, `page`, `limit`
- Response:

```json
{
  "sessions": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "agent_name": "Agente X",
      "user_id": "uuid",
      "user_name": "João Silva",
      "user_email": "joao@email.com",
      "created_at": "2024-01-01T10:00:00",
      "message_count": 10,
      "last_message": "Última mensagem...",
      "last_message_at": "2024-01-01T10:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 2.2 Obter Mensagens de uma Sessão

**GET `/conversation/sessions/:sessionId/messages`**

- Response:

```json
{
  "session": {
    "id": "uuid",
    "agent_name": "Agente X",
    "user_name": "João Silva",
    "user_email": "joao@email.com",
    "created_at": "2024-01-01T10:00:00"
  },
  "messages": [
    {
      "id": "uuid",
      "from": "user",
      "message": "Olá, preciso de ajuda",
      "created_at": "2024-01-01T10:00:00"
    },
    {
      "id": "uuid",
      "from": "agent",
      "message": "Olá! Como posso ajudar?",
      "created_at": "2024-01-01T10:00:05"
    }
  ]
}
```

#### 2.3 Obter Conversa de um Relatório

**GET `/report/:reportId/conversation`**

- Usa o `session_id` do relatório para buscar mensagens
- Response igual ao endpoint anterior

---

### 3. Implementação dos Controllers/Services

```typescript
// src/components/Conversation/conversation.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, MessageEntity]),
    RepositoriesModule,
  ],
  controllers: [ListSessionsController, GetSessionMessagesController],
  providers: [ListSessionsService, GetSessionMessagesService],
  exports: [GetSessionMessagesService], // Para usar no Report
})
export class ConversationModule {}
```

---

## 🎨 Frontend (MAIA-Frontend Angular)

### 1. Service de Conversas

```typescript
// src/app/core/services/conversation.service.ts
@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = `${environment.apiUrl}/conversation`;

  constructor(private http: HttpClient) {}

  getSessions(params: any): Observable<SessionsResponse> {
    return this.http.get<SessionsResponse>(`${this.apiUrl}/sessions`, {
      params,
    });
  }

  getSessionMessages(sessionId: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(
      `${this.apiUrl}/sessions/${sessionId}/messages`,
    );
  }

  getReportConversation(reportId: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(
      `${environment.apiUrl}/report/${reportId}/conversation`,
    );
  }
}
```

### 2. Modal de Conversa no Relatório

No componente de detalhes do relatório, adicionar botão:

```html
<button mat-stroked-button color="primary" (click)="viewConversation()">
  <mat-icon>forum</mat-icon>
  Ver Conversa
</button>
```

```typescript
viewConversation() {
  const dialogRef = this.dialog.open(ConversationModalComponent, {
    data: { reportId: this.report.id },
    width: '800px',
    maxHeight: '80vh'
  });
}
```

### 3. Página de Histórico de Conversas

Nova rota no módulo:

```typescript
// src/app/features/conversations/conversations-routing.module.ts
const routes: Routes = [
  {
    path: 'historico',
    component: ConversationHistoryComponent,
    canActivate: [AuthGuard],
  },
];
```

Adicionar item no menu lateral:

```html
<mat-list-item routerLink="/conversas/historico">
  <mat-icon>history</mat-icon>
  <span>Histórico de Conversas</span>
</mat-list-item>
```

---

## 📝 Checklist de Implementação

### Backend

- [ ] Migration para adicionar `organization_id` em `sessions`
- [ ] Criar `RecordChatMessageService`
- [ ] Integrar salvamento de mensagens em `QuestionService`
- [ ] Integrar salvamento de mensagens em `AttendantService`
- [ ] Criar módulo `ConversationModule`
- [ ] Criar `ListSessionsController` e `ListSessionsService`
- [ ] Criar `GetSessionMessagesController` e `GetSessionMessagesService`
- [ ] Criar `GetReportConversationController` e `GetReportConversationService`
- [ ] Testar endpoints com Postman/Insomnia

### Frontend

- [ ] Criar `ConversationService`
- [ ] Criar `ConversationModalComponent`
- [ ] Adicionar botão "Ver Conversa" no modal de relatório
- [ ] Criar página `ConversationHistoryComponent`
- [ ] Criar componente de detalhes da sessão
- [ ] Adicionar rota e item no menu
- [ ] Implementar filtros (agente, período)
- [ ] Implementar paginação
- [ ] Testes E2E

---

## ⚠️ Pontos de Atenção

1. **Performance**: Adicionar índices nas colunas `session_id`, `organization_id`, `created_at`
2. **Segurança**: Sempre validar `organization_id` para usuários não-admin
3. **Limites**: Implementar paginação para evitar queries muito grandes
4. **Cache**: Considerar cache Redis para sessões recentes
5. **Exportação**: Futuramente, adicionar botão para exportar conversa (PDF/CSV)

---

## 🚀 Próximos Passos (Futuro)

1. **Análise de sentimento** nas conversas
2. **Busca full-text** nas mensagens
3. **Exportação** de conversas (PDF, CSV)
4. **Métricas** por conversa (duração, número de interações, resolução)
5. **Integração com WhatsApp** (quando implementado)
