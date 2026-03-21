import { api, PaginatedResponse } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
}

export interface MiniStadium {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  district: { id: string; name: string };
}

export interface MultipurposeHall {
  id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  isActive: boolean;
  district: { id: string; name: string };
}

export interface MangalDal {
  id: string;
  dalType: 'MAHILA' | 'YUVAK';
  serialNo: number;
  name: string;
  affiliationNo: string;
  chairperson: string;
  affiliationDate: string;
  renewalDate: string | null;
  block: { id: string; name: string; district: { id: string; name: string } };
}

// ─── API functions ────────────────────────────────────────────────────────────

export const infrastructureApi = {
  getDistricts: () =>
    api.get<{ success: boolean; data: District[] }>('/districts'),

  getMiniStadiums: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<MiniStadium>>('/mini-stadiums', params),

  getMultipurposeHalls: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<MultipurposeHall>>('/multipurpose-halls', params),

  getMangalDals: (params?: {
    dalType?: 'MAHILA' | 'YUVAK';
    districtId?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<MangalDal>>('/mangal-dals', params),
};
