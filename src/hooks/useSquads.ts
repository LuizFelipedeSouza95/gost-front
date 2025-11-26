import { useState, useEffect, useCallback } from 'react';
import { squadsService, type Squad } from '../services/squads.service';

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await squadsService.list();
      if (response.success) {
        setSquads(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar squads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  return { squads, loading, error, refetch: fetchSquads };
}

