'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOfficerCmTrophyList } from '@/hooks/useOfficerCmTrophy';
import { RegistrationStatus } from '@/lib/api/registrations';

const STATUSES: RegistrationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];
const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto';

const STATUS_BADGE: Record<RegistrationStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  WAITLISTED: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function OfficerCmTrophyRegistrationsPage() {
  const [status, setStatus] = useState<RegistrationStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useOfficerCmTrophyList({ status: status || undefined, search: search || undefined, page, limit });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Registrations</h1>
      <p className="text-sm text-gray-500 mb-6">Nyay Panchayat-level registrations only.</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-64"
          placeholder="Search by name / application code"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select className={selectClass} value={status} onChange={(e) => { setStatus(e.target.value as RegistrationStatus); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500 text-sm">{(error as Error).message}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Application Code</th>
                <th className="px-4 py-2 text-left font-medium">Sport</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No registrations found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-gray-800">{r.fullName}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.registrationNo}</td>
                    <td className="px-4 py-2 text-gray-600">{r.sport?.name ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/officer/cm-trophy/${r.id}`} className="text-[#1e3a8a] font-semibold hover:underline text-xs">View / Edit</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
