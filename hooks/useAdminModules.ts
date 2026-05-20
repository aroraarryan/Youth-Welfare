'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminModulesApi } from '@/lib/api/adminModulesApi';
import { InfraType, InfraFormData } from '@/lib/api/officerApi';

// ─── Query keys ───────────────────────────────────────────────────────────────

const adminModuleKeys = {
  infra:      (type: InfraType, districtId?: string, page?: number) =>
                ['admin', 'infra', type, districtId, page] as const,
  mangalDals: (dalType?: string, districtId?: string, blockId?: string, page?: number, sortBy?: string, renewalStatus?: string) =>
                ['admin', 'mangalDals', dalType, districtId, blockId, page, sortBy, renewalStatus] as const,
};

// ─── Infrastructure ───────────────────────────────────────────────────────────

export function useAdminInfra(type: InfraType, districtId?: string, page = 1) {
  return useQuery({
    queryKey: adminModuleKeys.infra(type, districtId, page),
    queryFn:  () => adminModulesApi.listInfra(type, { districtId, page, limit: 20 }),
  });
}

export function useAdminCreateInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InfraFormData) => adminModulesApi.createInfra(type, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'infra', type] }),
  });
}

export function useAdminUpdateInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InfraFormData> & { isActive?: boolean } }) =>
      adminModulesApi.updateInfra(type, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'infra', type] }),
  });
}

export function useAdminDeleteInfra(type: InfraType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminModulesApi.deleteInfra(type, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'infra', type] }),
  });
}

// ─── Mangal Dal ───────────────────────────────────────────────────────────────

export function useAdminMangalDals(
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
    queryKey: adminModuleKeys.mangalDals(dalType, districtId, blockId, page, sortBy, renewalStatus),
    queryFn:  () => adminModulesApi.listMangalDals({
      dalType, districtId, blockId: blockId || undefined,
      page, limit: 50, sortBy: sortField, sortOrder: sortOrder, renewalStatus: rs,
    }),
  });
}

export function useAdminCreateMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminModulesApi.createMangalDal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'mangalDals'] }),
  });
}

export function useAdminUpdateMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminModulesApi.updateMangalDal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'mangalDals'] }),
  });
}

export function useAdminDeleteMangalDal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminModulesApi.deleteMangalDal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'mangalDals'] }),
  });
}
