'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officerCmTrophyFixturesApi, CreateOfficerFixtureEventInput } from '@/lib/api/officerCmTrophyFixturesApi';
import type { CmTrophyFixtureEntrantType, CmTrophyFixtureStatus } from '@/lib/api/adminCmTrophyFixturesApi';

export function useFixtureEvents(filters: { status?: CmTrophyFixtureStatus } = {}) {
  return useQuery({
    queryKey: ['officer', 'cmTrophyFixtures', 'list', filters],
    queryFn: () => officerCmTrophyFixturesApi.list(filters),
  });
}

export function useFixtureEvent(id: string) {
  return useQuery({
    queryKey: ['officer', 'cmTrophyFixtures', 'detail', id],
    queryFn: () => officerCmTrophyFixturesApi.get(id),
    enabled: !!id,
  });
}

export function useFixtureStandings(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['officer', 'cmTrophyFixtures', 'standings', id],
    queryFn: () => officerCmTrophyFixturesApi.getStandings(id),
    enabled: !!id && enabled,
  });
}

export function useCreateFixtureEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfficerFixtureEventInput) => officerCmTrophyFixturesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['officer', 'cmTrophyFixtures', 'list'] }),
  });
}

function useEventMutation(eventId: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['officer', 'cmTrophyFixtures', 'detail', eventId] });
  return { qc, invalidate };
}

export function useEntrantPool(params: {
  entrantType: CmTrophyFixtureEntrantType;
  sportId?: string;
  ageCategory?: string;
  gender?: string;
  event?: string;
  vidhanSabhaId?: string;
} | null) {
  return useQuery({
    queryKey: ['officer', 'cmTrophyFixtures', 'entrantPool', params],
    queryFn: () => officerCmTrophyFixturesApi.getEntrantPool(params!),
    enabled: !!params,
  });
}

export function useSearchRegistrations(params: { registrationNo: string; sportId: string; ageCategory: string } | null) {
  return useQuery({
    queryKey: ['officer', 'cmTrophyFixtures', 'searchRegistrations', params],
    queryFn: () => officerCmTrophyFixturesApi.searchRegistrations(params!),
    enabled: !!params && params.registrationNo.trim().length > 0,
  });
}

export function useAddTeam(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (geoId: string) => officerCmTrophyFixturesApi.addTeam(eventId, geoId),
    onSuccess: invalidate,
  });
}

export function useAddAllTeams(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => officerCmTrophyFixturesApi.addAllTeams(eventId),
    onSuccess: invalidate,
  });
}

export function useRemoveTeam(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (teamId: string) => officerCmTrophyFixturesApi.removeTeam(eventId, teamId),
    onSuccess: invalidate,
  });
}

export function useCommitDraw(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => officerCmTrophyFixturesApi.commitDraw(eventId),
    onSuccess: invalidate,
  });
}

export function useRevealDraw(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: () => officerCmTrophyFixturesApi.revealDraw(eventId),
    onSuccess: invalidate,
  });
}

export function useCreateVenue(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: (data: { name: string; address?: string }) => officerCmTrophyFixturesApi.createVenue(eventId, data),
    onSuccess: invalidate,
  });
}

export function useCreateField(eventId: string) {
  const { invalidate } = useEventMutation(eventId);
  return useMutation({
    mutationFn: ({ venueId, name }: { venueId: string; name: string }) => officerCmTrophyFixturesApi.createField(venueId, { name }),
    onSuccess: invalidate,
  });
}

export function usePatchMatch(eventId: string) {
  const { invalidate, qc } = useEventMutation(eventId);
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: Parameters<typeof officerCmTrophyFixturesApi.patchMatch>[1] }) =>
      officerCmTrophyFixturesApi.patchMatch(matchId, data),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['officer', 'cmTrophyFixtures', 'standings', eventId] });
    },
  });
}
