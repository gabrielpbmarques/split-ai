# Fluxo de Registro via WhatsApp

Este módulo implementa o fluxo de registro de usuários via WhatsApp, utilizando a IA como orquestradora principal do processo.

## Arquitetura

O sistema foi projetado seguindo os princípios de Clean Architecture, com separação de responsabilidades em casos de uso específicos:

### Componentes principais

1. **WhatsappMessage** - Ponto de entrada para mensagens do WhatsApp

   - Recebe mensagens do webhook do WhatsApp
   - Orquestra o fluxo utilizando os casos de uso especializados

2. **FindOrCreateSession** - Gerencia sessões de usuário

   - Recupera sessões existentes pelo sessionId ou número de telefone
   - Cria novas sessões quando necessário
   - Armazena o contexto da conversa

3. **ProcessMessageData** - Extrai dados estruturados das mensagens

   - Utiliza IA para converter mensagens de texto em dados estruturados
   - Identifica campos como nome, email, CPF, endereço, etc.

4. **UpdateWorker** - Gerencia o estado do cadastro

   - Atualiza o worker com novos dados
   - Avança os estágios do cadastro conforme completude
   - Cria usuário quando dados necessários estão completos
   - Verifica usuários existentes

5. **GenerateResponse** - Gera respostas contextualizadas
   - Utiliza IA para gerar respostas baseadas no contexto do usuário
   - Fornece instruções sobre as próximas etapas do cadastro
   - Personaliza mensagens de acordo com o estágio atual

## Fluxo de dados

```
[WhatsApp] -> [WhatsappMessageController]
               |
               v
             [WhatsappMessageService]
               |
               +--> [FindOrCreateSessionService] -> Recupera/cria sessão
               |
               +--> [ProcessMessageDataService] -> Extrai dados da mensagem
               |
               +--> [UpdateWorkerService] -> Atualiza estágio e dados
               |
               +--> [GenerateResponseService] -> Gera resposta ao usuário
               |
               v
             [WhatsApp] <- Resposta enviada de volta
```

## IA como Orquestradora Principal

Nesta arquitetura, a IA atua como a principal orquestradora do processo:

1. **Extração de dados** - A IA analisa e extrai informações relevantes do texto livre
2. **Processamento contextual** - Mantém o contexto entre mensagens
3. **Tomada de decisão** - Determina quais dados estão faltando e o que perguntar em seguida
4. **Geração de respostas** - Comunica-se com o usuário de forma natural e contextualizada

O backend atua principalmente como:

- Persistência de dados
- Integração com sistemas externos
- Fornecimento de contexto para a IA
- Execução de regras de negócio específicas

## Estágios do Cadastro

1. **personal_info** - Coleta de dados pessoais (nome, email, CPF, etc.)
2. **address** - Coleta de endereço completo
3. **profile_picture** - Upload de foto de perfil
4. **document** - Upload de documentos
5. **bank_account** - Dados bancários
6. **chains** - Seleção de cadeias de atuação
7. **complete** - Cadastro finalizado

## Alinhamento com o fluxo da Anthor

Esta implementação segue o fluxo original da Anthor:

- O worker é criado após a coleta dos dados pessoais básicos
- O usuário só é criado quando uma senha é fornecida
- Mantém a progressão de estágios consistente com o sistema existente
- Permite retomada do cadastro em qualquer ponto
