import { api } from '../api';

export interface GrievancePayload {
  name: string;
  email: string;
  mobile: string;
  atomId?: string;
  problem: string;
}

export const cmTrophyGrievanceApi = {
  submit: (payload: GrievancePayload) =>
    api.post<{ success: boolean; message: string }>('/cm-trophy/grievance', payload),
};
