/**
 * Serviço para integração com n8n
 * Envia webhooks para workflows do n8n que processam envio de emails
 */

const getN8nUrl = (): string => {
  // URL do n8n pode ser configurada via variável de ambiente
  if (import.meta.env.VITE_N8N_URL) {
    return import.meta.env.VITE_N8N_URL;
  }
  
  // Fallback para desenvolvimento local
  if (import.meta.env.DEV) {
    return 'http://localhost:5678';
  }
  
  // Fallback para produção (ajuste conforme necessário)
  return 'https://n8n.gosttactical.com.br';
};

const n8nBaseUrl = getN8nUrl();

/**
 * Envia webhook para n8n de forma assíncrona (não bloqueia a UI)
 * Falhas são silenciosas para não impactar a experiência do usuário
 */
async function sendN8nWebhook(workflowId: string, data: any): Promise<void> {
  try {
    const webhookUrl = `${n8nBaseUrl}/webhook/${workflowId}`;
    
    // Usa fetch com timeout para evitar bloqueios
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    // Log silencioso - não queremos que falhas no n8n afetem a experiência do usuário
    console.warn('Erro ao enviar webhook para n8n:', error);
  }
}

export interface RecrutamentoEmailData {
  tipo: 'novo_recrutamento' | 'atualizacao_etapa';
  recrutamento: {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
    etapa_atual?: string;
    status_etapa?: 'aprovado' | 'reprovado' | 'pendente';
    observacoes?: string | null;
    responsavel?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

export interface PresencaEmailData {
  tipo: 'confirmacao_presenca';
  jogo: {
    id: string;
    nome_jogo: string;
    data_jogo?: string | null;
    hora_inicio?: string | null;
    local_jogo?: string | null;
    tipo_jogo?: string | null;
  };
  usuario: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export interface ParceriaEmailData {
  tipo: 'mensagem_parceria';
  contato: {
    nome: string;
    email: string;
    whatsapp?: string;
    descricao: string;
  };
}

export const n8nService = {
  /**
   * Envia email quando um novo recrutamento é criado
   * Envia para o candidato e para a equipe
   */
  async enviarEmailNovoRecrutamento(data: RecrutamentoEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_RECRUTAMENTO || 'recrutamento-novo';
    
    await sendN8nWebhook(workflowId, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Envia email quando uma etapa do recrutamento é atualizada
   * Envia para o candidato informando sobre a atualização
   */
  async enviarEmailAtualizacaoRecrutamento(data: RecrutamentoEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_RECRUTAMENTO_ATUALIZACAO || 'recrutamento-atualizacao';
    
    await sendN8nWebhook(workflowId, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Envia email quando um usuário confirma presença em um jogo
   * Também agenda lembrete para 1 dia antes do jogo
   */
  async enviarEmailConfirmacaoPresenca(data: PresencaEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_PRESENCA || 'presenca-confirmacao';
    
    await sendN8nWebhook(workflowId, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Envia email quando uma mensagem de parceria é enviada
   * Envia para a equipe
   */
  async enviarEmailParceria(data: ParceriaEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_PARCERIA || 'parceria-mensagem';
    
    await sendN8nWebhook(workflowId, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },
};

