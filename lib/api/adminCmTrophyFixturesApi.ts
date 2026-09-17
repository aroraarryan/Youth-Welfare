/**
 * Admin API layer for CM Trophy Fixtures (tournament engine).
 * All calls go through /api/admin/... (cookie-based admin auth).
 */

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export type CmTrophyFixtureLevel = 'VIDHAN_SABHA' | 'SANSAD' | 'STATE';
export type CmTrophyFixtureStatus = 'DRAFT' | 'DRAWN' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type CmTrophyFixtureMatchStage = 'PRELIMINARY' | 'ROUND' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL';
export type CmTrophyFixtureMatchStatus = 'PENDING' | 'SCHEDULED' | 'FINAL';
export type CmTrophyFixtureEntrantType = 'PLACE' | 'PLAYER';

export const FIXTURE_LEVEL_LABEL: Record<CmTrophyFixtureLevel, string> = {
  VIDHAN_SABHA: 'Vidhan Sabha (entrants: its Nyay Panchayats)',
  SANSAD: 'Sansad (entrants: its Vidhan Sabhas)',
  STATE: 'State Final (entrants: all Sansads)',
};

export const MATCH_STAGE_LABEL: Record<CmTrophyFixtureMatchStage, string> = {
  PRELIMINARY: 'Preliminary',
  ROUND: 'Round',
  QUARTER_FINAL: 'Quarter Final',
  SEMI_FINAL: 'Semi Final',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export interface FixtureEventSummary {
  id: string;
  level: CmTrophyFixtureLevel;
  status: CmTrophyFixtureStatus;
  entrantType: CmTrophyFixtureEntrantType;
  event: string | null;
  ageCategory: string;
  gender: string | null;
  sportId: string;
  sportName: string;
  scopeName: string;
  teamCount: number;
  matchCount: number;
  createdAt: string;
}

export interface FixtureTeam {
  id: string;
  eventId: string;
  nyayPanchayatId: string | null;
  vidhanSabhaId: string | null;
  sansadId: string | null;
  registrationId: string | null;
  displayName: string;
  seedOrder: number | null;
}

export interface EntrantCandidate {
  id: string;
  label: string;
}

export interface FixtureVenue {
  id: string;
  eventId: string;
  name: string;
  address: string | null;
  fields: FixtureField[];
}

export interface FixtureField {
  id: string;
  venueId: string;
  name: string;
}

export interface FixtureMatch {
  id: string;
  eventId: string;
  stage: CmTrophyFixtureMatchStage;
  round: number;
  seq: number;
  teamAId: string | null;
  teamA: FixtureTeam | null;
  teamBId: string | null;
  teamB: FixtureTeam | null;
  scoreA: number;
  scoreB: number;
  status: CmTrophyFixtureMatchStatus;
  winnerId: string | null;
  winner: FixtureTeam | null;
  videoRef: string | null;
  venueId: string | null;
  fieldId: string | null;
}

export interface FixtureEventDetail extends FixtureEventSummary {
  seedHash: string | null;
  seed: string | null;
  drawnAt: string | null;
  revealedAt: string | null;
  vidhanSabhaId: string | null;
  sansadId: string | null;
  teams: FixtureTeam[];
  venues: FixtureVenue[];
  matches: FixtureMatch[];
}

export interface CreateFixtureEventInput {
  level: CmTrophyFixtureLevel;
  sportId: string;
  ageCategory: string;
  gender?: string;
  vidhanSabhaId?: string;
  sansadId?: string;
  entrantType?: CmTrophyFixtureEntrantType;
  event?: string;
}

export interface FixtureStandings {
  status: CmTrophyFixtureStatus;
  matches: FixtureMatch[];
  podium: { gold: FixtureTeam | null; silver: FixtureTeam | null; bronze: FixtureTeam | null } | null;
}

export const adminCmTrophyFixturesApi = {
  list: (params: { level?: CmTrophyFixtureLevel; status?: CmTrophyFixtureStatus } = {}): Promise<{ success: boolean; data: FixtureEventSummary[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`cm-trophy/fixtures${query}`);
  },

  get: (id: string): Promise<{ success: boolean; data: FixtureEventDetail }> =>
    adminFetch(`cm-trophy/fixtures/${id}`),

  create: (data: CreateFixtureEventInput): Promise<{ success: boolean; data: FixtureEventSummary }> =>
    adminFetch('cm-trophy/fixtures', { method: 'POST', body: JSON.stringify(data) }),

  addTeam: (eventId: string, entrantId: string): Promise<{ success: boolean; data: FixtureTeam }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/teams`, { method: 'POST', body: JSON.stringify({ entrantId }) }),

  // Only PLAYER-entrant fixtures call this from the UI today (PLACE candidates
  // are derived locally from the existing geo hooks — see TeamsTab).
  getEntrantPool: (params: {
    level: CmTrophyFixtureLevel;
    entrantType: CmTrophyFixtureEntrantType;
    sportId?: string;
    ageCategory?: string;
    gender?: string;
    event?: string;
    vidhanSabhaId?: string;
    sansadId?: string;
  }): Promise<{ success: boolean; data: EntrantCandidate[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    return adminFetch(`cm-trophy/fixtures/entrant-pool?${qs}`);
  },

  // Manual override for getEntrantPool: finds any approved player by
  // application code (registrationNo), regardless of geo scope — e.g. a
  // Nyay Panchayat-level winner advancing into a Vidhan Sabha fixture.
  searchRegistrations: (params: { registrationNo: string; sportId: string; ageCategory: string }): Promise<{ success: boolean; data: EntrantCandidate[] }> => {
    const qs = new URLSearchParams(params);
    return adminFetch(`cm-trophy/fixtures/search-registrations?${qs}`);
  },

  addAllTeams: (eventId: string): Promise<{ success: boolean; data: { created: number } }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/teams/add-all`, { method: 'POST' }),

  removeTeam: (eventId: string, teamId: string): Promise<{ success: boolean }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/teams/${teamId}`, { method: 'DELETE' }),

  commitDraw: (eventId: string): Promise<{ success: boolean; data: { seedHash: string; drawnAt: string; status: CmTrophyFixtureStatus } }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/commit-draw`, { method: 'POST' }),

  revealDraw: (eventId: string): Promise<{ success: boolean; data: FixtureEventDetail }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/reveal-draw`, { method: 'POST' }),

  listVenues: (eventId: string): Promise<{ success: boolean; data: FixtureVenue[] }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/venues`),

  createVenue: (eventId: string, data: { name: string; address?: string }): Promise<{ success: boolean; data: FixtureVenue }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/venues`, { method: 'POST', body: JSON.stringify(data) }),

  createField: (venueId: string, data: { name: string }): Promise<{ success: boolean; data: FixtureField }> =>
    adminFetch(`cm-trophy/fixtures/venues/${venueId}/fields`, { method: 'POST', body: JSON.stringify(data) }),

  listMatches: (eventId: string): Promise<{ success: boolean; data: FixtureMatch[] }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/matches`),

  patchMatch: (
    matchId: string,
    data: { scoreA?: number; scoreB?: number; videoRef?: string; finalise?: boolean; venueId?: string; fieldId?: string }
  ): Promise<{ success: boolean; data: FixtureMatch }> =>
    adminFetch(`cm-trophy/fixtures/matches/${matchId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getStandings: (eventId: string): Promise<{ success: boolean; data: FixtureStandings }> =>
    adminFetch(`cm-trophy/fixtures/${eventId}/standings`),
};
