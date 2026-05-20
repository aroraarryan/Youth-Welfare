/**
 * Admin API layer for Infrastructure and Mangal Dal modules.
 * All calls go through /api/admin/... (cookie-based admin auth).
 */

import { PaginatedResponse } from '../api';
import { InfraType, InfrastructureItem, InfraFormData } from './officerApi';

// Enum → URL segment (mirrors officer API)
const INFRA_URL: Record<InfraType, string> = {
  HALL:               'multipurpose-halls',
  STADIUM:            'mini-stadiums',
  YOUTH_HOSTEL:       'youth-hostels',
  VOCATIONAL_CENTER:  'vocational-training-centers',
  INDOOR_GYM:         'indoor-gym',
  OPEN_GYM:           'open-gym',
  KHEL_MAIDAAN:       'khel-maidaan',
};

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export const adminModulesApi = {
  // ─── Infrastructure ───────────────────────────────────────────────────────

  listInfra: (
    type: InfraType,
    params: { districtId?: string; blockId?: string; page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<InfrastructureItem>> => {
    const qs = new URLSearchParams();
    if (params.districtId) qs.set('districtId', params.districtId);
    if (params.blockId)    qs.set('blockId',    params.blockId);
    if (params.page)       qs.set('page',        String(params.page));
    if (params.limit)      qs.set('limit',       String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`infrastructure/${INFRA_URL[type]}${query}`);
  },

  createInfra: (
    type: InfraType,
    data: InfraFormData
  ): Promise<{ success: boolean; data: InfrastructureItem }> =>
    adminFetch(`infrastructure/${INFRA_URL[type]}`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  updateInfra: (
    type: InfraType,
    id: string,
    data: Partial<InfraFormData> & { isActive?: boolean }
  ): Promise<{ success: boolean; data: InfrastructureItem }> =>
    adminFetch(`infrastructure/${INFRA_URL[type]}/${id}`, {
      method: 'PATCH', body: JSON.stringify(data),
    }),

  deleteInfra: (
    type: InfraType,
    id: string
  ): Promise<{ success: boolean }> =>
    adminFetch(`infrastructure/${INFRA_URL[type]}/${id}`, { method: 'DELETE' }),

  // ─── Mangal Dal ───────────────────────────────────────────────────────────

  listMangalDals: (params: {
    dalType?: 'MAHILA' | 'YUVAK';
    districtId?: string;
    blockId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    renewalStatus?: string;
  } = {}): Promise<PaginatedResponse<any>> => {
    const qs = new URLSearchParams();
    if (params.dalType)       qs.set('dalType',       params.dalType);
    if (params.districtId)    qs.set('districtId',    params.districtId);
    if (params.blockId)       qs.set('blockId',       params.blockId);
    if (params.page)          qs.set('page',          String(params.page));
    if (params.limit)         qs.set('limit',         String(params.limit));
    if (params.sortBy)        qs.set('sortBy',        params.sortBy);
    if (params.sortOrder)     qs.set('sortOrder',     params.sortOrder);
    if (params.renewalStatus) qs.set('renewalStatus', params.renewalStatus);
    const query = qs.toString() ? `?${qs}` : '';
    return adminFetch(`mangal-dals${query}`);
  },

  createMangalDal: (data: any): Promise<{ success: boolean; data: any }> =>
    adminFetch('mangal-dals', { method: 'POST', body: JSON.stringify(data) }),

  updateMangalDal: (id: string, data: any): Promise<{ success: boolean; data: any }> =>
    adminFetch(`mangal-dals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMangalDal: (id: string): Promise<{ success: boolean }> =>
    adminFetch(`mangal-dals/${id}`, { method: 'DELETE' }),
};
