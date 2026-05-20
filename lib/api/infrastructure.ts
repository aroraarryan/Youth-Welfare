import { api, PaginatedResponse } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
}

export interface CommonInfrastructure {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  district: { id: string; name: string };
  block?: { id: string; name: string } | null;
  imageUrls?: string[];
  pocName?: string | null;
  pocPhone?: string | null;
  pocEmail?: string | null;
  facilities?: string | null;
  capacity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type MiniStadium = CommonInfrastructure;
export type MultipurposeHall = CommonInfrastructure;
export type YouthHostel = CommonInfrastructure;
export type VocationalCenter = CommonInfrastructure;
export type IndoorGym = CommonInfrastructure;
export type OpenGym = CommonInfrastructure;
export type KhelMaidaan = CommonInfrastructure;

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

  // New infrastructure placeholders
  getYouthHostels: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<YouthHostel>>('/youth-hostels', params),

  getVocationalCenters: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<VocationalCenter>>('/vocational-training-centers', params),

  getIndoorGyms: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<IndoorGym>>('/indoor-gyms', params),

  getOpenGyms: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<OpenGym>>('/open-gyms', params),

  getKhelMaidaans: (params?: { districtId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<KhelMaidaan>>('/khel-maidaans', params),

  getMangalDals: (params?: {
    dalType?: 'MAHILA' | 'YUVAK';
    districtId?: string;
    blockId?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<MangalDal>>('/mangal-dals', params),
};

// ─── Infrastructure stats (server-side safe, no auth required) ────────────────

export interface InfraStats {
  mahilaMangalDal:   number;
  yuvakMangalDal:    number;
  multipurposeHalls: number;
  miniStadiums:      number;
  youthHostels:      number;
  vocationalCenters: number;
  indoorGyms:        number;
  openGyms:          number;
  khelMaidaans:      number;
  otherInfra:        number;
}

export async function getInfraStats(): Promise<InfraStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/stats`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as InfraStats) ?? null;
  } catch {
    return null;
  }
}
