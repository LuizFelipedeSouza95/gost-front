# Configuração de Integração com n8n

Este documento descreve como configurar a integração com n8n para envio de emails automáticos.

## Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no seu arquivo `.env` ou `.env.local`:

```env
# URL base do n8n - ⚠️ IMPORTANTE: Use /webhook/ para PRODUÇÃO, não /webhook-test/
# Exemplo completo do workflow de recrutamento (PRODUÇÃO): https://n8n.gosttactical.com.br/webhook/4055cdd9-38cf-449e-a9ff-5c3c0297a8f4
# ⚠️ NÃO use /webhook-test/ em produção - funciona apenas uma vez!
VITE_N8N_URL=https://n8n.gosttactical.com.br/webhook/
VITE_N8N_WORKFLOW_RECRUTAMENTO=4055cdd9-38cf-449e-a9ff-5c3c0297a8f4
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
4. **⚠️ IMPORTANTE: Use a URL de PRODUÇÃO, não a URL de TESTE**
   - No node Webhook, você verá dois botões: **"Test URL"** e **"Production URL"**
   - Clique em **"Production URL"** (não use "Test URL" para produção!)
   - Copie a URL completa do webhook de PRODUÇÃO
   - Exemplo de URL de PRODUÇÃO: `https://n8n.gosttactical.com.br/webhook/4055cdd9-38cf-449e-a9ff-5c3c0297a8f4`
   - ⚠️ URL de TESTE (NÃO usar em produção): `https://n8n.gosttactical.com.br/webhook-test/...`
5. Use o ID do workflow nas variáveis de ambiente (a parte após a última barra `/`)
   - No exemplo acima, o ID seria: `4055cdd9-38cf-449e-a9ff-5c3c0297a8f4`
6. A URL base (sem o ID) deve ser configurada em `VITE_N8N_URL`
   - Exemplo de URL base de PRODUÇÃO: `https://n8n.gosttactical.com.br/webhook/`
   - ⚠️ NÃO use `/webhook-test/` em produção!

### ⚠️ IMPORTANTE: Manter o Workflow Sempre Ativo

**Problema comum:** O workflow executa uma vez e para, exigindo ativação manual novamente.

**Solução:** O workflow precisa estar **ATIVO** (Active) no n8n para receber requisições continuamente.

#### Como Ativar o Workflow:

1. **No n8n, abra o workflow que você criou**
2. **No canto superior direito, você verá um toggle/switch com o texto "Inactive" ou "Active"**
3. **Clique no toggle para ativar o workflow** (deve ficar verde/azul indicando "Active")
4. **Salve o workflow** (Ctrl+S ou botão Save no canto superior direito)

#### Verificação:

- ✅ **Workflow Ativo:** O toggle está verde/azul e mostra "Active"
- ❌ **Workflow Inativo:** O toggle está cinza e mostra "Inactive"

#### Dicas:

- **Após criar o workflow:** Sempre ative-o antes de testar
- **Após editar o workflow:** Verifique se ele continua ativo (às vezes pode desativar automaticamente)
- **Workflows ativos:** Aparecem com um indicador visual diferente na lista de workflows
- **Produção:** Mantenha sempre ativos os workflows que precisam receber webhooks

#### Troubleshooting:

**Se o workflow para de funcionar:**
1. Verifique se está ativo (toggle no canto superior direito)
2. Verifique se há erros no workflow (ícone de alerta vermelho)
3. Verifique os logs de execução (clique no workflow → aba "Executions")
4. Verifique se a URL do webhook está correta nas variáveis de ambiente

**Erro: "The requested webhook is not registered" após primeira execução:**
- ❌ **Problema:** Você está usando a URL de **TESTE** (`/webhook-test/`) em vez da URL de **PRODUÇÃO** (`/webhook/`)
- ✅ **Solução:** 
  1. No node Webhook, clique no botão **"Production URL"** (não "Test URL")
  2. Copie a URL de PRODUÇÃO completa
  3. Atualize a variável `VITE_N8N_URL` no seu `.env` para usar `/webhook/` em vez de `/webhook-test/`
  4. Reinicie a aplicação
  5. Certifique-se de que o workflow está **ATIVO** (toggle verde)

**Diferença entre Test URL e Production URL:**
- **Test URL** (`/webhook-test/`): Funciona apenas UMA vez após clicar em "Execute workflow". Use apenas para testes manuais.
- **Production URL** (`/webhook/`): Funciona continuamente enquanto o workflow estiver ativo. Use em produção.

