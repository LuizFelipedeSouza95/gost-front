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

  // Garantir que todos os campos obrigatórios estejam presentes
  return {
    // Manter dados originais primeiro para compatibilidade
    ...data,
    // Garantir campos obrigatórios (sobrescrevem se não existirem)
    nomeEquipe: data.nomeEquipe || equipeData?.nome || '',
    significadoNome: data.significadoNome || equipeData?.significado_nome || '',
    tipo: data.tipo || '',
    id: data.id || '',
    nome: data.nome || data.usuario?.name || data.contato?.nome || '',
    email: data.email || data.usuario?.email || data.contato?.email || '',
    status: data.status || '',
    assunto: data.assunto || '', // Garantir que assunto esteja presente
    linkWhatsApp: data.linkWhatsApp || equipeData?.whatsapp_url || '',
    linkInstagram: data.linkInstagram || equipeData?.instagram_url || '',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Envia webhook para n8n de forma assíncrona (não bloqueia a UI)
 * Falhas são silenciosas para não impactar a experiência do usuário
 */
async function sendN8nWebhook(workflowId: string, data: any): Promise<void> {
  try {
    const webhookUrl = `${import.meta.env.VITE_N8N_URL}/${workflowId}`;

    await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
  } catch (error) {
    console.warn('Erro ao enviar webhook para n8n:', error);
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
    // Workflow ID do n8n - configure conforme seu workflow
    const workflowId = import.meta.env.VITE_N8N_WORKFLOW_RECRUTAMENTO || 'recrutamento-novo';

    const normalizedData = await normalizeEmailData({
      ...data,
      assunto: 'GOST - Recrutamento',
    });

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

