import { api } from '../api';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export const sportsApi = {
  list: () =>
    api.get<{ success: boolean; data: Sport[] }>('/sports'),
};
