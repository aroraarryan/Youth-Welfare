'use client';

import { useQuery } from '@tanstack/react-query';
import { adminCmTrophyApi, CmTrophyListParams } from '@/lib/api/adminCmTrophyApi';

export function useAdminCmTrophyList(filters: CmTrophyListParams) {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'list', filters],
    queryFn: () => adminCmTrophyApi.list(filters),
  });
}

export function useAdminCmTrophyDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'detail', id],
    queryFn: () => adminCmTrophyApi.getById(id),
    enabled: !!id,
  });
}

export function useAdminCmTrophyStats() {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'stats'],
    queryFn: () => adminCmTrophyApi.stats(),
  });
}

export function useAdminCmTrophyWeeklyTrend() {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'weeklyTrend'],
    queryFn: () => adminCmTrophyApi.weeklyTrend(),
  });
}
