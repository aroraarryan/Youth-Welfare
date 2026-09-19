'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  officerCmTrophyApi,
  CmTrophyListParams,
  CmTrophyAttendanceListParams,
  CreateOfficerMedalInput,
  OfficerLeaderboardLevel,
  OfficerMedalListParams,
} from '@/lib/api/officerCmTrophyApi';

export function useOfficerCmTrophyList(filters: CmTrophyListParams) {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'list', filters],
    queryFn: () => officerCmTrophyApi.listRegistrations(filters),
  });
}

export function useOfficerCmTrophyStats() {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'stats'],
    queryFn: () => officerCmTrophyApi.stats(),
  });
}

export function useOfficerCmTrophyWeeklyTrend() {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'weeklyTrend'],
    queryFn: () => officerCmTrophyApi.weeklyTrend(),
  });
}

export function useOfficerCmTrophyDetail(id: string) {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'detail', id],
    queryFn: () => officerCmTrophyApi.getRegistration(id),
    enabled: !!id,
  });
}

export function useOfficerUpdateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      officerCmTrophyApi.updateRegistration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'list'] });
    },
  });
}

export function useOfficerMedalLeaderboard(level: OfficerLeaderboardLevel = 'nyay-panchayat') {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'medalLeaderboard', level],
    queryFn: () => officerCmTrophyApi.getLeaderboard(level),
  });
}

export function useOfficerMedals(params: OfficerMedalListParams) {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'medals', params],
    queryFn: () => officerCmTrophyApi.listMedals(params),
  });
}

export function useOfficerCreateMedal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfficerMedalInput) => officerCmTrophyApi.createMedal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'medals'] });
      queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'medalLeaderboard'] });
    },
  });
}

export function useOfficerAttendanceList(filters: CmTrophyAttendanceListParams) {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'attendance', 'list', filters],
    queryFn: () => officerCmTrophyApi.listAttendance(filters),
  });
}

export function useOfficerMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, isPresent }: { registrationId: string; isPresent: boolean }) =>
      officerCmTrophyApi.markAttendance(registrationId, isPresent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'attendance', 'list'] }),
  });
}

export function useOfficerBulkMarkPresent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationIds: string[]) => officerCmTrophyApi.bulkMarkPresent(registrationIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'attendance', 'list'] }),
  });
}

export function useOfficerGrievances(params: { isResolved?: boolean; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['officer', 'cmTrophy', 'grievances', params],
    queryFn: () => officerCmTrophyApi.listGrievances(params),
  });
}

export function useOfficerResolveGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerCmTrophyApi.resolveGrievance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'grievances'] }),
  });
}

export function useOfficerDeleteGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officerCmTrophyApi.deleteGrievance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['officer', 'cmTrophy', 'grievances'] }),
  });
}
