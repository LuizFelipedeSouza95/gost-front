import { useState, useEffect, useCallback } from 'react';
import { jogosService, type Jogo } from '../services/jogos.service';

export function useJogos(status?: string, limit?: number) {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJogos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jogosService.list(status, limit);
      if (response.success) {
        setJogos(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  useEffect(() => {
    fetchJogos();
  }, [fetchJogos]);

  return { jogos, loading, error, refetch: fetchJogos };
}

