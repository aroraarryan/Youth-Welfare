'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDistricts, useBlocks } from '@/hooks/useInfrastructure';
import {
  useSansads,
  useVidhanSabhas,
  useNyayPanchayats,
} from '@/hooks/useCmTrophyGeo';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PaginatedResponse } from '@/lib/api';
import type {
  CmTrophyListParams,
  AdminKhelMahakumbhExportRow,
  AdminKhelMahakumbhRegistration,
  CmTrophyStats,
  CmTrophyWeeklyPoint,
} from '@/lib/api/adminCmTrophyApi';
import { sportsApi, Sport } from '@/lib/api/sports';

// Shared by the admin page (app/admin/cm-trophy/page.tsx) and the officer page
// (app/officer/cm-trophy/page.tsx) so the two can't drift. They differ only in which
// data hooks / export they call and a few UI-only lock/hide flags — the server enforces
// each officer's scope (block / district) regardless of what the UI shows.
// Admin portal = blue, officer portal = teal (same split as app/admin/layout.tsx and app/officer/layout.tsx).
const ACCENTS = {
  admin: {
    card: 'from-[#1e3a8a] to-[#2563eb]',
    solid: 'bg-[#1e3a8a]',
    solidHover: 'hover:bg-[#1e2f6b]',
    stroke: '#1e3a8a',
  },
  officer: {
    card: 'from-[#115e59] to-[#0d9488]',
    solid: 'bg-[#115e59]',
    solidHover: 'hover:bg-[#0f766e]',
    stroke: '#115e59',
  },
} as const;
export type DashboardAccent = keyof typeof ACCENTS;

export interface RegistrationsDashboardProps {
  title: string;
  subtitle: string;
  detailHref: (id: string) => string;
  actionLabel?: string;
  useList: (filters: CmTrophyListParams) => UseQueryResult<PaginatedResponse<AdminKhelMahakumbhRegistration>, Error>;
  useStats: () => UseQueryResult<{ data: CmTrophyStats }, Error>;
  useTrend: () => UseQueryResult<{ data: CmTrophyWeeklyPoint[] }, Error>;
  exportBatch: (
    filters: CmTrophyListParams,
    cursor: string | null,
  ) => Promise<{ data: AdminKhelMahakumbhExportRow[]; nextCursor: string | null }>;
  /** Registration Level filter (hidden for block officers: the server forces Nyay Panchayat). Default true. */
  showLevelFilter?: boolean;
  /** District + Block filters (hidden for block officers, who only have one block). Default true. */
  showDistrictFilters?: boolean;
  /** District officers: their own district — the District filter is locked to it, Block/Sansad/Vidhan Sabha narrow to it. */
  lockedDistrictId?: string;
  /** Colour theme: 'admin' (blue, default) or 'officer' (teal). */
  accent?: DashboardAccent;
}

const AGE_CATEGORIES = [
  { value: 'UNDER_14', label: 'Under 14' },
  { value: 'UNDER_19', label: 'Under 19' },
  { value: 'WOMENS_19_25', label: "Women's 19-25" },
  { value: 'PARA_OPEN', label: 'Para Open' },
];

const REGISTRATION_LEVELS = [
  { value: 'NYAY_PANCHAYAT', label: 'Nyay Panchayat' },
  { value: 'VIDHAN_SABHA', label: 'Vidhan Sabha' },
  { value: 'SANSAD', label: 'Sansad' },
  { value: 'STATE', label: 'State' },
];

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const edge = 3; // pages shown at each end
  const around = 1; // pages shown around current
  const pages = new Set<number>();
  for (let i = 1; i <= Math.min(edge, total); i++) pages.add(i);
  for (let i = Math.max(1, total - edge + 1); i <= total; i++) pages.add(i);
  for (let i = Math.max(1, current - around); i <= Math.min(total, current + around); i++) pages.add(i);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push('...');
    result.push(p);
    prev = p;
  }
  return result;
}

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

const CSV_HEADERS = [
  'Sr No', 'Name', 'Application Code', 'Email', 'Phone', 'DOB', 'Gender',
  'Sport', 'Events', 'Age Category', 'Registration Level', 'Sansad',
  'Vidhan Sabha', 'Nyay Panchayat', 'District', 'Block',
];

const csvCell = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;

// One export batch -> CSV text. `offset` keeps Sr No running across batches.
function exportRowsToCsv(rows: AdminKhelMahakumbhExportRow[], offset: number): string {
  return rows
    .map((r, i) => [
    offset + i + 1,
    r.fullName,
    r.registrationNo,
    r.email ?? '',
    r.mobile ?? '',
    r.dob ? new Date(r.dob).toLocaleDateString('en-IN') : '',
    r.gender,
    r.sport?.name ?? '',
    (r.selectedEvents || []).join('; '),
    AGE_CATEGORIES.find((a) => a.value === r.ageCategory)?.label ?? r.ageCategory,
    REGISTRATION_LEVELS.find((l) => l.value === r.registrationLevel)?.label ?? r.registrationLevel,
    r.sansad?.name ?? '',
    r.vidhanSabha?.name ?? '',
    r.nyayPanchayat?.name ?? '',
    r.district?.name ?? '',
    r.block?.name ?? '',
    ].map(csvCell).join(','))
    .join('\n');
}

