import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Calendar, MessageSquare, Vote, Users, Loader2, Eye, FileText, X } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { recrutamentoService, type Recrutamento } from '../services/recrutamento.service';
import { usuariosService, type Usuario } from '../services/usuarios.service';
import { getUserInfo } from '../utils/auth';
import { n8nService } from '../services/n8n.service';
import { equipeService } from '../services/equipe.service';

type EtapaTipo = 'inscricao' | 'avaliacao' | 'qa' | 'votacao' | 'integracao';

export function RecruitmentAdminSection() {
  const [recrutamentos, setRecrutamentos] = useState([] as Recrutamento[]);
  const [usuarios, setUsuarios] = useState([] as Usuario[]);
  const [loading, setLoading] = useState(true);
  const [selectedRecrutamento, setSelectedRecrutamento] = useState(null as Recrutamento | null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null as any);
  const [filterStatus, setFilterStatus] = useState('ativo' as string);
  const [equipeData, setEquipeData] = useState(null as { 
    whatsapp_url?: string | null; 
    instagram_url?: string | null;
    nome?: string | null;
    significado_nome?: string | null;
  } | null);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  useEffect(() => {
    const loadEquipeData = async () => {
      try {
        const response = await equipeService.get();
        if (response.success && response.data) {
          setEquipeData({
            whatsapp_url: response.data.whatsapp_url || null,
            instagram_url: response.data.instagram_url || null,
            nome: response.data.nome || null,
            significado_nome: response.data.significado_nome || null,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados da equipe:', error);
      }
    };
    loadEquipeData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recrutamentosResponse, usuariosResponse, userResponse] = await Promise.all([
        recrutamentoService.list(filterStatus),
        usuariosService.list(1, 100),
        getUserInfo().catch(() => null),
      ]);

      if (recrutamentosResponse.success) {
        setRecrutamentos(recrutamentosResponse.data);
      }
      if (usuariosResponse.success && usuariosResponse.data) {
        setUsuarios(usuariosResponse.data);
      }
      setCurrentUser(userResponse);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar recrutamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (
    recrutamentoId: string,
    etapa: EtapaTipo,
    status: 'aprovado' | 'reprovado',
    observacoes?: string
  ) => {
    try {
      const response = await recrutamentoService.updateStage(recrutamentoId, etapa, status, observacoes);
      if (response.success) {
        toast.success(`Etapa ${getEtapaNome(etapa)} ${status === 'aprovado' ? 'aprovada' : 'reprovada'}!`);

        // Enviar email via n8n para o candidato sobre a atualização
        const recrutamentoAtualizado = response.data;
        // Mapear status da etapa para texto amigável
        const statusEtapa = recrutamentoAtualizado[`etapa_${etapa}` as keyof Recrutamento] as string || status;
        const statusTexto = statusEtapa === 'pendente' ? 'Em Análise' : statusEtapa === 'aprovado' ? 'Aprovado' : statusEtapa === 'reprovado' ? 'Reprovado' : statusEtapa;
        const nomeEtapa = getEtapaNome(etapa);
        // O normalizeEmailData no n8nService garante que todos os dados da equipe sejam incluídos
        n8nService.enviarEmailAtualizacaoRecrutamento({
          tipo: 'atualizacao_etapa',
          id: recrutamentoAtualizado.id,
          nome: recrutamentoAtualizado.nome,
          email: recrutamentoAtualizado.email,
          status: statusTexto, // Status da etapa atualizada (Em Análise/Aprovado/Reprovado)
          etapa: nomeEtapa, // Nome da etapa para incluir no assunto
          // Os dados da equipe (nomeEquipe, significadoNome, linkWhatsApp, linkInstagram) 
          // serão carregados automaticamente pelo normalizeEmailData no n8nService
          linkWhatsApp: equipeData?.whatsapp_url || null,
          linkInstagram: equipeData?.instagram_url || null,
          nomeEquipe: equipeData?.nome || null,
          significadoNome: equipeData?.significado_nome || null,
        }).catch((error) => {
          console.warn('Erro ao enviar email de atualização:', error);
        });

        setShowStageModal(false);
        setSelectedRecrutamento(null);
        loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar etapa: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleAssignResponsible = async (recrutamentoId: string, responsavelId: string | null) => {
    try {
      const response = await recrutamentoService.assignResponsible(recrutamentoId, responsavelId);
      if (response.success) {
        toast.success('Responsável atribuído com sucesso!');
        loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao atribuir responsável: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleVote = async (recrutamentoId: string, voto: 'aprovado' | 'reprovado') => {
    try {
      const response = await recrutamentoService.addVote(recrutamentoId, voto);
      if (response.success) {
        toast.success(`Voto registrado: ${voto === 'aprovado' ? 'Aprovado' : 'Reprovado'}`);
        setShowVoteModal(false);
        setSelectedRecrutamento(null);
        loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao registrar voto: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const getEtapaNome = (etapa: EtapaTipo): string => {
    const nomes: Record<EtapaTipo, string> = {
      inscricao: 'Inscrição',
      avaliacao: 'Avaliação',
      qa: 'Período Q&A',
      votacao: 'Votação',
      integracao: 'Integração',
    };
    return nomes[etapa] || etapa;
  };

  const getEtapaStatus = (recrutamento: Recrutamento, etapa: EtapaTipo) => {
    return recrutamento[`etapa_${etapa}` as keyof Recrutamento] as 'pendente' | 'aprovado' | 'reprovado';
  };

  const getStatusBadge = (status: 'pendente' | 'aprovado' | 'reprovado') => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/50">Aprovado</Badge>;
      case 'reprovado':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/50">Reprovado</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50">Pendente</Badge>;
    }
  };

  const isComando = currentUser?.roles?.includes('admin') ||
    currentUser?.patent === 'comando' ||
    currentUser?.patent === 'sub_comando';

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Gerenciar Recrutamentos</h1>
          <p className="text-gray-400">Visualize e gerencie os processos de recrutamento</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          {['ativo', 'aprovado', 'reprovado', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base whitespace-nowrap ${filterStatus === status
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de Recrutamentos */}
        <div className="space-y-4">
          {recrutamentos.length === 0 ? (
            <Card className="p-12 text-center bg-gray-800/50 border-amber-600/30">
              <p className="text-gray-400">Nenhum recrutamento encontrado</p>
            </Card>
          ) : (
            recrutamentos.map((recrutamento) => (
              <Card key={recrutamento.id} className="p-6 bg-gray-800/50 border-amber-600/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl text-white">{recrutamento.nome}</h3>
                      {getStatusBadge(recrutamento.status as any)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{recrutamento.email}</span>
                      </div>
                      {recrutamento.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{recrutamento.telefone}</span>
                        </div>
                      )}
                      {recrutamento.cidade && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{recrutamento.cidade}</span>
                        </div>
                      )}
                      {recrutamento.idade && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{recrutamento.idade} anos</span>
                        </div>
                      )}
                      {recrutamento.instagram && (
                        <div className="flex items-center gap-2">
                          <span>📷</span>
                          <span>@{recrutamento.instagram.replace('@', '')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {recrutamento.responsavel && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Responsável</p>
                      <p className="text-sm text-white">{recrutamento.responsavel.name}</p>
                    </div>
                  )}
                </div>

                {/* Etapas */}
                <div className="grid md:grid-cols-5 gap-2 mb-4">
                  {(['inscricao', 'avaliacao', 'qa', 'votacao', 'integracao'] as EtapaTipo[]).map((etapa) => {
                    const status = getEtapaStatus(recrutamento, etapa);
                    return (
                      <div key={etapa} className="text-center p-2 bg-gray-900/50 rounded">
                        <p className="text-xs text-gray-400 mb-1">{getEtapaNome(etapa)}</p>
                        {getStatusBadge(status)}
                      </div>
                    );
                  })}
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => {
                      setSelectedRecrutamento(recrutamento);
                      setShowFormModal(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-blue-400"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Formulário
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRecrutamento(recrutamento);
                      setShowStageModal(true);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={recrutamento.status === 'reprovado'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Gerenciar Etapas
                  </Button>
                  <ResponsibleButton
                    recrutamento={recrutamento}
                    usuarios={usuarios}
                    onAssign={handleAssignResponsible}
                  />
                  {recrutamento.etapa_votacao === 'pendente' && isComando && (
                    <Button
                      onClick={() => {
                        setSelectedRecrutamento(recrutamento);
                        setShowVoteModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-purple-400"
                      disabled={recrutamento.status === 'reprovado'}
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Votar
                    </Button>
                  )}
                </div>

                {/* Votos (se na etapa de votação) */}
                {recrutamento.etapa_votacao === 'pendente' && recrutamento.votos && Object.keys(recrutamento.votos).length > 0 && (
                  <div className="mt-4 p-3 bg-gray-900/50 rounded">
                    <p className="text-sm text-gray-400 mb-2">Votos registrados:</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(recrutamento.votos).map(([userId, voto]) => {
                        const usuario = usuarios.find(u => u.id === userId);
                        return (
                          <Badge
                            key={userId}
                            className={voto === 'aprovado' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}
                          >
                            {usuario?.nome_guerra || usuario?.name || 'Usuário'}: {voto === 'aprovado' ? '✓' : '✗'}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Gerenciar Etapas */}
      {showStageModal && selectedRecrutamento && (
        <StageModal
          recrutamento={selectedRecrutamento}
          onUpdate={handleUpdateStage}
          onClose={() => {
            setShowStageModal(false);
            setSelectedRecrutamento(null);
          }}
        />
      )}

      {/* Modal de Votação */}
      {showVoteModal && selectedRecrutamento && (
        <VoteModal
          recrutamento={selectedRecrutamento}
          onVote={handleVote}
          onClose={() => {
            setShowVoteModal(false);
            setSelectedRecrutamento(null);
          }}
        />
      )}

      {/* Modal de Visualização do Formulário */}
      {showFormModal && selectedRecrutamento && (
        <FormViewModal
          recrutamento={selectedRecrutamento}
          onClose={() => {
            setShowFormModal(false);
            setSelectedRecrutamento(null);
          }}
        />
      )}
    </div>
  );
}

// Modal para gerenciar etapas
function StageModal({
  recrutamento,
  onUpdate,
  onClose,
}: {
  recrutamento: Recrutamento;
  onUpdate: (id: string, etapa: EtapaTipo, status: 'aprovado' | 'reprovado', observacoes?: string) => void;
  onClose: () => void;
}) {
  const [selectedEtapa, setSelectedEtapa] = useState('avaliacao' as EtapaTipo);
  const [status, setStatus] = useState('aprovado' as 'aprovado' | 'reprovado');

  const etapas: EtapaTipo[] = ['inscricao', 'avaliacao', 'qa', 'votacao', 'integracao'];
  const etapaNomes: Record<EtapaTipo, string> = {
    inscricao: 'Inscrição',
    avaliacao: 'Avaliação',
    qa: 'Período Q&A',
    votacao: 'Votação',
    integracao: 'Integração',
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full my-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl text-white mb-4 break-words">
            Gerenciar Etapas - {recrutamento.nome}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Etapa</label>
              <select
                value={selectedEtapa}
                onChange={(e) => setSelectedEtapa(e.target.value as EtapaTipo)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base"
              >
                {etapas.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapaNomes[etapa]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="aprovado"
                    checked={status === 'aprovado'}
                    onChange={() => setStatus('aprovado')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-white text-sm sm:text-base">Aprovado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="reprovado"
                    checked={status === 'reprovado'}
                    onChange={() => setStatus('reprovado')}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-white text-sm sm:text-base">Reprovado</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={() => onUpdate(recrutamento.id, selectedEtapa, status)}
                className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-sm sm:text-base"
              >
                Salvar
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full sm:flex-1 text-sm sm:text-base">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Botão para atribuir responsável
function ResponsibleButton({
  recrutamento,
  usuarios,
  onAssign,
}: {
  recrutamento: Recrutamento;
  usuarios: Usuario[];
  onAssign: (id: string, responsavelId: string | null) => void;
}) {
  const [showModal, setShowModal] = React.useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = React.useState(recrutamento.responsavel?.id || '' as string);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        disabled={recrutamento.status === 'reprovado'}
      >
        <User className="w-4 h-4 mr-2" />
        Atribuir Responsável
      </Button>
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl text-white mb-4">Atribuir Responsável</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Responsável</label>
                  <select
                    value={selectedResponsavel}
                    onChange={(e) => setSelectedResponsavel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Nenhum</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome_guerra || usuario.name || usuario.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      onAssign(recrutamento.id, selectedResponsavel || null);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    Salvar
                  </Button>
                  <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// Modal de Votação
function VoteModal({
  recrutamento,
  onVote,
  onClose,
}: {
  recrutamento: Recrutamento;
  onVote: (id: string, voto: 'aprovado' | 'reprovado') => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl text-white mb-4">Votar - {recrutamento.nome}</h2>
          <p className="text-gray-400 mb-6">Registre seu voto para este candidato</p>

          <div className="flex gap-2">
            <Button
              onClick={() => onVote(recrutamento.id, 'aprovado')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
            <Button
              onClick={() => onVote(recrutamento.id, 'reprovado')}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reprovado
            </Button>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full mt-4">
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Modal de Visualização do Formulário
function FormViewModal({
  recrutamento,
  onClose,
}: {
  recrutamento: Recrutamento;
  onClose: () => void;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <Card
        className="bg-gray-900 border-gray-700 w-[95vw] h-[50vh] max-h-[50vh] flex flex-col overflow-hidden md:w-[50vw] md:h-[70vh] md:max-h-[70vh]"
        style={isDesktop ? { width: '50%', height: '70%' } : undefined}
      >
        <div className="p-2 sm:p-3 md:p-4 flex-shrink-0 border-b border-gray-700 relative">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 pr-1">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
              <h2 className="text-xs sm:text-sm md:text-base lg:text-lg text-white truncate">
                <span className="hidden sm:inline">Formulário de Cadastro - </span>
                {recrutamento.nome}
              </h2>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-shrink-0 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 min-w-[1.75rem] sm:min-w-[2rem] md:min-w-0 z-10"
            >
              <span className="hidden sm:inline text-xs sm:text-sm">Fechar</span>
              <X className="sm:hidden w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="space-y-3">
            {/* Informações Pessoais */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Informações Pessoais
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400">Nome Completo</label>
                  <p className="text-sm text-white mt-0.5">{recrutamento.nome}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <p className="text-sm text-white mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {recrutamento.email}
                  </p>
                </div>
                {recrutamento.telefone && (
                  <div>
                    <label className="text-xs text-gray-400">Telefone</label>
                    <p className="text-sm text-white mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {recrutamento.telefone}
                    </p>
                  </div>
                )}
                {recrutamento.idade && (
                  <div>
                    <label className="text-xs text-gray-400">Idade</label>
                    <p className="text-sm text-white mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {recrutamento.idade} anos
                    </p>
                  </div>
                )}
                {recrutamento.cidade && (
                  <div>
                    <label className="text-xs text-gray-400">Cidade</label>
                    <p className="text-sm text-white mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {recrutamento.cidade}
                    </p>
                  </div>
                )}
                {recrutamento.instagram && (
                  <div>
                    <label className="text-xs text-gray-400">Instagram</label>
                    <p className="text-sm text-white mt-0.5">@{recrutamento.instagram.replace('@', '')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Experiência */}
            {recrutamento.experiencia && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Tempo de Experiência em Airsoft
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{recrutamento.experiencia}</p>
              </div>
            )}

            {/* Equipamento */}
            {recrutamento.equipamento && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Equipamento que Possui
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{recrutamento.equipamento}</p>
              </div>
            )}

            {/* Disponibilidade */}
            {recrutamento.disponibilidade && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Disponibilidade
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{recrutamento.disponibilidade}</p>
              </div>
            )}

            {/* Motivação */}
            {recrutamento.motivacao && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Por que deseja entrar para o GOST?
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{recrutamento.motivacao}</p>
              </div>
            )}

            {/* Data de Inscrição */}
            {recrutamento.createdAt && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-sm text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Data de Inscrição
                </h3>
                <p className="text-sm text-gray-300">
                  {new Date(recrutamento.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

