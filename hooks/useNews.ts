'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchNewsList, fetchNewsItem, NewsItem, NewsMeta } from '@/lib/api/newsApi';

export function useNewsList(params: { page?: number; limit?: number; search?: string } = {}) {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [meta, setMeta] = useState<NewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((p: { page?: number; limit?: number; search?: string }) => {
    setLoading(true);
    setError(null);
    fetchNewsList(p)
      .then(res => { setArticles(res.data); setMeta(res.meta); })
      .catch(err => setError(err.message ?? 'Failed to load news'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(params); }, [params.page, params.limit, params.search, load]);

  return { articles, meta, loading, error };
}

export function useNewsItem(id: string) {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchNewsItem(id)
      .then(res => setArticle(res.data))
      .catch(err => setError(err.message ?? 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  return { article, loading, error };
}