## Configuração Detalhada dos Workflows no n8n

### 1. Workflow: Novo Recrutamento (`recrutamento-novo`)

#### Estrutura do Workflow:
```
[Webhook] → [Set] → [Send Email (candidato)] → [Send Email (equipe)]
```

#### Passo a Passo:

**Node 1: Webhook**
- Tipo: `Webhook`
- Método: `POST`
- Path: `/recrutamento-novo`
- Response Mode: `Last Node`
- Configure o webhook e copie a URL gerada

**Node 2: Set (Preparar dados do email para candidato)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: {{ $json.email }}
  Subject: {{ $json.assunto || 'Confirmação de Inscrição - GOST Tactical' }}
  From: seu-email@gosttactical.com.br
  ```
  **Nota:** O campo `assunto` vem do webhook. Se não estiver definido, usa o assunto padrão.
- No campo de texto do email (HTML ou Text), use:
  ```
  Olá {{ $json.nome }},

  Recebemos sua inscrição para o processo de recrutamento do GOST Tactical!

  Seus dados foram registrados e nossa equipe entrará em contato em breve.

  Dados da inscrição:
  - Nome: {{ $json.nome }}
  - Email: {{ $json.email }}
  {{ $json.telefone ? `- Telefone: ${$json.telefone}` : '' }}

  Aguarde nosso contato!

  Atenciosamente,
  Equipe GOST Tactical
  ```
  
  **Variáveis disponíveis no webhook:**
  - `{{ $json.tipo }}` - Tipo: 'novo_recrutamento' ou 'atualizacao_etapa'
  - `{{ $json.id }}` - ID do recrutamento
  - `{{ $json.nome }}` - Nome do candidato
  - `{{ $json.email }}` - Email do candidato
  - `{{ $json.status }}` - Status da etapa (pendente/aprovado/reprovado)
  - `{{ $json.assunto }}` - **Assunto do email (usar no Subject)**
  - `{{ $json.nomeEquipe }}` - Nome da equipe
  - `{{ $json.significadoNome }}` - Significado do nome da equipe
  - `{{ $json.linkWhatsApp }}` - Link do WhatsApp
  - `{{ $json.linkInstagram }}` - Link do Instagram
  - `{{ $json.timestamp }}` - Data/hora do envio

**Node 3: Send Email (Candidato)**
- Tipo: `Email Send` (Gmail, SMTP, ou outro serviço configurado)
- Configure suas credenciais de email
- Use os dados do node anterior (Set)

**Node 4: Set (Preparar dados do email para equipe)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: equipe@gosttactical.com.br (ou lista de emails da equipe)
  Subject: {{ $json.assunto || 'Novo Candidato - ' + $json.nome }}
  From: sistema@gosttactical.com.br
  ```
  **Nota:** O campo `assunto` vem do webhook. Se não estiver definido, usa o assunto padrão.
- No campo de texto do email:
  ```
  Nova inscrição recebida!

  Candidato: {{ $json.body.recrutamento.nome }}
  Email: {{ $json.body.recrutamento.email }}
  {{ $json.body.recrutamento.telefone ? `Telefone: ${$json.body.recrutamento.telefone}` : '' }}
  
  {{ $json.body.recrutamento.responsavel ? `Responsável atribuído: ${$json.body.recrutamento.responsavel.name} (${$json.body.recrutamento.responsavel.email})` : 'Nenhum responsável atribuído ainda.' }}

  ID do recrutamento: {{ $json.body.recrutamento.id }}
  ```

**Node 5: Send Email (Equipe)**
- Tipo: `Email Send`
- Use os dados do node anterior

---

### 2. Workflow: Atualização de Recrutamento (`recrutamento-atualizacao`)

#### Estrutura do Workflow:
```
[Webhook] → [Set] → [Send Email]
```

#### Passo a Passo:

**Node 1: Webhook**
- Tipo: `Webhook`
- Método: `POST`
- Path: `/recrutamento-atualizacao`
- Response Mode: `Last Node`

