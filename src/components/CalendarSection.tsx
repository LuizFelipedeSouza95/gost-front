import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users as UsersIcon, CheckCircle, XCircle, HelpCircle, Edit, Trash2, Ban, Plus, Save, X, User, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { getUserInfo } from '../utils/auth';
import { jogosService, type Jogo } from '../services/jogos.service';
import { usuariosService, type Usuario } from '../services/usuarios.service';

interface Event {
  id: string | number;
  date: Date;
  title: string;
  location: string;
  time: string;
  participants: number;
  type: string;
  confirmed?: number;
  declined?: number;
  pending?: number;
  confirmationIds?: string[]; // IDs dos usuários que confirmaram
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'; // Status do jogo
}

export function Calendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // Mês atual (0-indexed)
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [creatingJogo, setCreatingJogo] = useState(false);
  const [editingJogo, setEditingJogo] = useState<string | number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'cancel' | 'delete'; jogoId: string | number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConfirmationsModal, setShowConfirmationsModal] = useState<string | number | null>(null);
  const [confirmedUsers, setConfirmedUsers] = useState<Usuario[]>([]);
  const [loadingConfirmations, setLoadingConfirmations] = useState(false);

  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [userResponses, setUserResponses] = useState<Record<string | number, 'confirmed' | 'declined' | null>>({});

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      loadJogos();
    }
  }, [currentUserId]);

  const checkAdmin = async () => {
    try {
      const user = await getUserInfo();
      setIsAdmin(user?.roles?.includes('admin') || false);
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    }
  };

  const loadJogos = async () => {
    try {
      setLoading(true);
      // Buscar jogos scheduled e cancelled
      const [scheduledResponse, cancelledResponse] = await Promise.all([
        jogosService.list('scheduled'),
        jogosService.list('cancelled')
      ]);
      
      const allJogos: Jogo[] = [
        ...(scheduledResponse.success && scheduledResponse.data ? scheduledResponse.data : []),
        ...(cancelledResponse.success && cancelledResponse.data ? cancelledResponse.data : [])
      ];
      
      if (allJogos.length > 0) {
        setJogos(allJogos);

        // Converter jogos do backend para o formato de eventos
        const jogosAsEvents: Event[] = allJogos.map((jogo: Jogo) => {
          // Converter data string (YYYY-MM-DD) para Date sem problemas de timezone
          let eventDate = new Date();
          if (jogo.data_jogo) {
            const dateStr = jogo.data_jogo.split('T')[0]; // Pega apenas YYYY-MM-DD
            const [year, month, day] = dateStr.split('-').map(Number);
            eventDate = new Date(year, month - 1, day); // month é 0-indexed
          }
          
          return {
            id: jogo.id,
            date: eventDate,
            title: jogo.nome_jogo,
            location: jogo.local_jogo || 'Local não informado',
            time: jogo.hora_inicio && jogo.hora_fim
              ? `${jogo.hora_inicio} - ${jogo.hora_fim}`
              : 'Horário não informado',
            participants: jogo.confirmations?.length || 0,
            confirmed: jogo.confirmations?.length || 0,
            declined: 0,
            pending: 0,
            type: jogo.tipo_jogo || 'Operação Oficial',
            confirmationIds: jogo.confirmations || [], // Armazena os IDs para buscar depois
            status: jogo.status || 'scheduled' // Armazena o status do jogo
          };
        });
        
        // Ordenar eventos: cancelados por último, depois por data
        jogosAsEvents.sort((a, b) => {
          // Se um é cancelado e outro não, cancelado vai para o final
          if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
          if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
          // Se ambos têm o mesmo status, ordena por data
          return b.date.getTime() - a.date.getTime();
        });
        
        setEvents(jogosAsEvents);

        // Atualizar userResponses baseado nas confirmações do backend
        if (currentUserId) {
          const newResponses: Record<string | number, 'confirmed' | 'declined' | null> = {};
          allJogos.forEach((jogo: Jogo) => {
            if (jogo.confirmations?.includes(currentUserId)) {
              newResponses[jogo.id] = 'confirmed';
            }
          });
          setUserResponses(newResponses);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar jogos:', error);
      toast.error('Erro ao carregar jogos do calendário');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJogo = (eventId: string | number) => {
    setEditingJogo(eventId);
  };

  const handleDeleteJogo = (eventId: string | number) => {
    setConfirmModal({ type: 'delete', jogoId: eventId });
  };

  const handleCancelJogo = (eventId: string | number) => {
    setConfirmModal({ type: 'cancel', jogoId: eventId });
  };

  const confirmDelete = async () => {
    if (!confirmModal) return;

    try {
      await jogosService.delete(String(confirmModal.jogoId));
      toast.success('Jogo excluído com sucesso!');
      setConfirmModal(null);
      loadJogos();
    } catch (error: any) {
      toast.error('Erro ao excluir jogo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const confirmCancel = async () => {
    if (!confirmModal) return;

    try {
      await jogosService.update(String(confirmModal.jogoId), { status: 'cancelled' });
      toast.success('Jogo cancelado com sucesso!');
      setConfirmModal(null);
      loadJogos();
    } catch (error: any) {
      toast.error('Erro ao cancelar jogo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleUpdateJogo = async (id: string | number, data: Partial<Jogo>) => {
    try {
      // Se o jogo estava cancelado e não foi especificado um status, muda para scheduled
      const jogo = jogos.find(j => j.id === id);
      if (jogo?.status === 'cancelled' && !data.status) {
        data.status = 'scheduled';
      }
      
      const response = await jogosService.update(String(id), data);
      if (response.success) {
        toast.success('Jogo atualizado com sucesso!');
        setEditingJogo(null);
        loadJogos();
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar jogo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleRescheduleJogo = (eventId: string | number) => {
    setEditingJogo(eventId);
  };

  const handleDateClick = (day: number) => {
    if (!isAdmin) return;
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    setCreatingJogo(true);
  };

  // Função auxiliar para formatar data no formato YYYY-MM-DD sem problemas de timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateJogo = async (data: Partial<Jogo>) => {
    try {
      const jogoData = {
        ...data,
        data_jogo: selectedDate ? formatDateLocal(selectedDate) : formatDateLocal(new Date()),
        status: 'scheduled' as const,
      };
      const response = await jogosService.create(jogoData);
      if (response.success) {
        toast.success('Jogo criado com sucesso!');
        setCreatingJogo(false);
        setSelectedDate(null);
        loadJogos();
      }
    } catch (error: any) {
      toast.error('Erro ao criar jogo: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: React.ReactElement[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      // Verifica se há evento, mas exclui jogos cancelados da marcação no calendário
      const hasEvent = events.some(event =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear &&
        event.status !== 'cancelled' // Não marca jogos cancelados no calendário
      );
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => {
            if (isAdmin && !isPast) {
              handleDateClick(day);
            }
          }}
          disabled={isPast || !isAdmin}
          className={`p-2 text-center rounded-lg transition-colors w-full ${isSelected
            ? 'bg-blue-600/50 border-2 border-blue-500 text-white'
            : hasEvent
              ? 'bg-amber-600/30 border border-amber-500/50 text-white'
              : isPast
                ? 'text-gray-600 cursor-not-allowed opacity-50'
                : isAdmin
                  ? 'text-gray-400 hover:bg-gray-700/50 cursor-pointer'
                  : 'text-gray-400 cursor-default'
            }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Operação Oficial':
        return 'bg-red-600/20 text-red-400 border-red-500/50';
      case 'Operação Especial':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/50';
      case 'Treinamento':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
      case 'Recreativo':
        return 'bg-green-600/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    }
  };

  const handleShowConfirmations = async (eventId: string | number) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !event.confirmationIds || event.confirmationIds.length === 0) {
      toast.info('Nenhuma confirmação encontrada');
      return;
    }

    setShowConfirmationsModal(eventId);
    setLoadingConfirmations(true);
    
    try {
      // Buscar dados de todos os usuários que confirmaram
      const usersPromises = event.confirmationIds.map(id => 
        usuariosService.getById(id).catch(() => null)
      );
      
      const usersResults = await Promise.all(usersPromises);
      const validUsers = usersResults
        .filter(result => result && result.success)
        .map(result => result!.data);
      
      setConfirmedUsers(validUsers);
    } catch (error: any) {
      console.error('Erro ao carregar confirmações:', error);
      toast.error('Erro ao carregar lista de confirmações');
    } finally {
      setLoadingConfirmations(false);
    }
  };

  const handleConfirmPresence = async (eventId: string | number, response: 'confirmed' | 'declined') => {
    try {
      const currentResponse = userResponses[eventId];

      if (response === 'confirmed') {
        if (currentResponse === 'confirmed') {
          // Se já está confirmado, remove a confirmação
          await jogosService.removePresence(String(eventId));
          toast.success('Presença removida com sucesso!');
          setUserResponses(prev => ({
            ...prev,
            [eventId]: null
          }));
        } else {
          // Confirma presença
          await jogosService.confirmPresence(String(eventId));
          toast.success('Presença confirmada com sucesso!');
          setUserResponses(prev => ({
            ...prev,
            [eventId]: 'confirmed'
          }));
        }
      } else {
        // Recusar = remover confirmação se existir
        if (currentResponse === 'confirmed') {
          await jogosService.removePresence(String(eventId));
          toast.success('Presença removida com sucesso!');
        } else {
          toast.info('Você não estava confirmado neste jogo');
        }
        setUserResponses(prev => ({
          ...prev,
          [eventId]: null
        }));
      }

      // Recarregar jogos para atualizar contadores
      loadJogos();
    } catch (error: any) {
      toast.error('Erro ao atualizar presença: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Calendário de Jogos</h1>
          {/* <p className="text-gray-400">
            Todos os domingos, entre 07h00 e 18h00
          </p> */}
          {isAdmin && (
            <p className="text-amber-400 mt-2 text-sm">
              💡 Clique em uma data futura para criar um novo jogo
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="space-y-4 relative" style={{ zIndex: 1 }}>
            <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 relative" style={{ zIndex: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2 relative" style={{ zIndex: 1 }}>
                {renderCalendar()}
              </div>
            </Card>

            {/* Formulário de criação de jogo */}
            {creatingJogo && selectedDate && (
              <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
                <JogoCreateForm
                  selectedDate={selectedDate}
                  onSave={handleCreateJogo}
                  onCancel={() => {
                    setCreatingJogo(false);
                    setSelectedDate(null);
                  }}
                />
              </Card>
            )}
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <h2 className="text-2xl text-white mb-4">Próximos Eventos</h2>
            {events.map((event) => {
              const isCancelled = event.status === 'cancelled';
              return (
                <Card 
                  key={event.id} 
                  className={`p-4 backdrop-blur-sm transition-colors ${
                    isCancelled 
                      ? 'bg-gray-800/30 border-red-600/30 opacity-75' 
                      : 'bg-gray-800/50 border-amber-600/30 hover:border-amber-500'
                  }`}
                >
                  {editingJogo === event.id ? (
                    <JogoEditForm
                      jogo={jogos.find(j => j.id === event.id)}
                      onSave={(data) => handleUpdateJogo(event.id, data)}
                      onCancel={() => setEditingJogo(null)}
                    />
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-white ${event.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>
                              {event.title}
                            </h3>
                            {event.status === 'cancelled' && (
                              <Badge className="bg-red-600/20 text-red-400 border-red-500/50">
                                Cancelado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-amber-400">
                            {event.date.getDate()} de {monthNames[event.date.getMonth()]}
                          </p>
                        </div>
                        <Badge className={`${getEventTypeColor(event.type)} border`}>
                          {event.type}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location && (event.location.startsWith('http://') || event.location.startsWith('https://')) ? (
                            <a
                              href={event.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:text-amber-300 underline transition-colors"
                            >
                              Ver localização no mapa
                            </a>
                          ) : (
                            <span>{event.location}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      </div>

                      {/* Presence Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <button
                          onClick={() => handleShowConfirmations(event.id)}
                          disabled={!event.confirmed || event.confirmed === 0}
                          className={`flex items-center gap-1 text-green-400 transition-colors ${
                            event.confirmed && event.confirmed > 0
                              ? 'hover:text-green-300 cursor-pointer'
                              : 'cursor-not-allowed opacity-50'
                          }`}
                          title={event.confirmed && event.confirmed > 0 ? 'Clique para ver quem confirmou' : 'Nenhuma confirmação'}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{event.confirmed}</span>
                        </button>
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span>{event.declined}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <HelpCircle className="w-4 h-4" />
                          <span>{event.pending}</span>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex gap-2 mb-4 pb-4 border-b border-gray-700">
                          {isCancelled ? (
                            <>
                              <Button
                                onClick={() => handleRescheduleJogo(event.id)}
                                variant="outline"
                                className="flex-1 text-green-400 hover:text-green-300"
                                size="sm"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reagendar
                              </Button>
                              <Button
                                onClick={() => handleDeleteJogo(event.id)}
                                variant="outline"
                                className="flex-1 text-red-400 hover:text-red-300"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleEditJogo(event.id)}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleCancelJogo(event.id)}
                                variant="outline"
                                className="flex-1 text-yellow-400 hover:text-yellow-300"
                                size="sm"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleDeleteJogo(event.id)}
                                variant="outline"
                                className="flex-1 text-red-400 hover:text-red-300"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Confirm/Decline Buttons - Desabilitados para jogos cancelados */}
                      {event.status === 'cancelled' ? (
                        <div className="text-center py-2 text-gray-500 text-sm">
                          Este jogo foi cancelado
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleConfirmPresence(event.id, 'confirmed')}
                            className={`flex-1 ${userResponses[event.id] === 'confirmed'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-700 hover:bg-green-600'
                              }`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {userResponses[event.id] === 'confirmed' ? 'Confirmado' : 'Confirmar'}
                          </Button>
                          <Button
                            onClick={() => handleConfirmPresence(event.id, 'declined')}
                            className={`flex-1 ${userResponses[event.id] === 'confirmed'
                              ? 'bg-gray-700 hover:bg-red-600'
                              : 'bg-gray-700 hover:bg-red-600'
                              }`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {userResponses[event.id] === 'confirmed' ? 'Remover Confirmação' : 'Não Confirmado'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmModal && (
        <ConfirmModal
          type={confirmModal.type}
          onConfirm={confirmModal.type === 'delete' ? confirmDelete : confirmCancel}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Modal de Confirmações */}
      {showConfirmationsModal && (
        <ConfirmationsModal
          event={events.find(e => e.id === showConfirmationsModal)}
          users={confirmedUsers}
          loading={loadingConfirmations}
          onClose={() => {
            setShowConfirmationsModal(null);
            setConfirmedUsers([]);
          }}
        />
      )}
    </div>
  );
}

// Componente de criação de jogo
function JogoCreateForm({
  selectedDate,
  onSave,
  onCancel,
}: {
  selectedDate: Date;
  onSave: (data: Partial<Jogo>) => void;
  onCancel: () => void;
}) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [formData, setFormData] = useState({
    nome_jogo: '',
    descricao_jogo: '',
    local_jogo: '',
    hora_inicio: '07:00',
    hora_fim: '18:00',
    tipo_jogo: 'Operação Oficial',
    max_participantes: '',
    capa_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_jogo.trim()) {
      toast.error('O nome do jogo é obrigatório');
      return;
    }
    onSave({
      nome_jogo: formData.nome_jogo.trim(),
      descricao_jogo: formData.descricao_jogo.trim() || undefined,
      local_jogo: formData.local_jogo.trim() || undefined,
      hora_inicio: formData.hora_inicio || undefined,
      hora_fim: formData.hora_fim || undefined,
      tipo_jogo: formData.tipo_jogo || undefined,
      max_participantes: formData.max_participantes ? parseInt(formData.max_participantes) : undefined,
      capa_url: formData.capa_url.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl text-white mb-2">Criar Novo Jogo</h3>
        <p className="text-sm text-gray-400">
          Data selecionada: {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome do Jogo *</label>
        <input
          type="text"
          value={formData.nome_jogo}
          onChange={(e) => setFormData({ ...formData, nome_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
          placeholder="Ex: Operação Cerrado"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={formData.descricao_jogo}
          onChange={(e) => setFormData({ ...formData, descricao_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          rows={3}
          placeholder="Descrição do jogo..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Local do Jogo (URL do Google Maps)</label>
        <input
          type="url"
          value={formData.local_jogo}
          onChange={(e) => setFormData({ ...formData, local_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Hora de Início</label>
          <input
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Hora de Término</label>
          <input
            type="time"
            value={formData.hora_fim}
            onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tipo de Jogo</label>
          <select
            value={formData.tipo_jogo}
            onChange={(e) => setFormData({ ...formData, tipo_jogo: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="Operação Oficial">Operação Oficial</option>
            <option value="Operação Especial">Operação Especial</option>
            <option value="Treinamento">Treinamento</option>
            <option value="Recreativo">Recreativo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Máx. Participantes</label>
          <input
            type="number"
            value={formData.max_participantes}
            onChange={(e) => setFormData({ ...formData, max_participantes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Opcional"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">URL da Capa</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.capa_url}
            onChange={(e) => setFormData({ ...formData, capa_url: e.target.value })}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {formData.capa_url && (
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={formData.capa_url}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">Cole a URL da imagem da capa do jogo</p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Criar Jogo
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente de edição de jogo
function JogoEditForm({
  jogo,
  onSave,
  onCancel,
}: {
  jogo?: Jogo;
  onSave: (data: Partial<Jogo>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nome_jogo: '',
    descricao_jogo: '',
    data_jogo: '',
    local_jogo: '',
    hora_inicio: '07:00',
    hora_fim: '18:00',
    tipo_jogo: 'Operação Oficial',
    max_participantes: '',
    capa_url: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  });

  useEffect(() => {
    if (jogo) {
      // Se o jogo estava cancelado, ao abrir para editar (reagendar), muda o status para scheduled
      const newStatus = jogo.status === 'cancelled' ? 'scheduled' : (jogo.status || 'scheduled');
      
      setFormData({
        nome_jogo: jogo.nome_jogo || '',
        descricao_jogo: jogo.descricao_jogo || '',
        data_jogo: jogo.data_jogo ? jogo.data_jogo.split('T')[0] : '',
        local_jogo: jogo.local_jogo || '',
        hora_inicio: jogo.hora_inicio || '07:00',
        hora_fim: jogo.hora_fim || '18:00',
        tipo_jogo: jogo.tipo_jogo || 'Operação Oficial',
        max_participantes: jogo.max_participantes?.toString() || '',
        capa_url: jogo.capa_url || '',
        status: newStatus,
      });
    }
  }, [jogo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_jogo.trim()) {
      toast.error('O nome do jogo é obrigatório');
      return;
    }
    onSave({
      nome_jogo: formData.nome_jogo.trim(),
      descricao_jogo: formData.descricao_jogo.trim() || undefined,
      data_jogo: formData.data_jogo || undefined,
      local_jogo: formData.local_jogo.trim() || undefined,
      hora_inicio: formData.hora_inicio || undefined,
      hora_fim: formData.hora_fim || undefined,
      tipo_jogo: formData.tipo_jogo || undefined,
      max_participantes: formData.max_participantes ? parseInt(formData.max_participantes) : undefined,
      capa_url: formData.capa_url.trim() || undefined,
      status: formData.status as any,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl text-white mb-2">Editar Jogo</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Nome do Jogo *</label>
        <input
          type="text"
          value={formData.nome_jogo}
          onChange={(e) => setFormData({ ...formData, nome_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Descrição</label>
        <textarea
          value={formData.descricao_jogo}
          onChange={(e) => setFormData({ ...formData, descricao_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Data do Jogo</label>
        <input
          type="date"
          value={formData.data_jogo}
          onChange={(e) => setFormData({ ...formData, data_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Local do Jogo (URL do Google Maps)</label>
        <input
          type="url"
          value={formData.local_jogo}
          onChange={(e) => setFormData({ ...formData, local_jogo: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Hora de Início</label>
          <input
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Hora de Término</label>
          <input
            type="time"
            value={formData.hora_fim}
            onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tipo de Jogo</label>
          <select
            value={formData.tipo_jogo}
            onChange={(e) => setFormData({ ...formData, tipo_jogo: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="Operação Oficial">Operação Oficial</option>
            <option value="Operação Especial">Operação Especial</option>
            <option value="Treinamento">Treinamento</option>
            <option value="Recreativo">Recreativo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Máx. Participantes</label>
          <input
            type="number"
            value={formData.max_participantes}
            onChange={(e) => setFormData({ ...formData, max_participantes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="scheduled">Agendado</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">URL da Capa</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.capa_url}
            onChange={(e) => setFormData({ ...formData, capa_url: e.target.value })}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {formData.capa_url && (
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={formData.capa_url}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
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

// Componente de modal de confirmação
function ConfirmModal({
  type,
  onConfirm,
  onCancel,
}: {
  type: 'cancel' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 bg-gray-800 border-amber-600/30 max-w-md w-full">
        <div className="text-center mb-6">
          {type === 'delete' ? (
            <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          ) : (
            <Ban className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          )}
          <h3 className="text-2xl text-white mb-2">
            {type === 'delete' ? 'Excluir Jogo' : 'Cancelar Jogo'}
          </h3>
          <p className="text-gray-400">
            {type === 'delete'
              ? 'Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.'
              : 'Tem certeza que deseja cancelar este jogo?'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            {type === 'delete' ? 'Excluir' : 'Cancelar Jogo'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Componente de modal de confirmações
function ConfirmationsModal({
  event,
  users,
  loading,
  onClose,
}: {
  event?: Event;
  users: Usuario[];
  loading: boolean;
  onClose: () => void;
}) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card 
        className="p-6 bg-gray-800 border-amber-600/30 max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl text-white">
              Confirmações ({users.length})
            </h3>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {event && (
          <p className="text-sm text-gray-400 mb-4">
            {event.title} - {event.date.getDate()} de {monthNames[event.date.getMonth()]}
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Carregando confirmações...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhuma confirmação encontrada
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || user.email}
                      className="w-10 h-10 rounded-full object-cover border-2 border-green-500/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-green-500/50">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {user.nome_guerra || user.name || user.email.split('@')[0]}
                    </p>
                    {user.nome_guerra && user.name && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.name}
                      </p>
                    )}
                    {user.patent && (
                      <p className="text-xs text-amber-400 capitalize">
                        {user.patent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
