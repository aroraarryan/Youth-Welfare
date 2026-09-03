'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCmTrophyApi, CmTrophyListParams, MedalTallyEntry } from '@/lib/api/adminCmTrophyApi';

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

export function useAdminCmTrophyLeaderboard() {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'leaderboard'],
    queryFn: () => adminCmTrophyApi.getLeaderboard(),
  });
}

export function useUpdateCmTrophyLeaderboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: MedalTallyEntry[]) => adminCmTrophyApi.updateLeaderboard(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'leaderboard'] });
    },
  });
}
