# Configuração de Integração com n8n

Este documento descreve como configurar a integração com n8n para envio de emails automáticos.

## Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no seu arquivo `.env` ou `.env.local`:

```env
# URL base do n8n (exemplo: http://localhost:5678 ou https://n8n.gosttactical.com.br)
VITE_N8N_URL=http://localhost:5678

# IDs dos workflows do n8n (configure conforme seus workflows)
VITE_N8N_WORKFLOW_RECRUTAMENTO=recrutamento-novo
VITE_N8N_WORKFLOW_RECRUTAMENTO_ATUALIZACAO=recrutamento-atualizacao
VITE_N8N_WORKFLOW_PRESENCA=presenca-confirmacao
VITE_N8N_WORKFLOW_PARCERIA=parceria-mensagem
```

## Workflows Necessários no n8n

Você precisará criar os seguintes workflows no n8n:

### 1. Novo Recrutamento (`recrutamento-novo`)

**Trigger:** Webhook (POST)

**Payload esperado:**
```json
{
  "tipo": "novo_recrutamento",
  "recrutamento": {
    "id": "string",
    "nome": "string",
    "email": "string",
    "telefone": "string | null",
    "responsavel": {
      "id": "string",
      "name": "string",
      "email": "string"
    } | null
  },
  "timestamp": "ISO 8601"
}
```

**Ações:**
- Enviar email de confirmação para o candidato
- Enviar email de notificação para a equipe

### 2. Atualização de Recrutamento (`recrutamento-atualizacao`)

**Trigger:** Webhook (POST)

**Payload esperado:**
```json
{
  "tipo": "atualizacao_etapa",
  "recrutamento": {
    "id": "string",
    "nome": "string",
    "email": "string",
    "telefone": "string | null",
    "etapa_atual": "inscricao | avaliacao | qa | votacao | integracao",
    "status_etapa": "aprovado | reprovado | pendente",
    "observacoes": "string | null",
    "responsavel": {
      "id": "string",
      "name": "string",
      "email": "string"
    } | null
  },
  "timestamp": "ISO 8601"
}
```

**Ações:**
- Enviar email para o candidato informando sobre a atualização da etapa
- Incluir observações se houver

### 3. Confirmação de Presença (`presenca-confirmacao`)

**Trigger:** Webhook (POST)

**Payload esperado:**
```json
{
  "tipo": "confirmacao_presenca",
  "jogo": {
    "id": "string",
    "nome_jogo": "string",
    "data_jogo": "YYYY-MM-DD | null",
    "hora_inicio": "HH:mm | null",
    "local_jogo": "string | null",
    "tipo_jogo": "string | null"
  },
  "usuario": {
    "id": "string",
    "email": "string",
    "name": "string | null"
  },
  "timestamp": "ISO 8601"
}
```

**Ações:**
- Enviar email de confirmação para o usuário
- Agendar lembrete para 1 dia antes do jogo (usar node de Schedule ou Wait)

**Nota:** Para o lembrete de 1 dia antes, você pode usar:
- Node "Wait" com cálculo de tempo até 1 dia antes da data do jogo
- Ou node "Schedule" configurado para executar no dia anterior ao jogo

### 4. Mensagem de Parceria (`parceria-mensagem`)

**Trigger:** Webhook (POST)

**Payload esperado:**
```json
{
  "tipo": "mensagem_parceria",
  "contato": {
    "nome": "string",
    "email": "string",
    "whatsapp": "string | undefined",
    "descricao": "string"
  },
  "timestamp": "ISO 8601"
}
```

**Ações:**
- Enviar email para a equipe com os dados do contato
- Incluir informações de nome, email, WhatsApp (se fornecido) e descrição da proposta

## Configuração dos Webhooks no n8n

1. Crie um novo workflow no n8n
2. Adicione um node "Webhook" como trigger
3. Configure o método como "POST"
4. Copie a URL do webhook (exemplo: `http://localhost:5678/webhook/recrutamento-novo`)
5. Use o ID do workflow nas variáveis de ambiente (a parte após `/webhook/`)

## Exemplo de Workflow no n8n

### Workflow: Novo Recrutamento

```
[Webhook] → [Function (processar dados)] → [Send Email (candidato)] → [Send Email (equipe)]
```

### Workflow: Confirmação de Presença com Lembrete

```
[Webhook] → [Send Email (confirmação)] → [Calculate Date (1 dia antes)] → [Wait] → [Send Email (lembrete)]
```

## Testando a Integração

1. Configure as variáveis de ambiente
2. Inicie o frontend
3. Realize as ações que devem disparar os emails:
   - Enviar formulário de recrutamento
   - Atualizar etapa de recrutamento (admin)
   - Confirmar presença em um jogo
   - Enviar mensagem de parceria
4. Verifique os logs do n8n para confirmar que os webhooks estão sendo recebidos

## Tratamento de Erros

O serviço n8n foi implementado de forma que falhas no envio de emails não afetem a experiência do usuário:
- Erros são logados no console (modo desenvolvimento)
- Falhas não bloqueiam a operação principal
- Timeout de 5 segundos para evitar bloqueios

## Notas Importantes

- Os workflows do n8n devem estar ativos para receber os webhooks
- Certifique-se de que o n8n está acessível a partir do frontend (CORS configurado se necessário)
- Para produção, use HTTPS e autenticação adequada nos webhooks do n8n
- O lembrete de 1 dia antes do jogo deve ser configurado no workflow do n8n usando nodes de agendamento

