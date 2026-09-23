'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { sportsApi, Sport } from '@/lib/api/sports';
import { officerCmTrophyApi, CmTrophyMedal, RegistrationLookupResult, OfficerMedalLevel, LEVEL_LABEL } from '@/lib/api/officerCmTrophyApi';
import { officerApi } from '@/lib/api/officerApi';
import { Gender } from '@/lib/api/registrations';
import { CmTrophyAgeCategory, CM_TROPHY_AGE_CATEGORY_LABELS } from '@/lib/cmTrophyAgeCategory';

const MEDALS: CmTrophyMedal[] = ['GOLD', 'SILVER', 'BRONZE'];
const DO_LEVELS: OfficerMedalLevel[] = ['NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD'];
// Block officers who are nodal in-charge of a Vidhan Sabha also get Vidhan Sabha level.
const NODAL_BO_LEVELS: OfficerMedalLevel[] = ['NYAY_PANCHAYAT', 'VIDHAN_SABHA'];
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full disabled:opacity-50 disabled:bg-gray-50';
const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full disabled:opacity-50 disabled:bg-gray-50';

export default function OfficerCmTrophyPage() {
  const [applicationCode, setApplicationCode] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const [lookupError, setLookupError] = useState('Application code not found. Cannot add medal.');
  const [registration, setRegistration] = useState<RegistrationLookupResult | null>(null);
  const [name, setName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [email, setEmail] = useState('');

  const [sportId, setSportId] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [event, setEvent] = useState('');
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | ''>('');
  const [medal, setMedal] = useState<CmTrophyMedal | ''>('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [nyayPanchayatId, setNyayPanchayatId] = useState('');

  const [sports, setSports] = useState<Sport[]>([]);
  // Every Vidhan Sabha linked to a block officer's block (a block can serve
  // 2+ — see block_vidhan_sabhas); "" in vidhanSabhaId means "all of them".
  const [officerVidhanSabhas, setOfficerVidhanSabhas] = useState<{ id: string; name: string }[]>([]);
  // Seats this block officer is nodal in-charge of (subset of officerVidhanSabhas).
  const [nodalVidhanSabhas, setNodalVidhanSabhas] = useState<{ id: string; name: string; nodalOfficerName: string | null }[]>([]);
  // District officers (DO_PRD) pick a medal level and are limited to their own district;
  // block officers keep the fixed Nyay Panchayat flow.
  const [isDistrictOfficer, setIsDistrictOfficer] = useState(false);
  const [officerDistrictId, setOfficerDistrictId] = useState<string | undefined>(undefined);
  const [level, setLevel] = useState<OfficerMedalLevel>('NYAY_PANCHAYAT');
  const { sansads } = useSansads(officerDistrictId);
  const { vidhanSabhas, loading: vidhanSabhasLoading } = useVidhanSabhas(sansadId || undefined, officerDistrictId);
  const officerVidhanSabhaIds = officerVidhanSabhas.map((v) => v.id);
  const { nyayPanchayats, loading: nyayPanchayatsLoading } = useNyayPanchayats(
    vidhanSabhaId || undefined,
    undefined,
    !isDistrictOfficer && !vidhanSabhaId && officerVidhanSabhaIds.length > 0 ? officerVidhanSabhaIds : undefined,
  );

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sportsApi.list().then((res) => setSports(res.data)).catch(() => {});
    officerApi.me().then((res) => {
      setOfficerVidhanSabhas(res.officer.vidhanSabhas ?? []);
      setNodalVidhanSabhas(res.officer.nodalVidhanSabhas ?? []);
      setIsDistrictOfficer(res.officer.role === 'DO_PRD');
      setOfficerDistrictId(res.officer.role === 'DO_PRD' ? (res.officer.districtId ?? undefined) : undefined);
    }).catch(() => {});
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
      const res = await officerCmTrophyApi.lookupRegistrationByCode(trimmed);
      setRegistration(res.data);
      setName(res.data.fullName);
      setFathersName(res.data.fathersName);
      setEmail(res.data.email || '');
      if (res.data.gender) setGender(res.data.gender);
      setSportId(res.data.sportId);
      setEvent(res.data.selectedEvents?.[0] ?? '');
      setAgeCategory(res.data.ageCategory ?? '');
      setLookupStatus('found');
    } catch (e) {
      setRegistration(null);
      setLookupError(e instanceof Error ? e.message : 'Application code not found. Cannot add medal.');
      setLookupStatus('not_found');
    }
  }, []);

  const registrationEvents = registration?.selectedEvents ?? [];
  const isNodalBlockOfficer = !isDistrictOfficer && nodalVidhanSabhas.length > 0;
  const levelOptions = isDistrictOfficer ? DO_LEVELS : isNodalBlockOfficer ? NODAL_BO_LEVELS : null;
  const showVidhanSabha = level !== 'SANSAD';
  const showNyayPanchayat = level === 'NYAY_PANCHAYAT';
  // Block officers pick a Nyay Panchayat, or (nodal in-charge, Vidhan Sabha level) one of their nodal seats.
  const geoComplete = isDistrictOfficer
    ? !!sansadId && (!showVidhanSabha || !!vidhanSabhaId) && (!showNyayPanchayat || !!nyayPanchayatId)
    : level === 'VIDHAN_SABHA' ? !!vidhanSabhaId : !!nyayPanchayatId;
  const canSubmit = lookupStatus === 'found' && !!sportId && !!medal && geoComplete && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !registration) return;
    setMessage(null);
    setSubmitting(true);
    try {
      await officerCmTrophyApi.createMedal({
        applicationCode: registration.registrationNo,
        sportId,
        gender,
        event: event.trim() || undefined,
        ageCategory: ageCategory || undefined,
        medal: medal as CmTrophyMedal,
        name,
        fathersName,
        email: email || undefined,
        // Block officers send nyayPanchayatId (level defaults server-side), or a nodal
        // in-charge's Vidhan Sabha level + seat; district officers send the chosen
        // level plus the id that level needs.
        ...(isDistrictOfficer
          ? {
              level,
              ...(level === 'NYAY_PANCHAYAT' && { nyayPanchayatId }),
              ...(level === 'VIDHAN_SABHA' && { vidhanSabhaId }),
              ...(level === 'SANSAD' && { sansadId }),
            }
          : level === 'VIDHAN_SABHA'
            ? { level, vidhanSabhaId }
            : { nyayPanchayatId }),
      });
      setMessage({ type: 'success', text: 'Medal record added.' });
      setApplicationCode('');
      setLookupStatus('idle');
      setRegistration(null);
      setName('');
      setFathersName('');
      setEmail('');
      setGender('MALE');
      setSportId('');
      setEvent('');
      setAgeCategory('');
      setMedal('');
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message ?? 'Failed to add medal record.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        CM Trophy 2026-27 — Add Medal{isDistrictOfficer || isNodalBlockOfficer ? '' : ' (Nyay Panchayat)'}
      </h1>
      <p className={`text-sm text-gray-500 ${!isDistrictOfficer && officerVidhanSabhas.length > 0 ? 'mb-2' : 'mb-6'}`}>
        {isDistrictOfficer
          ? 'District Officers can add Nyay Panchayat, Vidhan Sabha and Sansad-level medal records for players registered in their district.'
          : isNodalBlockOfficer
            ? 'Block Officers can add Nyay Panchayat-level medal records, and Vidhan Sabha-level records for the Vidhan Sabha they are nodal in-charge of.'
            : 'Block Officers can add Nyay Panchayat-level medal records only.'}
      </p>
      {!isDistrictOfficer && officerVidhanSabhas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-gray-500">Vidhan Sabha:</span>
          {officerVidhanSabhas.map((v) => {
            const nodal = nodalVidhanSabhas.find((n) => n.id === v.id);
            return (
              <span key={v.id} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-br from-[#115e59] to-[#0d9488] text-white">
                {v.name}{nodal && ` · Nodal${nodal.nodalOfficerName ? ` (${nodal.nodalOfficerName})` : ''}`}
              </span>
            );
          })}
        </div>
      )}

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
            <p className="text-xs text-red-500 mt-1"><i className="fas fa-times-circle mr-1" />{lookupError}</p>
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
            <select className={selectClass} value={sportId} disabled>
              <option value="">{lookupStatus === 'found' ? 'Unknown sport' : 'Enter application code'}</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medal *</label>
            <select className={selectClass} value={medal} onChange={(e) => setMedal(e.target.value as CmTrophyMedal)}>
              <option value="">Select medal</option>
              {MEDALS.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select className={selectClass} value={gender} disabled>
              {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            {registrationEvents.length > 0 ? (
              <select
                className={selectClass}
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                disabled={lookupStatus !== 'found' || registrationEvents.length === 1}
              >
                {registrationEvents.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
              </select>
            ) : (
              <input className={inputClass} value={event} disabled placeholder="—" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Category</label>
            <select
              className={selectClass}
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value as CmTrophyAgeCategory)}
              disabled={lookupStatus !== 'found'}
            >
              <option value="">—</option>
              {(Object.keys(CM_TROPHY_AGE_CATEGORY_LABELS) as CmTrophyAgeCategory[]).map((c) => (
                <option key={c} value={c}>{CM_TROPHY_AGE_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {levelOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medal Level *</label>
            <select
              className={selectClass}
              value={level}
              onChange={(e) => { setLevel(e.target.value as OfficerMedalLevel); setSansadId(''); setVidhanSabhaId(''); setNyayPanchayatId(''); }}
            >
              {levelOptions.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isDistrictOfficer && (
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
          )}
          {isDistrictOfficer && showVidhanSabha && (
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
          {!isDistrictOfficer && level === 'VIDHAN_SABHA' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vidhan Sabha (Nodal) *</label>
            <select
              className={selectClass}
              value={vidhanSabhaId}
              onChange={(e) => setVidhanSabhaId(e.target.value)}
            >
              <option value="">Select Vidhan Sabha</option>
              {nodalVidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          )}
          {!isDistrictOfficer && showNyayPanchayat && officerVidhanSabhas.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vidhan Sabha</label>
            <select
              className={selectClass}
              value={vidhanSabhaId}
              onChange={(e) => { setVidhanSabhaId(e.target.value); setNyayPanchayatId(''); }}
            >
              <option value="">All Vidhan Sabha</option>
              {officerVidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          )}
          {showNyayPanchayat && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nyay Panchayat *</label>
            <SearchableSelect
              inputClassName={selectClass}
              value={nyayPanchayatId}
              onChange={(id) => setNyayPanchayatId(id)}
              options={nyayPanchayats}
              placeholder="Select Nyay Panchayat"
              disabled={(isDistrictOfficer && !vidhanSabhaId) || nyayPanchayatsLoading}
            />
            {(!isDistrictOfficer || vidhanSabhaId) && !nyayPanchayatsLoading && nyayPanchayats.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {isDistrictOfficer || vidhanSabhaId ? 'No Nyay Panchayats under this Vidhan Sabha.' : 'No Nyay Panchayats in your linked Vidhan Sabha.'}
              </p>
            )}
          </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding…' : 'Add Medal'}
        </button>
      </form>
    </div>
  );
}
