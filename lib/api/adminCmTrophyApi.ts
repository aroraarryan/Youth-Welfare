/**
 * Admin API layer for CM Trophy (Khel Mahakumbh) registrations.
 * All calls go through /api/admin/... (cookie-based admin auth).
 * View + export only — no status-changing actions.
 */

import { PaginatedResponse } from '../api';
import {
  RegistrationStatus,
  Gender,
  CmTrophyAgeCategory,
  CmTrophyRegistrationLevel,
} from './registrations';

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export interface AdminKhelMahakumbhRegistration {
  id: string;
  registrationNo: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
  dob: string;
  gender: Gender;
  hasDisability: boolean;
  ageCategory: CmTrophyAgeCategory;
  registrationLevel: CmTrophyRegistrationLevel;
  selectedEvents: string[];
  photoUrl: string;
  status: RegistrationStatus;
  createdAt: string;
  aadharNumber: string;
  fathersName: string;
  mothersName: string;
  address: string;
  bankName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  passbookOrChequeUrl: string | null;
  birthEducationCertificateUrl: string;
  residenceProofUrl: string | null;
  disabilityCertificateUrl: string | null;
  district: { id: string; name: string } | null;
  block: { id: string; name: string } | null;
  sansad: { id: string; name: string } | null;
  vidhanSabha: { id: string; name: string } | null;
  nyayPanchayat: { id: string; name: string } | null;
  sport: { id: string; name: string; slug: string } | null;
}

export interface AdminKhelMahakumbhExportRow {
  id: string;
  registrationNo: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
  dob: string;
  gender: Gender;
  selectedEvents: string[];
  ageCategory: CmTrophyAgeCategory;
  registrationLevel: CmTrophyRegistrationLevel;
  sport: { name: string } | null;
  sansad: { name: string } | null;
  vidhanSabha: { name: string } | null;
  nyayPanchayat: { name: string } | null;
  district: { name: string } | null;
  block: { name: string } | null;
}

export interface CmTrophyStats {
  total: number;
  underReview: number;
  approved: number;
  rejected: number;
}

export interface CmTrophyWeeklyPoint {
  day: string;
  count: number;
}

export interface DistrictMedalTally {
  districtId: string;
  districtName: string;
  districtHindiName: string | null;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  updatedAt: string | null;
}

export type CmTrophyMedalLevel = 'DISTRICT' | 'NYAY_PANCHAYAT' | 'VIDHAN_SABHA' | 'SANSAD';
export type CmTrophyMedal = 'GOLD' | 'SILVER' | 'BRONZE';

export const MEDAL_LEVEL_URL: Record<CmTrophyMedalLevel, string> = {
  DISTRICT: 'district',
  NYAY_PANCHAYAT: 'nyay-panchayat',
  VIDHAN_SABHA: 'vidhan-sabha',
  SANSAD: 'sansad',
};

export interface MedalLeaderboardRow {
  entityId: string;
  entityName: string;
  entityHindiName?: string | null;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

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

export interface CreateMedalInput {
  applicationCode: string;
  sportId: string;
  medal: CmTrophyMedal;
  level: CmTrophyMedalLevel;
  gender?: Gender;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
  name?: string;
  fathersName?: string;
  email?: string;
  districtId?: string;
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
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
  level: CmTrophyMedalLevel;
  gender: Gender | null;
  event: string | null;
  ageCategory: CmTrophyAgeCategory | null;
  entityName: string | null;
  districtId: string | null;
  sansadId: string | null;
  vidhanSabhaId: string | null;
  nyayPanchayatId: string | null;
  createdAt: string;
}

export interface MedalListParams {
  sportId?: string;
  level?: CmTrophyMedalLevel;
  medal?: CmTrophyMedal;
  districtId?: string;
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MedalRejectRow {
  row: number;
  applicationCode?: string;
  reason: string;
}

export const MEDAL_LEVEL_LABEL: Record<CmTrophyMedalLevel, string> = {
  DISTRICT: 'State',
  NYAY_PANCHAYAT: 'Nyay Panchayat',
  VIDHAN_SABHA: 'Vidhan Sabha',
  SANSAD: 'Sansad',
};

// One row of the bulk-upload Excel: human-readable text, resolved server-side.
export interface MedalBulkRow {
  applicationCode: string;
  sport: string;
  medal: string;
  level: string;
  entityName: string;
  gender?: string;
  event?: string;
  ageCategory?: string;
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
  registrationLevel?: CmTrophyRegistrationLevel;
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  districtId?: string;
  blockId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const adminCmTrophyApi = {
  list: (params: CmTrophyListParams = {}): Promise<PaginatedResponse<AdminKhelMahakumbhRegistration>> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`cm-trophy/registrations${query}`);
  },

