/**
 * Officer-facing CM Trophy API. Scope is enforced server-side (see
 * backend/src/routes/officerRoutes.js): Block Officers (BO_PRD) get
 * NYAY_PANCHAYAT level in their own block; District Officers (DO_PRD) get
 * every level in their own district. Grievances are BO_PRD only and have no
 * geo field at all. Mirrors the relevant slice of lib/api/adminCmTrophyApi.ts.
 */

import { Gender, RegistrationStatus, CmTrophyRegistrationLevel } from './registrations';
import { CmTrophyAgeCategory } from '../cmTrophyAgeCategory';
import type { PaginatedResponse } from '../api';
import type {
  AdminKhelMahakumbhRegistration,
  AdminKhelMahakumbhExportRow,
  CmTrophyStats,
  CmTrophyWeeklyPoint,
  MedalLeaderboardRow,
} from './adminCmTrophyApi';

export type CmTrophyMedal = 'GOLD' | 'SILVER' | 'BRONZE';

// Levels a District Officer can add medals at / see leaderboards for.
export type OfficerMedalLevel = 'NYAY_PANCHAYAT' | 'VIDHAN_SABHA' | 'SANSAD';
export type OfficerLeaderboardLevel = 'nyay-panchayat' | 'vidhan-sabha' | 'sansad';

export const LEVEL_LABEL: Record<string, string> = {
  NYAY_PANCHAYAT: 'Nyay Panchayat',
  VIDHAN_SABHA: 'Vidhan Sabha',
  SANSAD: 'Sansad',
  STATE: 'State',
  DISTRICT: 'District',
};

export interface RegistrationLookupResult {
  id: string;
  fullName: string;
  fathersName: string;
  email: string | null;
  registrationNo: string;
  gender: Gender | null;
  selectedEvents: string[];
  ageCategory: CmTrophyAgeCategory | null;
  sportId: string;
  sportName: string | null;
}

export interface CreateOfficerMedalInput {
  applicationCode: string;
  sportId: string;
  medal: CmTrophyMedal;
  gender?: Gender;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
  name?: string;
  fathersName?: string;
  email?: string;
  // Block officers: nyayPanchayatId only. District officers: `level` + the matching id.
  level?: OfficerMedalLevel;
  nyayPanchayatId?: string;
  vidhanSabhaId?: string;
  sansadId?: string;
}

export interface MedalRecord {
  id: string;
  applicationCode: string;
  name: string;
  fathersName: string;
  email: string | null;
  sportId: string;
  sportName: string;
  medal: CmTrophyMedal;
  level: OfficerMedalLevel | 'DISTRICT';
  gender: Gender | null;
  event: string | null;
  ageCategory: CmTrophyAgeCategory | null;
  entityName: string | null;
  nyayPanchayatId: string | null;
  vidhanSabhaId?: string | null;
  sansadId?: string | null;
  createdAt: string;
}

export interface CmTrophyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: RegistrationStatus;
  sportId?: string;
  gender?: Gender;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
  registrationLevel?: CmTrophyRegistrationLevel; // honoured for district officers only
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  districtId?: string; // ignored server-side for scoped officers (their own district always wins)
  blockId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Medal Dashboard filters (level is honoured for district officers only).
export interface OfficerMedalListParams {
  page?: number;
  limit?: number;
  search?: string;
  sportId?: string;
  level?: OfficerMedalLevel;
  medal?: CmTrophyMedal;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
}