**Node 2: Set (Preparar email)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: {{ $json.email }}
  Subject: {{ $json.assunto || 'Atualização no Processo de Recrutamento - GOST Tactical' }}
  From: seu-email@gosttactical.com.br
  ```
  **Nota:** O campo `assunto` vem do webhook. Se não estiver definido, usa o assunto padrão.
- No campo de texto do email:
  ```
  Olá {{ $json.nome }},

  Temos uma atualização no seu processo de recrutamento:

  Status: {{ $json.status === 'aprovado' ? 'Aprovado ✓' : ($json.status === 'reprovado' ? 'Reprovado ✗' : 'Pendente') }}

  {{ $json.nomeEquipe ? `Equipe: ${$json.nomeEquipe}` : '' }}
  {{ $json.significadoNome ? `(${$json.significadoNome})` : '' }}

  {{ $json.linkWhatsApp ? `WhatsApp: ${$json.linkWhatsApp}` : '' }}
  {{ $json.linkInstagram ? `Instagram: ${$json.linkInstagram}` : '' }}
  ```
  
  **Variáveis disponíveis no webhook:**
  - `{{ $json.tipo }}` - Tipo: 'novo_recrutamento' ou 'atualizacao_etapa'
  - `{{ $json.id }}` - ID do recrutamento
  - `{{ $json.nome }}` - Nome do candidato
  - `{{ $json.email }}` - Email do candidato
  - `{{ $json.status }}` - Status da etapa (pendente/aprovado/reprovado)
  - `{{ $json.assunto }}` - **Assunto do email (usar no Subject)**
  - `{{ $json.nomeEquipe }}` - Nome da equipe
  - `{{ $json.significadoNome }}` - Significado do nome da equipe
  - `{{ $json.linkWhatsApp }}` - Link do WhatsApp
  - `{{ $json.linkInstagram }}` - Link do Instagram
  - `{{ $json.timestamp }}` - Data/hora do envio

  Atenciosamente,
  Equipe GOST Tactical
  ```

**Node 3: Send Email**
- Tipo: `Email Send`
- Use os dados do node anterior

---

### 3. Workflow: Confirmação de Presença (`presenca-confirmacao`)

#### Estrutura do Workflow:
```
[Webhook] → [Set] → [Send Email (confirmação)] → [Code] → [Wait] → [Set] → [Send Email (lembrete)]
```

#### Passo a Passo:

**Node 1: Webhook**
- Tipo: `Webhook`
- Método: `POST`
- Path: `/presenca-confirmacao`
- Response Mode: `Respond to Webhook` (no primeiro email)
- Response Code: `200`
- Response Body: `{{ { "success": true, "message": "Confirmação enviada" } }}`

**Node 2: Set (Email de confirmação)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: {{ $json.body.usuario.email }}
  Subject: Confirmação de Presença - {{ $json.body.jogo.nome_jogo }}
  From: seu-email@gosttactical.com.br
  ```
- No campo de texto do email:
  ```
  Olá {{ $json.body.usuario.name || 'Operador' }},

  Sua presença foi confirmada para o jogo:

  Jogo: {{ $json.body.jogo.nome_jogo }}
  Data: {{ $json.body.jogo.data_jogo }}
  Hora: {{ $json.body.jogo.hora_inicio }}
  Local: {{ $json.body.jogo.local_jogo || 'A definir' }}
  Tipo: {{ $json.body.jogo.tipo_jogo || 'A definir' }}

  Você receberá um lembrete 1 dia antes do jogo.

  Nos vemos lá!

  Equipe GOST Tactical
  ```

**Node 3: Send Email (Confirmação)**
- Tipo: `Email Send`
- Use os dados do node anterior

**Node 4: Code (Calcular data 1 dia antes)**
- Tipo: `Code`
- Language: `JavaScript`
- Código:
  ```javascript
  const dataJogo = $input.item.json.body.jogo.data_jogo;
  
  if (!dataJogo) {
    return { success: false, error: 'Data do jogo não informada' };
  }
  
  const data = new Date(dataJogo);
  data.setDate(data.getDate() - 1); // 1 dia antes
  
  const agora = new Date();
  const diferencaMs = data.getTime() - agora.getTime();
  
  if (diferencaMs <= 0) {
    return { success: false, error: 'Data já passou' };
  }
  
  return {
    waitUntil: data.toISOString(),
    jogo: $input.item.json.body.jogo,
    usuario: $input.item.json.json.body.usuario
  };
  ```

**Node 5: Wait**
- Tipo: `Wait`
- Resume: `When Last Node Finishes`
- Ou use: `Wait Until Date` usando `{{ $json.waitUntil }}`

**Node 6: Set (Email de lembrete)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: {{ $json.usuario.email }}
  Subject: Lembrete: Jogo amanhã - {{ $json.jogo.nome_jogo }}
  From: seu-email@gosttactical.com.br
  ```
