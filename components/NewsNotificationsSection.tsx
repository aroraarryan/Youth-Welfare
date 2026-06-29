'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsList } from '@/hooks/useNews';

interface NotifItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function NewsNotificationsSection() {
  const { articles, loading } = useNewsList({ limit: 8 });
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/notifications?limit=5')
      .then(r => r.json())
      .then(d => { setNotifications(d.data ?? []); setNotifLoading(false); })
      .catch(() => setNotifLoading(false));
  }, []);

  return (
    <section className="py-12 px-4 sm:px-10 bg-[#f8fafc]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Notifications Panel ──────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
            <span className="text-white text-xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-bullhorn text-lg" />
              Notifications
            </span>
            <Link
              href="/notifications"
              className="border border-white/30 text-white/90 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              View All <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
            </Link>
          </div>

          <div className="bg-white max-h-[520px] overflow-y-auto divide-y divide-gray-100">
            {notifLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-400">
                <i className="fa-solid fa-bell-slash text-4xl mb-4 block opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const d = new Date(n.createdAt);
                const day   = String(d.getDate()).padStart(2, '0');
                const month = d.toLocaleString('en', { month: 'short' });
                return (
                  <div key={n.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-default">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-[#1e293b] leading-none">{day}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-bold text-[#1e293b] leading-snug line-clamp-1 mb-1">{n.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── News Panel ───────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
            <span className="text-white text-xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-newspaper text-lg" />
              News
            </span>
            <Link
              href="/news"
              className="border border-white/30 text-white/90 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              View All <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
            </Link>
          </div>

          <div className="bg-white max-h-[520px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4 animate-pulse">
                  <div className="w-[96px] h-[72px] rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))
            ) : articles.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-400">
                <i className="fa-solid fa-newspaper text-4xl mb-4 block opacity-30" />
                <p className="text-sm font-medium">No news articles yet</p>
              </div>
            ) : (
              articles.map(item => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="w-[96px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} width={96} height={72} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-image text-2xl text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                        General
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#1e293b] leading-snug line-clamp-2 mb-1">{item.title}</p>
                    {item.location && (
                      <p className="text-[11px] font-semibold text-[#1e3a8a] mb-1">{item.location}</p>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {item.excerpt || item.content.slice(0, 100) + '...'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