export interface CmTrophyAttendanceListParams {
  sportId?: string;
  event?: string;
  registrationLevel?: CmTrophyRegistrationLevel; // honoured for district officers only
  gender?: Gender;
  ageCategory?: CmTrophyAgeCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceRow {
  id: string;
  registrationNo: string;
  fullName: string;
  fathersName: string;
  gender: Gender;
  ageCategory: CmTrophyAgeCategory;
  sportId: string;
  sportName: string;
  registrationLevel: CmTrophyRegistrationLevel;
  selectedEvents: string[];
  isPresent: boolean | null;
  markedAt: string | null;
}

export interface Grievance {
  id: string;
  name: string;
  email: string;
  mobile: string;
  atomId: string | null;
  problem: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

interface PaginatedResult<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

function qs<T extends object>(params: T = {} as T) {
  const s = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => { if (v !== undefined && v !== '') s.set(k, String(v)); });
  const str = s.toString();
  return str ? `?${str}` : '';
}

async function officerFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/officer/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export const officerCmTrophyApi = {
  lookupRegistrationByCode: (code: string): Promise<{ success: boolean; data: RegistrationLookupResult }> =>
    officerFetch(`cm-trophy/registrations/by-code/${encodeURIComponent(code)}`),

  createMedal: (data: CreateOfficerMedalInput): Promise<{ success: boolean; data: MedalRecord }> =>
    officerFetch('cm-trophy/medals', { method: 'POST', body: JSON.stringify(data) }),

  listMedals: (params: OfficerMedalListParams = {}): Promise<PaginatedResult<MedalRecord>> =>
    officerFetch(`cm-trophy/medals${qs(params)}`),

  // Block officers only get 'nyay-panchayat'; district officers get all three.
  getLeaderboard: (level: OfficerLeaderboardLevel = 'nyay-panchayat'): Promise<{ success: boolean; data: MedalLeaderboardRow[] }> =>
    officerFetch(`cm-trophy/leaderboard/${level}`),

  // Registrations (BO: Nyay Panchayat-level in own block; DO: all levels in own district — forced server-side)
  listRegistrations: (params: CmTrophyListParams = {}): Promise<PaginatedResponse<AdminKhelMahakumbhRegistration>> =>
    officerFetch(`cm-trophy/registrations${qs(params)}`),

  stats: (): Promise<{ success: boolean; data: CmTrophyStats }> =>
    officerFetch('cm-trophy/stats'),

  weeklyTrend: (): Promise<{ success: boolean; data: CmTrophyWeeklyPoint[] }> =>
    officerFetch('cm-trophy/weekly-trend'),

  // One cursor-paginated batch of the lean CSV export field set, same scope + filters as
  // `listRegistrations` (page/limit ignored); pass back `nextCursor` until it is null.
  exportBatch: (
    params: CmTrophyListParams,
    cursor?: string | null,
    limit = 2000,
  ): Promise<{ success: boolean; data: AdminKhelMahakumbhExportRow[]; nextCursor: string | null }> =>
    officerFetch(`cm-trophy/registrations-export${qs({ ...params, page: undefined, limit, cursor: cursor || undefined })}`),

  getRegistration: (id: string): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    officerFetch(`cm-trophy/registrations/${id}`),

  updateRegistration: (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    officerFetch(`cm-trophy/registrations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Attendance (BO: Nyay Panchayat-level in own block; DO: all levels in own district — forced server-side)
  listAttendance: (params: CmTrophyAttendanceListParams = {}): Promise<PaginatedResult<AttendanceRow>> =>
    officerFetch(`cm-trophy/attendance${qs(params)}`),

  markAttendance: (registrationId: string, isPresent: boolean): Promise<{ success: boolean; data: unknown }> =>
    officerFetch(`cm-trophy/attendance/${registrationId}`, { method: 'PATCH', body: JSON.stringify({ isPresent }) }),

  bulkMarkPresent: (registrationIds: string[]): Promise<{ success: boolean; inserted: number; rejected: { registrationId: string; reason: string }[] }> =>
    officerFetch('cm-trophy/attendance/bulk-present', { method: 'POST', body: JSON.stringify({ registrationIds }) }),

  // Grievances (unscoped — no geo field exists on this model)
  listGrievances: (params: { isResolved?: boolean; search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResult<Grievance>> =>
    officerFetch(`cm-trophy/grievance${qs(params)}`),

  getGrievance: (id: string): Promise<{ success: boolean; data: Grievance }> =>
    officerFetch(`cm-trophy/grievance/${id}`),

  resolveGrievance: (id: string): Promise<{ success: boolean; data: Grievance }> =>
    officerFetch(`cm-trophy/grievance/${id}/resolve`, { method: 'PATCH' }),

  deleteGrievance: (id: string): Promise<{ success: boolean }> =>
    officerFetch(`cm-trophy/grievance/${id}`, { method: 'DELETE' }),
};