- No campo de texto do email:
  ```
  Olá {{ $json.usuario.name || 'Operador' }},

  Este é um lembrete: você tem um jogo AMANHÃ!

  Jogo: {{ $json.jogo.nome_jogo }}
  Data: {{ $json.jogo.data_jogo }}
  Hora: {{ $json.jogo.hora_inicio }}
  Local: {{ $json.jogo.local_jogo || 'A definir' }}

  Não esqueça de trazer todo seu equipamento!

  Equipe GOST Tactical
  ```

**Node 7: Send Email (Lembrete)**
- Tipo: `Email Send`
- Use os dados do node anterior

---

### 4. Workflow: Mensagem de Parceria (`parceria-mensagem`)

#### Estrutura do Workflow:
```
[Webhook] → [Set] → [Send Email]
```

#### Passo a Passo:

**Node 1: Webhook**
- Tipo: `Webhook`
- Método: `POST`
- Path: `/parceria-mensagem`
- Response Mode: `Last Node`

**Node 2: Set (Preparar email)**
- Tipo: `Set`
- Mode: `Manual`
- Adicione os seguintes campos:
  ```
  To: parcerias@gosttactical.com.br (ou email da equipe responsável)
  Subject: Nova Proposta de Parceria - {{ $json.body.contato.nome }}
  From: sistema@gosttactical.com.br
  ```
- No campo de texto do email:
  ```
  Nova proposta de parceria recebida!

  Contato:
  - Nome: {{ $json.body.contato.nome }}
  - Email: {{ $json.body.contato.email }}
  {{ $json.body.contato.whatsapp ? `- WhatsApp: ${$json.body.contato.whatsapp}` : '' }}

  Descrição da proposta:
  {{ $json.body.contato.descricao }}

  ---
  Recebido em: {{ $json.body.timestamp }}
  ```

**Node 3: Send Email**
- Tipo: `Email Send`
- Use os dados do node anterior

---

## Onde Encontrar os Nodes no n8n

### Categoria: **Core** (Essencial para todos os workflows)

#### 1. **Webhook** 
- **Onde encontrar:** Core → Webhook
- **Uso:** Trigger inicial de todos os workflows
- **Configuração:** 
  - Método: POST
  - Path: `/nome-do-workflow` (ex: `/recrutamento-novo`)
  - Response Mode: `Last Node` ou `Respond to Webhook`

#### 2. **Set**
- **Onde encontrar:** Data transformation → Set
- **Uso:** Preparar e estruturar dados para os emails
- **Configuração:**
  - Mode: `Manual`
  - Adicione campos customizados (To, Subject, From, etc.)

#### 3. **Code**
- **Onde encontrar:** Core → Code
- **Uso:** Cálculos de data para agendamento de lembretes
- **Configuração:**
  - Language: `JavaScript`
  - Use expressões como `$input.item.json.body` para acessar dados

#### 4. **Wait**
- **Onde encontrar:** Flow → Wait
- **Uso:** Agendar envio de emails futuros (lembrete 1 dia antes)
- **Configuração:**
  - Resume: `When Last Node Finishes` ou `Wait Until Date`

### Categoria: **Action in an app** (Para envio de emails)

#### 5. **Gmail**
- **Onde encontrar:** Action in an app → Gmail → Send Email
- **Uso:** Enviar emails usando conta Gmail
- **Configuração:**
  - Autenticação OAuth2
  - Configure credenciais do Gmail no n8n

#### 6. **SMTP Email**
- **Onde encontrar:** Action in an app → Email Send (SMTP)
- **Uso:** Enviar emails usando servidor SMTP genérico
- **Configuração:**
  - Host SMTP (ex: smtp.gmail.com, smtp.outlook.com)
  - Port (587 para TLS, 465 para SSL)
  - User e Password

#### 7. **SendGrid** (Opcional)
- **Onde encontrar:** Action in an app → SendGrid → Send Email
- **Uso:** Serviço de email transacional profissional
- **Configuração:** API Key nas credenciais do n8n

### Categoria: **Flow** (Lógica condicional - Opcional)

#### 8. **IF**
- **Onde encontrar:** Flow → IF
- **Uso:** Enviar email apenas se houver observações
- **Exemplo:** `{{ $json.body.recrutamento.observacoes }}` existe

