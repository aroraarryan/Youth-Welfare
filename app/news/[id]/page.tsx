'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchNewsItem, fetchNewsList, NewsItem } from '@/lib/api/newsApi';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<NewsItem | null>(null);
  const [recentArticles, setRecentArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchNewsItem(id),
      fetchNewsList({ limit: 15 }),
    ])
      .then(([itemRes, listRes]) => {
        setArticle(itemRes.data);
        setRecentArticles(listRes.data);
      })
      .catch(err => setError(err.message ?? 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9ca3af] text-sm">
        <i className="fas fa-spinner fa-spin mr-2" />Loading…
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{error ?? 'Article not found'}</p>
        <Link href="/news" className="text-[#1e3a8a] font-semibold text-sm hover:underline">
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-screen">

      {/* LEFT SIDEBAR — NEWS ROOM */}
      <aside className="lg:w-80 bg-white border-r border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto shrink-0">
        <div className="bg-[#1e3a8a] px-6 py-5">
          <h2 className="text-white text-xl font-black tracking-wide uppercase">News Room</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentArticles.map(a => (
            <Link
              key={a.id}
              href={`/news/${a.id}`}
              className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${a.id === id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative w-20 h-14 rounded shrink-0 bg-gray-200 overflow-hidden">
                {a.imageUrl && (
                  <Image src={a.imageUrl} alt={a.title} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-[#1e3a8a] text-white text-[10px] font-bold px-2 py-0.5 mb-1">NEWS</span>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2">{a.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDate(a.publishedAt || a.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* RIGHT: MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-12 max-w-4xl">
        {article.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
            <Image src={article.imageUrl} alt={article.title} fill sizes="(max-width: 1024px) 100vw, calc(100vw - 320px)" className="object-cover" />
          </div>
        )}
        <span className="inline-block bg-[#1e3a8a] text-white text-xs font-bold px-3 py-1 mb-4">NEWS</span>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1e3a8a] mb-4 leading-tight">{article.title}</h1>
        {(article.location || article.publishedAt) && (
          <p className="font-semibold text-gray-700 mb-6">
            {article.location}
            {article.location && article.publishedAt ? ', ' : ''}
            {formatDate(article.publishedAt)}
          </p>
        )}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
          {article.content.split('\n').filter(p => p.trim()).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link href="/news" className="text-[#1e3a8a] font-semibold text-sm hover:underline flex items-center gap-2">
            <i className="fas fa-arrow-left text-xs" /> Back to News
          </Link>
        </div>
      </main>

    </div>
  );
}
