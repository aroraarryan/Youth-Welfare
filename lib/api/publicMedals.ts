import { api } from '../api';
import { Gender, CmTrophyAgeCategory } from './registrations';
import { CmTrophyMedalLevel, CmTrophyMedal } from './adminCmTrophyApi';
import { TeamMedalFields, MedalSummary } from '../cmTrophyTeamMedal';

export interface PublicMedalRecord extends TeamMedalFields {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  medal: CmTrophyMedal;
  level: CmTrophyMedalLevel;
  gender: Gender | null;
  event: string | null;
  ageCategory: CmTrophyAgeCategory | null;
  entityName: string | null;
  createdAt: string;
}

export interface PublicMedalListParams {
  sportId?: string;
  level?: CmTrophyMedalLevel;
  medal?: CmTrophyMedal;
  districtId?: string;
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  event?: string;
  ageCategory?: CmTrophyAgeCategory;
  gender?: Gender;
  search?: string;
  page?: number;
  limit?: number;
}

export const publicMedalsApi = {
  list: (params: PublicMedalListParams = {}) =>
    api.get<{ success: boolean; total: number; page: number; limit: number; data: PublicMedalRecord[]; summary: MedalSummary }>(
      '/cm-trophy/medals',
      params as Record<string, string | number | boolean | undefined | null>,
    ),
};
