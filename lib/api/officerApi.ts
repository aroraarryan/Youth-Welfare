/**
 * Officer-specific API layer.
 * All calls go through the /api/officer/... Next.js proxy which forwards
 * to ${BACKEND}/officer/... with the officer_token cookie.
 */

import { PaginatedResponse } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InfraType =
  | 'HALL' | 'STADIUM' | 'YOUTH_HOSTEL' | 'VOCATIONAL_CENTER'
  | 'INDOOR_GYM' | 'OPEN_GYM' | 'KHEL_MAIDAAN';

export interface InfrastructureItem {
  id: string;
  type: InfraType;
  name: string;
  location: string | null;
  districtId: string;
  district: { id: string; name: string };
  blockId: string | null;
  block: { id: string; name: string } | null;
  capacity: number | null;
  pocName: string | null;
  pocPhone: string | null;
  pocEmail: string | null;
  imageUrls: string[];
  facilities: string | null;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfraFormData {
  name: string;
  location: string;
  districtId: string;
  blockId?: string;
  pocName: string;
  pocPhone: string;
  pocEmail?: string;
  imageUrls?: string[];
  facilities: string;
  capacity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export interface OfficerProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'DO_PRD' | 'BO_PRD' | 'SUPER_ADMIN';
  district: string;
  block: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export type GalleryStatus = 'PENDING' | 'DO_APPROVED' | 'APPROVED' | 'REJECTED';

export interface GallerySubmission {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  districtId: string | null;
  district: { id: string; name: string } | null;
  blockName: string | null;
  description: string;
  mediaUrls: string[];
  status: GalleryStatus;
  reviewNotes: string | null;
  reviewedBy: number | null;
  createdAt: string;
}

// Map InfraType enum → URL segment
const INFRA_URL: Record<InfraType, string> = {
  HALL:               'multipurpose-halls',
  STADIUM:            'mini-stadiums',
  YOUTH_HOSTEL:       'youth-hostels',
  VOCATIONAL_CENTER:  'vocational-training-centers',
  INDOOR_GYM:         'indoor-gym',
  OPEN_GYM:           'open-gym',
  KHEL_MAIDAAN:       'khel-maidaan',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function officerFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`/api/officer/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data as T;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const officerApi = {
  me: (): Promise<{ success: boolean; officer: OfficerProfile }> =>
    officerFetch('me'),

  updateProfile: (body: {
    name?: string;
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; officer: OfficerProfile }> =>
    officerFetch('profile', { method: 'PATCH', body: JSON.stringify(body) }),

  // ─── Infrastructure ─────────────────────────────────────────────────────────

  listInfra: (
    type: InfraType,
    params: { districtId?: string; page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<InfrastructureItem>> => {
    const qs = new URLSearchParams();
    if (params.districtId) qs.set('districtId', params.districtId);
    if (params.page)       qs.set('page', String(params.page));
    if (params.limit)      qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return officerFetch(`infrastructure/${INFRA_URL[type]}${query}`);
  },

  createInfra: (
    type: InfraType,
    data: InfraFormData
  ): Promise<{ success: boolean; data: InfrastructureItem }> =>
    officerFetch(`infrastructure/${INFRA_URL[type]}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInfra: (
    type: InfraType,
    id: string,
    data: Partial<InfraFormData> & { isActive?: boolean }
  ): Promise<{ success: boolean; data: InfrastructureItem }> =>
    officerFetch(`infrastructure/${INFRA_URL[type]}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteInfra: (
    type: InfraType,
    id: string
  ): Promise<{ success: boolean }> =>
    officerFetch(`infrastructure/${INFRA_URL[type]}/${id}`, { method: 'DELETE' }),

  // ─── Mangal Dal ─────────────────────────────────────────────────────────────

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
    if (params.dalType)       qs.set('dalType', params.dalType);
    if (params.districtId)    qs.set('districtId', params.districtId);
    if (params.blockId)       qs.set('blockId', params.blockId);
    if (params.page)          qs.set('page', String(params.page));
    if (params.limit)         qs.set('limit', String(params.limit));
    if (params.sortBy)        qs.set('sortBy', params.sortBy);
    if (params.sortOrder)     qs.set('sortOrder', params.sortOrder);
    if (params.renewalStatus) qs.set('renewalStatus', params.renewalStatus);
    const query = qs.toString() ? `?${qs}` : '';
    return officerFetch(`mangal-dals${query}`);
  },

  createMangalDal: (data: {
    dalType: 'MAHILA' | 'YUVAK';
    name: string;
    serialNo: number;
    affiliationNo: string;
    chairperson: string;
    affiliationDate: string;
    renewalDate?: string;
    blockId: string;
  }): Promise<{ success: boolean; data: any }> =>
    officerFetch('mangal-dals', { method: 'POST', body: JSON.stringify(data) }),

  updateMangalDal: (
    id: string,
    data: Partial<{
      name: string;
      serialNo: number;
      affiliationNo: string;
      chairperson: string;
      affiliationDate: string;
      renewalDate: string;
      blockId: string;
    }>
  ): Promise<{ success: boolean; data: any }> =>
    officerFetch(`mangal-dals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMangalDal: (id: string): Promise<{ success: boolean }> =>
    officerFetch(`mangal-dals/${id}`, { method: 'DELETE' }),

  // ─── Gallery ────────────────────────────────────────────────────────────────

  listAllGallery: (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<GallerySubmission>> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page)   qs.set('page', String(params.page));
    if (params?.limit)  qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return officerFetch(`gallery${query}`);
  },

  listGalleryPending: (): Promise<PaginatedResponse<GallerySubmission>> =>
    officerFetch('gallery/pending'),

  approveGallery: (
    id: string,
    notes?: string
  ): Promise<{ success: boolean; data: GallerySubmission }> =>
    officerFetch(`gallery/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  rejectGallery: (
    id: string,
    notes?: string
  ): Promise<{ success: boolean; data: GallerySubmission }> =>
    officerFetch(`gallery/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  updateGallery: (
    id: string,
    data: { description?: string; mediaUrls?: string[] }
  ): Promise<{ success: boolean; data: GallerySubmission }> =>
    officerFetch(`gallery/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGallery: (id: string): Promise<{ success: boolean }> =>
    officerFetch(`gallery/${id}`, { method: 'DELETE' }),
};

// ─── Public gallery submission ────────────────────────────────────────────────
export const submitGallery = (data: {
  fullName: string;
  mobile: string;
  email?: string;
  districtId?: string;
  blockName?: string;
  description: string;
  mediaUrls: string[];
}): Promise<{ success: boolean; message: string }> =>
  fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (res) => {
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Failed to submit');
    return d;
  });
