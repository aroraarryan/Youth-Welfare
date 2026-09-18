/**
 * Officer-facing CM Trophy API (BO_PRD only, server-enforced to
 * NYAY_PANCHAYAT level everywhere except Grievances, which have no geo
 * field at all — see backend/src/routes/officerRoutes.js). Mirrors the
 * relevant slice of lib/api/adminCmTrophyApi.ts.
 */

import { Gender, RegistrationStatus, CmTrophyRegistrationLevel } from './registrations';
import { CmTrophyAgeCategory } from '../cmTrophyAgeCategory';
import type { AdminKhelMahakumbhRegistration, MedalLeaderboardRow } from './adminCmTrophyApi';

export type CmTrophyMedal = 'GOLD' | 'SILVER' | 'BRONZE';

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
  nyayPanchayatId: string;
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
  level: 'NYAY_PANCHAYAT';
  gender: Gender | null;
  event: string | null;
  ageCategory: CmTrophyAgeCategory | null;
  entityName: string | null;
  nyayPanchayatId: string | null;
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
  dateFrom?: string;
  dateTo?: string;
}

export interface CmTrophyAttendanceListParams {
  sportId?: string;
  event?: string;
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

  listMedals: (params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginatedResult<MedalRecord>> =>
    officerFetch(`cm-trophy/medals${qs(params)}`),

  getLeaderboard: (): Promise<{ success: boolean; data: MedalLeaderboardRow[] }> =>
    officerFetch('cm-trophy/leaderboard/nyay-panchayat'),

  // Registrations (Nyay Panchayat-level, forced server-side)
  listRegistrations: (params: CmTrophyListParams = {}): Promise<PaginatedResult<AdminKhelMahakumbhRegistration>> =>
    officerFetch(`cm-trophy/registrations${qs(params)}`),

  getRegistration: (id: string): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    officerFetch(`cm-trophy/registrations/${id}`),

  updateRegistration: (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    officerFetch(`cm-trophy/registrations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Attendance (Nyay Panchayat-level, forced server-side)
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
