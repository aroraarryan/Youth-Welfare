'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsApi, Document, DocumentCategory } from '@/lib/api/documents';
import { PaginationMeta } from '@/lib/api';

export function useDocuments(category?: DocumentCategory, search?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const limit = 20;

  const load = useCallback((cat?: DocumentCategory, q?: string, pg = 1) => {
    setLoading(true);
    setError(null);
    documentsApi.list({ category: cat, search: q || undefined, page: pg, limit })
      .then(res => { setDocuments(res.data); setMeta(res.meta); setPageState(pg); })
      .catch(err => setError(err.message ?? 'Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(category, search, 1); }, [category, search, load]);

  const setPage = (p: number) => load(category, search, p);

  return { documents, meta, loading, error, page, setPage };
}
