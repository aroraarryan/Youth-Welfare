import { api } from '../api';

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export const contactApi = {
  submit: (payload: ContactPayload) =>
    api.post<{ success: boolean; message: string }>('/contact', payload),
};
