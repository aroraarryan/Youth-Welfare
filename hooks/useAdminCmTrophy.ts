'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCmTrophyApi,
  CmTrophyListParams,
  CmTrophyMedalLevel,
  CreateMedalInput,
  MedalBulkRow,
  MedalListParams,
} from '@/lib/api/adminCmTrophyApi';

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

export function useAdminMedalLeaderboard(level: CmTrophyMedalLevel) {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'medalLeaderboard', level],
    queryFn: () => adminCmTrophyApi.getMedalLeaderboard(level),
  });
}

export function useMedals(filters: MedalListParams) {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'medals', filters],
    queryFn: () => adminCmTrophyApi.listMedals(filters),
  });
}

function invalidateMedalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'medalLeaderboard'] });
  queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'medals'] });
  queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'leaderboard'] });
}

export function useCreateMedal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedalInput) => adminCmTrophyApi.createMedal(data),
    onSuccess: () => invalidateMedalQueries(queryClient),
  });
}

export function useBulkCreateMedals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: MedalBulkRow[]) => adminCmTrophyApi.bulkCreateMedals(rows),
    onSuccess: () => invalidateMedalQueries(queryClient),
  });
}

export function useDeleteMedal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCmTrophyApi.deleteMedal(id),
    onSuccess: () => invalidateMedalQueries(queryClient),
  });
}
