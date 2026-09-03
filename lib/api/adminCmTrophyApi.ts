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
}

export interface CreateMedalInput {
  applicationCode: string;
  sportId: string;
  medal: CmTrophyMedal;
  level: CmTrophyMedalLevel;
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
  entityName: string | null;
  createdAt: string;
}

export interface MedalListParams {
  sportId?: string;
  level?: CmTrophyMedalLevel;
  districtId?: string;
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  page?: number;
  limit?: number;
}

export interface MedalRejectRow {
  row: number;
  applicationCode?: string;
  reason: string;
}

export const MEDAL_LEVEL_LABEL: Record<CmTrophyMedalLevel, string> = {
  DISTRICT: 'District',
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
}

export interface CmTrophyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: RegistrationStatus;
  sportId?: string;
  gender?: Gender;
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

  deleteMedal: (id: string): Promise<{ success: boolean }> =>
    adminFetch(`cm-trophy/medals/${id}`, { method: 'DELETE' }),
};
