'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useDistricts } from '@/hooks/useInfrastructure';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import { sportsApi, Sport } from '@/lib/api/sports';
import { adminCmTrophyApi, CmTrophyMedal, CmTrophyMedalLevel, MedalBulkRow, MEDAL_LEVEL_LABEL, RegistrationLookupResult } from '@/lib/api/adminCmTrophyApi';
import { useCreateMedal, useBulkCreateMedals } from '@/hooks/useAdminCmTrophy';

const LEVELS: CmTrophyMedalLevel[] = ['DISTRICT', 'NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD'];
const MEDALS: CmTrophyMedal[] = ['GOLD', 'SILVER', 'BRONZE'];

const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full disabled:opacity-50 disabled:bg-gray-50';
const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full disabled:opacity-50 disabled:bg-gray-50';

export default function AdminAddMedalPage() {
  const [applicationCode, setApplicationCode] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const [registration, setRegistration] = useState<RegistrationLookupResult | null>(null);
  const [name, setName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [email, setEmail] = useState('');

  const [sportId, setSportId] = useState('');
  const [medal, setMedal] = useState<CmTrophyMedal>('GOLD');
  const [level, setLevel] = useState<CmTrophyMedalLevel>('DISTRICT');
  const [districtId, setDistrictId] = useState('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [nyayPanchayatId, setNyayPanchayatId] = useState('');

  const [sports, setSports] = useState<Sport[]>([]);
  const { districts } = useDistricts();
  const { sansads } = useSansads();
  const { vidhanSabhas, loading: vidhanSabhasLoading } = useVidhanSabhas(sansadId || undefined);
  const { nyayPanchayats, loading: nyayPanchayatsLoading } = useNyayPanchayats(vidhanSabhaId || undefined);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const createMutation = useCreateMedal();
  const bulkMutation = useBulkCreateMedals();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkResult, setBulkResult] = useState<{ inserted: number; rejected: { row: number; applicationCode?: string; reason: string }[] } | null>(null);

  useEffect(() => {
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
  }, []);

  const runLookup = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setLookupStatus('idle');
      setRegistration(null);
      return;
    }
    setLookupStatus('checking');
    try {
      const res = await adminCmTrophyApi.lookupRegistrationByCode(trimmed);
      setRegistration(res.data);
      setName(res.data.fullName);
      setFathersName(res.data.fathersName);
      setEmail(res.data.email || '');
      setLookupStatus('found');
    } catch {
      setRegistration(null);
      setLookupStatus('not_found');
    }
  }, []);

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
    !!nyayPanchayatId;

  const canSubmit = lookupStatus === 'found' && !!sportId && !!medal && geoSelected && !createMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !registration) return;
    setMessage(null);
    try {
      await createMutation.mutateAsync({
        applicationCode: registration.registrationNo,
        sportId,
        medal,
        level,
        name,
        fathersName,
        email: email || undefined,
        districtId: level === 'DISTRICT' ? districtId : undefined,
        sansadId: level === 'SANSAD' ? sansadId : undefined,
        vidhanSabhaId: level === 'VIDHAN_SABHA' ? vidhanSabhaId : undefined,
        nyayPanchayatId: level === 'NYAY_PANCHAYAT' ? nyayPanchayatId : undefined,
      });
      setMessage({ type: 'success', text: 'Medal record added.' });
      setApplicationCode('');
      setLookupStatus('idle');
      setRegistration(null);
      setName('');
      setFathersName('');
      setEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message ?? 'Failed to add medal record.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkResult(null);
    setMessage(null);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    const rows: MedalBulkRow[] = parsed.map((r) => ({
      applicationCode: String(r['Application Code'] ?? r['applicationCode'] ?? '').trim(),
      sport: String(r['Sport'] ?? r['sport'] ?? '').trim(),
      medal: String(r['Medal'] ?? r['medal'] ?? '').trim(),
      level: String(r['Level'] ?? r['level'] ?? '').trim(),
      entityName: String(
        r['Nyay Panchayat'] ?? r['Vidhan Sabha'] ?? r['Sansad'] ?? r['District'] ?? r['entityName'] ?? ''
      ).trim(),
    }));

    try {
      const res = await bulkMutation.mutateAsync(rows);
      setBulkResult({ inserted: res.inserted, rejected: res.rejected });
      setMessage({ type: 'success', text: `Uploaded: ${res.inserted} inserted, ${res.rejected.length} rejected.` });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message ?? 'Bulk upload failed.' });
    }
    e.target.value = '';
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">CM Trophy 2026-27 — Add Medal</h1>

      {message && (
        <div
          className={`mb-4 text-sm rounded-lg px-4 py-2 border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Code *</label>
          <input
            className={inputClass}
            value={applicationCode}
            onChange={(e) => { setApplicationCode(e.target.value); setLookupStatus('idle'); }}
            onBlur={() => runLookup(applicationCode)}
            placeholder="CMT-XXXXXXXX"
          />
          {lookupStatus === 'checking' && <p className="text-xs text-gray-400 mt-1">Checking…</p>}
          {lookupStatus === 'found' && registration && (
            <p className="text-xs text-green-600 mt-1"><i className="fas fa-check-circle mr-1" />Found: {registration.fullName}</p>
          )}
          {lookupStatus === 'not_found' && (
            <p className="text-xs text-red-500 mt-1"><i className="fas fa-times-circle mr-1" />Application code not found. Cannot add medal.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} disabled={lookupStatus !== 'found'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name</label>
            <input className={inputClass} value={fathersName} onChange={(e) => setFathersName(e.target.value)} disabled={lookupStatus !== 'found'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} disabled={lookupStatus !== 'found'} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
            <select className={selectClass} value={sportId} onChange={(e) => setSportId(e.target.value)}>
              <option value="">Select sport</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medal *</label>
            <select className={selectClass} value={medal} onChange={(e) => setMedal(e.target.value as CmTrophyMedal)}>
              {MEDALS.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
          <select className={selectClass} value={level} onChange={(e) => handleLevelChange(e.target.value as CmTrophyMedalLevel)}>
            {LEVELS.map((l) => <option key={l} value={l}>{MEDAL_LEVEL_LABEL[l]}</option>)}
          </select>
        </div>

        {level === 'DISTRICT' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <select className={selectClass} value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
              <option value="">Select district</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {level !== 'DISTRICT' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <button
          type="submit"
          disabled={!canSubmit}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? 'Adding…' : 'Add Medal'}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Bulk Upload via Excel</h2>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkMutation.isPending}
            className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <i className="fas fa-file-excel mr-2 text-green-600" />
            {bulkMutation.isPending ? 'Uploading…' : 'Upload Excel'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Expected columns: <span className="font-mono">Application Code, Sport, Medal, Level, District/Sansad/Vidhan Sabha/Nyay Panchayat</span>{' '}
          (fill the one geo column matching Level). Application codes that don&apos;t match an existing registration are rejected, not uploaded.
        </p>

        {bulkResult && (
          <div className="mt-4 text-sm">
            <p className="text-green-700 mb-2">{bulkResult.inserted} row(s) inserted.</p>
            {bulkResult.rejected.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Application Code</th>
                      <th className="px-3 py-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bulkResult.rejected.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{r.row}</td>
                        <td className="px-3 py-2 font-mono">{r.applicationCode ?? '—'}</td>
                        <td className="px-3 py-2 text-red-600">{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
