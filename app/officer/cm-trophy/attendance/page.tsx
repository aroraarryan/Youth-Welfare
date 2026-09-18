'use client';

import { useState, useEffect } from 'react';
import { useOfficerAttendanceList, useOfficerMarkAttendance, useOfficerBulkMarkPresent } from '@/hooks/useOfficerCmTrophy';

export default function OfficerAttendancePage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const limit = 50;

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useOfficerAttendanceList({ search: search || undefined, page, limit });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

  const markAttendance = useOfficerMarkAttendance();
  const bulkMarkPresent = useOfficerBulkMarkPresent();

  const selectableIds = rows.filter((r) => r.isPresent === null).map((r) => r.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const submitAttendance = () => {
    if (selected.size === 0) return;
    bulkMarkPresent.mutate(Array.from(selected), { onSuccess: () => setSelected(new Set()) });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">
        Check in Nyay Panchayat-level players on event day — mark write-once, cannot be undone.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-64"
          placeholder="Search by name or application code"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          onClick={submitAttendance}
          disabled={selected.size === 0 || bulkMarkPresent.isPending}
          className="ml-auto text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
        >
          {bulkMarkPresent.isPending ? 'Submitting…' : `Submit Attendance${selected.size ? ` (${selected.size})` : ''}`}
        </button>
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
                <th className="px-4 py-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Application Code</th>
                <th className="px-4 py-2 text-left font-medium">Sport</th>
                <th className="px-4 py-2 text-left font-medium">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No registrations found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      {r.isPresent === null && (
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{r.fullName}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.registrationNo}</td>
                    <td className="px-4 py-2 text-gray-600">{r.sportName}</td>
                    <td className="px-4 py-2">
                      {r.isPresent === true ? (
                        <span className="text-green-600 text-xs font-semibold">Present</span>
                      ) : r.isPresent === false ? (
                        <span className="text-red-500 text-xs font-semibold">Absent</span>
                      ) : (
                        <button
                          onClick={() => markAttendance.mutate({ registrationId: r.id, isPresent: false })}
                          disabled={markAttendance.isPending}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Mark Absent
                        </button>
                      )}
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
