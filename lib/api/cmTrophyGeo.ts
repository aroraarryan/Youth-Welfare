import { api } from '../api';

export interface Sansad {
  id: string;
  name: string;
}

export interface VidhanSabha {
  id: string;
  name: string;
  sansadId: string;
}

export interface NyayPanchayat {
  id: string;
  name: string;
  vidhanSabhaId: string;
  blockId: string | null;
}

export const cmTrophyGeoApi = {
  // districtId (district officers) narrows to Sansads with a seat in that district.
  getSansads: (districtId?: string) =>
    api.get<{ success: boolean; data: Sansad[] }>('/sansads', { limit: 100, ...(districtId && { districtId }) }),

  // districtId (district officers) narrows to that district's seats.
  getVidhanSabhas: (sansadId: string, districtId?: string) =>
    api.get<{ success: boolean; data: VidhanSabha[] }>('/vidhan-sabhas', { sansadId, limit: 100, ...(districtId && { districtId }) }),

  // blockId scopes to a BO officer's own block; NyayPanchayats not yet
  // reconciled to a block are always included regardless (fail-open, enforced
  // server-side in nyayPanchayatService.findAll).
  getNyayPanchayats: (vidhanSabhaId: string, blockId?: string) =>
    api.get<{ success: boolean; data: NyayPanchayat[] }>('/nyay-panchayats', { vidhanSabhaId, ...(blockId && { blockId }) }),
};
