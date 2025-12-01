import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Shield, Target, Skull } from 'lucide-react';
import { agendaService, AgendaItem } from '../services/agenda.service';
import { toast } from 'sonner';

// Componente para exibir um item da agenda
function AgendaItemCard({ 
  item, 
  dateStr, 
  endDate, 
  logoUrl 
}: { 
  item: AgendaItem; 
  dateStr: string; 
  endDate?: string | undefined; 
  logoUrl: string | null;
}) {
  const [logoError, setLogoError] = useState(false);

  const getEventIcon = (titulo: string, tipo?: string | null) => {
    const titleLower = titulo.toLowerCase();
    
    if (titleLower.includes('specwar')) {
      return <Shield className="w-8 h-8 text-amber-500" />;
    }
    if (titleLower.includes('parabellum')) {
      return <Skull className="w-8 h-8 text-gray-300" />;
    }
    if (titleLower.includes('milsim')) {
      return <Target className="w-8 h-8 text-red-500" />;
    }
    if (titleLower.includes('pandora') || titleLower.includes('fronteira') || titleLower.includes('combat zone') || titleLower.includes('vietnã')) {
      return <Shield className="w-8 h-8 text-amber-500" />;
    }
    if (titleLower.includes('kivu') || titleLower.includes('radar')) {
      return <Target className="w-8 h-8 text-green-500" />;
    }
    
    // Ícone padrão
    return <Calendar className="w-8 h-8 text-amber-600" />;
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors rounded-lg border border-gray-700/50">
      {/* Data */}
      <div className="flex-shrink-0">
        {endDate ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-amber-600/90 text-white font-bold text-xs px-3 py-1.5 rounded text-center whitespace-nowrap">
              {dateStr}
            </div>
            <span className="text-gray-400 text-xs whitespace-nowrap">a</span>
            <div className="bg-amber-600/90 text-white font-bold text-xs px-3 py-1.5 rounded text-center whitespace-nowrap">
              {endDate}
            </div>
          </div>
        ) : (
          <div className="bg-amber-600/90 text-white font-bold text-xs px-3 py-1.5 rounded min-w-[80px] text-center">
            {dateStr}
          </div>
        )}
      </div>

      {/* Nome do evento */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-lg truncate">
          {item.titulo}
        </h3>
      </div>

      {/* Logo/Ícone */}
      <div className="flex-shrink-0">
        {logoUrl && !logoError ? (
          <img 
            src={logoUrl} 
            alt={item.titulo}
            className="w-8 h-8 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          getEventIcon(item.titulo, item.tipo)
        )}
      </div>
    </div>
  );
}

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

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return dateString;
    }
  };

  const getEventIcon = (titulo: string, tipo?: string | null) => {
    const titleLower = titulo.toLowerCase();
    
    if (titleLower.includes('specwar')) {
      return <Shield className="w-8 h-8 text-amber-500" />;
    }
    if (titleLower.includes('parabellum')) {
      return <Skull className="w-8 h-8 text-gray-300" />;
    }
    if (titleLower.includes('milsim')) {
      return <Target className="w-8 h-8 text-red-500" />;
    }
    if (titleLower.includes('pandora') || titleLower.includes('fronteira') || titleLower.includes('combat zone') || titleLower.includes('vietnã')) {
      return <Shield className="w-8 h-8 text-amber-500" />;
    }
    if (titleLower.includes('kivu') || titleLower.includes('radar')) {
      return <Target className="w-8 h-8 text-green-500" />;
    }
    
    // Ícone padrão
    return <Calendar className="w-8 h-8 text-amber-600" />;
  };

  // Agrupar itens consecutivos do mesmo evento (para eventos de 2 dias)
  const processItems = (): Array<{ item: AgendaItem; endDate?: string }> => {
    if (agendaItems.length === 0) return [];

    const sorted = [...agendaItems].sort((a, b) => {
      const dateA = a.data.includes('T') ? a.data.split('T')[0] : a.data.split(' ')[0];
      const dateB = b.data.includes('T') ? b.data.split('T')[0] : b.data.split(' ')[0];
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    const processed: Array<{ item: AgendaItem; endDate?: string }> = [];
    const used = new Set<number>();

    sorted.forEach((current, i) => {
      if (used.has(i)) return;

      const currentDateStr = current.data.includes('T') ? current.data.split('T')[0] : current.data.split(' ')[0];
      
      // Normalizar a data para garantir formato correto
      let currentDate: Date;
      try {
        currentDate = new Date(currentDateStr + 'T00:00:00');
      } catch {
        currentDate = new Date(currentDateStr);
      }
      
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      // Verifica se há um evento no dia seguinte com o mesmo título
      const nextIndex = sorted.findIndex(
        (item, idx) => {
          if (idx <= i || used.has(idx)) return false;
          const itemDateStr = item.data.includes('T') ? item.data.split('T')[0] : item.data.split(' ')[0];
          // Comparar títulos (case-insensitive) e datas normalizadas
          return item.titulo.trim().toLowerCase() === current.titulo.trim().toLowerCase() && 
                 itemDateStr === nextDateStr;
        }
      );

      if (nextIndex !== -1) {
        const nextItemDateStr = sorted[nextIndex].data.includes('T') 
          ? sorted[nextIndex].data.split('T')[0] 
          : sorted[nextIndex].data.split(' ')[0];
        processed.push({
          item: current,
          endDate: formatDateShort(nextItemDateStr),
        });
        used.add(i);
        used.add(nextIndex);
      } else {
        processed.push({ item: current });
        used.add(i);
      }
    });

    return processed;
  };

  const processedItems = processItems();

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4 font-bold">Agenda do Time</h1>
        </div>

        {agendaItems.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Nenhum evento agendado no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedItems.map((processed) => {
              const { item, endDate } = processed;
              const itemDateStr = item.data.includes('T') ? item.data.split('T')[0] : item.data.split(' ')[0];
              const dateStr = formatDateShort(itemDateStr);
              
              // Extrair logo URL da descrição se existir (formato: logo_url:URL)
              const logoMatch = item.descricao?.match(/logo_url:([^|]+)/);
              const logoUrl = logoMatch ? logoMatch[1] : null;
              
              return React.createElement(AgendaItemCard, {
                key: item.id,
                item,
                dateStr,
                endDate,
                logoUrl,
              });
            })}
          </div>
        )}

        {/* Footer */}
        {/* <div className="mt-12 text-center text-xs text-gray-500">
          <p>SUJEITO A ALTERAÇÃO. PARA INSCRIÇÃO CONSULTE UM ADM.</p>
        </div> */}
      </div>
    </div>
  );
}

