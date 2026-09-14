/**
 * Admin API layer for the "Send Email" feature — reusable templates +
 * bulk send against an uploaded Excel file's rows.
 * All calls go through /api/admin/... (cookie-based admin auth).
 */

import { PaginatedResponse } from '../api';

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateInput {
  name: string;
  subject: string;
  body: string;
}

export interface EmailSendResult {
  row: number;
  email: string | null;
  status: 'SENT' | 'FAILED';
  error?: string;
}

export interface EmailSendResponse {
  success: boolean;
  sent: number;
  failed: number;
  results: EmailSendResult[];
}

export interface EmailPreviewResponse {
  success: boolean;
  data: { subject: string; html: string };
}

export const adminEmailApi = {
  listTemplates: (): Promise<PaginatedResponse<EmailTemplate>> =>
    adminFetch('email-templates?limit=100'),

  getTemplate: (id: string): Promise<{ success: boolean; data: EmailTemplate }> =>
    adminFetch(`email-templates/${id}`),

  createTemplate: (data: EmailTemplateInput): Promise<{ success: boolean; data: EmailTemplate }> =>
    adminFetch('email-templates', { method: 'POST', body: JSON.stringify(data) }),

  updateTemplate: (
    id: string,
    data: Partial<EmailTemplateInput>
  ): Promise<{ success: boolean; data: EmailTemplate }> =>
    adminFetch(`email-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteTemplate: (id: string): Promise<{ success: boolean }> =>
    adminFetch(`email-templates/${id}`, { method: 'DELETE' }),

  previewEmail: (
    templateId: string,
    sampleRow: Record<string, unknown>
  ): Promise<EmailPreviewResponse> =>
    adminFetch('email/preview', {
      method: 'POST',
      body: JSON.stringify({ templateId, sampleRow }),
    }),

  sendBulkEmail: (
    templateId: string,
    rows: Record<string, unknown>[]
  ): Promise<EmailSendResponse> =>
    adminFetch('email/send-bulk', {
      method: 'POST',
      body: JSON.stringify({ templateId, rows }),
    }),
};
