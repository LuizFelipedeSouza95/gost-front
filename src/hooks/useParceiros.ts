import { useState, useEffect, useCallback } from 'react';
import { parceirosService, type Parceiro } from '../services/parceiros.service';

export function useParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParceiros = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parceirosService.list();
      if (response.success) {
        setParceiros(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParceiros();
  }, [fetchParceiros]);

  return { parceiros, loading, error, refetch: fetchParceiros };
}

