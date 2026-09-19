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

  // blockId scopes to a BO officer's own block (and, alone, lists that block's
  // Nyay Panchayats directly with no Vidhan Sabha needed); NyayPanchayats not
  // yet reconciled to a block are always included regardless (fail-open,
  // enforced server-side in nyayPanchayatService.findAll). vidhanSabhaIds is
  // a BO's full linked-Vidhan-Sabha set (a block can serve 2+ — see
  // block_vidhan_sabhas); ignored once a single vidhanSabhaId is set. The
  // endpoint returns the full unpaginated list — a statewide/fail-open query
  // can span hundreds of rows and any page-size cap would cut it off
  // alphabetically.
  getNyayPanchayats: (vidhanSabhaId?: string, blockId?: string, vidhanSabhaIds?: string[]) =>
    api.get<{ success: boolean; data: NyayPanchayat[] }>('/nyay-panchayats', {
      ...(vidhanSabhaId && { vidhanSabhaId }),
      ...(blockId && { blockId }),
      ...(!vidhanSabhaId && vidhanSabhaIds?.length && { vidhanSabhaIds: vidhanSabhaIds.join(',') }),
    }),
};
