import { api } from '../api';
import { CmTrophyMedalLevel, MEDAL_LEVEL_URL, MedalLeaderboardRow } from './adminCmTrophyApi';

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

export interface SportMedalBreakdown {
  sportId: string;
  sportName: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export const leaderboardApi = {
  getAll: () =>
    api.get<{ success: boolean; data: DistrictMedalTally[] }>('/cm-trophy/leaderboard'),

  getByLevel: (level: CmTrophyMedalLevel) =>
    api.get<{ success: boolean; data: MedalLeaderboardRow[] }>(`/cm-trophy/leaderboard/${MEDAL_LEVEL_URL[level]}`),

  getSportBreakdown: (level: CmTrophyMedalLevel, entityId: string) =>
    api.get<{ success: boolean; data: SportMedalBreakdown[] }>(
      `/cm-trophy/leaderboard/${MEDAL_LEVEL_URL[level]}/${entityId}/sports`,
    ),
};
