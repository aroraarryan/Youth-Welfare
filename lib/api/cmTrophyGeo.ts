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
}

export const cmTrophyGeoApi = {
  getSansads: () =>
    api.get<{ success: boolean; data: Sansad[] }>('/sansads'),

  getVidhanSabhas: (sansadId: string) =>
    api.get<{ success: boolean; data: VidhanSabha[] }>('/vidhan-sabhas', { sansadId }),

  getNyayPanchayats: (vidhanSabhaId: string) =>
    api.get<{ success: boolean; data: NyayPanchayat[] }>('/nyay-panchayats', { vidhanSabhaId }),
};
