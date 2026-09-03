'use client';

import { useState, useEffect } from 'react';
import { leaderboardApi, DistrictMedalTally } from '@/lib/api/leaderboard';

export function useCmTrophyLeaderboard() {
  const [entries, setEntries] = useState<DistrictMedalTally[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaderboardApi.getAll()
      .then((res) => setEntries(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return { entries, loading, error };
}
