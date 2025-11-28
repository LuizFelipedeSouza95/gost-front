# Guia de Templates de Email para n8n

Este documento explica como usar os templates HTML de email no n8n para o processo de recrutamento.

## 📧 Templates Disponíveis

### 1. Email para o Candidato (Confirmação de Inscrição)
**Arquivo:** `email-templates-novo-recrutamento.html` (primeira seção)

**Quando usar:** Enviar para o candidato quando ele se inscreve no processo de recrutamento.

**Variáveis disponíveis no n8n:**
- `{{ $json.userInfo.nome }}` - Nome do candidato
- `{{ $json.userInfo.email }}` - Email do candidato
- `{{ $json.userInfo.telefone }}` - Telefone do candidato (pode ser null)
- `{{ $json.userInfo.status }}` - Status atual do recrutamento
- `{{ $json.userInfo.linkWhatsApp }}` - Link do WhatsApp da equipe (pode ser null)
- `{{ $json.userInfo.linkInstagram }}` - Link do Instagram da equipe (pode ser null)
- `{{ $json.timestamp }}` - Data/hora da inscrição (ISO 8601)

### 2. Email para a Equipe (Notificação de Novo Recrutamento)
**Arquivo:** `email-templates-novo-recrutamento.html` (segunda seção)

**Quando usar:** Enviar para a equipe quando um novo candidato se inscreve.

**Variáveis disponíveis no n8n:**
- `{{ $json.userInfo.nome }}` - Nome do candidato
- `{{ $json.userInfo.email }}` - Email do candidato
- `{{ $json.userInfo.telefone }}` - Telefone do candidato (pode ser null)
- `{{ $json.userInfo.status }}` - Status atual do recrutamento
- `{{ $json.userInfo.id }}` - ID do recrutamento
- `{{ $json.timestamp }}` - Data/hora da inscrição (ISO 8601)

## 🚀 Como Configurar no n8n

### Passo 1: Criar o Workflow

1. Acesse o n8n e crie um novo workflow
2. Adicione um node **Webhook** como trigger
3. Configure:
   - **Method:** POST
   - **Response Mode:** Last Node
   - Copie a URL do webhook gerada

### Passo 2: Adicionar Node de Email

1. Adicione um node **Send Email** (ou use o node de email do seu provedor)
2. Configure as credenciais do seu provedor de email (Gmail, SendGrid, etc.)

### Passo 3: Configurar o Template HTML

#### Para Email ao Candidato:

1. No node **Send Email**, configure:
   - **To:** `{{ $json.userInfo.email }}`
   - **Subject:** `Confirmação de Inscrição - GOST Tactical`
   - **From:** `seu-email@gosttactical.com.br`
   - **Email Type:** HTML

2. No campo **HTML**, copie o primeiro template do arquivo `email-templates-novo-recrutamento.html`

3. **IMPORTANTE:** No n8n, você precisa substituir as variáveis Handlebars por variáveis do n8n:
   - `{{ $json.userInfo.nome }}` → `{{ $json.userInfo.nome }}`
   - `{{ $json.userInfo.email }}` → `{{ $json.userInfo.email }}`
   - `{{ $json.userInfo.telefone }}` → `{{ $json.userInfo.telefone }}`
   - `{{ $json.userInfo.status }}` → `{{ $json.userInfo.status }}`
   - `{{ $json.userInfo.linkWhatsApp }}` → `{{ $json.userInfo.linkWhatsApp }}`
   - `{{ $json.userInfo.linkInstagram }}` → `{{ $json.userInfo.linkInstagram }}`
   - `{{ $json.timestamp }}` → `{{ $json.timestamp }}`

4. Para condições (se o link existe), use:
   ```javascript
   {{#if $json.userInfo.linkWhatsApp}}
   <!-- conteúdo -->
   {{/if}}
   ```

#### Para Email à Equipe:

1. No node **Send Email**, configure:
   - **To:** `equipe@gosttactical.com.br` (ou email configurado)
   - **Subject:** `🎯 Novo Recrutamento - {{ $json.userInfo.nome }}`
   - **From:** `sistema@gosttactical.com.br`
   - **Email Type:** HTML

2. No campo **HTML**, copie o segundo template do arquivo `email-templates-novo-recrutamento.html`

3. Substitua as variáveis conforme explicado acima

### Passo 4: Adicionar Lógica Condicional (Opcional)

Se quiser enviar emails diferentes baseado em condições, use o node **IF**:

```javascript
// Exemplo: Enviar link do WhatsApp apenas se existir
{{#if $json.userInfo.linkWhatsApp}}
  <a href="{{ $json.userInfo.linkWhatsApp }}">WhatsApp</a>
{{/if}}
```

## 📝 Exemplo de Configuração no n8n

### Workflow: Novo Recrutamento

```
[Webhook] → [IF] → [Send Email (Candidato)]
              ↓
         [Send Email (Equipe)]
```

**Node IF:**
- Condição: Verificar se `$json.tipo === 'novo_recrutamento'`

**Node Send Email (Candidato):**
- To: `{{ $json.userInfo.email }}`
- Subject: `Confirmação de Inscrição - GOST Tactical`
- HTML: (primeiro template)

**Node Send Email (Equipe):**
- To: `equipe@gosttactical.com.br`
- Subject: `🎯 Novo Recrutamento - {{ $json.userInfo.nome }}`
- HTML: (segundo template)

## 🎨 Personalização

### Cores
Os templates usam a paleta de cores do GOST:
- **Amber/Orange:** `#f59e0b`, `#d97706` (cor principal)
- **Dark Gray:** `#1a1a1a`, `#2d2d2d` (fundo)
- **Light Gray:** `#e5e5e5`, `#9ca3af` (texto)

### Fontes
- **Família:** Arial, sans-serif
- **Tamanhos:** 11px a 28px conforme hierarquia

### Responsividade
Os templates são responsivos e funcionam bem em:
- Desktop
- Mobile
- Clientes de email (Gmail, Outlook, etc.)

## 🔧 Troubleshooting

### Variáveis não aparecem
- Certifique-se de usar `{{ $json.variavel }}` e não `{{ variavel }}`
- Verifique se o payload do webhook contém os dados esperados

### Links não funcionam
- Certifique-se de que os links começam com `http://` ou `https://`
- Teste os links antes de enviar

### Email não chega
- Verifique as configurações do provedor de email
- Verifique spam/lixo eletrônico
- Teste com um email de teste primeiro

## 📚 Recursos Adicionais

- [Documentação do n8n - Send Email](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail/)
- [Documentação do n8n - Expressões](https://docs.n8n.io/code/expressions/)
- [Guia de HTML para Email](https://www.campaignmonitor.com/dev-resources/guides/coding/)

