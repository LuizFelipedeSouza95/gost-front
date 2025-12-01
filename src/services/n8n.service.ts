import axios from 'axios';
import { equipeService } from './equipe.service';

/**
 * Normaliza os dados do email para garantir que todos os parâmetros obrigatórios estejam presentes
 */
async function normalizeEmailData(data: any): Promise<any> {
  // Carregar dados da equipe uma vez e reutilizar
  let equipeData: { nome?: string | null; significado_nome?: string | null; whatsapp_url?: string | null; instagram_url?: string | null } | null = null;
  
  try {
    const equipeResponse = await equipeService.get();
    if (equipeResponse.success && equipeResponse.data) {
      equipeData = {
        nome: equipeResponse.data.nome || null,
        significado_nome: equipeResponse.data.significado_nome || null,
        whatsapp_url: equipeResponse.data.whatsapp_url || null,
        instagram_url: equipeResponse.data.instagram_url || null,
      };
    }
  } catch (error) {
    console.warn('Erro ao carregar dados da equipe para email:', error);
  }

  // Extrair email de forma robusta
  const email = (data.email || data.usuario?.email || data.contato?.email || '').trim();
  
  // Validar email antes de normalizar
  if (!email) {
    throw new Error('Email não encontrado nos dados fornecidos');
  }

  // Garantir que todos os campos obrigatórios estejam presentes
  const normalized = {
    // Manter dados originais primeiro para compatibilidade
    ...data,
    // Garantir campos obrigatórios (sobrescrevem se não existirem)
    nomeEquipe: data.nomeEquipe || equipeData?.nome || '',
    significadoNome: data.significadoNome || equipeData?.significado_nome || '',
    tipo: data.tipo || '',
    id: data.id || '',
    nome: (data.nome || data.usuario?.name || data.contato?.nome || '').trim(),
    email: email, // Email já validado acima
    status: data.status || '',
    assunto: data.assunto || '', // Garantir que assunto esteja presente
    linkWhatsApp: data.linkWhatsApp || equipeData?.whatsapp_url || '',
    linkInstagram: data.linkInstagram || equipeData?.instagram_url || '',
    timestamp: new Date().toISOString(),
  };

  // Log para debug
  console.log('Dados normalizados para email:', {
    email: normalized.email,
    nome: normalized.nome,
    tipo: normalized.tipo,
    assunto: normalized.assunto,
  });

  return normalized;
}

/**
 * Envia webhook para n8n
 * Agora lança erros para que possam ser tratados adequadamente
 */
async function sendN8nWebhook(workflowId: string, data: any): Promise<void> {
  const n8nBaseUrl = import.meta.env.VITE_N8N_URL;
  
  // Validar se a URL base está configurada
  if (!n8nBaseUrl) {
    const error = new Error('VITE_N8N_URL não está configurada nas variáveis de ambiente');
    console.error('Erro de configuração:', error);
    throw error;
  }
  
  // Garantir que a URL base não termine com barra e o workflowId não comece com barra
  const baseUrl = n8nBaseUrl.endsWith('/') ? n8nBaseUrl.slice(0, -1) : n8nBaseUrl;
  const cleanWorkflowId = workflowId.startsWith('/') ? workflowId.slice(1) : workflowId;
  const webhookUrl = `${baseUrl}/${cleanWorkflowId}`;

  try {
    await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // Aumentado para 10 segundos
    });
  } catch (error: any) {
    // Log detalhado do erro
    console.error('Erro ao enviar webhook para n8n:', {
      url: webhookUrl,
      workflowId: cleanWorkflowId,
      email: data.email,
      tipo: data.tipo,
      erro: error.message || error,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    // Lançar erro para que possa ser tratado pelo chamador
    throw new Error(`Erro ao enviar email via n8n: ${error.message || 'Erro desconhecido'}`);
  }
}

export interface RecrutamentoEmailData {
  tipo: 'novo_recrutamento' | 'atualizacao_etapa';
  id: string;
  nome: string;
  email: string;
  status: string;
  etapa?: string; // Nome da etapa para incluir no assunto
  linkWhatsApp?: string | null;
  linkInstagram?: string | null;
  nomeEquipe?: string | null;
  significadoNome?: string | null;
  assunto?: string | null;
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
    // Validar email antes de enviar
    if (!data.email || !data.email.trim()) {
      throw new Error('Email não fornecido para envio de confirmação');
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error(`Email inválido: ${data.email}`);
    }

    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_RECRUTAMENTO || 'recrutamento-novo';

    if (!workflowId) {
      throw new Error('VITE_N8N_WORKFLOW_RECRUTAMENTO não está configurado');
    }

    const normalizedData = await normalizeEmailData({
      ...data,
      assunto: 'GOST - Recrutamento',
    });

    // Validar novamente após normalização
    if (!normalizedData.email || !normalizedData.email.trim()) {
      throw new Error('Email não encontrado após normalização dos dados');
    }

    await sendN8nWebhook(workflowId, normalizedData);
  },

  /**
   * Envia email quando uma etapa do recrutamento é atualizada
   * Envia para o candidato informando sobre a atualização
   */
  async enviarEmailAtualizacaoRecrutamento(data: RecrutamentoEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_RECRUTAMENTO_ATUALIZACAO || 'recrutamento-atualizacao';

    // Incluir o nome da etapa no assunto se fornecido
    const assunto = data.etapa 
      ? `GOST - Recrutamento - ${data.etapa}`
      : 'GOST - Recrutamento';

    const normalizedData = await normalizeEmailData({
      ...data,
      assunto,
    });

    await sendN8nWebhook(workflowId, normalizedData);
  },

  /**
   * Envia email 1 dia antes do jogo para lembrar o usuário
   * Este método deve ser chamado pelo backend/n8n quando agendar o lembrete
   * Não é chamado imediatamente ao confirmar presença
   */
  async enviarEmailConfirmacaoPresenca(data: PresencaEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_PRESENCA || 'presenca-confirmacao';

    const normalizedData = await normalizeEmailData({
      ...data,
      id: data.jogo.id,
      nome: data.usuario.name || '',
      email: data.usuario.email,
      status: '',
      assunto: 'GOST - Jogo agendado',
    });

    await sendN8nWebhook(workflowId, normalizedData);
  },

  /**
   * Envia email quando uma mensagem de parceria é enviada
   * Envia para a equipe
   */
  async enviarEmailParceria(data: ParceriaEmailData): Promise<void> {
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_PARCERIA || 'parceria-mensagem';

    const normalizedData = await normalizeEmailData({
      ...data,
      id: '',
      nome: data.contato.nome,
      email: data.contato.email,
      status: '',
      assunto: 'GOST - Parceria',
    });

    await sendN8nWebhook(workflowId, normalizedData);
  },
};

