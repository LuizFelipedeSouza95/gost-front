import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { agendaService, AgendaItem } from '../services/agenda.service';
import { toast } from 'sonner';

export function AgendaSection() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const response = await agendaService.list();
      if (response.success && response.data) {
        setAgendaItems(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar agenda:', error);
      toast.error('Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const isPastDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date < today;
    } catch {
      return false;
    }
  };

  // Agrupar itens por data
  const groupedByDate = agendaItems.reduce((acc, item) => {
    const dateKey = item.data.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, AgendaItem[]>);

  // Ordenar datas
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

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
          <h1 className="text-4xl text-white mb-4">Agenda do Time</h1>
          <p className="text-gray-400">
            Próximos eventos, reuniões e atividades programadas
          </p>
        </div>

        {agendaItems.length === 0 ? (
          <Card className="p-12 text-center bg-gray-800/50 border-amber-600/30">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Nenhum evento agendado no momento.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
              const items = groupedByDate[dateKey];
              const isPast = isPastDate(dateKey);
              const firstItem = items[0];

              return (
                <div key={dateKey}>
                  {/* Cabeçalho da data */}
                  <div className="mb-4">
                    <h2 className="text-2xl text-white font-bold">
                      {formatDate(firstItem.data)}
                    </h2>
                    {isPast && (
                      <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 mt-2">
                        Passado
                      </Badge>
                    )}
                  </div>

                  {/* Lista de eventos do dia */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 ${
                          isPast ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl text-white font-semibold">
                                {item.titulo}
                              </h3>
                              {item.tipo && (
                                <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/50">
                                  {item.tipo}
                                </Badge>
                              )}
                            </div>

                            {item.descricao && (
                              <p className="text-gray-300 mb-4 leading-relaxed">
                                {item.descricao}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              {item.hora && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(item.hora)}</span>
                                </div>
                              )}
                              {item.local && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{item.local}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

