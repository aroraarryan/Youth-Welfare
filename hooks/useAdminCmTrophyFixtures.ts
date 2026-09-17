'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCmTrophyFixturesApi,
  CmTrophyFixtureEntrantType,
  CmTrophyFixtureLevel,
  CmTrophyFixtureStatus,
  CreateFixtureEventInput,
} from '@/lib/api/adminCmTrophyFixturesApi';

export function useFixtureEvents(filters: { level?: CmTrophyFixtureLevel; status?: CmTrophyFixtureStatus } = {}) {
  return useQuery({
    queryKey: ['admin', 'cmTrophyFixtures', 'list', filters],
    queryFn: () => adminCmTrophyFixturesApi.list(filters),
  });
}

export function useFixtureEvent(id: string) {
  return useQuery({
    queryKey: ['admin', 'cmTrophyFixtures', 'detail', id],
    queryFn: () => adminCmTrophyFixturesApi.get(id),
    enabled: !!id,
  });
}

export function useFixtureStandings(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'cmTrophyFixtures', 'standings', id],
    queryFn: () => adminCmTrophyFixturesApi.getStandings(id),
    enabled: !!id && enabled,
  });
}

export function useCreateFixtureEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFixtureEventInput) => adminCmTrophyFixturesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'cmTrophyFixtures', 'list'] }),
  });
}

function useEventMutation(eventId: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'cmTrophyFixtures', 'detail', eventId] });
  return { qc, invalidate };
}

export function useEntrantPool(params: {
  level: CmTrophyFixtureLevel;
  entrantType: CmTrophyFixtureEntrantType;
  sportId?: string;
  ageCategory?: string;
  gender?: string;
  event?: string;
  vidhanSabhaId?: string;
  sansadId?: string;
} | null) {
  return useQuery({
    queryKey: ['admin', 'cmTrophyFixtures', 'entrantPool', params],
    queryFn: () => adminCmTrophyFixturesApi.getEntrantPool(params!),
    enabled: !!params,
  });
}

export function useSearchRegistrations(params: { registrationNo: string; sportId: string; ageCategory: string } | null) {
  return useQuery({
    queryKey: ['admin', 'cmTrophyFixtures', 'searchRegistrations', params],
    queryFn: () => adminCmTrophyFixturesApi.searchRegistrations(params!),
    enabled: !!params && params.registrationNo.trim().length > 0,
  });
}

export function useAddTeam(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (geoId: string) => adminCmTrophyFixturesApi.addTeam(eventId, geoId),
    onSuccess: invalidate,
  });
}

export function useAddAllTeams(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => adminCmTrophyFixturesApi.addAllTeams(eventId),
    onSuccess: invalidate,
  });
}

export function useRemoveTeam(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (teamId: string) => adminCmTrophyFixturesApi.removeTeam(eventId, teamId),
    onSuccess: invalidate,
  });
}

export function useCommitDraw(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => adminCmTrophyFixturesApi.commitDraw(eventId),
    onSuccess: invalidate,
  });
}

export function useRevealDraw(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => adminCmTrophyFixturesApi.revealDraw(eventId),
    onSuccess: invalidate,
  });
}

export function useCreateVenue(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (data: { name: string; address?: string }) => adminCmTrophyFixturesApi.createVenue(eventId, data),
    onSuccess: invalidate,
  });
}

export function useCreateField(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: ({ venueId, name }: { venueId: string; name: string }) => adminCmTrophyFixturesApi.createField(venueId, { name }),
    onSuccess: invalidate,
  });
}

export function usePatchMatch(eventId: string) {
  const { invalidate, qc } = useEventMutation(eventId);
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: Parameters<typeof adminCmTrophyFixturesApi.patchMatch>[1] }) =>
      adminCmTrophyFixturesApi.patchMatch(matchId, data),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['admin', 'cmTrophyFixtures', 'standings', eventId] });
    },
  });
}
