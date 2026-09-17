'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  useFixtureEvent,
  useAddTeam,
  useAddAllTeams,
  useRemoveTeam,
  useCommitDraw,
  useRevealDraw,
  useCreateVenue,
  useCreateField,
  usePatchMatch,
  useEntrantPool,
  useSearchRegistrations,
} from '@/hooks/useAdminCmTrophyFixtures';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import { FixtureMatch, FixtureTeam, MATCH_STAGE_LABEL, FIXTURE_LEVEL_LABEL } from '@/lib/api/adminCmTrophyFixturesApi';

const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full disabled:opacity-50 disabled:bg-gray-50';
const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full disabled:opacity-50 disabled:bg-gray-50';

const TABS = ['Teams', 'Draw', 'Venues', 'Matches', 'Standings'] as const;
type Tab = (typeof TABS)[number];

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function FixtureEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>('Teams');
  const { data, isLoading, isError, error } = useFixtureEvent(id);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20 text-gray-400">
        <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
        <p className="text-sm">Loading fixture event…</p>
      </div>
    );
  }
  if (isError || !data) {
    return <div className="p-6 text-red-500 text-sm">{(error as Error)?.message ?? 'Failed to load event.'}</div>;
  }

  const ev = data.data;

  return (
    <div className="p-6">
      <div className="mb-4 text-sm">
        <Link href="/admin/cm-trophy/fixtures" className="text-[#1e3a8a] font-semibold hover:underline">Fixtures</Link>
        <span className="text-gray-400"> / {ev.sportName}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{ev.sportName} — {ev.scopeName}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {FIXTURE_LEVEL_LABEL[ev.level].split(' (')[0]} · {ev.ageCategory.replace('_', ' ')}{ev.gender ? ` · ${ev.gender}` : ''}
            {ev.entrantType === 'PLAYER' && ` · Individual player${ev.event ? ` · ${ev.event}` : ''}`}
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{ev.status}</span>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-[#1e3a8a] text-[#1e3a8a]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Teams' && <TeamsTab event={ev} />}
      {tab === 'Draw' && <DrawTab event={ev} />}
      {tab === 'Venues' && <VenuesTab event={ev} />}
      {tab === 'Matches' && <MatchesTab event={ev} />}
      {tab === 'Standings' && <StandingsTab event={ev} />}
    </div>
  );
}

