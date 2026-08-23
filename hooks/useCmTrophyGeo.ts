'use client';

import { useState, useEffect } from 'react';
import { cmTrophyGeoApi, Sansad, VidhanSabha, NyayPanchayat } from '@/lib/api/cmTrophyGeo';

export function useSansads() {
  const [sansads, setSansads] = useState<Sansad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cmTrophyGeoApi.getSansads()
      .then((res) => setSansads(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load Sansads'))
      .finally(() => setLoading(false));
  }, []);

  return { sansads, loading, error };
}

export function useVidhanSabhas(sansadId?: string) {
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
    cmTrophyGeoApi.getVidhanSabhas(sansadId)
      .then((res) => setVidhanSabhas(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load Vidhan Sabhas'))
      .finally(() => setLoading(false));
  }, [sansadId]);

  return { vidhanSabhas, loading, error };
}

export function useNyayPanchayats(vidhanSabhaId?: string) {
  const [nyayPanchayats, setNyayPanchayats] = useState<NyayPanchayat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vidhanSabhaId) {
      setNyayPanchayats([]);
      return;
    }
    setLoading(true);
    setError(null);
    cmTrophyGeoApi.getNyayPanchayats(vidhanSabhaId)
      .then((res) => setNyayPanchayats(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load Nyay Panchayats'))
      .finally(() => setLoading(false));
  }, [vidhanSabhaId]);

  return { nyayPanchayats, loading, error };
}
