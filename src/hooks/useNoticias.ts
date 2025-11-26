import { useState, useEffect, useCallback } from 'react';
import { noticiasService, type Noticia } from '../services/noticias.service';

export function useNoticias(categoria?: string, publicado?: boolean, limit?: number) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticiasService.list(categoria, publicado, limit);
      if (response.success) {
        setNoticias(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  }, [categoria, publicado, limit]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  return { noticias, loading, error, refetch: fetchNoticias };
}

