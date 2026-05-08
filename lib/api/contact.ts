import { api } from '../api';

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  consentGiven?: string;
}

export const contactApi = {
  submit: (payload: ContactPayload) =>
    api.post<{ success: boolean; message: string }>('/contact', {
      ...payload,
      consentGiven: 'true',   // checkbox is required on the form before submit
    }),
};
