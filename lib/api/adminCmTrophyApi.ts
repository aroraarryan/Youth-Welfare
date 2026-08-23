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
};
