'use client';

import { useState, useEffect } from 'react';
import { sportsApi, Sport } from '@/lib/api/sports';
import { AttendanceRow, CmTrophyAttendanceListParams } from '@/lib/api/adminCmTrophyApi';
import { useAttendanceList, useMarkAttendance, useBulkMarkPresent } from '@/hooks/useAdminCmTrophy';
import { CM_TROPHY_AGE_CATEGORY_LABELS, CM_TROPHY_REGISTRATION_LEVEL_LABELS, CmTrophyAgeCategory } from '@/lib/cmTrophyAgeCategory';
import { CmTrophyRegistrationLevel } from '@/lib/api/registrations';

const AGE_CATEGORIES: CmTrophyAgeCategory[] = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const REGISTRATION_LEVELS: CmTrophyRegistrationLevel[] = ['NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD', 'STATE'];
const selectClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white min-w-[160px] disabled:opacity-50';

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const edge = 3;
  const around = 1;
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

export default function CmTrophyAttendancePage() {
  const [sportId, setSportId] = useState('');
  const [event, setEvent] = useState('');
  const [registrationLevel, setRegistrationLevel] = useState<CmTrophyRegistrationLevel | ''>('');
  const [gender, setGender] = useState('');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [absentTarget, setAbsentTarget] = useState<AttendanceRow | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [sports, setSports] = useState<Sport[]>([]);
  useEffect(() => {
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
  }, []);

  const filters: CmTrophyAttendanceListParams = {
    sportId: sportId || undefined,
    event: event || undefined,
    registrationLevel: registrationLevel || undefined,
    gender: (gender || undefined) as CmTrophyAttendanceListParams['gender'],
    ageCategory: ageCategory || undefined,
    search: search || undefined,
    page,
    limit,
  };

  const { data, isLoading, isError, error } = useAttendanceList(filters);

  // Wider fetch (same filters, minus event) just to build the Event dropdown's option list.
  const { data: eventOptionsData } = useAttendanceList({ ...filters, event: undefined, page: undefined, limit: 200 });
  const eventOptions = Array.from(
    new Set((eventOptionsData?.data ?? []).flatMap((r) => r.selectedEvents || []))
  ).sort();

  const rows = data?.data ?? [];
  const markAttendance = useMarkAttendance();
  const bulkMarkPresent = useBulkMarkPresent();

  const resetPage = () => { setPage(1); setSelected(new Set()); };

  const selectableIds = rows.filter((r) => r.isPresent === null).map((r) => r.id);
  const allSelectedOnPage = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        selectableIds.forEach((id) => next.delete(id));
      } else {
        selectableIds.forEach((id) => next.add(id));
      }
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

  const handleSubmit = () => {
    bulkMarkPresent.mutate(Array.from(selected), {
      onSuccess: (res) => {
        setSelected(new Set());
        setConfirming(false);
        if (res.rejected.length > 0) {
          setWarning(`${res.inserted} marked present, ${res.rejected.length} already marked by someone else.`);
        } else {
          setWarning(null);
        }
      },
    });
  };

  const handleMarkAbsent = () => {
    if (!absentTarget) return;
    markAttendance.mutate(
      { registrationId: absentTarget.id, isPresent: false },
      { onSuccess: () => setAbsentTarget(null) }
    );
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">CM Trophy — Attendance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Check in players on event day — mark write-once, cannot be undone.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name or application code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm min-w-[220px]"
          />

          <select className={selectClass} value={sportId} onChange={(e) => { setSportId(e.target.value); setEvent(''); resetPage(); }}>
            <option value="">All Sports</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select className={selectClass} value={event} onChange={(e) => { setEvent(e.target.value); resetPage(); }} disabled={!sportId}>
            <option value="">All Events</option>
            {eventOptions.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>

          <select className={selectClass} value={registrationLevel} onChange={(e) => { setRegistrationLevel(e.target.value as CmTrophyRegistrationLevel | ''); resetPage(); }}>
            <option value="">All Levels</option>
            {REGISTRATION_LEVELS.map((l) => <option key={l} value={l}>{CM_TROPHY_REGISTRATION_LEVEL_LABELS[l]}</option>)}
          </select>

          <select className={selectClass} value={gender} onChange={(e) => { setGender(e.target.value); resetPage(); }}>
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <select className={selectClass} value={ageCategory} onChange={(e) => { setAgeCategory(e.target.value as CmTrophyAgeCategory | ''); resetPage(); }}>
            <option value="">All Age Categories</option>
            {AGE_CATEGORIES.map((c) => <option key={c} value={c}>{CM_TROPHY_AGE_CATEGORY_LABELS[c]}</option>)}
          </select>

          <button
            onClick={() => setConfirming(true)}
            disabled={selected.size === 0}
            className="ml-auto bg-[#1e3a8a] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#1e2f6b] transition-colors shadow-sm disabled:opacity-40"
          >
            Submit Attendance {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>

      {warning && (
        <div className="mb-4 text-sm rounded-lg px-4 py-2 border bg-amber-50 border-amber-200 text-amber-700">
          {warning}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500 text-sm">{(error as Error).message}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No players match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a8a] text-left">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allSelectedOnPage} onChange={toggleAll} disabled={selectableIds.length === 0} />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Sr No</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Application Code</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Father&apos;s Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Sport</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Age Category</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {r.isPresent === null && (
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-[12px]">{r.registrationNo}</td>
                    <td className="px-4 py-3 text-gray-600">{r.fathersName}</td>
                    <td className="px-4 py-3 text-gray-600">{r.sportName}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{r.gender?.toLowerCase()}</td>
                    <td className="px-4 py-3 text-gray-600">{r.ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[r.ageCategory] : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{CM_TROPHY_REGISTRATION_LEVEL_LABELS[r.registrationLevel]}</td>
                    <td className="px-4 py-3">
                      {r.isPresent === true ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-green-50 text-green-700">Present</span>
                      ) : r.isPresent === false ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-red-50 text-red-700">Absent</span>
                      ) : (
                        <button
                          onClick={() => setAbsentTarget(r)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Mark Absent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > data.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>Page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total} total)</span>
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
              <button
                disabled={page <= 1}
                onClick={() => { setPage((p) => p - 1); setSelected(new Set()); }}
                className="px-3 py-2 border-r border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium text-gray-600"
              >
                ‹ previous
              </button>
              {getPageNumbers(page, Math.ceil(data.total / data.limit)).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-3 py-2 border-r border-gray-200 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => { setPage(p); setSelected(new Set()); }}
                    className={`px-3 py-2 border-r border-gray-200 font-medium ${p === page ? 'bg-[#1e3a8a] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => { setPage((p) => p + 1); setSelected(new Set()); }}
                className="px-3 py-2 disabled:opacity-40 hover:bg-gray-50 font-medium text-gray-600"
              >
                next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Submit attendance?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Mark <span className="font-semibold">{selected.size}</span> player{selected.size === 1 ? '' : 's'} as Present. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={bulkMarkPresent.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={bulkMarkPresent.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] hover:bg-[#1e2f6b] rounded-md disabled:opacity-50"
              >
                {bulkMarkPresent.isPending ? 'Submitting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {absentTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Mark absent?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Mark <span className="font-semibold">{absentTarget.fullName}</span> ({absentTarget.registrationNo}) as Absent. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAbsentTarget(null)}
                disabled={markAttendance.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAbsent}
                disabled={markAttendance.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {markAttendance.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
