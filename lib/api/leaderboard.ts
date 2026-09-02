import { api } from '../api';

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

export const leaderboardApi = {
  getAll: () =>
    api.get<{ success: boolean; data: DistrictMedalTally[] }>('/cm-trophy/leaderboard'),
};
