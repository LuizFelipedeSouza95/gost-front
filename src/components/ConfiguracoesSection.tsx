import React, { useState, useEffect } from 'react';
import { Users, UsersRound, Building2, Shield, Edit, Trash2, Plus, Save, X, FileText, ChevronDown, ChevronUp, UserPlus, Newspaper, Loader2, Calendar, User, Tag, Handshake, Mail, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { usuariosService, type Usuario } from '../services/usuarios.service';
import { squadsService, type Squad, type SquadCreateUpdateData } from '../services/squads.service';
import { equipeService, type EquipeInfo } from '../services/equipe.service';
import { estatutoService, type EstatutoInfo, type EstatutoTopic } from '../services/estatuto.service';
import { noticiasService, type Noticia } from '../services/noticias.service';
import { parceirosService, type Parceiro } from '../services/parceiros.service';
import { getUserInfo } from '../utils/auth';

export function ConfiguracoesSection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [equipe, setEquipe] = useState<EquipeInfo>({
    nome: 'GOST',
    significado_nome: null,
    objetivo: 'Operações Especiais de Airsoft',
    data_criacao: '2020-01-01',
    descricao: 'Ghost Operations Special Team',
    logo_url: null,
    email: null,
    telefone: null,
    endereco: null,
    cidade: null,
    estado: null,
    instagram_url: null,
    whatsapp_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [editingUsuario, setEditingUsuario] = useState<string | null>(null);
  const [creatingUsuario, setCreatingUsuario] = useState(false);
  const [editingSquad, setEditingSquad] = useState<string | null>(null);
  const [creatingSquad, setCreatingSquad] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState(false);
  const [estatuto, setEstatuto] = useState<EstatutoInfo | null>(null);
  const [editingEstatuto, setEditingEstatuto] = useState(false);
  const [equipeEmail, setEquipeEmail] = useState('');
  const [equipeWhatsapp, setEquipeWhatsapp] = useState('');
  const [editingContatoEquipe, setEditingContatoEquipe] = useState(false);

  useEffect(() => {
    checkAdmin();
    loadData();
    loadContatoEquipe();
  }, []);

  const loadContatoEquipe = () => {
    // Carrega email e WhatsApp da equipe do localStorage
    const email = localStorage.getItem('equipe_email') || '';
    const whatsapp = localStorage.getItem('equipe_whatsapp') || '';
    setEquipeEmail(email);
    setEquipeWhatsapp(whatsapp);
  };

  const saveContatoEquipe = (email: string, whatsapp: string) => {
    localStorage.setItem('equipe_email', email);
    localStorage.setItem('equipe_whatsapp', whatsapp);
    setEquipeEmail(email);
    setEquipeWhatsapp(whatsapp);
    setEditingContatoEquipe(false);
    toast.success('Contatos da equipe salvos com sucesso!');
  };

  const checkAdmin = async () => {
    try {
      const user = await getUserInfo();
      if (user && user.roles && user.roles.includes('admin')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
        // Redireciona para início após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosRes, squadsRes, equipeRes, estatutoRes] = await Promise.all([
        usuariosService.list(1, 100),
        squadsService.list(),
        equipeService.get(),
        estatutoService.get()
      ]);

      if (usuariosRes.success) {
        setUsuarios(usuariosRes.data || []);
      }
      if (squadsRes.success) {
        setSquads(squadsRes.data || []);
      }
      if (equipeRes.success && equipeRes.data) {
        setEquipe({
          ...equipeRes.data,
          data_criacao: equipeRes.data.data_criacao
            ? new Date(equipeRes.data.data_criacao).toISOString().split('T')[0]
            : '2020-01-01'
        });
      }
      if (estatutoRes.success && estatutoRes.data) {
        setEstatuto(estatutoRes.data);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsuario = async (id: string, data: Partial<Usuario>) => {
    try {
      const response = await usuariosService.update(id, data);
      if (response.success) {
        toast.success('Usuário atualizado com sucesso!');
        setEditingUsuario(null);
        // Recarrega dados imediatamente
        await loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleCreateUsuario = async (data: Partial<Usuario> & { squad_id?: string | null }) => {
    try {
      const response = await usuariosService.create(data);
      if (response.success) {
        toast.success('Usuário criado com sucesso!');
        setCreatingUsuario(false);
        // Recarrega dados imediatamente
        await loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleUpdateSquad = async (id: string, data: SquadCreateUpdateData) => {
    try {
      const response = await squadsService.update(id, data);
      if (response.success) {
        toast.success('Squad atualizado com sucesso!');
        setEditingSquad(null);
        // Recarrega dados imediatamente
        await loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar squad: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDeleteSquad = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este squad?')) return;

    try {
      const response = await squadsService.delete(id);
      if (response.success) {
        toast.success('Squad deletado com sucesso!');
        // Recarrega dados imediatamente
        await loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao deletar squad: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleCreateSquad = async (data: SquadCreateUpdateData) => {
    try {
      const response = await squadsService.create({ 
        nome: data.nome || '', 
        ativo: data.ativo ?? true,
        descricao: data.descricao || '',
        comandante_id: data.comandante_id || null,
        membros_ids: data.membros_ids || []
      });
      if (response.success) {
        toast.success('Squad criado com sucesso!');
        setCreatingSquad(false);
        // Recarrega dados imediatamente
        await loadData();
      }
    } catch (error: any) {
      toast.error('Erro ao criar squad: ' + (error.message || 'Erro desconhecido'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <Card className="p-8 bg-gray-800/50 border-amber-600/30 max-w-md">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-400">Apenas administradores podem acessar esta página.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Configurações</h1>
          <p className="text-gray-400">Gestão do sistema GOST</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <style>{`
            [data-slot="tabs-trigger"] {
              color: white !important;
            }
            [data-slot="tabs-trigger"][data-state="active"] {
              color: black !important;
            }
          `}</style>
          <div className="flex justify-center mb-8 h-[56px] overflow-x-auto">
            <TabsList className="flex flex-col sm:flex-row w-full max-w-4xl mx-auto gap-2 sm:gap-2 bg-gray-800/80 backdrop-blur-sm border-2 border-amber-600/30 rounded-xl shadow-lg h-[56px] p-1 min-w-fit">
              <TabsTrigger value="usuarios" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <Users className="w-4 h-4 sm:w-4 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="squads" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <UsersRound className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Squads</span>
              </TabsTrigger>
              <TabsTrigger value="equipe" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <Building2 className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Equipe</span>
              </TabsTrigger>
              <TabsTrigger value="estatuto" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <FileText className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Estatuto</span>
              </TabsTrigger>
              <TabsTrigger value="recrutamento" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <Shield className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Recrutamentos</span>
              </TabsTrigger>
              <TabsTrigger value="noticias" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <Newspaper className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Notícias</span>
              </TabsTrigger>
              <TabsTrigger value="parceiros" className="flex-1 min-w-0 sm:min-w-[100px] h-full text-xs sm:text-sm">
                <Handshake className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Parceiros</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Gestão de Usuários */}
          <TabsContent value="usuarios">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Gestão de Usuários</h2>
                {!creatingUsuario && (
                  <Button onClick={() => setCreatingUsuario(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {creatingUsuario && (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <UsuarioCreateForm
                      squads={squads}
                      onSave={handleCreateUsuario}
                      onCancel={() => setCreatingUsuario(false)}
                    />
                  </div>
                )}
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    {editingUsuario === usuario.id ? (
                      <UsuarioEditForm
                        usuario={usuario}
                        onSave={(data) => {
                          handleUpdateUsuario(usuario.id, data);
                        }}
                        onCancel={() => setEditingUsuario(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">
                              {usuario.name || usuario.email}
                            </h3>
                            {usuario.roles?.includes('admin') && (
                              <Badge className="bg-red-600/20 text-red-400 border-red-500/50">
                                Admin
                              </Badge>
                            )}
                            {usuario.active ? (
                              <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{usuario.email}</p>
                          {usuario.nome_guerra && (
                            <p className="text-sm text-amber-400">Nome de Guerra: {usuario.nome_guerra}</p>
                          )}
                          {usuario.patent && (
                            <p className="text-sm text-gray-300">Patente: {usuario.patent}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => setEditingUsuario(usuario.id)}
                          className="ml-4"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Gestão de Squads */}
          <TabsContent value="squads">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Gestão de Squads</h2>
                {!creatingSquad && (
                  <Button onClick={() => setCreatingSquad(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Squad
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {creatingSquad && (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <SquadCreateForm
                      usuarios={usuarios}
                      onSave={handleCreateSquad}
                      onCancel={() => setCreatingSquad(false)}
                    />
                  </div>
                )}
                {squads.map((squad) => (
                  <div
                    key={squad.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    {editingSquad === squad.id ? (
                      <SquadEditForm
                        squad={squad}
                        usuarios={usuarios}
                        onSave={(data) => {
                          handleUpdateSquad(squad.id, data);
                        }}
                        onCancel={() => setEditingSquad(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">{squad.nome}</h3>
                            {squad.ativo ? (
                              <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          {squad.descricao && (
                            <p className="text-sm text-gray-400">{squad.descricao}</p>
                          )}
                          {squad.comandante && (
                            <p className="text-sm text-amber-400 mt-1">
                              Comandante: {squad.comandante.nome_guerra || squad.comandante.name || squad.comandante.email}
                            </p>
                          )}
                          {squad.membros && (
                            <p className="text-sm text-gray-300 mt-1">
                              {squad.membros.length} membro(s)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingSquad(squad.id)}
                            variant="outline"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteSquad(squad.id)}
                            variant="outline"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Gestão da Equipe */}
          <TabsContent value="equipe">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Gestão da Equipe</h2>
                {!editingEquipe && (
                  <Button onClick={() => setEditingEquipe(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
              {editingEquipe ? (
                <EquipeEditForm
                  equipe={equipe}
                  onSave={async (data) => {
                    try {
                      const response = await equipeService.createOrUpdate(data);
                      if (response.success) {
                        setEquipe({
                          ...response.data,
                          data_criacao: response.data.data_criacao
                            ? new Date(response.data.data_criacao).toISOString().split('T')[0]
                            : data.data_criacao || '2020-01-01'
                        });
                        setEditingEquipe(false);
                        toast.success('Informações da equipe atualizadas!');
                        // Recarrega todos os dados para garantir sincronização
                        loadData();
                      }
                    } catch (error: any) {
                      toast.error('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
                    }
                  }}
                  onCancel={() => setEditingEquipe(false)}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Nome da Equipe</label>
                    <p className="text-white text-lg">{equipe.nome}</p>
                  </div>
                  {equipe.significado_nome && (
                    <div>
                      <label className="text-sm text-gray-400">Significado do Nome</label>
                      <p className="text-white">{equipe.significado_nome}</p>
                    </div>
                  )}
                  {equipe.objetivo && (
                    <div>
                      <label className="text-sm text-gray-400">Objetivo</label>
                      <p className="text-white">{equipe.objetivo}</p>
                    </div>
                  )}
                  {equipe.data_criacao && (
                    <div>
                      <label className="text-sm text-gray-400">Data de Criação</label>
                      <p className="text-white">{new Date(equipe.data_criacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  {equipe.descricao && (
                    <div>
                      <label className="text-sm text-gray-400">Descrição</label>
                      <p className="text-white">{equipe.descricao}</p>
                    </div>
                  )}
                  {equipe.logo_url && (
                    <div>
                      <label className="text-sm text-gray-400">Logo</label>
                      <img src={equipe.logo_url} alt="Logo da equipe" className="mt-2 max-w-xs rounded" />
                    </div>
                  )}
                  {equipe.email && (
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{equipe.email}</p>
                    </div>
                  )}
                  {equipe.telefone && (
                    <div>
                      <label className="text-sm text-gray-400">Telefone</label>
                      <p className="text-white">{equipe.telefone}</p>
                    </div>
                  )}
                  {equipe.endereco && (
                    <div>
                      <label className="text-sm text-gray-400">Endereço</label>
                      <p className="text-white">{equipe.endereco}</p>
                    </div>
                  )}
                  {(equipe.cidade || equipe.estado) && (
                    <div>
                      <label className="text-sm text-gray-400">Localização</label>
                      <p className="text-white">
                        {[equipe.cidade, equipe.estado].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                  {equipe.instagram_url && (
                    <div>
                      <label className="text-sm text-gray-400">Instagram</label>
                      <p className="text-white">
                        <a href={equipe.instagram_url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                          {equipe.instagram_url}
                        </a>
                      </p>
                    </div>
                  )}
                  {equipe.whatsapp_url && (
                    <div>
                      <label className="text-sm text-gray-400">WhatsApp</label>
                      <p className="text-white">
                        <a href={equipe.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                          {equipe.whatsapp_url}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Gestão de Estatuto */}
          <TabsContent value="estatuto">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Gestão de Estatuto</h2>
                {!editingEstatuto && (
                  <Button onClick={() => setEditingEstatuto(true)}>
                    {estatuto ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Estatuto
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Estatuto
                      </>
                    )}
                  </Button>
                )}
              </div>

              {editingEstatuto ? (
                <EstatutoEditForm
                  estatuto={estatuto}
                  onSave={async (data) => {
                    try {
                      const response = await estatutoService.createOrUpdate(data);
                      if (response.success) {
                        setEstatuto(response.data);
                        setEditingEstatuto(false);
                        toast.success('Estatuto salvo com sucesso!');
                        // Recarrega todos os dados para garantir sincronização
                        loadData();
                      }
                    } catch (error: any) {
                      toast.error('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
                    }
                  }}
                  onCancel={() => setEditingEstatuto(false)}
                />
              ) : estatuto ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Título</label>
                    <p className="text-white text-lg">{estatuto.titulo}</p>
                  </div>
                  {estatuto.descricao && (
                    <div>
                      <label className="text-sm text-gray-400">Descrição</label>
                      <p className="text-white">{estatuto.descricao}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400">Tópicos</label>
                    <p className="text-white">{estatuto.conteudo?.topics?.length || 0} tópico(s) cadastrado(s)</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Nenhum estatuto cadastrado ainda.</p>
                  <Button onClick={() => setEditingEstatuto(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Estatuto
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Gestão de Recrutamentos */}
          <TabsContent value="recrutamento">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Gestão de Recrutamentos</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Gerencie os processos de recrutamento, etapas e votações.
              </p>
              
              {/* Configuração de Contato da Equipe */}
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white mb-1">Contatos da Equipe</h3>
                    <p className="text-sm text-gray-400">
                      Email e WhatsApp usados para notificações de recrutamento
                    </p>
                  </div>
                  {!editingContatoEquipe && (
                    <Button
                      onClick={() => setEditingContatoEquipe(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>

                {editingContatoEquipe ? (
                  <ContatoEquipeForm
                    email={equipeEmail}
                    whatsapp={equipeWhatsapp}
                    onSave={saveContatoEquipe}
                    onCancel={() => setEditingContatoEquipe(false)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">Email:</span>{' '}
                        {equipeEmail || <span className="text-gray-500 italic">Não configurado</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">WhatsApp:</span>{' '}
                        {equipeWhatsapp || <span className="text-gray-500 italic">Não configurado</span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  Acesse a página de gerenciamento de recrutamentos para visualizar candidatos, 
                  gerenciar etapas do processo, atribuir responsáveis e registrar votos.
                </p>
                <Button
                  onClick={() => {
                    // Dispara evento customizado para mudar a seção
                    window.dispatchEvent(new CustomEvent('changeSection', { detail: 'recrutamento-admin' }));
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Abrir Gerenciamento de Recrutamentos
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Gestão de Notícias */}
          <TabsContent value="noticias">
            <NoticiasManagement />
          </TabsContent>

          {/* Gestão de Parceiros */}
          <TabsContent value="parceiros">
            <ParceirosManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente de Gestão de Notícias
function NoticiasManagement() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadNoticias();
  }, []);

  const loadNoticias = async () => {
    try {
      setLoading(true);
      const response = await noticiasService.list(undefined, undefined);
      if (response.success) {
        setNoticias(response.data);
        // Extrair categorias únicas
        const uniqueCategories = Array.from(
          new Set(response.data.map(n => n.categoria).filter(Boolean) as string[])
        );
        setCategories(uniqueCategories.sort());
      }
    } catch (error: any) {
      console.error('Erro ao carregar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await noticiasService.delete(id);
      if (response.success) {
        toast.success('Notícia excluída com sucesso!');
        loadNoticias();
      }
    } catch (error: any) {
      toast.error('Erro ao excluir notícia: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (noticia: Noticia) => {
    setEditingNoticia(noticia);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingNoticia(null);
    setShowEditModal(true);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category?: string | null) => {
    if (!category) return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    switch (category) {
      case 'Conquistas':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 'Treinamento':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
      case 'Parcerias':
        return 'bg-green-600/20 text-green-400 border-green-500/50';
      case 'Infraestrutura':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/50';
      case 'Recrutamento':
        return 'bg-red-600/20 text-red-400 border-red-500/50';
      case 'Tutoriais':
        return 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gray-800/50 border-amber-600/30">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <span className="ml-2 text-gray-400">Carregando notícias...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 border-amber-600/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl text-white mb-2">Gestão de Notícias</h2>
          <p className="text-sm text-gray-400">
            Crie, edite e exclua notícias do site
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      {noticias.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Nenhuma notícia cadastrada ainda.</p>
          <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Notícia
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {noticias.map((noticia) => (
            <div
              key={noticia.id}
              className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-amber-500/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    {noticia.imagem_url && (
                      <img
                        src={noticia.imagem_url}
                        alt={noticia.titulo}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-semibold text-sm sm:text-base">{noticia.titulo}</h3>
                        {noticia.categoria && (
                          <Badge className={`${getCategoryColor(noticia.categoria)} border text-xs`}>
                            {noticia.categoria}
                          </Badge>
                        )}
                        {noticia.publicado ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/50 text-xs">
                            Publicado
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 text-xs">
                            Rascunho
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">
                        {noticia.resumo || noticia.conteudo.substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {noticia.autor_nome && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{noticia.autor_nome}</span>
                          </div>
                        )}
                        {noticia.data_publicacao && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(noticia.data_publicacao)}</span>
                          </div>
                        )}
                        <span>Visualizações: {noticia.visualizacoes}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(noticia)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(noticia.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-red-400 border-red-500/50 hover:bg-red-600/20"
                    disabled={deletingId === noticia.id}
                  >
                    {deletingId === noticia.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar Notícia */}
      {showEditModal && (
        <NoticiaEditModal
          noticia={editingNoticia}
          onClose={() => {
            setShowEditModal(false);
            setEditingNoticia(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingNoticia(null);
            loadNoticias();
          }}
          categories={categories}
        />
      )}
    </Card>
  );
}

// Componente Modal para Criar/Editar Notícia
function NoticiaEditModal({
  noticia,
  onClose,
  onSuccess,
  categories
}: {
  noticia: Noticia | null;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}) {
  const [titulo, setTitulo] = useState(noticia?.titulo || '');
  const [conteudo, setConteudo] = useState(noticia?.conteudo || '');
  const [resumo, setResumo] = useState(noticia?.resumo || '');
  const [imagemUrl, setImagemUrl] = useState(noticia?.imagem_url || '');
  const [categoria, setCategoria] = useState(noticia?.categoria || '');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [tags, setTags] = useState(noticia?.tags?.join(', ') || '');
  const [publicado, setPublicado] = useState(noticia?.publicado ?? true);
  const [destaque, setDestaque] = useState(noticia?.destaque ?? false);
  const [saving, setSaving] = useState(false);

  // Categorias pré-definidas
  const categoriasPredefinidas = [
    'Conquistas',
    'Treinamento',
    'Parcerias',
    'Infraestrutura',
    'Recrutamento',
    'Tutoriais',
    'Eventos',
    'Torneios',
    'Geral'
  ];

  useEffect(() => {
    if (noticia) {
      setTitulo(noticia.titulo || '');
      setConteudo(noticia.conteudo || '');
      setResumo(noticia.resumo || '');
      setImagemUrl(noticia.imagem_url || '');
      setCategoria(noticia.categoria || '');
      setTags(noticia.tags?.join(', ') || '');
      setPublicado(noticia.publicado ?? true);
      setDestaque(noticia.destaque ?? false);
      setMostrarNovaCategoria(false);
      setNovaCategoria('');
    } else {
      setTitulo('');
      setConteudo('');
      setResumo('');
      setImagemUrl('');
      setCategoria('');
      setTags('');
      setPublicado(true);
      setDestaque(false);
      setMostrarNovaCategoria(false);
      setNovaCategoria('');
    }
  }, [noticia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      // Usar nova categoria se estiver preenchendo, senão usar a categoria selecionada
      const categoriaFinal = mostrarNovaCategoria && novaCategoria.trim() 
        ? novaCategoria.trim() 
        : categoria || null;
      
      if (noticia) {
        // Editar
        await noticiasService.update(noticia.id, {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          resumo: resumo.trim() || null,
          imagem_url: imagemUrl.trim() || null,
          categoria: categoriaFinal,
          tags: tagsArray,
          publicado,
          destaque,
        });
        toast.success('Notícia atualizada com sucesso!');
      } else {
        // Criar
        await noticiasService.create({
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          resumo: resumo.trim() || null,
          imagem_url: imagemUrl.trim() || null,
          categoria: categoriaFinal,
          tags: tagsArray,
          publicado,
          destaque,
        });
        toast.success('Notícia criada com sucesso!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao salvar notícia: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl text-white font-bold">
              {noticia ? 'Editar Notícia' : 'Nova Notícia'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Título da notícia"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Resumo</label>
              <textarea
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Resumo breve da notícia (opcional)"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Conteúdo *</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Conteúdo completo da notícia"
                rows={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">URL da Imagem</label>
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                {!mostrarNovaCategoria ? (
                  <div className="space-y-2">
                    <select
                      value={categoria}
                      onChange={(e) => {
                        if (e.target.value === 'nova') {
                          setMostrarNovaCategoria(true);
                          setCategoria('');
                        } else {
                          setCategoria(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoriasPredefinidas.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {categories.filter(cat => !categoriasPredefinidas.includes(cat)).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="nova" className="text-amber-500">+ Criar nova categoria</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="Nome da nova categoria"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarNovaCategoria(false);
                        setNovaCategoria('');
                      }}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publicado"
                  checked={publicado}
                  onChange={(e) => setPublicado(e.target.checked)}
                  className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-700 rounded"
                />
                <label htmlFor="publicado" className="text-sm text-gray-300">
                  Publicar imediatamente
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={destaque}
                  onChange={(e) => setDestaque(e.target.checked)}
                  className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-700 rounded"
                />
                <label htmlFor="destaque" className="text-sm text-gray-300">
                  Marcar como destaque
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {noticia ? 'Atualizar' : 'Criar'} Notícia
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Componente de edição de usuário
function UsuarioEditForm({
  usuario,
  onSave,
  onCancel,
}: {
  usuario: Usuario;
  onSave: (data: Partial<Usuario>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    roles: usuario.roles || ['user'],
    active: usuario.active ?? true,
    patent: usuario.patent || 'recruta',
    nome_guerra: usuario.nome_guerra || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Roles</label>
        <div className="flex gap-2 flex-wrap">
          {['user', 'admin', 'membro_oficial'].map((role) => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      roles: [...formData.roles, role],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      roles: formData.roles.filter((r) => r !== role),
                    });
                  }
                }}
                className="rounded"
              />
              <span className="text-white text-sm capitalize">{role.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Status</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded"
          />
          <span className="text-white text-sm">Ativo</span>
        </label>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Patente</label>
        <select
          value={formData.patent}
          onChange={(e) => setFormData({ ...formData, patent: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="recruta">Recruta</option>
          <option value="soldado">Soldado</option>
          <option value="sub_comando">Sub Comando</option>
          <option value="comando_squad">Comando Squad</option>
          <option value="comando">Comando</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome de Guerra</label>
        <input
          type="text"
          value={formData.nome_guerra}
          onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de criação de usuário
function UsuarioCreateForm({
  squads,
  onSave,
  onCancel,
}: {
  squads: Squad[];
  onSave: (data: Partial<Usuario> & { squad_id?: string | null }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nome_guerra: '',
    patent: 'recruta' as 'comando' | 'comando_squad' | 'soldado' | 'sub_comando' | 'recruta',
    roles: ['user'] as string[],
    active: true,
    squad_id: '' as string | '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('O email é obrigatório');
      return;
    }
    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      nome_guerra: formData.nome_guerra.trim() || undefined,
      patent: formData.patent,
      roles: formData.roles,
      active: formData.active,
      squad_id: formData.squad_id || null,
    });
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome de Guerra</label>
        <input
          type="text"
          value={formData.nome_guerra}
          onChange={(e) => setFormData({ ...formData, nome_guerra: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Patente</label>
        <select
          value={formData.patent}
          onChange={(e) => setFormData({ ...formData, patent: e.target.value as any })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="recruta">Recruta</option>
          <option value="soldado">Soldado</option>
          <option value="sub_comando">Sub Comando</option>
          <option value="comando_squad">Comando Squad</option>
          <option value="comando">Comando</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Roles</label>
        <div className="flex gap-2 flex-wrap">
          {['user', 'admin', 'membro_oficial'].map((role) => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded"
              />
              <span className="text-white text-sm capitalize">{role.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Squad</label>
        <select
          value={formData.squad_id}
          onChange={(e) => setFormData({ ...formData, squad_id: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">Nenhum</option>
          {squads.map((squad) => (
            <option key={squad.id} value={squad.id}>
              {squad.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded"
          />
          <span className="text-white text-sm">Ativo</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Criar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de edição de squad
function SquadEditForm({
  squad,
  usuarios,
  onSave,
  onCancel,
}: {
  squad: Squad;
  usuarios: Usuario[];
  onSave: (data: SquadCreateUpdateData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nome: squad.nome,
    descricao: squad.descricao || '',
    ativo: squad.ativo ?? true,
    comandante_id: squad.comandante?.id || '',
    membros_ids: squad.membros?.map((m: any) => m.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      comandante_id: formData.comandante_id || null,
    });
  };

  const toggleMembro = (usuarioId: string) => {
    setFormData(prev => ({
      ...prev,
      membros_ids: prev.membros_ids.includes(usuarioId)
        ? prev.membros_ids.filter(id => id !== usuarioId)
        : [...prev.membros_ids, usuarioId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Comandante</label>
        <select
          value={formData.comandante_id}
          onChange={(e) => setFormData({ ...formData, comandante_id: e.target.value })}
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

      <div>
        <label className="block text-sm text-gray-400 mb-2">Membros</label>
        <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-2 bg-gray-800/50">
          {usuarios.map((usuario) => (
            <label key={usuario.id} className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={formData.membros_ids.includes(usuario.id)}
                onChange={() => toggleMembro(usuario.id)}
                className="rounded"
              />
              <span className="text-white text-sm">
                {usuario.nome_guerra || usuario.name || usuario.email}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formData.membros_ids.length} membro(s) selecionado(s)
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="rounded"
          />
          <span className="text-white text-sm">Ativo</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de criação de squad
function SquadCreateForm({
  usuarios,
  onSave,
  onCancel,
}: {
  usuarios: Usuario[];
  onSave: (data: SquadCreateUpdateData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true,
    comandante_id: '',
    membros_ids: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error('O nome do squad é obrigatório');
      return;
    }
    onSave({
      ...formData,
      comandante_id: formData.comandante_id || null,
    });
  };

  const toggleMembro = (usuarioId: string) => {
    setFormData(prev => ({
      ...prev,
      membros_ids: prev.membros_ids.includes(usuarioId)
        ? prev.membros_ids.filter(id => id !== usuarioId)
        : [...prev.membros_ids, usuarioId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Comandante</label>
        <select
          value={formData.comandante_id}
          onChange={(e) => setFormData({ ...formData, comandante_id: e.target.value })}
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

      <div>
        <label className="block text-sm text-gray-400 mb-2">Membros</label>
        <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-2 bg-gray-800/50">
          {usuarios.map((usuario) => (
            <label key={usuario.id} className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={formData.membros_ids.includes(usuario.id)}
                onChange={() => toggleMembro(usuario.id)}
                className="rounded"
              />
              <span className="text-white text-sm">
                {usuario.nome_guerra || usuario.name || usuario.email}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formData.membros_ids.length} membro(s) selecionado(s)
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="rounded"
          />
          <span className="text-white text-sm">Ativo</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Criar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de edição de equipe
function EquipeEditForm({
  equipe,
  onSave,
  onCancel,
}: {
  equipe: EquipeInfo;
  onSave: (data: EquipeInfo) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(equipe);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome da Equipe</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Significado do Nome</label>
        <input
          type="text"
          value={formData.significado_nome || ''}
          onChange={(e) => setFormData({ ...formData, significado_nome: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="Ex: Ghost Operations Special Team"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Objetivo</label>
        <input
          type="text"
          value={formData.objetivo}
          onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Data de Criação</label>
        <input
          type="date"
          value={formData.data_criacao}
          onChange={(e) => setFormData({ ...formData, data_criacao: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={formData.descricao || ''}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">URL do Logo</label>
        <input
          type="url"
          value={formData.logo_url || ''}
          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="https://exemplo.com/logo.png"
        />
        {formData.logo_url && (
          <img 
            src={formData.logo_url} 
            alt="Preview do logo" 
            className="mt-2 max-w-xs rounded border border-gray-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="equipe@gosttactical.com.br"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Telefone</label>
          <input
            type="tel"
            value={formData.telefone || ''}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="(11) 98765-4321"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Endereço</label>
        <input
          type="text"
          value={formData.endereco || ''}
          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Cidade</label>
          <input
            type="text"
            value={formData.cidade || ''}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="São Paulo"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Estado</label>
          <input
            type="text"
            value={formData.estado || ''}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="SP"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">URL do Instagram</label>
          <input
            type="url"
            value={formData.instagram_url || ''}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="https://www.instagram.com/gost.operacional"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">URL do WhatsApp</label>
          <input
            type="url"
            value={formData.whatsapp_url || ''}
            onChange={(e) => setFormData({ ...formData, whatsapp_url: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de edição de estatuto
function EstatutoEditForm({
  estatuto,
  onSave,
  onCancel,
}: {
  estatuto: EstatutoInfo | null;
  onSave: (data: Partial<EstatutoInfo>) => void;
  onCancel: () => void;
}) {
  const iconOptions = [
    { value: 'Shield', label: 'Escudo' },
    { value: 'Users', label: 'Usuários' },
    { value: 'ClipboardCheck', label: 'Lista' },
    { value: 'Shirt', label: 'Camisa' },
    { value: 'Target', label: 'Alvo' },
    { value: 'Package', label: 'Pacote' },
  ];

  const defaultEstatuto: EstatutoInfo = {
    titulo: 'Estatuto de Conduta e Operação do GOST',
    descricao: 'Diretrizes oficiais e regulamentações da equipe',
    conteudo: {
      topics: []
    }
  };

  const [formData, setFormData] = useState<EstatutoInfo>(
    estatuto || defaultEstatuto
  );
  // Expande todos os tópicos por padrão se houver estatuto existente
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    new Set(estatuto?.conteudo?.topics?.map(t => t.id) || [])
  );

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const addTopic = () => {
    const newTopic: EstatutoTopic = {
      id: `topic_${Date.now()}`,
      icon: 'Shield',
      title: '',
      description: '',
      content: {
        sections: []
      }
    };
    setFormData({
      ...formData,
      conteudo: {
        topics: [...formData.conteudo.topics, newTopic]
      }
    });
    setExpandedTopics(new Set([...expandedTopics, newTopic.id]));
  };

  const removeTopic = (topicId: string) => {
    setFormData({
      ...formData,
      conteudo: {
        topics: formData.conteudo.topics.filter(t => t.id !== topicId)
      }
    });
    const newExpanded = new Set(expandedTopics);
    newExpanded.delete(topicId);
    setExpandedTopics(newExpanded);
  };

  const updateTopic = (topicId: string, updates: Partial<EstatutoTopic>) => {
    setFormData({
      ...formData,
      conteudo: {
        topics: formData.conteudo.topics.map(t =>
          t.id === topicId ? { ...t, ...updates } : t
        )
      }
    });
  };

  const addSection = (topicId: string) => {
    const newSection = {
      title: '',
      items: []
    };
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      updateTopic(topicId, {
        content: {
          sections: [...topic.content.sections, newSection]
        }
      });
    }
  };

  const removeSection = (topicId: string, sectionIndex: number) => {
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      updateTopic(topicId, {
        content: {
          sections: topic.content.sections.filter((_, i) => i !== sectionIndex)
        }
      });
    }
  };

  const updateSection = (topicId: string, sectionIndex: number, updates: Partial<{ title: string; items: any[] }>) => {
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      const sections = [...topic.content.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], ...updates };
      updateTopic(topicId, {
        content: {
          sections
        }
      });
    }
  };

  const addItem = (topicId: string, sectionIndex: number) => {
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      const sections = [...topic.content.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        items: [...sections[sectionIndex].items, { text: '' }]
      };
      updateTopic(topicId, {
        content: {
          sections
        }
      });
    }
  };

  const removeItem = (topicId: string, sectionIndex: number, itemIndex: number) => {
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      const sections = [...topic.content.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        items: sections[sectionIndex].items.filter((_, i) => i !== itemIndex)
      };
      updateTopic(topicId, {
        content: {
          sections
        }
      });
    }
  };

  const updateItem = (topicId: string, sectionIndex: number, itemIndex: number, updates: any) => {
    const topic = formData.conteudo.topics.find(t => t.id === topicId);
    if (topic) {
      const sections = [...topic.content.sections];
      const items = [...sections[sectionIndex].items];
      items[itemIndex] = { ...items[itemIndex], ...updates };
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        items
      };
      updateTopic(topicId, {
        content: {
          sections
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.titulo.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (formData.conteudo.topics.length === 0) {
      toast.error('Adicione pelo menos um tópico');
      return;
    }

    for (const topic of formData.conteudo.topics) {
      if (!topic.title.trim()) {
        toast.error('Todos os tópicos devem ter um título');
        return;
      }
      if (topic.content.sections.length === 0) {
        toast.error('Cada tópico deve ter pelo menos uma seção');
        return;
      }
      for (const section of topic.content.sections) {
        if (!section.title.trim()) {
          toast.error('Todas as seções devem ter um título');
          return;
        }
      }
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Gerais */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
        <h3 className="text-white text-lg mb-4">Informações Gerais</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título do Estatuto *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Ex: Estatuto de Conduta e Operação do GOST"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Descrição</label>
            <textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              rows={2}
              placeholder="Ex: Diretrizes oficiais e regulamentações da equipe"
            />
          </div>
        </div>
      </div>

      {/* Tópicos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg">Tópicos do Estatuto</h3>
          <Button type="button" onClick={addTopic} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tópico
          </Button>
        </div>

        {formData.conteudo.topics.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Nenhum tópico adicionado ainda</p>
            <p className="text-gray-500 text-sm mt-1">Clique em "Adicionar Tópico" para começar</p>
          </div>
        ) : (
          formData.conteudo.topics.map((topic, topicIndex) => (
            <div key={topic.id} className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors flex-1"
                >
                  {expandedTopics.has(topic.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    Tópico {topicIndex + 1}{topic.title ? `: ${topic.title}` : ''}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTopic(topic.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {expandedTopics.has(topic.id) && (
                <div className="space-y-4 mt-4 pl-6 border-l-2 border-amber-600/30">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ícone</label>
                    <select
                      value={topic.icon || 'Shield'}
                      onChange={(e) => updateTopic(topic.id, { icon: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Título do Tópico *</label>
                    <input
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="Ex: TÓPICO I. DISPOSIÇÕES GERAIS"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Descrição do Tópico</label>
                    <textarea
                      value={topic.description}
                      onChange={(e) => updateTopic(topic.id, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      rows={2}
                      placeholder="Ex: A estrutura oficial e hierarquia dentro da cadeia de comando."
                    />
                  </div>

                  {/* Seções */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm text-gray-400">Seções</label>
                      <Button
                        type="button"
                        onClick={() => addSection(topic.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar Seção
                      </Button>
                    </div>

                    {topic.content.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="bg-gray-900/50 p-3 rounded border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Título da Seção *</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(topic.id, sectionIndex, { title: e.target.value })}
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                              placeholder="Ex: 1. Estrutura de Comando"
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSection(topic.id, sectionIndex)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Itens */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-400">Itens</label>
                            <Button
                              type="button"
                              onClick={() => addItem(topic.id, sectionIndex)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Item
                            </Button>
                          </div>

                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-2 items-start">
                              <textarea
                                value={item.text || ''}
                                onChange={(e) => updateItem(topic.id, sectionIndex, itemIndex, { text: e.target.value })}
                                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                                rows={2}
                                placeholder="Digite o texto do item..."
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(topic.id, sectionIndex, itemIndex)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Salvar Estatuto
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de Gestão de Parceiros
function ParceirosManagement() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<Parceiro | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadParceiros();
  }, []);

  const loadParceiros = async () => {
    try {
      setLoading(true);
      const response = await parceirosService.list();
      if (response.success) {
        setParceiros(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este parceiro?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await parceirosService.delete(id);
      if (response.success) {
        toast.success('Parceiro excluído com sucesso!');
        loadParceiros();
      }
    } catch (error: any) {
      toast.error('Erro ao excluir parceiro: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (parceiro: Parceiro) => {
    setEditingParceiro(parceiro);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingParceiro(null);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gray-800/50 border-amber-600/30">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <span className="ml-2 text-gray-400">Carregando parceiros...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-gray-800/50 border-amber-600/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl text-white mb-2">Gestão de Parceiros</h2>
          <p className="text-sm text-gray-400">
            Crie, edite e exclua parceiros e patrocinadores
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      {parceiros.length === 0 ? (
        <div className="text-center py-12">
          <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Nenhum parceiro cadastrado ainda.</p>
          <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Parceiro
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {parceiros.map((parceiro) => (
            <div
              key={parceiro.id}
              className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-amber-500/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    {parceiro.logo_url && (
                      <img
                        src={parceiro.logo_url}
                        alt={parceiro.nome}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-semibold text-sm sm:text-base">{parceiro.nome}</h3>
                        {parceiro.tipo && (
                          <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 text-xs">
                            {parceiro.tipo}
                          </Badge>
                        )}
                        {parceiro.ativo ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/50 text-xs">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      {parceiro.descricao && (
                        <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">
                          {parceiro.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {parceiro.email && (
                          <span className="truncate">{parceiro.email}</span>
                        )}
                        {parceiro.telefone && (
                          <span>{parceiro.telefone}</span>
                        )}
                        <span>Ordem: {parceiro.ordem_exibicao}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(parceiro)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(parceiro.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-red-400 border-red-500/50 hover:bg-red-600/20"
                    disabled={deletingId === parceiro.id}
                  >
                    {deletingId === parceiro.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <ParceiroEditModal
          parceiro={editingParceiro}
          onClose={() => {
            setShowEditModal(false);
            setEditingParceiro(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingParceiro(null);
            loadParceiros();
          }}
        />
      )}
    </Card>
  );
}

// Componente Modal para Criar/Editar Parceiro
function ParceiroEditModal({
  parceiro,
  onClose,
  onSuccess,
}: {
  parceiro: Parceiro | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nome, setNome] = useState(parceiro?.nome || '');
  const [descricao, setDescricao] = useState(parceiro?.descricao || '');
  const [logoUrl, setLogoUrl] = useState(parceiro?.logo_url || '');
  const [website, setWebsite] = useState(parceiro?.website || '');
  const [email, setEmail] = useState(parceiro?.email || '');
  const [telefone, setTelefone] = useState(parceiro?.telefone || '');
  const [endereco, setEndereco] = useState(parceiro?.endereco || '');
  const [tipo, setTipo] = useState(parceiro?.tipo || '');
  const [ordemExibicao, setOrdemExibicao] = useState(parceiro?.ordem_exibicao || 0);
  const [ativo, setAtivo] = useState(parceiro?.ativo ?? true);
  const [saving, setSaving] = useState(false);

  const tiposPredefinidos = [
    'Loja de Equipamentos',
    'Uniformes e Equipamentos',
    'Peças e Upgrades',
    'Campo de Airsoft',
    'Patrocinador',
    'Fabricante',
    'Outro'
  ];

  useEffect(() => {
    if (parceiro) {
      setNome(parceiro.nome || '');
      setDescricao(parceiro.descricao || '');
      setLogoUrl(parceiro.logo_url || '');
      setWebsite(parceiro.website || '');
      setEmail(parceiro.email || '');
      setTelefone(parceiro.telefone || '');
      setEndereco(parceiro.endereco || '');
      setTipo(parceiro.tipo || '');
      setOrdemExibicao(parceiro.ordem_exibicao || 0);
      setAtivo(parceiro.ativo ?? true);
    } else {
      setNome('');
      setDescricao('');
      setLogoUrl('');
      setWebsite('');
      setEmail('');
      setTelefone('');
      setEndereco('');
      setTipo('');
      setOrdemExibicao(0);
      setAtivo(true);
    }
  }, [parceiro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      if (parceiro) {
        await parceirosService.update(parceiro.id, {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          logo_url: logoUrl.trim() || null,
          website: website.trim() || null,
          email: email.trim() || null,
          telefone: telefone.trim() || null,
          endereco: endereco.trim() || null,
          tipo: tipo || null,
          ordem_exibicao: ordemExibicao,
          ativo,
        });
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        await parceirosService.create({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          logo_url: logoUrl.trim() || null,
          website: website.trim() || null,
          email: email.trim() || null,
          telefone: telefone.trim() || null,
          endereco: endereco.trim() || null,
          tipo: tipo || null,
          ordem_exibicao: ordemExibicao,
          ativo,
        });
        toast.success('Parceiro criado com sucesso!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao salvar parceiro: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl text-white font-bold">
              {parceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Nome do parceiro"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Descrição do parceiro"
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">URL do Logo</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Ex: Loja, Campo, Patrocinador"
                  list="tipos-list"
                />
                <datalist id="tipos-list">
                  {tiposPredefinidos.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="https://exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ordem de Exibição</label>
                <input
                  type="number"
                  value={ordemExibicao}
                  onChange={(e) => setOrdemExibicao(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Endereço</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Endereço completo"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="ativo" className="text-sm text-gray-300">
                Ativo (visível na página pública)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {parceiro ? 'Atualizar' : 'Criar'} Parceiro
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Componente de formulário para contatos da equipe
function ContatoEquipeForm({
  email,
  whatsapp,
  onSave,
  onCancel,
}: {
  email: string;
  whatsapp: string;
  onSave: (email: string, whatsapp: string) => void;
  onCancel: () => void;
}) {
  const [formEmail, setFormEmail] = useState(email);
  const [formWhatsapp, setFormWhatsapp] = useState(whatsapp);

  const maskPhoneBR = (value: string) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!ddd) return '';
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

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhoneBR(e.target.value);
    setFormWhatsapp(masked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formEmail.trim(), formWhatsapp.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Email da Equipe *</label>
        <input
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="equipe@gosttactical.com.br"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Email usado para receber notificações de novos recrutamentos
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">WhatsApp da Equipe</label>
        <input
          type="tel"
          value={formWhatsapp}
          onChange={handleWhatsappChange}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="(11) 98765-4321"
        />
        <p className="text-xs text-gray-500 mt-1">
          WhatsApp usado para contato rápido (opcional)
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
