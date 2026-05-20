'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officerApi, OfficerProfile, InfraType } from '@/lib/api/officerApi';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const officerKeys = {
  me:          ['officer', 'me'] as const,
  infra:       (type: InfraType, districtId?: string) =>
                 ['officer', 'infra', type, districtId] as const,
  mangalDals:  (dalType?: string, districtId?: string, blockId?: string, page?: number, sortBy?: string, renewalStatus?: string) =>
                 ['officer', 'mangalDals', dalType, districtId, blockId, page, sortBy, renewalStatus] as const,
  gallery:     ['officer', 'gallery', 'pending'] as const,
  galleryAll:  (status?: string) => ['officer', 'gallery', 'all', status] as const,
};

// ─── Current officer (me) ─────────────────────────────────────────────────────

export function useCurrentOfficer() {
  return useQuery({
    queryKey: officerKeys.me,
    queryFn: () => officerApi.me().then((r) => r.officer),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ─── Infrastructure ───────────────────────────────────────────────────────────

export function useOfficerInfra(
  type: InfraType,
  districtId?: string,
  page = 1
) {
  return useQuery({
    queryKey: [...officerKeys.infra(type, districtId), page],
    queryFn: () => officerApi.listInfra(type, { districtId, page, limit: 20 }),
  });
}

export function useCreateInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof officerApi.createInfra>[1]) =>
      officerApi.createInfra(type, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'infra', type] });
    },
  });
}

export function useUpdateInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof officerApi.updateInfra>[2] }) =>
      officerApi.updateInfra(type, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'infra', type] });
    },
  });
}

export function useDeleteInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerApi.deleteInfra(type, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'infra', type] });
    },
  });
}

// ─── Mangal Dal ───────────────────────────────────────────────────────────────

export function useOfficerMangalDals(
  dalType?: 'MAHILA' | 'YUVAK',
  districtId?: string,
  blockId?: string,
  page = 1,
  sortBy = 'name_asc',
  renewalStatus = 'all'
) {
  const [sortField, sortOrder] = sortBy === 'name_desc'  ? ['name', 'desc']
                               : sortBy === 'date_desc'  ? ['affiliationDate', 'desc']
                               : sortBy === 'date_asc'   ? ['affiliationDate', 'asc']
                               : ['name', 'asc'];
  const rs = renewalStatus === 'all' ? undefined : renewalStatus;
  return useQuery({
    queryKey: officerKeys.mangalDals(dalType, districtId, blockId, page, sortBy, renewalStatus),
    queryFn: () => officerApi.listMangalDals({
      dalType, districtId, blockId: blockId || undefined,
      page, limit: 50, sortBy: sortField, sortOrder: sortOrder, renewalStatus: rs,
    }),
  });
}

export function useCreateMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: officerApi.createMangalDal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'mangalDals'] });
    },
  });
}

export function useUpdateMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof officerApi.updateMangalDal>[1] }) =>
      officerApi.updateMangalDal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'mangalDals'] });
    },
  });
}

export function useDeleteMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: officerApi.deleteMangalDal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'mangalDals'] });
    },
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: officerApi.updateProfile,
    onSuccess: (data) => {
      qc.setQueryData(officerKeys.me, data.officer);
    },
  });
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function useGalleryPending() {
  return useQuery({
    queryKey: officerKeys.gallery,
    queryFn: () => officerApi.listGalleryPending(),
  });
}

export function useAllGallery(status?: string) {
  return useQuery({
    queryKey: officerKeys.galleryAll(status),
    queryFn: () => officerApi.listAllGallery({ status, limit: 50 }),
  });
}

export function useApproveGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      officerApi.approveGallery(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'gallery'] });
    },
  });
}

export function useRejectGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      officerApi.rejectGallery(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'gallery'] });
    },
  });
}

export function useUpdateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { description?: string; mediaUrls?: string[] } }) =>
      officerApi.updateGallery(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'gallery'] });
    },
  });
}

export function useDeleteGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerApi.deleteGallery(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['officer', 'gallery'] });
    },
  });
}
