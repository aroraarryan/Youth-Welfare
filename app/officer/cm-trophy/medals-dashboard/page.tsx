'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useOfficerMedals } from '@/hooks/useOfficerCmTrophy';

export default function OfficerMedalDashboardPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const limit = 50;

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useOfficerMedals({ search: search || undefined, page, limit });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

  const handleExport = () => {
    setExporting(true);
    try {
      const sheet = XLSX.utils.json_to_sheet(
        rows.map((r) => ({
          'Application Code': r.applicationCode,
          Name: r.name,
          "Father's Name": r.fathersName,
          Sport: r.sportName,
          Medal: r.medal,
          'Nyay Panchayat': r.entityName,
          Gender: r.gender,
          Event: r.event,
          'Age Category': r.ageCategory,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Medals');
      XLSX.writeFile(workbook, 'cm-trophy-nyay-panchayat-medals.xlsx');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Medal Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Nyay Panchayat-level medal records only.</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-64"
          placeholder="Search by name / application code"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          onClick={handleExport}
          disabled={exporting || rows.length === 0}
          className="ml-auto text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <i className="fas fa-file-excel mr-2 text-green-600" />
          Export current page
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
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Application Code</th>
                <th className="px-4 py-2 text-left font-medium">Sport</th>
                <th className="px-4 py-2 text-left font-medium">Medal</th>
                <th className="px-4 py-2 text-left font-medium">Nyay Panchayat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No medal records found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-gray-800">{r.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{r.applicationCode}</td>
                    <td className="px-4 py-2 text-gray-600">{r.sportName}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs font-semibold">{r.medal.charAt(0) + r.medal.slice(1).toLowerCase()}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{r.entityName ?? '—'}</td>
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