#### 9. **Switch**
- **Onde encontrar:** Flow → Switch
- **Uso:** Diferentes fluxos baseados no status da etapa
- **Exemplo:** Um email diferente para "aprovado" vs "reprovado"

### Categoria: **Data transformation** (Manipulação de dados)

#### 10. **Set** (já mencionado acima)
- **Onde encontrar:** Data transformation → Set

#### 11. **Function** (Alternativa ao Code)
- **Onde encontrar:** Core → Function
- **Uso:** Transformações mais complexas de dados
- **Diferença:** Function usa JavaScript/TypeScript, Code é mais simples

## Guia Rápido: Qual Node Usar em Cada Situação

| Situação | Categoria | Node Específico |
|----------|-----------|----------------|
| Receber dados do frontend | **Core** | Webhook |
| Preparar dados do email | **Data transformation** | Set |
| Enviar email via Gmail | **Action in an app** | Gmail → Send Email |
| Enviar email via SMTP | **Action in an app** | Email Send (SMTP) |
| Calcular data futura | **Core** | Code |
| Agendar envio futuro | **Flow** | Wait |
| Lógica condicional | **Flow** | IF ou Switch |
| Transformar dados complexos | **Core** | Function ou Code |

## Passo a Passo: Como Adicionar Nodes no n8n

### 1. Adicionando o Primeiro Node (Webhook)

1. Clique no botão **"+"** ou pressione **Espaço** no workflow vazio
2. Na janela "What happens next?", procure por **"Core"**
3. Clique em **"Core"** → procure **"Webhook"**
4. Clique em **"Webhook"** para adicionar ao workflow
5. Configure:
   - **HTTP Method:** POST
   - **Path:** `/recrutamento-novo` (ou o nome do seu workflow)
   - **Response Mode:** `Last Node` (ou `Respond to Webhook` se quiser resposta imediata)

### 2. Adicionando Node Set (Preparar Dados)

1. Clique no **"+"** após o node Webhook
2. Procure por **"Data transformation"**
3. Clique em **"Data transformation"** → **"Set"**
4. Configure:
   - **Mode:** Manual
   - Adicione campos clicando em **"Add Value"**
   - Use expressões como `{{ $json.body.recrutamento.email }}`

### 3. Adicionando Node de Email

**Opção A - Gmail:**
1. Clique no **"+"** após o node Set
2. Procure por **"Action in an app"**
3. Clique em **"Action in an app"** → procure **"Gmail"**
4. Selecione **"Gmail"** → escolha **"Send Email"**
5. Configure autenticação OAuth2 na primeira vez

**Opção B - SMTP Genérico:**
1. Clique no **"+"** após o node Set
2. Procure por **"Action in an app"**
3. Clique em **"Action in an app"** → procure **"Email Send (SMTP)"**
4. Configure credenciais SMTP

### 4. Adicionando Node Code (Para Cálculos)

1. Clique no **"+"** onde necessário
2. Procure por **"Core"**
3. Clique em **"Core"** → **"Code"**
4. Configure:
   - **Language:** JavaScript
   - Escreva seu código no editor

### 5. Adicionando Node Wait (Para Agendamento)

1. Clique no **"+"** após o node Code
2. Procure por **"Flow"**
3. Clique em **"Flow"** → **"Wait"**
4. Configure:
   - **Resume:** `When Last Node Finishes` ou `Wait Until Date`
   - Use expressão do node Code: `{{ $json.waitUntil }}`

## Dicas de Navegação no n8n

- **Busca rápida:** Use a barra de busca no topo da janela "What happens next?"
- **Atalhos:** Pressione **Espaço** para abrir a janela de adicionar nodes
- **Conectar nodes:** Arraste da saída de um node até a entrada de outro
- **Testar workflow:** Use o botão **"Execute Workflow"** no canto superior direito
- **Ver dados:** Clique em qualquer node para ver os dados que ele recebeu/enviou

## Configuração de Email no n8n

### Opção 1: Gmail
1. Adicione node `Gmail`
2. Configure autenticação OAuth2
3. Use `Send Email` para enviar

### Opção 2: SMTP Genérico
1. Adicione node `Email Send (SMTP)`
2. Configure:
   - Host SMTP (ex: smtp.gmail.com)
   - Port (ex: 587)
   - User e Password
   - SSL/TLS conforme necessário

### Opção 3: SendGrid/Mailgun
1. Use nodes específicos desses serviços
2. Configure API keys nas credenciais do n8n

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

