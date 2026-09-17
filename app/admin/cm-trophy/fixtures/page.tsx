'use client';

import Link from 'next/link';
import { useFixtureEvents } from '@/hooks/useAdminCmTrophyFixtures';
import { CmTrophyFixtureStatus, FIXTURE_LEVEL_LABEL } from '@/lib/api/adminCmTrophyFixturesApi';

const STATUS_BADGE: Record<CmTrophyFixtureStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  DRAWN: 'bg-amber-50 text-amber-700',
  LIVE: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function AdminCmTrophyFixturesPage() {
  const { data, isLoading, isError, error } = useFixtureEvents();

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">CM Trophy 2026-27 — Fixtures</h1>
        <Link
          href="/admin/cm-trophy/fixtures/new"
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b]"
        >
          <i className="fas fa-plus mr-2" />
          New Fixture
        </Link>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Each event is one level of the ladder (a Kabaddi tournament at a Vidhan Sabha, a Volleyball tournament at a
        Sansad, or the State final). When an event finishes, create the next level&apos;s event separately and add its
        winner as an entrant there.
      </p>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading fixtures…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error).message}</p>
        </div>
      ) : !data?.data.length ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4 text-gray-400">
          <i className="fas fa-trophy text-3xl mb-3 opacity-40" />
          <p className="text-sm">No fixture events yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Sport</th>
                <th className="px-4 py-3 text-left font-medium">Level</th>
                <th className="px-4 py-3 text-left font-medium">Scope</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Teams</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/admin/cm-trophy/fixtures/${ev.id}`} className="text-[#1e3a8a] font-semibold hover:underline">
                      {ev.sportName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{FIXTURE_LEVEL_LABEL[ev.level].split(' (')[0]}</td>
                  <td className="px-4 py-3 text-gray-600">{ev.entrantType === 'PLAYER' ? (ev.event || 'Individual players') : ev.scopeName}</td>
                  <td className="px-4 py-3 text-gray-600">{ev.ageCategory.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{ev.teamCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
