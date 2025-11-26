import React, { useState, useEffect } from 'react';
import { UserPlus, Send, CheckCircle, Clock, CheckCircle2, XCircle, Loader2, MessageSquare, User } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { getUserInfo } from '../utils/auth';
import { recrutamentoService, type Recrutamento } from '../services/recrutamento.service';
import { n8nService } from '../services/n8n.service';

export function RecruitmentSection() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    idade: '',
    cidade: '',
    experiencia: '',
    equipamento: '',
    disponibilidade: '',
    motivacao: '',
    instagram: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [myRecrutamento, setMyRecrutamento] = useState<Recrutamento | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<{ nome: boolean; email: boolean }>({
    nome: false,
    email: false,
  });

  // Função para aplicar máscara de telefone brasileiro
  const maskPhoneBR = (value: string) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!ddd) return '';
    // 11 dígitos -> (99) 99999-9999 | 10 dígitos -> (99) 9999-9999
    if (rest.length > 5) {
      if (digits.length === 11) {
        const p1 = rest.slice(0, 5);
        const p2 = rest.slice(5, 9);
        return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
      }
    }
    const p1 = rest.slice(0, 4);
    const p2 = rest.slice(4, 8);
    return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
  };

  const loadMyRecrutamento = async () => {
    try {
      setLoadingStatus(true);
      const response = await recrutamentoService.getMyRecrutamento();
      if (response.success) {
        setMyRecrutamento(response.data);
      }
    } catch (error: any) {
      // Se não encontrar recrutamento, não é erro (usuário ainda não se inscreveu)
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar status do recrutamento:', error);
      }
      setMyRecrutamento(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Preencher dados do usuário logado e carregar status do recrutamento
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getUserInfo();
        if (user && !userLoaded) {
          setIsLoggedIn(true);
          const hasName = !!user.name;
          const hasEmail = !!user.email;
          setFormData(prev => ({
            ...prev,
            nome: user.name || prev.nome,
            email: user.email || prev.email,
          }));
          setAutoFilledFields({
            nome: hasName,
            email: hasEmail,
          });
          setUserLoaded(true);
          // Carregar status do recrutamento
          loadMyRecrutamento();
        } else {
          setUserLoaded(true);
        }
      } catch (error) {
        // Usuário não está logado, continua normalmente
        setUserLoaded(true);
      }
    };
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscara de telefone
    if (name === 'telefone') {
      const maskedValue = maskPhoneBR(value);
      setFormData({
        ...formData,
        telefone: maskedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Remover máscara do telefone antes de enviar
      const telefoneSemMascara = formData.telefone.replace(/\D/g, '');
      
      const response = await recrutamentoService.create({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: telefoneSemMascara || undefined,
        idade: formData.idade ? parseInt(formData.idade) : undefined,
        cidade: formData.cidade.trim() || undefined,
        experiencia: formData.experiencia.trim() || undefined,
        equipamento: formData.equipamento.trim() || undefined,
        disponibilidade: formData.disponibilidade.trim() || undefined,
        motivacao: formData.motivacao.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
      });

      if (response.success) {
        setSubmitted(true);
        toast.success('Formulário enviado com sucesso! Um email de confirmação foi enviado.');

        // Enviar emails via n8n para o candidato e para a equipe
        const recrutamentoCriado = response.data;
        n8nService.enviarEmailNovoRecrutamento({
          tipo: 'novo_recrutamento',
          recrutamento: {
            id: recrutamentoCriado.id,
            nome: recrutamentoCriado.nome,
            email: recrutamentoCriado.email,
            telefone: recrutamentoCriado.telefone || null,
            responsavel: recrutamentoCriado.responsavel || null,
          },
        }).catch((error) => {
          console.warn('Erro ao enviar email de recrutamento:', error);
        });

        // Recarregar status do recrutamento
        if (isLoggedIn) {
          loadMyRecrutamento();
        }

        // Reset form após 5 segundos
        setTimeout(async () => {
          // Se os campos foram preenchidos automaticamente, restaurar os valores
          try {
            const user = await getUserInfo();
            if (user && autoFilledFields.nome && autoFilledFields.email) {
              setFormData({
                nome: user.name || '',
                email: user.email || '',
                telefone: '',
                idade: '',
                cidade: '',
                experiencia: '',
                equipamento: '',
                disponibilidade: '',
                motivacao: '',
                instagram: '',
              });
            } else {
              setFormData({
                nome: '',
                email: '',
                telefone: '',
                idade: '',
                cidade: '',
                experiencia: '',
                equipamento: '',
                disponibilidade: '',
                motivacao: '',
                instagram: '',
              });
            }
          } catch {
            setFormData({
              nome: '',
              email: '',
              telefone: '',
              idade: '',
              cidade: '',
              experiencia: '',
              equipamento: '',
              disponibilidade: '',
              motivacao: '',
              instagram: '',
            });
          }
          setSubmitted(false);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro ao enviar formulário: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    'Ter no mínimo 18 anos de idade',
    'Possuir equipamento básico de airsoft (réplica, proteção, uniforme)',
    'Disponibilidade para participar de treinamentos aos domingos',
    'Comprometimento com fair play e segurança',
    'Respeito às regras e hierarquia da equipe',
    'Espírito de equipe e camaradagem',
  ];

  const recruitmentProcess = [
    {
      step: '1',
      title: 'Inscrição',
      description: 'Preencha o formulário de interesse com suas informações',
    },
    {
      step: '2',
      title: 'Avaliação',
      description: 'Análise do perfil e contato inicial da equipe',
    },
    {
      step: '3',
      title: 'Período Q&A',
      description: '3 semanas de participação em treinamentos e jogos',
    },
    {
      step: '4',
      title: 'Votação',
      description: 'Aprovação pelos membros permanentes (mínimo 50%)',
    },
    {
      step: '5',
      title: 'Integração',
      description: 'Boas-vindas oficial e uniforme GOST',
    },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-amber-600/20 rounded-full border-2 border-amber-500/50">
              <UserPlus className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4 px-2">Recrutamento GOST</h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-2">
            Junte-se à nossa equipe de elite e faça parte de operações táticas de alto nível
          </p>
        </div>

        {/* Requirements */}
        <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6">Requisitos Básicos</h2>
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-sm sm:text-base text-gray-300">{req}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Status do Meu Recrutamento */}
        {isLoggedIn && (
          <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl text-white">Status do Seu Recrutamento</h2>
              <Button
                onClick={loadMyRecrutamento}
                disabled={loadingStatus}
                variant="outline"
                size="sm"
                className="sm:w-auto h-8 px-2 text-xs"
              >
                {loadingStatus ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Atualizar</span>
                  </>
                )}
              </Button>
            </div>
            {loadingStatus ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                <span className="ml-2 text-gray-400">Carregando status...</span>
              </div>
            ) : myRecrutamento ? (
              <MyRecrutamentoStatus recrutamento={myRecrutamento} />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">Você ainda não possui uma inscrição ativa.</p>
                <p className="text-sm text-gray-500 mt-2">Preencha o formulário abaixo para se inscrever.</p>
              </div>
            )}
          </Card>
        )}

        {/* Process */}
        <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6">Processo de Recrutamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {recruitmentProcess.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <span className="text-sm sm:text-base text-amber-500">{item.step}</span>
                </div>
                <h3 className="text-sm sm:text-base text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        {(!myRecrutamento || myRecrutamento.status === 'reprovado' || myRecrutamento.status === 'cancelado') && (
          <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
            <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6">Formulário de Interesse</h2>

            {submitted ? (
              <div className="text-center py-8 sm:py-12">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl text-white mb-2">Formulário Enviado!</h3>
                <p className="text-sm sm:text-base text-gray-400 px-2">
                  Obrigado pelo seu interesse. Analisaremos sua inscrição e entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="nome" className="text-gray-300">Nome Completo *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      disabled={autoFilledFields.nome}
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={autoFilledFields.email}
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-gray-300">Telefone *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                      placeholder="(00) 00000-0000"
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idade" className="text-gray-300">Idade *</Label>
                    <Input
                      id="idade"
                      name="idade"
                      type="number"
                      min="18"
                      value={formData.idade}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      type="text"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@seu_usuario"
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade" className="text-gray-300">Cidade *</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experiencia" className="text-gray-300">Tempo de Experiência em Airsoft *</Label>
                    <Input
                      id="experiencia"
                      name="experiencia"
                      placeholder="Ex: 2 anos ou 3 meses"
                      value={formData.experiencia}
                      onChange={handleChange}
                      required
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Informe em anos ou meses (ex: "2 anos", "6 meses", "1 ano e 3 meses")</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="equipamento" className="text-gray-300">Equipamento que Possui *</Label>
                  <Textarea
                    id="equipamento"
                    name="equipamento"
                    value={formData.equipamento}
                    onChange={handleChange}
                    required
                    placeholder="Descreva seu equipamento (réplicas, proteção, uniforme, etc.)"
                    rows={3}
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="disponibilidade" className="text-gray-300">Disponibilidade *</Label>
                  <Textarea
                    id="disponibilidade"
                    name="disponibilidade"
                    value={formData.disponibilidade}
                    onChange={handleChange}
                    required
                    placeholder="Quando você está disponível para treinar e jogar?"
                    rows={3}
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="motivacao" className="text-gray-300">Por que deseja entrar para o GOST? *</Label>
                  <Textarea
                    id="motivacao"
                    name="motivacao"
                    value={formData.motivacao}
                    onChange={handleChange}
                    required
                    placeholder="Conte-nos sua motivação e o que espera da equipe"
                    rows={4}
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Inscrição
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        )}

        {/* Mensagem se já tem recrutamento ativo */}
        {myRecrutamento && myRecrutamento.status === 'ativo' && (
          <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
            <div className="text-center">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl text-white mb-2 px-2">Você já possui uma inscrição ativa</h2>
              <p className="text-sm sm:text-base text-gray-400 px-2">
                Acompanhe o status do seu processo de recrutamento acima.
                Você será notificado por email sobre atualizações em cada etapa.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente para mostrar o status do próprio recrutamento
function MyRecrutamentoStatus({ recrutamento }: { recrutamento: Recrutamento }) {
  const etapas = [
    { key: 'inscricao' as const, nome: 'Inscrição', descricao: 'Formulário enviado e analisado' },
    { key: 'avaliacao' as const, nome: 'Avaliação', descricao: 'Análise do perfil e contato inicial' },
    { key: 'qa' as const, nome: 'Período Q&A', descricao: '3 semanas de participação em treinamentos' },
    { key: 'votacao' as const, nome: 'Votação', descricao: 'Aprovação pelos membros do comando' },
    { key: 'integracao' as const, nome: 'Integração', descricao: 'Boas-vindas oficial e uniforme GOST' },
  ];

  const getEtapaStatus = (etapa: typeof etapas[0]['key']) => {
    return recrutamento[`etapa_${etapa}` as keyof Recrutamento] as 'pendente' | 'aprovado' | 'reprovado';
  };

  const getEtapaObservacoes = (etapa: typeof etapas[0]['key']) => {
    return recrutamento[`observacoes_${etapa}` as keyof Recrutamento] as string | null | undefined;
  };

  const getStatusIcon = (status: 'pendente' | 'aprovado' | 'reprovado') => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'reprovado':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pendente' | 'aprovado' | 'reprovado') => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/50 text-xs">Aprovado</Badge>;
      case 'reprovado':
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/50 text-xs">Reprovado</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 text-xs">Pendente</Badge>;
    }
  };

  const getCurrentEtapa = () => {
    // Encontra a primeira etapa pendente ou a última aprovada
    for (let i = 0; i < etapas.length; i++) {
      const status = getEtapaStatus(etapas[i].key);
      if (status === 'pendente') {
        return i;
      }
      if (status === 'reprovado') {
        return i; // Para na primeira reprovada
      }
    }
    return etapas.length - 1; // Todas aprovadas
  };

  const currentEtapaIndex = getCurrentEtapa();
  const statusGeral = recrutamento.status;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Geral */}
      <div className="text-center p-3 sm:p-4 bg-gray-900/50 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            {statusGeral === 'aprovado' && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
            {statusGeral === 'reprovado' && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
            {statusGeral === 'ativo' && <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />}
            <h3 className="text-lg sm:text-xl text-white">
              Status: {statusGeral === 'aprovado' ? 'Aprovado' : statusGeral === 'reprovado' ? 'Reprovado' : 'Em Andamento'}
            </h3>
          </div>
        </div>
        {recrutamento.responsavel && (
          <p className="text-xs sm:text-sm text-gray-400 mt-2 px-2">
            Responsável: <span className="text-amber-400">{recrutamento.responsavel.name}</span>
          </p>
        )}
      </div>

      {/* Etapas */}
      <div className="space-y-3 sm:space-y-4">
        {etapas.map((etapa, index) => {
          const status = getEtapaStatus(etapa.key);
          const observacoes = getEtapaObservacoes(etapa.key);
          const isCurrent = index === currentEtapaIndex;
          const isCompleted = status === 'aprovado';
          const isRejected = status === 'reprovado';
          const isPending = status === 'pendente';

          return (
            <div
              key={etapa.key}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${isCurrent && !isRejected
                  ? 'bg-amber-600/20 border-amber-500/50'
                  : isCompleted
                    ? 'bg-green-600/10 border-green-500/30'
                    : isRejected
                      ? 'bg-red-600/10 border-red-500/30'
                      : 'bg-gray-900/50 border-gray-700/50'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                        ? 'bg-green-600/20 border-2 border-green-500'
                        : isRejected
                          ? 'bg-red-600/20 border-2 border-red-500'
                          : isCurrent
                            ? 'bg-amber-600/20 border-2 border-amber-500'
                            : 'bg-gray-700/50 border-2 border-gray-600'
                      }`}
                  >
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <h4 className="text-sm sm:text-base text-white font-semibold">{etapa.nome}</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {getStatusBadge(status)}
                        {isCurrent && !isRejected && (
                          <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/50 text-xs">
                            Etapa Atual
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">{etapa.descricao}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {observacoes && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-900/50 rounded border-l-4 border-amber-500/50">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-amber-400 mb-1">Observações:</p>
                      <p className="text-xs sm:text-sm text-gray-300 break-words">{observacoes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Votos (se na etapa de votação) */}
              {etapa.key === 'votacao' && recrutamento.votos && Object.keys(recrutamento.votos).length > 0 && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-900/50 rounded">
                  <p className="text-xs text-gray-400 mb-2">Votos registrados:</p>
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    {Object.entries(recrutamento.votos).map(([userId, voto]) => (
                      <Badge
                        key={userId}
                        className={`text-xs ${voto === 'aprovado' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}
                      >
                        {voto === 'aprovado' ? '✓' : '✗'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensagem de conclusão */}
      {statusGeral === 'aprovado' && (
        <div className="p-3 sm:p-4 bg-green-600/20 border-2 border-green-500/50 rounded-lg text-center">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg sm:text-xl text-white mb-2">Parabéns!</h3>
          <p className="text-sm sm:text-base text-gray-300 px-2">
            Você foi aprovado em todas as etapas! Em breve entraremos em contato para finalizar sua integração ao GOST.
          </p>
        </div>
      )}

      {statusGeral === 'reprovado' && (
        <div className="p-3 sm:p-4 bg-red-600/20 border-2 border-red-500/50 rounded-lg text-center">
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg sm:text-xl text-white mb-2">Processo Finalizado</h3>
          <p className="text-sm sm:text-base text-gray-300 px-2">
            Infelizmente seu processo de recrutamento foi reprovado. Você pode tentar novamente no futuro.
          </p>
        </div>
      )}
    </div>
  );
}
