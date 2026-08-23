import { api } from '../api';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface CmTrophyEventOption {
  name: string;
  gender: 'MALE' | 'FEMALE' | null;
  isFreeBonus: boolean;
}

export interface CmTrophySportOption {
  sportId: string;
  name: string;
  registrationLevel: 'NYAY_PANCHAYAT' | 'VIDHAN_SABHA' | 'SANSAD' | 'STATE';
  maxEventsSelectable: number;
  events: CmTrophyEventOption[];
}

export const sportsApi = {
  list: () =>
    api.get<{ success: boolean; data: Sport[] }>('/sports'),

  listByCmTrophyCategory: (ageCategory: string) =>
    api.get<{ success: boolean; data: CmTrophySportOption[] }>(
      '/cm-trophy/registration/sports',
      { ageCategory },
    ),
};
