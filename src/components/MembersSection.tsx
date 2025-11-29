import React, { useState, useEffect } from 'react';
import { Shield, Star, Award, Users as UsersIcon, User } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { usuariosService, type Usuario } from '../services/usuarios.service';
import { toast } from 'sonner';


interface Squad {
  id: string;
  nome: string;
}

interface HierarchyLevel {
  rank: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  order: number;
  members: Array<{
    id: string;
    name: string;
    role: string;
    specialization: string;
    picture?: string | null;
  }>;
}

export function MembersSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMembros();
  }, []);

  const loadMembros = async () => {
    try {
      setLoading(true);
      // Tenta carregar sem autenticação primeiro (para visualização pública)
      const response = await usuariosService.list(1, 100, false);
      if (response.success && response.data) {
        // Filtrar apenas membros ativos que foram cadastrados como membros oficiais pelos admins
        // OU que tenham patente de organização
        const membrosAtivos = response.data.filter(u => 
          u.active && (
            u.roles?.includes('membro_oficial') || 
            u.patent === 'organizacao' || 
            u.patent === 'organização'
          )
        );
        setUsuarios(membrosAtivos);
      }
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error);
      // Se der erro de autenticação, mostra mensagem amigável
      if (error.response?.status === 401) {
        toast.error('Erro ao carregar membros. Verifique se você está logado.');
      } else {
        toast.error('Erro ao carregar membros');
      }
    } finally {
      setLoading(false);
    }
  };

  // Agrupar membros por patente/hierarquia com ordenação correta
  const getHierarchyLevel = (patent?: string, roles?: string[]): HierarchyLevel => {
    // Verificar se tem role de organização
    const isOrganizacao = roles?.includes('organizacao') || roles?.includes('organização');
    
    switch (patent) {
      case 'comando':
      case 'sub_comando':
        return {
          rank: 'Diretoria',
          icon: Shield,
          color: 'text-red-500',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-500/50',
          order: 1,
          members: []
        };
      case 'organizacao':
      case 'organização':
        return {
          rank: 'Organização',
          icon: Award,
          color: 'text-purple-500',
          bgColor: 'bg-purple-600/20',
          borderColor: 'border-purple-500/50',
          order: 2,
          members: []
        };
      case 'comando_squad':
        return {
          rank: 'Comando de Squad',
          icon: Award,
          color: 'text-blue-500',
          bgColor: 'bg-blue-600/20',
          borderColor: 'border-blue-500/50',
          order: 3,
          members: []
        };
      case 'soldado':
        return {
          rank: 'Operadores',
          icon: UsersIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-500/50',
          order: 4,
          members: []
        };
      case 'recruta':
        return {
          rank: 'Recrutas',
          icon: User,
          color: 'text-gray-400',
          bgColor: 'bg-gray-600/20',
          borderColor: 'border-gray-500/50',
          order: 5,
          members: []
        };
      default:
        // Se não tem patente mas tem role de organização, colocar em Organização
        if (isOrganizacao) {
          return {
            rank: 'Organização',
            icon: Award,
            color: 'text-purple-500',
            bgColor: 'bg-purple-600/20',
            borderColor: 'border-purple-500/50',
            order: 2,
            members: []
          };
        }
        return {
          rank: 'Sem Patente',
          icon: User,
          color: 'text-gray-400',
          bgColor: 'bg-gray-600/20',
          borderColor: 'border-gray-500/50',
          order: 6,
          members: []
        };
    }
  };

  const groupedMembers = usuarios.reduce((acc, usuario) => {
    // Verificar se tem role de organização primeiro
    const isOrganizacao = usuario.roles?.includes('organizacao') || usuario.roles?.includes('organização');
    
    // Para comando e sub_comando, agrupar ambos em "Diretoria"
    let patentKey = usuario.patent;
    if (usuario.patent === 'comando' || usuario.patent === 'sub_comando') {
      patentKey = 'comando'; // Usar 'comando' como chave para agrupar ambos
    } else if (usuario.patent === 'organizacao' || usuario.patent === 'organização') {
      // Se tem patente de organização, usar 'organizacao'
      patentKey = 'organizacao';
    } else if (isOrganizacao && !usuario.patent) {
      // Se não tem patente mas tem role de organização, usar 'organizacao'
      patentKey = 'organizacao';
    }
    
    const level = getHierarchyLevel(patentKey, usuario.roles);
    const key = level.rank;

    if (!acc[key]) {
      acc[key] = {
        ...level,
        members: []
      };
    }

    const squad = usuario.squad as Squad | undefined;

    acc[key].members.push({
      id: usuario.id,
      name: usuario.nome_guerra || usuario.name || usuario.email.split('@')[0],
      role: usuario.patent || 'Sem patente',
      specialization: squad?.nome || 'Sem squad',
      picture: usuario.picture
    });

    return acc;
  }, {} as Record<string, HierarchyLevel>);

  // Ordenar hierarquia pela ordem definida
  const hierarchy: HierarchyLevel[] = (Object.values(groupedMembers) as HierarchyLevel[]).sort((a, b) => a.order - b.order);

  // Se não houver membros, mostrar mensagem
  if (hierarchy.length === 0 && !loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl text-white mb-4">Membros e Cadeia de Comando</h1>
            <p className="text-gray-400">
              Estrutura hierárquica e membros ativos do GOST
            </p>
          </div>
          <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
            <p className="text-gray-400 text-center">Nenhum membro encontrado.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando membros...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Membros e Cadeia de Comando</h1>
          <p className="text-gray-400">
            Estrutura hierárquica e membros ativos do GOST
          </p>
        </div>

        {/* Hierarchy */}
        <div className="space-y-6 mb-12">
          {hierarchy.map((level, index) => (
            <Card key={index} className={`p-6 bg-gray-800/50 backdrop-blur-sm border ${level.borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <level.icon className={`w-6 h-6 ${level.color}`} />
                <h2 className="text-2xl text-white">{level.rank}</h2>
                <Badge className={`${level.bgColor} ${level.color} border ${level.borderColor}`}>
                  {level.members.length} {level.members.length === 1 ? 'membro' : 'membros'}
                </Badge>
              </div>

              {level.members.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {level.members.map((member) => {
                    const hasPicture = member.picture && member.picture.trim().length > 0;
                    const imageFailed = imageErrors.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {hasPicture && !imageFailed ? (
                            <img
                              src={member.picture!}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-amber-600/50 flex-shrink-0"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              loading="lazy"
                              onError={() => {
                                // Marcar como erro apenas após falha real
                                setImageErrors(prev => new Set(prev).add(member.id));
                              }}
                              onLoad={() => {
                                // Se carregou com sucesso, garantir que não está no set de erros
                                setImageErrors(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(member.id);
                                  return newSet;
                                });
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-amber-600/50 flex-shrink-0">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">{member.name}</h3>
                            <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Nenhum membro nesta categoria</p>
              )}
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
          <h2 className="text-2xl text-white mb-6">Lista Completa de Membros ({usuarios.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Nome</th>
                  <th className="text-left py-3 px-4 text-gray-400">Nome de Guerra</th>
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-center py-3 px-4 text-gray-400">Patente</th>
                  <th className="text-center py-3 px-4 text-gray-400">Squad</th>
                  <th className="text-center py-3 px-4 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Nenhum membro encontrado
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => {
                    const squad = usuario.squad as Squad | undefined;
                    return (
                      <tr key={usuario.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 text-white">{usuario.name || '-'}</td>
                        <td className="py-3 px-4 text-white">{usuario.nome_guerra || '-'}</td>
                        <td className="py-3 px-4 text-gray-300">{usuario.email}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 capitalize">
                            {usuario.patent || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-300">
                          {squad?.nome || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={usuario.active
                            ? "bg-green-600/20 text-green-400 border-green-500/50"
                            : "bg-gray-600/20 text-gray-400 border-gray-500/50"
                          }>
                            {usuario.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
