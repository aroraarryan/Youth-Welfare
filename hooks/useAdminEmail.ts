'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminEmailApi, EmailTemplateInput } from '@/lib/api/adminEmailApi';

const TEMPLATES_KEY = ['admin', 'email', 'templates'];

export function useEmailTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => adminEmailApi.listTemplates(),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailTemplateInput) => adminEmailApi.createTemplate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplateInput> }) =>
      adminEmailApi.updateTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminEmailApi.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY }),
  });
}

export function usePreviewEmail() {
  return useMutation({
    mutationFn: ({ templateId, sampleRow }: { templateId: string; sampleRow: Record<string, unknown> }) =>
      adminEmailApi.previewEmail(templateId, sampleRow),
  });
}

export function useSendBulkEmail() {
  return useMutation({
    mutationFn: ({ templateId, rows }: { templateId: string; rows: Record<string, unknown>[] }) =>
      adminEmailApi.sendBulkEmail(templateId, rows),
  });
}
