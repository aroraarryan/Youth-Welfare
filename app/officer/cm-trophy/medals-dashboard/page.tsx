'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useOfficerMedals } from '@/hooks/useOfficerCmTrophy';
import { teamLabel } from '@/lib/cmTrophyTeamMedal';
import { sportsApi, Sport } from '@/lib/api/sports';
import { officerApi } from '@/lib/api/officerApi';
import {
  officerCmTrophyApi,
  CmTrophyMedal,
  MedalRecord,
  OfficerMedalLevel,
  LEVEL_LABEL,
} from '@/lib/api/officerCmTrophyApi';
import { CmTrophyAgeCategory, CM_TROPHY_AGE_CATEGORY_LABELS } from '@/lib/cmTrophyAgeCategory';

// Mirrors app/admin/cm-trophy/medals-dashboard/page.tsx (layout, filters, tiles, columns, Excel
// export). The server scopes the records to the officer (block officers: Nyay Panchayat level in
// their block; district officers: every level, players from their district), so the only
// difference here is that the Level filter is shown to district officers only.
const LEVELS: OfficerMedalLevel[] = ['NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD'];
const MEDALS: CmTrophyMedal[] = ['GOLD', 'SILVER', 'BRONZE'];
const AGE_CATEGORIES: CmTrophyAgeCategory[] = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const MEDAL_RANK: Record<string, number> = { GOLD: 1, SILVER: 2, BRONZE: 3 };
const selectClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[160px] disabled:opacity-50';

const sortRows = (rows: MedalRecord[]) =>
  [...rows].sort(
    (a, b) =>
      (a.entityName ?? '').localeCompare(b.entityName ?? '') ||
      MEDAL_RANK[a.medal] - MEDAL_RANK[b.medal] ||
      (a.teamId ?? '').localeCompare(b.teamId ?? '') ||
      a.name.localeCompare(b.name),
  );

