'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsApi, Document, DocumentCategory } from '@/lib/api/documents';
import { PaginationMeta } from '@/lib/api';

export function useDocuments(
  category?: DocumentCategory,
  search?: string,
  year?: number,
  month?: number,
) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const limit = 20;

  const load = useCallback((
    cat?: DocumentCategory,
    q?: string,
    pg = 1,
    yr?: number,
    mo?: number,
  ) => {
    setLoading(true);
    setError(null);
    documentsApi.list({ category: cat, search: q || undefined, page: pg, limit, year: yr, month: mo })
      .then(res => { setDocuments(res.data); setMeta(res.meta); setPageState(pg); })
      .catch(err => setError(err.message ?? 'Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(category, search, 1, year, month); }, [category, search, year, month, load]);

  const setPage = (p: number) => load(category, search, p, year, month);

  return { documents, meta, loading, error, page, setPage };
}
