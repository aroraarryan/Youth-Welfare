'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsApi, Document, DocumentCategory, DocumentSection } from '@/lib/api/documents';
import { PaginationMeta } from '@/lib/api';

export function useDocuments(
  category?: DocumentCategory,
  search?: string,
  year?: number,
  month?: number,
  section?: DocumentSection,
) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const limit = 10;

  const load = useCallback((
    cat?: DocumentCategory,
    q?: string,
    pg = 1,
    yr?: number,
    mo?: number,
    sec?: DocumentSection,
  ) => {
    setLoading(true);
    setError(null);
    documentsApi.list({ category: cat, search: q || undefined, page: pg, limit, year: yr, month: mo, section: sec })
      .then(res => { setDocuments(res.data); setMeta(res.meta); setPageState(pg); })
      .catch(err => setError(err.message ?? 'Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(category, search, 1, year, month, section); }, [category, search, year, month, section, load]);

  const setPage = (p: number) => load(category, search, p, year, month, section);

  return { documents, meta, loading, error, page, setPage };
}