export default function OfficerMedalDashboardPage() {
  const [isDistrictOfficer, setIsDistrictOfficer] = useState<boolean | null>(null);
  // Block officer who is nodal in-charge of a Vidhan Sabha: also sees that seat's Vidhan Sabha-level medals.
  const [isNodal, setIsNodal] = useState(false);
  const [sportId, setSportId] = useState('');
  const [level, setLevel] = useState<OfficerMedalLevel | ''>('');
  const [medal, setMedal] = useState<CmTrophyMedal | ''>('');
  const [event, setEvent] = useState('');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    officerApi.me().then((res) => {
      setIsDistrictOfficer(res.officer.role === 'DO_PRD');
      setIsNodal(res.officer.role === 'BO_PRD' && (res.officer.nodalVidhanSabhas?.length ?? 0) > 0);
    }).catch(() => setIsDistrictOfficer(false));
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filters = {
    sportId: sportId || undefined,
    level: level || undefined,
    medal: medal || undefined,
    event: event || undefined,
    ageCategory: ageCategory || undefined,
    search: search || undefined,
  };

  const { data, isLoading, isError, error } = useOfficerMedals({ ...filters, page, limit: 50 });

  // Wider fetch (same filters, minus event) just to build the Event dropdown's option list.
  const { data: eventOptionsData } = useOfficerMedals({ sportId: filters.sportId, level: filters.level, medal: filters.medal, limit: 200 });
  const eventOptions = Array.from(
    new Set((eventOptionsData?.data ?? []).map((r) => r.event).filter((e): e is string => !!e)),
  ).sort();

  const rows = sortRows(data?.data ?? []);
  // Server-side, across all pages, a team counted once.
  const summary = data?.summary ?? { gold: 0, silver: 0, bronze: 0, total: 0 };

  // Exports EVERY record matching the current filters (all pages), not just the visible one.
  const handleExport = async () => {
    setExporting(true);
    try {
      const limit = 200;
      let exportPage = 1;
      let total = Infinity;
      const all: MedalRecord[] = [];
      while (all.length < total) {
        const res = await officerCmTrophyApi.listMedals({ ...filters, page: exportPage, limit });
        all.push(...res.data);
        total = res.total;
        if (res.data.length === 0) break;
        exportPage++;
      }
      const sheetRows = sortRows(all).map((r) => ({
        Rank: MEDAL_RANK[r.medal],
        Name: r.name,
        Sport: r.sportName,
        Gender: r.gender ? r.gender.charAt(0) + r.gender.slice(1).toLowerCase() : '',
        Event: r.event ?? '',
        'Age Category': r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory] : '',
        Medal: r.medal.charAt(0) + r.medal.slice(1).toLowerCase(),
        Level: LEVEL_LABEL[r.level] ?? r.level,
        Location: r.entityName ?? '',
        'Application Code': r.applicationCode,
        Team: r.teamId ? teamLabel(r) : '',
      }));
      const ws = XLSX.utils.json_to_sheet(sheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Medals');
      XLSX.writeFile(wb, `cm-trophy-medals-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  // Wait for the role so a block officer never briefly sees the Level filter.
  if (isDistrictOfficer === null) return <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-gray-900">CM Trophy 2026-27 — Medal Dashboard</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-[#115e59] hover:bg-[#0f766e] text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          <i className={`fas ${exporting ? 'fa-circle-notch fa-spin' : 'fa-file-excel'}`} />
          {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {isDistrictOfficer
          ? 'Medal records for players from your district, all levels.'
          : isNodal
            ? 'Nyay Panchayat-level medal records, plus Vidhan Sabha-level records for your nodal Vidhan Sabha.'
            : 'Nyay Panchayat-level medal records only.'}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[220px]"
          placeholder="Search by name or application code…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className={selectClass} value={sportId} onChange={(e) => { setSportId(e.target.value); setEvent(''); setPage(1); }}>
          <option value="">All Sports</option>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {(isDistrictOfficer || isNodal) && (
          <select className={selectClass} value={level} onChange={(e) => { setLevel(e.target.value as OfficerMedalLevel | ''); setEvent(''); setPage(1); }}>
            <option value="">All Levels</option>
            {(isDistrictOfficer ? LEVELS : LEVELS.filter((l) => l !== 'SANSAD')).map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
        )}

        <select className={selectClass} value={medal} onChange={(e) => { setMedal(e.target.value as CmTrophyMedal | ''); setPage(1); }}>
          <option value="">All Medals</option>
          {MEDALS.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
        </select>

        <select className={selectClass} value={event} onChange={(e) => { setEvent(e.target.value); setPage(1); }}>
          <option value="">All Events</option>
          {eventOptions.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
        </select>

        <select className={selectClass} value={ageCategory} onChange={(e) => { setAgeCategory(e.target.value as CmTrophyAgeCategory | ''); setPage(1); }}>
          <option value="">All Age Categories</option>
          {AGE_CATEGORIES.map((c) => <option key={c} value={c}>{CM_TROPHY_AGE_CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">🥇 Gold</p>
          <p className="text-2xl font-bold text-gray-900">{summary.gold}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">🥈 Silver</p>
          <p className="text-2xl font-bold text-gray-900">{summary.silver}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">🥉 Bronze</p>
          <p className="text-2xl font-bold text-gray-900">{summary.bronze}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total medals</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error).message}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Sport</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Age Category</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Medal</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Application Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">No medal records match this filter.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-semibold">{MEDAL_RANK[r.medal]}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {r.name}
                        {r.teamId && (
                          <span className="block mt-0.5 w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {teamLabel(r)} · counts as 1
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.sportName}</td>
                      <td className="px-4 py-3 text-gray-700">{r.gender ? r.gender.charAt(0) + r.gender.slice(1).toLowerCase() : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.event ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory] : '—'}</td>
                      <td className="px-4 py-3">
                        {r.medal === 'GOLD' ? '🥇' : r.medal === 'SILVER' ? '🥈' : '🥉'} {r.medal.charAt(0) + r.medal.slice(1).toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{LEVEL_LABEL[r.level] ?? r.level}</td>
                      <td className="px-4 py-3 text-gray-700">{r.entityName ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.applicationCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > data.limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>Page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total} total)</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Prev</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / data.limit)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
