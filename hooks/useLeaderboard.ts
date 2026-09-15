'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/lib/api/leaderboard';
import { publicMedalsApi, PublicMedalListParams } from '@/lib/api/publicMedals';
import { CmTrophyMedalLevel } from '@/lib/api/adminCmTrophyApi';

export function useCmTrophyLeaderboard(level: CmTrophyMedalLevel = 'DISTRICT') {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public', 'cmTrophy', 'leaderboard', level],
    queryFn: () => leaderboardApi.getByLevel(level),
  });

  return {
    entries: data?.data ?? [],
    loading: isLoading,
    error: isError ? (error as Error).message ?? 'Failed to load leaderboard' : null,
  };
}

export function useEntitySportBreakdown(level: CmTrophyMedalLevel, entityId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'cmTrophy', 'sportBreakdown', level, entityId],
    queryFn: () => leaderboardApi.getSportBreakdown(level, entityId as string),
    enabled: !!entityId,
  });

  return { rows: data?.data ?? [], loading: isLoading };
}

export function usePublicMedals(filters: PublicMedalListParams) {
  return useQuery({
    queryKey: ['public', 'cmTrophy', 'medals', filters],
    queryFn: () => publicMedalsApi.list(filters),
  });
}
