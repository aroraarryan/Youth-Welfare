'use client';

import { useState, useEffect } from 'react';
import { cmTrophyGeoApi, Sansad, VidhanSabha, NyayPanchayat } from '@/lib/api/cmTrophyGeo';

export function useSansads(districtId?: string) {
  const [sansads, setSansads] = useState<Sansad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    cmTrophyGeoApi.getSansads(districtId)
      .then((res) => { if (!cancelled) setSansads(res.data); })
      .catch((err) => { if (!cancelled) setError(err.message ?? 'Failed to load Sansads'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [districtId]);

  return { sansads, loading, error };
}

export function useVidhanSabhas(sansadId?: string, districtId?: string) {
  const [vidhanSabhas, setVidhanSabhas] = useState<VidhanSabha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sansadId) {
      setVidhanSabhas([]);
      return;
    }
    setLoading(true);
    setError(null);
    cmTrophyGeoApi.getVidhanSabhas(sansadId, districtId)
      .then((res) => setVidhanSabhas(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load Vidhan Sabhas'))
      .finally(() => setLoading(false));
  }, [sansadId, districtId]);

  return { vidhanSabhas, loading, error };
}

// vidhanSabhaIds: a BO officer's block can serve 2+ Vidhan Sabha (see
// block_vidhan_sabhas) — pass every linked id to get their whole Nyay
// Panchayat pool. Ignored once vidhanSabhaId (a single explicit pick) is set.
export function useNyayPanchayats(vidhanSabhaId?: string, blockId?: string, vidhanSabhaIds?: string[]) {
  const [nyayPanchayats, setNyayPanchayats] = useState<NyayPanchayat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vsIdsKey = vidhanSabhaIds?.join(',') ?? '';

  useEffect(() => {
    if (!vidhanSabhaId && !blockId && !vsIdsKey) {
      setNyayPanchayats([]);
      return;
    }
    setLoading(true);
    setError(null);
    cmTrophyGeoApi.getNyayPanchayats(vidhanSabhaId, blockId, vsIdsKey ? vsIdsKey.split(',') : undefined)
      .then((res) => setNyayPanchayats(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load Nyay Panchayats'))
      .finally(() => setLoading(false));
  }, [vidhanSabhaId, blockId, vsIdsKey]);

  return { nyayPanchayats, loading, error };
}
