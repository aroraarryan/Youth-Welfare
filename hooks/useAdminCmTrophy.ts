'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCmTrophyApi,
  CmTrophyAttendanceListParams,
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

export function useUpdateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminCmTrophyApi.updateRegistration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'list'] });
    },
  });
}

export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string | null }) =>
      adminCmTrophyApi.updateRegistrationStatus(id, status, rejectionReason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'list'] });
    },
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

export function useUpdateMedal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMedalInput }) => adminCmTrophyApi.updateMedal(id, data),
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

export function useAttendanceList(filters: CmTrophyAttendanceListParams) {
  return useQuery({
    queryKey: ['admin', 'cmTrophy', 'attendance', 'list', filters],
    queryFn: () => adminCmTrophyApi.listAttendance(filters),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, isPresent }: { registrationId: string; isPresent: boolean }) =>
      adminCmTrophyApi.markAttendance(registrationId, isPresent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'attendance', 'list'] }),
  });
}

export function useBulkMarkPresent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationIds: string[]) => adminCmTrophyApi.bulkMarkPresent(registrationIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cmTrophy', 'attendance', 'list'] }),
  });
}
