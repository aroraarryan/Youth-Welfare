'use client';

import { useState, useEffect } from 'react';
import { useOfficerGrievances, useOfficerResolveGrievance, useOfficerDeleteGrievance } from '@/hooks/useOfficerCmTrophy';
import { Grievance } from '@/lib/api/officerCmTrophyApi';

type Tab = 'all' | 'unresolved' | 'resolved';

export default function OfficerGrievancePage() {
  const [tab, setTab] = useState<Tab>('unresolved');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const limit = 25;

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useOfficerGrievances({
    isResolved: tab === 'all' ? undefined : tab === 'resolved',
    search: search || undefined,
    page,
    limit,
  });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

  const resolveMutation = useOfficerResolveGrievance();
  const deleteMutation = useOfficerDeleteGrievance();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'unresolved', label: 'Unresolved' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Grievances</h1>
      <p className="text-sm text-gray-500 mb-6">Not scoped to Nyay Panchayat — grievances have no geographic level.</p>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
        <input
          className="ml-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 self-center"
          placeholder="Search by name / email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No grievances found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((g) => (
                <li
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selected?.id === g.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{g.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${g.isResolved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                      {g.isResolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{g.problem}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {!selected ? (
            <p className="text-sm text-gray-400 text-center py-10">Select a grievance to view details.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Name:</span> {selected.name}</div>
              <div><span className="text-gray-500">Email:</span> {selected.email}</div>
              <div><span className="text-gray-500">Mobile:</span> {selected.mobile}</div>
              {selected.atomId && <div><span className="text-gray-500">Application Code:</span> {selected.atomId}</div>}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-gray-500 block mb-1">Problem:</span>
                <p className="whitespace-pre-wrap">{selected.problem}</p>
              </div>
              <div className="flex gap-2 pt-3">
                {!selected.isResolved && (
                  <button
                    onClick={() => resolveMutation.mutate(selected.id, { onSuccess: () => setSelected({ ...selected, isResolved: true }) })}
                    disabled={resolveMutation.isPending}
                    className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
                  >
                    Mark Resolved
                  </button>
                )}
                {confirmDeleteId === selected.id ? (
                  <>
                    <button
                      onClick={() => deleteMutation.mutate(selected.id, { onSuccess: () => { setSelected(null); setConfirmDeleteId(null); } })}
                      className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDeleteId(selected.id)} className="text-sm text-red-500 hover:underline px-4 py-2">
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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
