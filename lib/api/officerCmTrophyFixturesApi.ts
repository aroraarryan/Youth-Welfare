/**
 * Officer API layer for CM Trophy Fixtures (BO_PRD and DO_PRD, server-enforced to
 * VIDHAN_SABHA level — the one fixture tier whose entrants are Nyay
 * Panchayats; district officers are further limited to Vidhan Sabhas in their
 * district, see backend/src/routes/officerRoutes.js). Mirrors
 * lib/api/adminCmTrophyFixturesApi.ts, whose types are reused directly.
 */

import type {
  CmTrophyFixtureStatus,
  CmTrophyFixtureEntrantType,
  FixtureEventSummary,
  FixtureEventDetail,
  FixtureTeam,
  FixtureVenue,
  FixtureField,
  FixtureMatch,
  FixtureStandings,
  EntrantCandidate,
} from './adminCmTrophyFixturesApi';

async function officerFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/officer/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export interface CreateOfficerFixtureEventInput {
  sportId: string;
  ageCategory: string;
  gender?: string;
  vidhanSabhaId: string;
  entrantType?: CmTrophyFixtureEntrantType;
  event?: string;
}

export const officerCmTrophyFixturesApi = {
  list: (params: { status?: CmTrophyFixtureStatus } = {}): Promise<{ success: boolean; data: FixtureEventSummary[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    const query = qs.toString() ? `?${qs}` : '';
    return officerFetch(`cm-trophy/fixtures${query}`);
  },

  get: (id: string): Promise<{ success: boolean; data: FixtureEventDetail }> =>
    officerFetch(`cm-trophy/fixtures/${id}`),

  create: (data: CreateOfficerFixtureEventInput): Promise<{ success: boolean; data: FixtureEventSummary }> =>
    officerFetch('cm-trophy/fixtures', { method: 'POST', body: JSON.stringify(data) }),

  addTeam: (eventId: string, entrantId: string): Promise<{ success: boolean; data: FixtureTeam }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/teams`, { method: 'POST', body: JSON.stringify({ entrantId }) }),

  getEntrantPool: (params: {
    entrantType: CmTrophyFixtureEntrantType;
    sportId?: string;
    ageCategory?: string;
    gender?: string;
    event?: string;
    vidhanSabhaId?: string;
  }): Promise<{ success: boolean; data: EntrantCandidate[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
    return officerFetch(`cm-trophy/fixtures/entrant-pool?${qs}`);
  },

  searchRegistrations: (params: { registrationNo: string; sportId: string; ageCategory: string }): Promise<{ success: boolean; data: EntrantCandidate[] }> => {
    const qs = new URLSearchParams(params);
    return officerFetch(`cm-trophy/fixtures/search-registrations?${qs}`);
  },

  addAllTeams: (eventId: string): Promise<{ success: boolean; data: { created: number } }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/teams/add-all`, { method: 'POST' }),

  removeTeam: (eventId: string, teamId: string): Promise<{ success: boolean }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/teams/${teamId}`, { method: 'DELETE' }),

  commitDraw: (eventId: string): Promise<{ success: boolean; data: { seedHash: string; drawnAt: string; status: CmTrophyFixtureStatus } }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/commit-draw`, { method: 'POST' }),

  revealDraw: (eventId: string): Promise<{ success: boolean; data: FixtureEventDetail }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/reveal-draw`, { method: 'POST' }),

  listVenues: (eventId: string): Promise<{ success: boolean; data: FixtureVenue[] }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/venues`),

  createVenue: (eventId: string, data: { name: string; address?: string }): Promise<{ success: boolean; data: FixtureVenue }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/venues`, { method: 'POST', body: JSON.stringify(data) }),

  createField: (venueId: string, data: { name: string }): Promise<{ success: boolean; data: FixtureField }> =>
    officerFetch(`cm-trophy/fixtures/venues/${venueId}/fields`, { method: 'POST', body: JSON.stringify(data) }),

  listMatches: (eventId: string): Promise<{ success: boolean; data: FixtureMatch[] }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/matches`),

  patchMatch: (
    matchId: string,
    data: { scoreA?: number; scoreB?: number; videoRef?: string; finalise?: boolean; venueId?: string; fieldId?: string }
  ): Promise<{ success: boolean; data: FixtureMatch }> =>
    officerFetch(`cm-trophy/fixtures/matches/${matchId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getStandings: (eventId: string): Promise<{ success: boolean; data: FixtureStandings }> =>
    officerFetch(`cm-trophy/fixtures/${eventId}/standings`),
};
