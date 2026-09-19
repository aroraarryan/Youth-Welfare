'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sportsApi, CmTrophySportOption } from '@/lib/api/sports';
import { useSansads, useVidhanSabhas } from '@/hooks/useCmTrophyGeo';
import { useCreateFixtureEvent } from '@/hooks/useOfficerCmTrophyFixtures';
import { CmTrophyFixtureEntrantType } from '@/lib/api/adminCmTrophyFixturesApi';

const ENTRANT_TYPES: { value: CmTrophyFixtureEntrantType; label: string }[] = [
  { value: 'PLACE', label: 'Team (Nyay Panchayat)' },
  { value: 'PLAYER', label: 'Individual player' },
];
const AGE_CATEGORIES = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const GENDERS = [
  { value: '', label: 'Not split by gender' },
  { value: 'MALE', label: 'Boys / Men' },
  { value: 'FEMALE', label: 'Girls / Women' },
];

// Vidhan Sabha fixtures need NYAY_PANCHAYAT-registered sports (see
// CmTrophySportLevel) — this is the only level officers ever create.
const EXPECTED_REGISTRATION_LEVEL = 'NYAY_PANCHAYAT';

const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full disabled:opacity-50 disabled:bg-gray-50';

export default function OfficerNewFixtureEventPage() {
  const router = useRouter();
  const [entrantType, setEntrantType] = useState<CmTrophyFixtureEntrantType>('PLACE');
  const [ageCategory, setAgeCategory] = useState('UNDER_19');
  const [gender, setGender] = useState('');
  const [eventName, setEventName] = useState('');
  const [sportOptions, setSportOptions] = useState<CmTrophySportOption[]>([]);
  const [sportId, setSportId] = useState('');
  const [sansadId, setSansadId] = useState('');
  const [vidhanSabhaId, setVidhanSabhaId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isPlayerEntrant = entrantType === 'PLAYER';

  const handleEntrantTypeChange = (next: CmTrophyFixtureEntrantType) => {
    setEntrantType(next);
    setEventName('');
  };

  const { sansads } = useSansads();
  const { vidhanSabhas, loading: vidhanSabhasLoading } = useVidhanSabhas(sansadId || undefined);
  const createMutation = useCreateFixtureEvent();

  useEffect(() => {
    sportsApi.listByCmTrophyCategory(ageCategory).then((res) => setSportOptions(res.data)).catch(() => setSportOptions([]));
    setSportId('');
    setEventName('');
  }, [ageCategory]);

  const eligibleSports = sportOptions.filter((s) => s.registrationLevel === EXPECTED_REGISTRATION_LEVEL);

  const selectedSport = sportOptions.find((s) => s.sportId === sportId) ?? null;
  const eventOptionsForSport = (selectedSport?.events ?? []).filter((e) => !e.gender || !gender || e.gender === gender);

  const handleSportChange = (next: string) => {
    setSportId(next);
    setEventName('');
  };

  const canSubmit = !!sportId && !!ageCategory && !!vidhanSabhaId && !createMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const res = await createMutation.mutateAsync({
        sportId,
        ageCategory,
        gender: gender || undefined,
        vidhanSabhaId,
        entrantType,
        event: isPlayerEntrant ? eventName.trim() || undefined : undefined,
      });
      router.push(`/officer/cm-trophy/fixtures/${res.data.id}`);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to create fixture event.');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">New Fixture Event</h1>
      <p className="text-sm text-gray-500 mb-6">Vidhan Sabha level — entrants are its Nyay Panchayats.</p>

      {error && (
        <div className="mb-4 text-sm rounded-lg px-4 py-2 border bg-red-50 border-red-200 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entrant Type *</label>
          <select className={selectClass} value={entrantType} onChange={(e) => handleEntrantTypeChange(e.target.value as CmTrophyFixtureEntrantType)}>
            {ENTRANT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {isPlayerEntrant && (
            <p className="text-xs text-gray-400 mt-1">
              Entrant pool is scoped to players registered under the Vidhan Sabha selected below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sansad *</label>
            <select className={selectClass} value={sansadId} onChange={(e) => { setSansadId(e.target.value); setVidhanSabhaId(''); }}>
              <option value="">Select Sansad</option>
              {sansads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vidhan Sabha (host) *</label>
            <select
              className={selectClass}
              value={vidhanSabhaId}
              onChange={(e) => setVidhanSabhaId(e.target.value)}
              disabled={!sansadId || vidhanSabhasLoading}
            >
              <option value="">Select Vidhan Sabha</option>
              {vidhanSabhas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Category *</label>
            <select className={selectClass} value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}>
              {AGE_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender split</label>
            <select className={selectClass} value={gender} onChange={(e) => setGender(e.target.value)}>
              {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
          <select className={selectClass} value={sportId} onChange={(e) => handleSportChange(e.target.value)} disabled={!eligibleSports.length}>
            <option value="">{eligibleSports.length ? 'Select sport' : 'No eligible team sport at this level/category'}</option>
            {eligibleSports.map((s) => <option key={s.sportId} value={s.sportId}>{s.name}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Only sports whose registration level matches Vidhan Sabha (e.g. Kabaddi, Kho-Kho) are listed.
          </p>
        </div>

        {isPlayerEntrant && sportId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event / Discipline</label>
            <select className={selectClass} value={eventName} onChange={(e) => setEventName(e.target.value)} disabled={!eventOptionsForSport.length}>
              <option value="">{eventOptionsForSport.length ? 'All events in this sport' : 'No events configured for this sport'}</option>
              {eventOptionsForSport.map((ev) => <option key={ev.name} value={ev.name}>{ev.name}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Leave unselected to pool every event in this sport.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? 'Creating…' : 'Create Fixture Event'}
        </button>
      </form>
    </div>
  );
}
