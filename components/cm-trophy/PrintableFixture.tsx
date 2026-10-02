import { FixtureEventDetail, FixtureMatch, FIXTURE_LEVEL_LABEL, MATCH_STAGE_LABEL } from '@/lib/api/adminCmTrophyFixturesApi';

// Print-only sheet (hidden on screen): entrants, matches by round, podium.
// Triggered by window.print() from the fixture detail pages.
export default function PrintableFixture({ event }: { event: FixtureEventDetail }) {
  const rounds = Array.from(new Set(event.matches.map((m) => m.round))).sort((a, b) => a - b);
  const venueName = (m: FixtureMatch) => {
    const v = event.venues.find((x) => x.id === m.venueId);
    const f = v?.fields.find((x) => x.id === m.fieldId);
    return v ? `${v.name}${f ? ` — ${f.name}` : ''}` : '—';
  };
  const final = event.matches.find((m) => m.stage === 'FINAL');
  const third = event.matches.find((m) => m.stage === 'THIRD_PLACE');
  const podium = event.status === 'COMPLETED' && final
    ? [
        ['Gold', final.winner],
        ['Silver', final.winnerId === final.teamAId ? final.teamB : final.teamA],
        ['Bronze', third?.winner ?? null],
      ] as const
    : [];
  const th = 'border border-black px-2 py-1 text-left';
  const td = 'border border-black px-2 py-1';

  return (
    <div className="hidden print:block text-black text-sm">
      <h1 className="text-xl font-bold">{event.sportName} — {event.scopeName}</h1>
      <p className="mb-4">
        {FIXTURE_LEVEL_LABEL[event.level].split(' (')[0]} · {event.ageCategory.replace(/_/g, ' ')}
        {event.gender ? ` · ${event.gender}` : ''}
        {event.entrantType === 'PLAYER' && ` · Individual player${event.event ? ` · ${event.event}` : ''}`} · {event.status}
      </p>

      <h2 className="font-semibold mb-1">Entrants ({event.teams.length})</h2>
      <table className="w-full border-collapse mb-6">
        <thead><tr><th className={`${th} w-10`}>#</th><th className={th}>Entrant</th></tr></thead>
        <tbody>
          {event.teams.map((t, i) => (
            <tr key={t.id}><td className={td}>{i + 1}</td><td className={td}>{t.displayName}</td></tr>
          ))}
        </tbody>
      </table>

      {rounds.map((r) => {
        const ms = event.matches.filter((m) => m.round === r).sort((a, b) => a.seq - b.seq);
        return (
          <div key={r} className="mb-5 break-inside-avoid">
            <h2 className="font-semibold mb-1">Round {r} — {MATCH_STAGE_LABEL[ms[0].stage]}</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr><th className={th}>Match</th><th className={th}>Team A</th><th className={th}>Team B</th><th className={th}>Score</th><th className={th}>Venue</th><th className={th}>Winner</th></tr>
              </thead>
              <tbody>
                {ms.map((m) => (
                  <tr key={m.id}>
                    <td className={td}>{m.seq}</td>
                    <td className={td}>{m.teamA?.displayName ?? 'TBD'}</td>
                    <td className={td}>{m.teamB?.displayName ?? 'TBD'}</td>
                    <td className={td}>{m.status === 'FINAL' ? `${m.scoreA} – ${m.scoreB}` : '—'}</td>
                    <td className={td}>{venueName(m)}</td>
                    <td className={td}>{m.winner?.displayName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {podium.length > 0 && (
        <div className="break-inside-avoid">
          <h2 className="font-semibold mb-1">Final standings</h2>
          <table className="border-collapse">
            <tbody>
              {podium.map(([place, team]) => (
                <tr key={place}><td className={`${td} font-semibold`}>{place}</td><td className={td}>{team?.displayName ?? '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