function downloadCsv(parts: string[], filename: string) {
  const blob = new Blob(parts, { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Deferred: revoking synchronously can cancel a large download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl px-6 py-5 text-white shadow-sm`}>
      <div className="flex items-center gap-2 text-sm opacity-90">
        <i className="fas fa-trophy" />
        {label}
      </div>
      <div className="text-3xl font-extrabold mt-2">{value.toLocaleString('en-IN')}</div>
    </div>
  );
}

export default function RegistrationsDashboard({
  title,
  subtitle,
  detailHref,
  actionLabel = 'View',
  useList,
  useStats,
  useTrend,
  exportBatch,
  showLevelFilter = true,
  showDistrictFilters = true,
  lockedDistrictId,
  accent = 'admin',
}: RegistrationsDashboardProps) {
  const a = ACCENTS[accent];
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('');
  const [sportId, setSportId] = useState('');
  const [gender, setGender] = useState('');
  const [event, setEvent] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [registrationLevel, setRegistrationLevel] = useState('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [nyayPanchayatId, setNyayPanchayatId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [blockId, setBlockId] = useState('');

  const [sports, setSports] = useState<Sport[]>([]);
  useEffect(() => {
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
  }, []);

  const { districts } = useDistricts();
  const effectiveDistrictId = lockedDistrictId ?? districtId;
  const { blocks } = useBlocks(effectiveDistrictId || undefined);
  const { sansads } = useSansads(lockedDistrictId);
  const { vidhanSabhas } = useVidhanSabhas(sansadId || undefined, lockedDistrictId);
  const { nyayPanchayats } = useNyayPanchayats(vidhanSabhaId || undefined);

  const filters: CmTrophyListParams = {
    page,
    limit,
    search: search || undefined,
    status: (status || undefined) as CmTrophyListParams['status'],
    sportId: sportId || undefined,
    gender: (gender || undefined) as CmTrophyListParams['gender'],
    event: event || undefined,
    ageCategory: (ageCategory || undefined) as CmTrophyListParams['ageCategory'],
    registrationLevel: (registrationLevel || undefined) as CmTrophyListParams['registrationLevel'],
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    districtId: effectiveDistrictId || undefined,
    blockId: blockId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useList(filters);
  const { data: statsRes } = useStats();
  const { data: trendRes } = useTrend();

  // Wider fetch (same filters, minus event) just to build the Event dropdown's option list.
  const { data: eventOptionsData } = useList({ ...filters, event: undefined, page: 1, limit: 200 });
  const eventOptions = Array.from(
    new Set(
      (eventOptionsData?.data ?? []).flatMap((r) => r.selectedEvents || [])
    )
  ).sort();

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const stats = statsRes?.data ?? { total: 0, underReview: 0, approved: 0, rejected: 0 };
  const trend = trendRes?.data ?? [];

  const resetPage = () => setPage(1);

  // Exports EVERY record matching the current filters (not just this page),
  // fetched in cursor-paginated batches and stitched into one CSV.
  const [exporting, setExporting] = useState<{ done: number } | null>(null);
  const [exportError, setExportError] = useState('');

  const handleExport = async () => {
    if (exporting) return;
    setExportError('');
    setExporting({ done: 0 });
    try {
      const parts: string[] = ['﻿' + CSV_HEADERS.map(csvCell).join(',') + '\n'];
      let cursor: string | null = null;
      let done = 0;
      do {
        const res = await exportBatch(filters, cursor);
        if (res.data.length > 0) parts.push(exportRowsToCsv(res.data, done) + '\n');
        done += res.data.length;
        cursor = res.nextCursor;
        setExporting({ done });
      } while (cursor);
      downloadCsv(parts, 'CM_Trophy_Registrations.csv');
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const hasActiveFilters =
    search || status || sportId || gender || event || ageCategory || registrationLevel ||
    sansadId || vidhanSabhaId || nyayPanchayatId || districtId || blockId || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch(''); setStatus(''); setSportId(''); setGender(''); setEvent(''); setAgeCategory(''); setRegistrationLevel('');
    setSansadId(''); setVidhanSabhaId(''); setNyayPanchayatId('');
    setDistrictId(''); setBlockId(''); setDateFrom(''); setDateTo('');
    resetPage();
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Applications" value={stats.total} gradient={a.card} />
        <StatCard label="Under Review" value={stats.underReview} gradient={a.card} />
        <StatCard label="Approved" value={stats.approved} gradient={a.card} />
        <StatCard label="Rejected" value={stats.rejected} gradient={a.card} />
      </div>

      {/* Weekly chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Total Registration</h3>
          <span className="text-xs text-gray-400">Weekly</span>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={a.stroke}
                strokeWidth={2}
                dot={{ r: 4, fill: a.stroke }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); resetPage(); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search here…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[180px]"
          />
          <button
            onClick={handleExport}
            disabled={rows.length === 0 || !!exporting}
            className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Exporting {exporting.done.toLocaleString('en-IN')}
                {meta ? ` / ${meta.total.toLocaleString('en-IN')}` : ''}…
              </>
            ) : (
              <>
                <i className="fas fa-file-csv" /> Export
              </>
            )}
          </button>
          {exportError && <span className="text-xs text-red-600">{exportError}</span>}
          <button
            onClick={() => refetch()}
            className={`${a.solid} text-white w-9 h-9 rounded-lg flex items-center justify-center ${a.solidHover} transition-colors shadow-sm`}
            title="Refresh"
          >
            <i className="fas fa-rotate-right" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]">
            <option value="">All Status</option>
            <option value="PENDING">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select value={sportId} onChange={(e) => { setSportId(e.target.value); setEvent(''); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]">
            <option value="">All Sports</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select
            value={event}
            onChange={(e) => { setEvent(e.target.value); resetPage(); }}
            disabled={!sportId}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px] disabled:opacity-50"
          >
            <option value="">All Events</option>
            {eventOptions.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>

          <select value={gender} onChange={(e) => { setGender(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]">
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <select value={ageCategory} onChange={(e) => { setAgeCategory(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[160px]">
            <option value="">All Age Categories</option>
            {AGE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          {showLevelFilter && (
            <select value={registrationLevel} onChange={(e) => { setRegistrationLevel(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[170px]">
              <option value="">All Registration Levels</option>
              {REGISTRATION_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          )}

          <select
            value={sansadId}
            onChange={(e) => { setSansadId(e.target.value); setVidhanSabhaId(''); setNyayPanchayatId(''); resetPage(); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]"
          >
            <option value="">All Sansad</option>
            {sansads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select
            value={vidhanSabhaId}
            onChange={(e) => { setVidhanSabhaId(e.target.value); setNyayPanchayatId(''); resetPage(); }}
            disabled={!sansadId}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[150px] disabled:opacity-50"
          >
            <option value="">All Vidhan Sabha</option>
            {vidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>

          <select
            value={nyayPanchayatId}
            onChange={(e) => { setNyayPanchayatId(e.target.value); resetPage(); }}
            disabled={!vidhanSabhaId}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[150px] disabled:opacity-50"
          >
            <option value="">All Nyay Panchayat</option>
            {nyayPanchayats.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>

          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white" />

          {showDistrictFilters && (
            <>
              <select
                value={effectiveDistrictId}
                onChange={(e) => { setDistrictId(e.target.value); setBlockId(''); resetPage(); }}
                disabled={!!lockedDistrictId}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px] disabled:opacity-70"
              >
                <option value="">All District</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <select
                value={blockId}
                onChange={(e) => { setBlockId(e.target.value); resetPage(); }}
                disabled={!effectiveDistrictId}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[120px] disabled:opacity-50"
              >
                <option value="">All Block</option>
                {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </>
          )}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-blue-700 font-medium">
              Clear
            </button>
          )}
          {meta && <span className="text-xs text-gray-400 ml-auto">{meta.total} records</span>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
            <p className="text-sm">Loading registrations…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500 text-sm mb-3">{(error as Error).message}</p>
            <button onClick={() => refetch()} className="text-xs text-blue-700 hover:underline">Try again</button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fas fa-trophy text-3xl mb-3 text-gray-200" />
            <p className="text-sm font-medium">No registrations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${a.solid} text-left`}>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Sr No</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Rejection Reason</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Application Code</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">DOB</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Sport</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Events</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">District</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Block</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                    <td className="px-4 py-3">
                      {r.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photoUrl} alt={r.fullName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-[12px]">{r.registrationNo}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.mobile ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.dob ? new Date(r.dob).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.gender?.toLowerCase()}</td>
                    <td className="px-4 py-3 text-gray-600">{r.sport?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{(r.selectedEvents || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{calcAge(r.dob) ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                        r.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                        r.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.district?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.block?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={detailHref(r.id)}
                        className={`inline-block ${a.solid} text-white px-4 py-1.5 rounded-md text-xs font-semibold ${a.solidHover} transition-colors`}
                      >
                        {actionLabel}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-[13px] text-gray-500">
            Page <span className="font-semibold text-gray-700">{meta.page}</span> of{' '}
            <span className="font-semibold text-gray-700">{meta.totalPages}</span> (
            <span className="font-semibold text-gray-700">{meta.total}</span> total)
          </p>
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
            <button
              disabled={page <= 1}
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-3 py-2 border-r border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium text-gray-600"
            >
              ‹ previous
            </button>
            {getPageNumbers(page, meta.totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-3 py-2 border-r border-gray-200 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`px-3 py-2 border-r border-gray-200 font-medium ${
                    p === page ? `${a.solid} text-white` : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              disabled={page >= meta.totalPages}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-3 py-2 disabled:opacity-40 hover:bg-gray-50 font-medium text-gray-600"
            >
              next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