  // One cursor-paginated batch of the lean export field set. Same filter params
  // as `list` (page/limit ignored); pass back `nextCursor` until it's null.
  exportBatch: (
    params: CmTrophyListParams,
    cursor?: string | null,
    limit = 2000,
  ): Promise<{ success: boolean; data: AdminKhelMahakumbhExportRow[]; nextCursor: string | null }> => {
    const qs = new URLSearchParams();
    Object.entries({ ...params, page: undefined, limit }).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    if (cursor) qs.set('cursor', cursor);
    return adminFetch(`cm-trophy/registrations-export?${qs}`);
  },

  getById: (id: string): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    adminFetch(`cm-trophy/registrations/${id}`),

  stats: (): Promise<{ success: boolean; data: CmTrophyStats }> =>
    adminFetch('cm-trophy/stats'),

  weeklyTrend: (): Promise<{ success: boolean; data: CmTrophyWeeklyPoint[] }> =>
    adminFetch('cm-trophy/weekly-trend'),

  getLeaderboard: (): Promise<{ success: boolean; data: DistrictMedalTally[] }> =>
    adminFetch('cm-trophy/leaderboard'),

  getMedalLeaderboard: (level: CmTrophyMedalLevel): Promise<{ success: boolean; data: MedalLeaderboardRow[] }> =>
    adminFetch(`cm-trophy/leaderboard/${MEDAL_LEVEL_URL[level]}`),

  lookupRegistrationByCode: (code: string): Promise<{ success: boolean; data: RegistrationLookupResult }> =>
    adminFetch(`cm-trophy/registrations/by-code/${encodeURIComponent(code)}`),

  createMedal: (data: CreateMedalInput): Promise<{ success: boolean; data: MedalRecord }> =>
    adminFetch('cm-trophy/medals', { method: 'POST', body: JSON.stringify(data) }),

  bulkCreateMedals: (rows: MedalBulkRow[]): Promise<{ success: boolean; inserted: number; rejected: MedalRejectRow[] }> =>
    adminFetch('cm-trophy/medals/bulk', { method: 'POST', body: JSON.stringify(rows) }),

  listMedals: (params: MedalListParams = {}): Promise<{ success: boolean; total: number; page: number; limit: number; data: MedalRecord[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`cm-trophy/medals${query}`);
  },

  updateMedal: (id: string, data: CreateMedalInput): Promise<{ success: boolean; data: MedalRecord }> =>
    adminFetch(`cm-trophy/medals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMedal: (id: string): Promise<{ success: boolean }> =>
    adminFetch(`cm-trophy/medals/${id}`, { method: 'DELETE' }),

  updateRegistration: (id: string, data: Record<string, unknown>): Promise<{ success: boolean; data: AdminKhelMahakumbhRegistration }> =>
    adminFetch(`cm-trophy/registrations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  listAttendance: (params: CmTrophyAttendanceListParams = {}): Promise<{ success: boolean; total: number; page: number; limit: number; data: AttendanceRow[] }> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`cm-trophy/attendance${query}`);
  },

  markAttendance: (registrationId: string, isPresent: boolean): Promise<{ success: boolean; data: unknown }> =>
    adminFetch(`cm-trophy/attendance/${registrationId}`, { method: 'PATCH', body: JSON.stringify({ isPresent }) }),

  bulkMarkPresent: (registrationIds: string[]): Promise<{ success: boolean; inserted: number; rejected: { registrationId: string; reason: string }[] }> =>
    adminFetch('cm-trophy/attendance/bulk-present', { method: 'POST', body: JSON.stringify({ registrationIds }) }),
};

export interface CmTrophyAttendanceListParams {
  sportId?: string;
  event?: string;
  registrationLevel?: CmTrophyRegistrationLevel;
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
