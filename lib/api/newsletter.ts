import { api } from '../api';

export const newsletterApi = {
  subscribe: (email: string) =>
    api.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email }),

  unsubscribe: (email: string) =>
    api.post<{ success: boolean; message: string }>('/newsletter/unsubscribe', { email }),
};