// ─── Teams ──────────────────────────────────────────────────────────────────
function TeamsTab({ event }: { event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail }) {
  const isPlayerEntrant = event.entrantType === 'PLAYER';
  const [pickerSansadId, setPickerSansadId] = useState('');
  const [selectedGeoId, setSelectedGeoId] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const { data: searchRes, isFetching: isSearching } = useSearchRegistrations(
    isPlayerEntrant ? { registrationNo: searchCode, sportId: event.sportId, ageCategory: event.ageCategory } : null
  );
  const addTeam = useAddTeam(event.id);
  const addAll = useAddAllTeams(event.id);
  const removeTeam = useRemoveTeam(event.id);

  const { sansads } = useSansads();
  const { vidhanSabhas } = useVidhanSabhas(event.level === 'SANSAD' ? event.sansadId ?? undefined : pickerSansadId || undefined);
  const { nyayPanchayats } = useNyayPanchayats(event.level === 'VIDHAN_SABHA' ? event.vidhanSabhaId ?? undefined : undefined);

  const { data: playerPoolRes } = useEntrantPool(
    isPlayerEntrant
      ? { level: event.level, entrantType: 'PLAYER', sportId: event.sportId, ageCategory: event.ageCategory, gender: event.gender ?? undefined, event: event.event ?? undefined }
      : null
  );

  const addedIds = new Set(
    isPlayerEntrant
      ? (event.teams.map((t) => t.registrationId).filter(Boolean) as string[])
      : (event.teams.map((t) => t.nyayPanchayatId || t.vidhanSabhaId || t.sansadId).filter(Boolean) as string[])
  );

  const candidates = isPlayerEntrant
    ? (playerPoolRes?.data ?? []).filter((c) => !addedIds.has(c.id))
    : event.level === 'VIDHAN_SABHA'
      ? nyayPanchayats.filter((n) => !addedIds.has(n.id))
      : event.level === 'SANSAD'
      ? vidhanSabhas.filter((v) => !addedIds.has(v.id))
      : sansads.filter((s) => !addedIds.has(s.id));

  const isDraft = event.status === 'DRAFT';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e3a8a] text-white">
            <tr>
              <th className="px-4 py-2 text-left font-medium">#</th>
              <th className="px-4 py-2 text-left font-medium">Entrant</th>
              {isDraft && <th className="px-4 py-2 text-right font-medium">Remove</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {event.teams.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No teams added yet.</td></tr>
            ) : (
              event.teams.map((t, i) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2 text-gray-800">{t.displayName}</td>
                  {isDraft && (
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => removeTeam.mutate(t.id)} className="text-red-500 hover:underline text-xs">Remove</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDraft && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Add entrants</h2>

          {isPlayerEntrant && (
            <div className="space-y-2 border-b border-gray-100 pb-4">
              <label className="block text-xs font-medium text-gray-700">
                Add any player registered for this sport/age category by application code (e.g. a lower-level winner advancing to this fixture)
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Search by application code (CMT-...)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
              {searchCode.trim() && (
                <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-3 py-2 text-xs text-gray-400">Searching…</div>
                  ) : (searchRes?.data ?? []).filter((c) => !addedIds.has(c.id)).length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400">No matching players for this sport/age category.</div>
                  ) : (
                    (searchRes?.data ?? []).filter((c) => !addedIds.has(c.id)).map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="text-gray-800">{c.label}</span>
                        <button
                          onClick={() => { addTeam.mutate(c.id); setSearchCode(''); }}
                          disabled={addTeam.isPending}
                          className="text-xs font-semibold text-[#1e3a8a] hover:underline disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {!isPlayerEntrant && event.level !== 'SANSAD' && event.level !== 'STATE' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Sansad (optional)</label>
              <select className={selectClass} value={pickerSansadId} onChange={(e) => setPickerSansadId(e.target.value)}>
                <option value="">— all —</option>
                {sansads.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <select className={selectClass} value={selectedGeoId} onChange={(e) => setSelectedGeoId(e.target.value)}>
              <option value="">Select entrant</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{'label' in c ? c.label : c.name}</option>)}
            </select>
            <button
              onClick={() => { if (selectedGeoId) { addTeam.mutate(selectedGeoId); setSelectedGeoId(''); } }}
              disabled={!selectedGeoId || addTeam.isPending}
              className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40 whitespace-nowrap"
            >
              Add
            </button>
          </div>

          <button
            onClick={() => addAll.mutate()}
            disabled={addAll.isPending}
            className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {addAll.isPending
              ? 'Adding…'
              : `Add all ${isPlayerEntrant ? 'eligible players' : event.level === 'VIDHAN_SABHA' ? 'Nyay Panchayats' : event.level === 'SANSAD' ? 'Vidhan Sabhas' : 'Sansads'}`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Draw ───────────────────────────────────────────────────────────────────
function DrawTab({ event }: { event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail }) {
  const commitDraw = useCommitDraw(event.id);
  const revealDraw = useRevealDraw(event.id);
  const [verified, setVerified] = useState<boolean | null>(null);

  const verify = async () => {
    if (!event.seed || !event.seedHash) return;
    const hash = await sha256Hex(event.seed);
    setVerified(hash === event.seedHash);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 max-w-xl">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Run the draw · {event.teams.length} teams</h2>
        <p className="text-xs text-gray-500 mt-1">
          Two steps, so no one can question the draw afterwards. <b>1. Commit</b> — the seed&apos;s SHA-256 hash is
          shown first and should be published before the draw. <b>2. Reveal</b> — the seed itself is shown with the
          bracket, so anyone can re-run the draw and check it.
        </p>
      </div>

      {event.status === 'DRAFT' && (
        <button
          onClick={() => commitDraw.mutate()}
          disabled={event.teams.length < 2 || commitDraw.isPending}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
        >
          {commitDraw.isPending ? 'Committing…' : 'Step 1 · Generate Hash'}
        </button>
      )}
      {event.teams.length < 2 && event.status === 'DRAFT' && (
        <p className="text-xs text-amber-600">Add at least 2 teams first.</p>
      )}

      {event.seedHash && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Committed hash — publish this now</p>
          <p className="font-mono text-xs break-all mt-1">{event.seedHash}</p>
        </div>
      )}

      {event.status === 'DRAWN' && (
        <button
          onClick={() => revealDraw.mutate()}
          disabled={revealDraw.isPending}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
        >
          {revealDraw.isPending ? 'Revealing…' : 'Step 2 · Reveal & Draw'}
        </button>
      )}

      {event.seed && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Revealed seed</p>
          <p className="font-mono text-xs break-all">{event.seed}</p>
          <button onClick={verify} className="text-xs font-medium text-[#1e3a8a] hover:underline">Verify sha256(seed) = committed hash</button>
          {verified !== null && (
            <p className={`text-xs font-semibold ${verified ? 'text-green-600' : 'text-red-600'}`}>
              {verified ? '✓ Verified — matches the committed hash' : '✗ Mismatch — this is unexpected'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Venues ─────────────────────────────────────────────────────────────────
function VenuesTab({ event }: { event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail }) {
  const [venueName, setVenueName] = useState('');
  const [fieldNameByVenue, setFieldNameByVenue] = useState<Record<string, string>>({});
  const createVenue = useCreateVenue(event.id);
  const createField = useCreateField(event.id);

  return (
    <div className="space-y-6 max-w-xl">
      {event.venues.map((v) => (
        <div key={v.id} className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900">{v.name}</h3>
          {v.address && <p className="text-xs text-gray-400 mt-0.5">{v.address}</p>}
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {v.fields.map((f) => <li key={f.id}>• {f.name}</li>)}
          </ul>
          <div className="flex gap-2 mt-3">
            <input
              className={inputClass}
              placeholder="e.g. Kabaddi Circle 2"
              value={fieldNameByVenue[v.id] ?? ''}
              onChange={(e) => setFieldNameByVenue((s) => ({ ...s, [v.id]: e.target.value }))}
            />
            <button
              onClick={() => {
                const name = (fieldNameByVenue[v.id] ?? '').trim();
                if (!name) return;
                createField.mutate({ venueId: v.id, name });
                setFieldNameByVenue((s) => ({ ...s, [v.id]: '' }));
              }}
              className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap"
            >
              + Field
            </button>
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Add a venue</h2>
        <div className="flex gap-2">
          <input className={inputClass} placeholder="e.g. Government Inter College Ground" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
          <button
            onClick={() => { if (venueName.trim()) { createVenue.mutate({ name: venueName.trim() }); setVenueName(''); } }}
            className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] whitespace-nowrap"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Guidelines contemplate one venue per Vidhan Sabha, fixed by the MLA — add fields (a second circle/court)
          inside it rather than a second venue unless the level genuinely needs several.
        </p>
      </div>
    </div>
  );
}

// ─── Matches ────────────────────────────────────────────────────────────────
function MatchesTab({ event }: { event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail }) {
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (event.status === 'DRAFT' || event.status === 'DRAWN') {
    return <p className="text-sm text-gray-400">No matches yet — run the draw on the Draw tab first.</p>;
  }

  const rounds = Array.from(new Set(event.matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const matches = event.matches.filter((m) => m.round === round).sort((a, b) => a.seq - b.seq);
        return (
          <div key={round}>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-mono mb-2">
              {MATCH_STAGE_LABEL[matches[0].stage]}
            </p>
            <div className="space-y-2">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} event={event} open={openMatchId === m.id} onToggle={() => setOpenMatchId(openMatchId === m.id ? null : m.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function teamLabel(t: FixtureTeam | null) {
  return t?.displayName ?? 'विजेता प्रतीक्षित · TBD';
}

function MatchCard({ match, event, open, onToggle }: { match: FixtureMatch; event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail; open: boolean; onToggle: () => void }) {
  const patchMatch = usePatchMatch(event.id);
  const [scoreA, setScoreA] = useState(match.scoreA);
  const [scoreB, setScoreB] = useState(match.scoreB);
  const [videoRef, setVideoRef] = useState(match.videoRef ?? '');

  const canEdit = match.status !== 'FINAL' && match.teamAId && match.teamBId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => canEdit && onToggle()}
        disabled={!canEdit}
        className="w-full flex items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
      >
        <span className={`flex-1 text-sm ${match.winnerId === match.teamAId ? 'font-bold text-[#1e3a8a]' : 'text-gray-700'}`}>{teamLabel(match.teamA)}</span>
        <span className="font-mono text-sm text-gray-400">{match.status === 'FINAL' ? `${match.scoreA} – ${match.scoreB}` : 'बनाम · vs'}</span>
        <span className={`flex-1 text-sm text-right ${match.winnerId === match.teamBId ? 'font-bold text-[#1e3a8a]' : 'text-gray-700'}`}>{teamLabel(match.teamB)}</span>
      </button>

      {open && canEdit && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{match.teamA?.displayName}</label>
              <input type="number" min={0} className={inputClass} value={scoreA} onChange={(e) => setScoreA(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{match.teamB?.displayName}</label>
              <input type="number" min={0} className={inputClass} value={scoreB} onChange={(e) => setScoreB(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Video reference (URL)</label>
            <input className={inputClass} placeholder="https://…" value={videoRef} onChange={(e) => setVideoRef(e.target.value)} />
          </div>
          {patchMatch.isError && <p className="text-xs text-red-600">{(patchMatch.error as Error).message}</p>}
          <button
            onClick={() => patchMatch.mutate({ matchId: match.id, data: { scoreA, scoreB, videoRef: videoRef || undefined, finalise: true } }, { onSuccess: onToggle })}
            disabled={scoreA === scoreB || patchMatch.isPending}
            className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
          >
            {patchMatch.isPending ? 'Saving…' : 'Finalise Result'}
          </button>
          {scoreA === scoreB && <p className="text-xs text-amber-600">Scores cannot be level — knockout needs a winner.</p>}
        </div>
      )}
    </div>
  );
}

// ─── Standings ──────────────────────────────────────────────────────────────
function StandingsTab({ event }: { event: import('@/lib/api/adminCmTrophyFixturesApi').FixtureEventDetail }) {
  if (event.status !== 'COMPLETED') {
    return <p className="text-sm text-gray-400">Standings appear once the final and third-place match are both finalised.</p>;
  }
  const final = event.matches.find((m) => m.stage === 'FINAL');
  const third = event.matches.find((m) => m.stage === 'THIRD_PLACE');
  const gold = final?.winner ?? null;
  const silver = final ? (final.winnerId === final.teamAId ? final.teamB : final.teamA) : null;
  const bronze = third?.winner ?? null;

  return (
    <div className="max-w-md space-y-3">
      <Podium place="Gold" icon="🥇" team={gold} />
      <Podium place="Silver" icon="🥈" team={silver} />
      <Podium place="Bronze" icon="🥉" team={bronze} />
      <p className="text-xs text-gray-400 mt-4">
        These placings are not yet reflected on the CM Trophy medal leaderboard — that wiring is a follow-up once the
        medal-record schema question is settled. Use the existing Add Medal page to record them there for now if needed.
      </p>
    </div>
  );
}

function Podium({ place, icon, team }: { place: string; icon: string; team: FixtureTeam | null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{place}</p>
        <p className="text-sm font-semibold text-gray-900">{team?.displayName ?? '—'}</p>
      </div>
    </div>
  );
}
