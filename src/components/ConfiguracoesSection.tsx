import React, { useState, useEffect } from 'react';
import { Users, UsersRound, Building2, Shield, Edit, Trash2, Plus, Save, X, FileText, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { usuariosService, type Usuario } from '../services/usuarios.service';
import { squadsService, type Squad, type SquadCreateUpdateData } from '../services/squads.service';
import { equipeService, type EquipeInfo } from '../services/equipe.service';
import { estatutoService, type EstatutoInfo, type EstatutoTopic } from '../services/estatuto.service';
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
    descricao: 'Ghost Operations Special Team'
  });
  const [loading, setLoading] = useState(true);
  const [editingUsuario, setEditingUsuario] = useState<string | null>(null);
  const [creatingUsuario, setCreatingUsuario] = useState(false);
  const [editingSquad, setEditingSquad] = useState<string | null>(null);
  const [creatingSquad, setCreatingSquad] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState(false);
  const [estatuto, setEstatuto] = useState<EstatutoInfo | null>(null);
  const [editingEstatuto, setEditingEstatuto] = useState(false);

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

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
        loadData();
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
        loadData();
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
        loadData();
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
        loadData();
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
        loadData();
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
          <TabsList className="flex flex-col sm:flex-row w-full max-w-2xl mx-auto gap-2 sm:gap-3 bg-gray-800/80 backdrop-blur-sm border-2 border-amber-600/30 rounded-xl p-2 shadow-lg">
            <TabsTrigger value="usuarios" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="squads" className="flex-1">
              <UsersRound className="w-4 h-4 mr-2" />
              Squads
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="estatuto" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Estatuto
            </TabsTrigger>
            <TabsTrigger value="recrutamento" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Recrutamentos
            </TabsTrigger>
          </TabsList>

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
                  <div>
                    <label className="text-sm text-gray-400">Objetivo</label>
                    <p className="text-white">{equipe.objetivo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Data de Criação</label>
                    <p className="text-white">{new Date(equipe.data_criacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {equipe.descricao && (
                    <div>
                      <label className="text-sm text-gray-400">Descrição</label>
                      <p className="text-white">{equipe.descricao}</p>
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
        </Tabs>
      </div>
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

