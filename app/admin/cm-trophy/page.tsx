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
import {
  useAdminCmTrophyList,
  useAdminCmTrophyStats,
  useAdminCmTrophyWeeklyTrend,
} from '@/hooks/useAdminCmTrophy';
import { CmTrophyListParams, AdminKhelMahakumbhRegistration } from '@/lib/api/adminCmTrophyApi';
import { sportsApi, Sport } from '@/lib/api/sports';

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

function exportToCSV(rows: AdminKhelMahakumbhRegistration[], filename: string) {
  const headers = [
    'Sr No', 'Rejection Reason', 'Name', 'Application Code', 'Email', 'Phone',
    'DOB', 'Gender', 'Sport', 'Events', 'Age', 'Status', 'District', 'Block',
  ];
  const csvRows = rows.map((r, i) => [
    i + 1,
    '',
    r.fullName,
    r.registrationNo,
    r.email ?? '',
    r.mobile ?? '',
    r.dob ? new Date(r.dob).toLocaleDateString('en-IN') : '',
    r.gender,
    r.sport?.name ?? '',
    (r.selectedEvents || []).join('; '),
    calcAge(r.dob) ?? '',
    r.status,
    r.district?.name ?? '',
    r.block?.name ?? '',
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-2xl px-6 py-5 text-white shadow-sm">
      <div className="flex items-center gap-2 text-sm opacity-90">
        <i className="fas fa-trophy" />
        {label}
      </div>
      <div className="text-3xl font-extrabold mt-2">{value.toLocaleString('en-IN')}</div>
    </div>
  );
}

export default function CmTrophyAdminPage() {
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('');
  const [sportId, setSportId] = useState('');
  const [gender, setGender] = useState('');
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
  const { blocks } = useBlocks(districtId || undefined);
  const { sansads } = useSansads();
  const { vidhanSabhas } = useVidhanSabhas(sansadId || undefined);
  const { nyayPanchayats } = useNyayPanchayats(vidhanSabhaId || undefined);

  const filters: CmTrophyListParams = {
    page,
    limit,
    search: search || undefined,
    status: (status || undefined) as CmTrophyListParams['status'],
    sportId: sportId || undefined,
    gender: (gender || undefined) as CmTrophyListParams['gender'],
    ageCategory: (ageCategory || undefined) as CmTrophyListParams['ageCategory'],
    registrationLevel: (registrationLevel || undefined) as CmTrophyListParams['registrationLevel'],
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    districtId: districtId || undefined,
    blockId: blockId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useAdminCmTrophyList(filters);
  const { data: statsRes } = useAdminCmTrophyStats();
  const { data: trendRes } = useAdminCmTrophyWeeklyTrend();

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const stats = statsRes?.data ?? { total: 0, underReview: 0, approved: 0, rejected: 0 };
  const trend = trendRes?.data ?? [];

  const resetPage = () => setPage(1);

  const hasActiveFilters =
    search || status || sportId || gender || ageCategory || registrationLevel ||
    sansadId || vidhanSabhaId || nyayPanchayatId || districtId || blockId || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch(''); setStatus(''); setSportId(''); setGender(''); setAgeCategory(''); setRegistrationLevel('');
    setSansadId(''); setVidhanSabhaId(''); setNyayPanchayatId('');
    setDistrictId(''); setBlockId(''); setDateFrom(''); setDateTo('');
    resetPage();
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">CM Trophy</h2>
        <p className="text-xs text-gray-400 mt-0.5">CM Championship Trophy 2026-27 registrations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Applications" value={stats.total} />
        <StatCard label="Under Review" value={stats.underReview} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
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
                stroke="#1e3a8a"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1e3a8a' }}
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
            onClick={() => exportToCSV(rows, 'CM_Trophy_Registrations.csv')}
            disabled={rows.length === 0}
            className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-file-csv" /> Export
          </button>
          <button
            onClick={() => refetch()}
            className="bg-[#1e3a8a] text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#1e2f6b] transition-colors shadow-sm"
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

          <select value={sportId} onChange={(e) => { setSportId(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]">
            <option value="">All Sports</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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

          <select value={registrationLevel} onChange={(e) => { setRegistrationLevel(e.target.value); resetPage(); }} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[170px]">
            <option value="">All Registration Levels</option>
            {REGISTRATION_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

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

          <select
            value={districtId}
            onChange={(e) => { setDistrictId(e.target.value); setBlockId(''); resetPage(); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[140px]"
          >
            <option value="">All District</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select
            value={blockId}
            onChange={(e) => { setBlockId(e.target.value); resetPage(); }}
            disabled={!districtId}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[120px] disabled:opacity-50"
          >
            <option value="">All Block</option>
            {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

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
                <tr className="bg-[#1e3a8a] text-left">
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
                        href={`/admin/cm-trophy/${r.id}`}
                        className="inline-block bg-[#1e3a8a] text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-[#1e2f6b] transition-colors"
                      >
                        View
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
                    p === page ? 'bg-[#1e3a8a] text-white' : 'text-gray-700 hover:bg-gray-50'
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
