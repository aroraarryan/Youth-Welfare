'use client';

import { useState, useEffect } from 'react';
import { useDistricts } from '@/hooks/useInfrastructure';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import { sportsApi, Sport } from '@/lib/api/sports';
import { CmTrophyMedalLevel, MEDAL_LEVEL_LABEL } from '@/lib/api/adminCmTrophyApi';
import { useMedals } from '@/hooks/useAdminCmTrophy';
import { CmTrophyAgeCategory, CM_TROPHY_AGE_CATEGORY_LABELS } from '@/lib/cmTrophyAgeCategory';

const LEVELS: CmTrophyMedalLevel[] = ['DISTRICT', 'NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD'];
const AGE_CATEGORIES: CmTrophyAgeCategory[] = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const selectClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[160px] disabled:opacity-50';

export default function AdminMedalDashboardPage() {
  const [sportId, setSportId] = useState('');
  const [level, setLevel] = useState<CmTrophyMedalLevel | ''>('');
  const [districtId, setDistrictId] = useState('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [nyayPanchayatId, setNyayPanchayatId] = useState('');
  const [event, setEvent] = useState('');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>('');
  const [page, setPage] = useState(1);

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
    districtId: districtId || undefined,
    sansadId: sansadId || undefined,
    vidhanSabhaId: vidhanSabhaId || undefined,
    nyayPanchayatId: nyayPanchayatId || undefined,
    event: event || undefined,
    ageCategory: ageCategory || undefined,
    page,
    limit: 50,
  });

  // Wider fetch (same filters, minus event) just to build the Event dropdown's option list.
  const { data: eventOptionsData } = useMedals({
    sportId: sportId || undefined,
    level: level || undefined,
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">CM Trophy 2026-27 — Medal Dashboard</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select className={selectClass} value={sportId} onChange={(e) => { setSportId(e.target.value); setEvent(''); setPage(1); }}>
          <option value="">All Sports</option>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select className={selectClass} value={level} onChange={(e) => handleLevelChange(e.target.value as CmTrophyMedalLevel | '')}>
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{MEDAL_LEVEL_LABEL[l]}</option>)}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">No medal records match this filter.</td></tr>
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
