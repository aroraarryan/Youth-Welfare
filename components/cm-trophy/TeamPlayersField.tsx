'use client';

import { useState } from 'react';
import { TeamMedalError } from '@/lib/cmTrophyTeamMedal';

export interface TeamPlayer {
  code: string;
  name: string;
}

// "Team players" section of Add Medal (admin + officer). Shown automatically when the
// first player's sport/event is a team one (isTeamMedal). The first player comes from the
// main Application Code field; more are added here by application code. Each code is
// checked with the page's own lookup (which already rejects unknown, rejected and
// out-of-scope codes); the server re-validates everything on save.
export default function TeamPlayersField({
  firstPlayer,
  players,
  setPlayers,
  lookup,
  serverErrors,
  inputClass,
}: {
  firstPlayer: { registrationNo: string; fullName: string; sportId: string };
  players: TeamPlayer[];
  setPlayers: (players: TeamPlayer[]) => void;
  lookup: (code: string) => Promise<{ data: { registrationNo: string; fullName: string; sportId: string } }>;
  serverErrors: TeamMedalError[];
  inputClass: string;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const add = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || checking) return;
    setError('');
    const taken = [firstPlayer.registrationNo, ...players.map((p) => p.code)].map((c) => c.toUpperCase());
    if (taken.includes(trimmed)) {
      setError('This player is already in the team.');
      return;
    }
    setChecking(true);
    try {
      const res = await lookup(trimmed);
      if (res.data.sportId !== firstPlayer.sportId) {
        setError(`${res.data.fullName} is registered for a different sport.`);
        return;
      }
      setPlayers([...players, { code: res.data.registrationNo, name: res.data.fullName }]);
      setCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Application code not found.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4">
      <p className="text-sm font-semibold text-gray-800">
        Team players ({players.length + 1})
        <span className="ml-2 text-xs font-normal text-gray-500">Every player gets the medal; the team counts as 1 medal.</span>
      </p>

      <ul className="flex flex-wrap gap-2 mt-3">
        <li className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1">
          {firstPlayer.fullName} <span className="font-mono text-gray-400">{firstPlayer.registrationNo}</span>
        </li>
        {players.map((p) => (
          <li key={p.code} className="text-xs bg-white border border-gray-300 rounded-full pl-3 pr-1 py-1 flex items-center gap-1">
            {p.name} <span className="font-mono text-gray-400">{p.code}</span>
            <button
              type="button"
              onClick={() => setPlayers(players.filter((x) => x.code !== p.code))}
              className="w-5 h-5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
              aria-label={`Remove ${p.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-3">
        <input
          className={inputClass}
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Add player — application code (CMT-XXXXXXXX)"
        />
        <button
          type="button"
          onClick={add}
          disabled={!code.trim() || checking}
          className="text-sm font-medium border border-gray-300 bg-white text-gray-700 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
        >
          {checking ? 'Checking…' : '+ Add'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {players.length === 0 && <p className="text-xs text-amber-700 mt-1">Add at least one more player to save this team medal.</p>}
      {serverErrors.length > 0 && (
        <ul className="mt-2 text-xs text-red-600 space-y-0.5">
          {serverErrors.map((e) => <li key={e.applicationCode}><span className="font-mono">{e.applicationCode}</span> — {e.reason}</li>)}
        </ul>
      )}
    </div>
  );
}
