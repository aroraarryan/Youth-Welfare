'use client';

import { useState, useEffect, useMemo } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  url?: string;
  documentUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ', ' + new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function NotificationsPage() {
  const [items, setItems]       = useState<NotificationItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/notifications?limit=200')
      .then(r => r.json())
      .then(d => { setItems(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(n =>
      n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 relative z-10">Website Notifications</h1>
          <p className="text-white/80 text-base sm:text-lg relative z-10">
            Stay updated with the latest announcements from the Department of Youth Welfare &amp; PRD, Uttarakhand.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        {/* Search bar */}
        <div className="relative mb-8 max-w-xl">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a] transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {/* Header */}
          <div className="bg-[#0f172a] text-white grid grid-cols-[48px_1fr_2fr_120px_100px_160px] gap-0 px-0">
            {['S.No', 'Title', 'Message', 'URL', 'Document', 'Created On'].map(h => (
              <div key={h} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-white/80">
                {h}
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-[48px_1fr_2fr_120px_100px_160px] border-b border-gray-100 animate-pulse">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="px-4 py-5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-white px-6 py-20 text-center">
              <i className="fa-solid fa-bell-slash text-5xl text-gray-200 mb-4 block" />
              <p className="text-gray-400 font-medium">
                {search ? 'No notifications match your search.' : 'No notifications available yet.'}
              </p>
            </div>
          ) : (
            filtered.map((n, i) => {
              const isExpanded = expanded.has(n.id);
              return (
                <div
                  key={n.id}
                  className={`grid grid-cols-[48px_1fr_2fr_120px_100px_160px] border-b border-gray-100 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'
                  } hover:bg-blue-50/40`}
                >
                  {/* S.No */}
                  <div className="px-4 py-4 text-sm font-semibold text-gray-500 flex items-start pt-4">
                    {i + 1}
                  </div>

                  {/* Title */}
                  <div className="px-4 py-4 text-sm font-semibold text-[#1e293b] leading-snug flex items-start pt-4">
                    {n.title}
                  </div>

                  {/* Message */}
                  <div className="px-4 py-4 text-sm text-gray-600 leading-relaxed">
                    <p className={isExpanded ? '' : 'line-clamp-2'}>{n.message}</p>
                    {n.message.length > 120 && (
                      <button
                        onClick={() => toggleExpand(n.id)}
                        className="text-[#1e3a8a] text-xs font-semibold mt-1 hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* URL */}
                  <div className="px-4 py-4 text-sm flex items-start pt-4">
                    {n.url ? (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-link text-xs" /> Link
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>

                  {/* Document */}
                  <div className="px-4 py-4 text-sm flex items-start pt-4">
                    {n.documentUrl ? (
                      <a
                        href={n.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 font-semibold hover:underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-file-pdf text-base" />
                        <span className="text-xs">View</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>

                  {/* Created On */}
                  <div className="px-4 py-4 text-xs text-gray-500 leading-tight flex items-start pt-4">
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-right">
            Showing {filtered.length} of {items.length} notification{items.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </>
  );
}
