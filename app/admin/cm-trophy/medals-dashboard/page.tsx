'use client';

import { useState, useEffect } from 'react';
import { useDistricts } from '@/hooks/useInfrastructure';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import { sportsApi, Sport } from '@/lib/api/sports';
import { CmTrophyMedalLevel, CmTrophyMedal, MEDAL_LEVEL_LABEL } from '@/lib/api/adminCmTrophyApi';
import { Gender } from '@/lib/api/registrations';
import { useMedals, useDeleteMedal, useUpdateMedal, useAdminPermissions } from '@/hooks/useAdminCmTrophy';
import { CmTrophyAgeCategory, CM_TROPHY_AGE_CATEGORY_LABELS } from '@/lib/cmTrophyAgeCategory';
import { adminCmTrophyApi, CreateMedalInput, MedalRecord } from '@/lib/api/adminCmTrophyApi';
import * as XLSX from 'xlsx';

const LEVELS: CmTrophyMedalLevel[] = ['DISTRICT', 'NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD'];
const MEDALS: CmTrophyMedal[] = ['GOLD', 'SILVER', 'BRONZE'];
const AGE_CATEGORIES: CmTrophyAgeCategory[] = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};
const selectClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[160px] disabled:opacity-50';

export default function AdminMedalDashboardPage() {
  const [sportId, setSportId] = useState('');
  const [level, setLevel] = useState<CmTrophyMedalLevel | ''>('');
  const [medal, setMedal] = useState<CmTrophyMedal | ''>('');
  const [districtId, setDistrictId] = useState('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [nyayPanchayatId, setNyayPanchayatId] = useState('');
  const [event, setEvent] = useState('');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [username, setUsername] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MedalRecord | null>(null);
  const [editTarget, setEditTarget] = useState<MedalRecord | null>(null);
  const deleteMedal = useDeleteMedal();

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => setUsername(d?.admin?.username ?? '')).catch(() => {});
  }, []);
  const canDelete = username === 'superadmin';
  const canEdit = username === 'superadmin';
  const { canExportBankDetails } = useAdminPermissions();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMedal.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [sports, setSports] = useState<Sport[]>([]);
  const { districts } = useDistricts();
  const { sansads } = useSansads();
  const { vidhanSabhas } = useVidhanSabhas(sansadId || undefined);
  const { nyayPanchayats } = useNyayPanchayats(vidhanSabhaId || undefined);

  useEffect(() => {
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
  }, []);

  const { data, isLoading, isError, error } = useMedals({
    sportId: sportId || undefined,
    level: level || undefined,
    medal: medal || undefined,
    districtId: districtId || undefined,
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    event: event || undefined,
    ageCategory: ageCategory || undefined,
    search: search || undefined,
    page,
    limit: 50,
  });

  // Wider fetch (same filters, minus event) just to build the Event dropdown's option list.
  const { data: eventOptionsData } = useMedals({
    sportId: sportId || undefined,
    level: level || undefined,
    medal: medal || undefined,
    districtId: districtId || undefined,
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    limit: 200,
  });
  const eventOptions = Array.from(
    new Set((eventOptionsData?.data ?? []).map((r) => r.event).filter((e): e is string => !!e))
  ).sort();
  const MEDAL_RANK: Record<string, number> = { GOLD: 1, SILVER: 2, BRONZE: 3 };
  const rows = [...(data?.data ?? [])].sort(
    (a, b) =>
      (a.entityName ?? '').localeCompare(b.entityName ?? '') ||
      MEDAL_RANK[a.medal] - MEDAL_RANK[b.medal] ||
      a.name.localeCompare(b.name)
  );
  const summary = rows.reduce(
    (acc, r) => {
      if (r.medal === 'GOLD') acc.gold++;
      else if (r.medal === 'SILVER') acc.silver++;
      else acc.bronze++;
      return acc;
    },
    { gold: 0, silver: 0, bronze: 0 }
  );

  const exportFilters = {
    sportId: sportId || undefined,
    level: level || undefined,
    medal: medal || undefined,
    districtId: districtId || undefined,
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    event: event || undefined,
    ageCategory: ageCategory || undefined,
    search: search || undefined,
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const limit = 200;
      let page = 1;
      let total = Infinity;
      const all: MedalRecord[] = [];
      while (all.length < total) {
        const res = await adminCmTrophyApi.listMedals({ ...exportFilters, page, limit });
        all.push(...res.data);
        total = res.total;
        if (res.data.length === 0) break;
        page++;
      }
      const sorted = [...all].sort(
        (a, b) =>
          (a.entityName ?? '').localeCompare(b.entityName ?? '') ||
          MEDAL_RANK[a.medal] - MEDAL_RANK[b.medal] ||
          a.name.localeCompare(b.name)
      );
      const sheetRows = sorted.map((r) => ({
        Rank: MEDAL_RANK[r.medal],
        Name: r.name,
        Sport: r.sportName,
        Gender: r.gender ? r.gender.charAt(0) + r.gender.slice(1).toLowerCase() : '',
        Event: r.event ?? '',
        'Age Category': r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory] : '',
        Medal: r.medal.charAt(0) + r.medal.slice(1).toLowerCase(),
        Level: MEDAL_LEVEL_LABEL[r.level],
        Location: r.entityName ?? '',
        'Application Code': r.applicationCode,
        ...(canExportBankDetails && {
          'Bank Name': r.bankName ?? '',
          'Account Holder Name': r.accountHolderName ?? '',
          'Account Number': r.accountNumber ?? '',
          'IFSC Code': r.ifscCode ?? '',
        }),
      }));
      const ws = XLSX.utils.json_to_sheet(sheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Medals');
      XLSX.writeFile(wb, `cm-trophy-medals-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const handleLevelChange = (next: CmTrophyMedalLevel | '') => {
    setLevel(next);
    setDistrictId('');
    setSansadId('');
    setVidhanSabhaId('');
    setNyayPanchayatId('');
    setEvent('');
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">CM Trophy 2026-27 — Medal Dashboard</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          <i className={`fas ${exporting ? 'fa-circle-notch fa-spin' : 'fa-file-excel'}`} />
          {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
      </div>

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

        <select className={selectClass} value={level} onChange={(e) => handleLevelChange(e.target.value as CmTrophyMedalLevel | '')}>
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{MEDAL_LEVEL_LABEL[l]}</option>)}
        </select>

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

        {level === 'DISTRICT' && (
          <select className={selectClass} value={districtId} onChange={(e) => { setDistrictId(e.target.value); setPage(1); }}>
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}

        {(level === 'SANSAD' || level === 'VIDHAN_SABHA' || level === 'NYAY_PANCHAYAT') && (
          <select className={selectClass} value={sansadId} onChange={(e) => { setSansadId(e.target.value); setVidhanSabhaId(''); setNyayPanchayatId(''); setPage(1); }}>
            <option value="">All Sansads</option>
            {sansads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        {(level === 'VIDHAN_SABHA' || level === 'NYAY_PANCHAYAT') && (
          <select className={selectClass} value={vidhanSabhaId} onChange={(e) => { setVidhanSabhaId(e.target.value); setNyayPanchayatId(''); setPage(1); }} disabled={!sansadId}>
            <option value="">All Vidhan Sabhas</option>
            {vidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}

        {level === 'NYAY_PANCHAYAT' && (
          <select className={selectClass} value={nyayPanchayatId} onChange={(e) => { setNyayPanchayatId(e.target.value); setPage(1); }} disabled={!vidhanSabhaId}>
            <option value="">All Nyay Panchayats</option>
            {nyayPanchayats.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        )}
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
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total (this page)</p>
          <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
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
                  {canDelete && <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={canDelete ? 11 : 10} className="text-center py-10 text-gray-400 text-sm">No medal records match this filter.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-semibold">{MEDAL_RANK[r.medal]}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.sportName}</td>
                      <td className="px-4 py-3 text-gray-700">{r.gender ? r.gender.charAt(0) + r.gender.slice(1).toLowerCase() : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.event ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory] : '—'}</td>
                      <td className="px-4 py-3">
                        {r.medal === 'GOLD' ? '🥇' : r.medal === 'SILVER' ? '🥈' : '🥉'} {r.medal.charAt(0) + r.medal.slice(1).toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{MEDAL_LEVEL_LABEL[r.level]}</td>
                      <td className="px-4 py-3 text-gray-700">{r.entityName ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.applicationCode}</td>
                      {canDelete && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {canEdit && (
                              <button
                                onClick={() => setEditTarget(r)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                              >
                                <i className="fas fa-pen mr-1" />Edit
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              <i className="fas fa-trash mr-1" />Delete
                            </button>
                          </div>
                        </td>
                      )}
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

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete medal record?</h3>
            <p className="text-sm text-gray-600 mb-5">
              This will permanently remove <span className="font-semibold">{deleteTarget.name}</span>&apos;s{' '}
              {deleteTarget.medal.charAt(0) + deleteTarget.medal.slice(1).toLowerCase()} medal ({deleteTarget.applicationCode}). This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMedal.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMedal.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {deleteMedal.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <EditMedalModal
          record={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

function EditMedalModal({ record, onClose }: { record: MedalRecord; onClose: () => void }) {
  const [medal, setMedal] = useState<CmTrophyMedal>(record.medal);
  const [gender, setGender] = useState<Gender | ''>(record.gender ?? '');
  const [event, setEvent] = useState(record.event ?? '');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>(record.ageCategory ?? '');
  const [level, setLevel] = useState<CmTrophyMedalLevel>(record.level);
  const [districtId, setDistrictId] = useState(record.districtId ?? '');
  const [sansadId, setSansadId] = useState(record.sansadId ?? '');
  const [vidhanSabhaId, setVidhanSabhaId] = useState(record.vidhanSabhaId ?? '');
  const [nyayPanchayatId, setNyayPanchayatId] = useState(record.nyayPanchayatId ?? '');
  const [error, setError] = useState('');

  const { districts } = useDistricts();
  const { sansads } = useSansads();
  const { vidhanSabhas, loading: vidhanSabhasLoading } = useVidhanSabhas(sansadId || undefined);
  const { nyayPanchayats, loading: nyayPanchayatsLoading } = useNyayPanchayats(vidhanSabhaId || undefined);
  const updateMedal = useUpdateMedal();

  const handleLevelChange = (next: CmTrophyMedalLevel) => {
    setLevel(next);
    setDistrictId('');
    setSansadId('');
    setVidhanSabhaId('');
    setNyayPanchayatId('');
  };

  const geoSelected =
    level === 'DISTRICT' ? !!districtId :
    level === 'SANSAD' ? !!sansadId :
    level === 'VIDHAN_SABHA' ? !!vidhanSabhaId :
    level === 'NYAY_PANCHAYAT' ? !!nyayPanchayatId :
    false;

  const handleSave = () => {
    if (!geoSelected) { setError('Select a location for this level.'); return; }
    setError('');
    const data: CreateMedalInput = {
      applicationCode: record.applicationCode,
      sportId: record.sportId,
      medal,
      level,
      gender: gender || undefined,
      event: event.trim() || undefined,
      ageCategory: ageCategory || undefined,
      districtId: level === 'DISTRICT' ? districtId : undefined,
      sansadId: level === 'SANSAD' ? sansadId : undefined,
      vidhanSabhaId: level === 'VIDHAN_SABHA' ? vidhanSabhaId : undefined,
      nyayPanchayatId: level === 'NYAY_PANCHAYAT' ? nyayPanchayatId : undefined,
    };
    updateMedal.mutate(
      { id: record.id, data },
      {
        onSuccess: onClose,
        onError: (e) => setError((e as Error).message ?? 'Failed to save changes.'),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Edit medal record</h3>
        <p className="text-xs text-gray-500 mb-4">{record.name} ({record.applicationCode})</p>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medal *</label>
            <select className={selectClass} value={medal} onChange={(e) => setMedal(e.target.value as CmTrophyMedal)}>
              {MEDALS.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <input
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="—"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select className={selectClass} value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="">—</option>
            {GENDERS.map((g) => <option key={g} value={g}>{GENDER_LABEL[g]}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Age Category</label>
          <select className={selectClass} value={ageCategory} onChange={(e) => setAgeCategory(e.target.value as CmTrophyAgeCategory)}>
            <option value="">—</option>
            {AGE_CATEGORIES.map((c) => <option key={c} value={c}>{CM_TROPHY_AGE_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
          <select className={selectClass} value={level} onChange={(e) => handleLevelChange(e.target.value as CmTrophyMedalLevel)}>
            {LEVELS.map((l) => <option key={l} value={l}>{MEDAL_LEVEL_LABEL[l]}</option>)}
          </select>
        </div>

        {level === 'DISTRICT' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <select className={selectClass} value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
              <option value="">Select district</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {level !== 'DISTRICT' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sansad *</label>
              <select
                className={selectClass}
                value={sansadId}
                onChange={(e) => { setSansadId(e.target.value); setVidhanSabhaId(''); setNyayPanchayatId(''); }}
              >
                <option value="">Select Sansad</option>
                {sansads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {(level === 'VIDHAN_SABHA' || level === 'NYAY_PANCHAYAT') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vidhan Sabha *</label>
                <select
                  className={selectClass}
                  value={vidhanSabhaId}
                  onChange={(e) => { setVidhanSabhaId(e.target.value); setNyayPanchayatId(''); }}
                  disabled={!sansadId || vidhanSabhasLoading}
                >
                  <option value="">Select Vidhan Sabha</option>
                  {vidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            )}
            {level === 'NYAY_PANCHAYAT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nyay Panchayat *</label>
                <select
                  className={selectClass}
                  value={nyayPanchayatId}
                  onChange={(e) => setNyayPanchayatId(e.target.value)}
                  disabled={!vidhanSabhaId || nyayPanchayatsLoading}
                >
                  <option value="">Select Nyay Panchayat</option>
                  {nyayPanchayats.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={updateMedal.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMedal.isPending}
            className="px-4 py-2 text-sm font-semibold bg-[#1e3a8a] text-white rounded-md hover:bg-[#1e2f6b] disabled:opacity-50"
          >
            {updateMedal.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
