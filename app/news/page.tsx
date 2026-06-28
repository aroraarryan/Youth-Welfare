'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { fetchNewsList, NewsItem, NewsMeta } from '@/lib/api/newsApi';

const LIMIT = 9;

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

interface NewsCardProps {
  article: NewsItem;
}

function NewsCard({ article }: NewsCardProps) {
  const locationDate = [
    article.location,
    formatDate(article.publishedAt || article.createdAt),
  ].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-[240px] bg-gradient-to-br from-gray-200 to-gray-300 shrink-0">
        {article.imageUrl ? (
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-newspaper text-5xl text-gray-400" />
          </div>
        )}
        <span className="absolute bottom-0 right-0 bg-[#1e3a8a] text-white text-xs font-bold px-4 py-1.5 tracking-wide">NEWS</span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">{article.title}</h3>
        {locationDate && (
          <p className="text-sm font-semibold text-gray-500 mb-3">{locationDate}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 flex-1">
          {article.excerpt || article.content.substring(0, 200)}
        </p>
        <Link
          href={`/news/${article.id}`}
          className="mt-5 inline-block bg-[#1e3a8a] text-white text-sm font-semibold px-6 py-3 rounded hover:bg-[#162d6b] transition-colors w-fit"
        >
          Read Now
        </Link>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [meta, setMeta] = useState<NewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchNewsList({ page, limit: LIMIT, search: debouncedSearch || undefined })
      .then(res => { setArticles(res.data); setMeta(res.meta); })
      .catch(err => setError(err.message ?? 'Failed to load news'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  const featuredArticle = articles.find(a => a.isFeatured) ?? null;
  const gridArticles = featuredArticle
    ? articles.filter(a => a.id !== featuredArticle.id)
    : articles;

  return (
    <>
      <PageHero
        hindiTitle="समाचार"
        title="Latest News"
        subtitle="Department updates, events, and announcements · Department of Youth Welfare and PRD, Uttarakhand"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Gallery', href: '/gallery' }, { label: 'News' }]}
        stats={[
          { value: '13', label: 'Districts' },
          { value: `${meta?.total ?? '—'}`, label: 'Articles' },
          { value: '2026', label: 'Edition' },
        ]}
      />

      {/* Tab switcher — mirrors gallery tabs */}
      <div className="max-w-[1400px] mx-auto px-5 pt-10 pb-2">
        <div className="flex gap-2 mb-2 justify-center">
          <Link
            href="/gallery"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <i className="fas fa-building mr-2" />
            Media Uploaded by Department
          </Link>
          <Link
            href="/gallery?tab=users"
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <i className="fas fa-users mr-2" />
            Media Uploaded by Users
          </Link>
          <span className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-[#1e3a8a] text-white shadow-md">
            <i className="fas fa-newspaper mr-2" />
            News
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {error && (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        )}

        {/* TOP NEWS — featured article */}
        {!loading && featuredArticle && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-8">Top News</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col lg:flex-row">
              <div className="relative lg:w-1/2 aspect-video lg:aspect-auto min-h-[260px] bg-gradient-to-br from-gray-200 to-gray-300">
                {featuredArticle.imageUrl ? (
                  <Image src={featuredArticle.imageUrl} alt={featuredArticle.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-newspaper text-6xl text-gray-400" />
                  </div>
                )}
                <span className="absolute bottom-4 left-4 bg-[#1e3a8a] text-white text-xs font-bold px-3 py-1">News</span>
              </div>
              <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                {(featuredArticle.location || featuredArticle.publishedAt) && (
                  <p className="text-sm font-semibold text-[#374151] mb-3">
                    {featuredArticle.location}{featuredArticle.location && featuredArticle.publishedAt ? ', ' : ''}{formatDate(featuredArticle.publishedAt)}
                  </p>
                )}
                <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4 leading-tight">{featuredArticle.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                  {featuredArticle.excerpt || featuredArticle.content.substring(0, 200)}
                </p>
                <Link
                  href={`/news/${featuredArticle.id}`}
                  className="inline-block bg-[#1e3a8a] text-white px-6 py-3 font-semibold hover:bg-blue-900 transition-colors w-fit"
                >
                  Read Now
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* TRENDING NOW — grid + search */}
        <section>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-[#1e3a8a]">Trending Now</h2>
            <div className="relative">
              <input
                type="search"
                placeholder="Search news..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48 sm:w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#9ca3af] text-sm">
              <i className="fas fa-spinner fa-spin mr-2" />Loading news…
            </div>
          ) : gridArticles.length === 0 ? (
            <div className="text-center py-16 text-[#9ca3af] text-sm">
              {debouncedSearch
                ? `No news found for "${debouncedSearch}"`
                : 'No news articles available.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#374151] disabled:opacity-40 hover:bg-[#f8fafc] transition-colors"
              >
                <i className="fas fa-chevron-left" />
              </button>
              <span className="text-sm text-[#6b7280]">Page {page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#374151] disabled:opacity-40 hover:bg-[#f8fafc] transition-colors"
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </section>

      </div>
    </>
  );
}
