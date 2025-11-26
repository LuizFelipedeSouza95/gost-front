import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Calendar, MessageSquare, Vote, Users, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { recrutamentoService, type Recrutamento } from '../services/recrutamento.service';
import { usuariosService, type Usuario } from '../services/usuarios.service';
import { getUserInfo } from '../utils/auth';

type EtapaTipo = 'inscricao' | 'avaliacao' | 'qa' | 'votacao' | 'integracao';

export function RecruitmentAdminSection() {
  const [recrutamentos, setRecrutamentos] = useState<Recrutamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecrutamento, setSelectedRecrutamento] = useState<Recrutamento | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ativo');

  useEffect(() => {
    loadData();
  }, [filterStatus]);

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
        <div className="flex gap-4 mb-6">
          {['ativo', 'aprovado', 'reprovado', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === status
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
                      setShowStageModal(true);
                    }}
                    variant="outline"
                    size="sm"
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
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaTipo>('avaliacao');
  const [status, setStatus] = useState<'aprovado' | 'reprovado'>('aprovado');
  const [observacoes, setObservacoes] = useState('');

  const etapas: EtapaTipo[] = ['inscricao', 'avaliacao', 'qa', 'votacao', 'integracao'];
  const etapaNomes: Record<EtapaTipo, string> = {
    inscricao: 'Inscrição',
    avaliacao: 'Avaliação',
    qa: 'Período Q&A',
    votacao: 'Votação',
    integracao: 'Integração',
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-2xl text-white mb-4">Gerenciar Etapas - {recrutamento.nome}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Etapa</label>
              <select
                value={selectedEtapa}
                onChange={(e) => setSelectedEtapa(e.target.value as EtapaTipo)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="aprovado"
                    checked={status === 'aprovado'}
                    onChange={() => setStatus('aprovado')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-white">Aprovado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="reprovado"
                    checked={status === 'reprovado'}
                    onChange={() => setStatus('reprovado')}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-white">Reprovado</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Observações (será enviado por email)</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                rows={4}
                placeholder="Observações sobre a decisão..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onUpdate(recrutamento.id, selectedEtapa, status, observacoes)}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Salvar
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
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
  const [selectedResponsavel, setSelectedResponsavel] = React.useState<string>(recrutamento.responsavel?.id || '');

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
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

