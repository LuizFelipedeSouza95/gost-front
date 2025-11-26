import { useState, useEffect, useCallback } from 'react';
import { faqsService, type FAQ } from '../services/faqs.service';

export function useFAQs(categoria?: string) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await faqsService.list(categoria);
      if (response.success) {
        setFaqs(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar FAQs');
    } finally {
      setLoading(false);
    }
  }, [categoria]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  return { faqs, loading, error, refetch: fetchFAQs };
}

