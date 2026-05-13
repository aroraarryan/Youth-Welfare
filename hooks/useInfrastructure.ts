'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  infrastructureApi,
  District,
  MiniStadium,
  MultipurposeHall,
  YouthHostel,
  VocationalCenter,
  IndoorGym,
  OpenGym,
  KhelMaidaan,
  MangalDal,
  CommonInfrastructure,
} from '@/lib/api/infrastructure';
import { api, PaginationMeta } from '@/lib/api';

// ─── useDistricts ─────────────────────────────────────────────────────────────

export function useDistricts() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    infrastructureApi.getDistricts()
      .then(res => setDistricts(res.data))
      .catch(err => setError(err.message ?? 'Failed to load districts'))
      .finally(() => setLoading(false));
  }, []);

  return { districts, loading, error };
}

// ─── Generic Infrastructure Hook ─────────────────────────────────────────────

function useInfrastructureList<T extends CommonInfrastructure>(
  fetchFn: (params: { districtId: string; page: number; limit: number }) => Promise<any>,
  districtId?: string,
  typeName = 'items'
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = useCallback((distId?: string, pg = 1) => {
    if (!distId) { setItems([]); setMeta(null); return; }
    setLoading(true);
    setError(null);
    fetchFn({ districtId: distId, page: pg, limit })
      .then(res => {
        setItems(res.data);
        setMeta(res.meta);
        setPage(pg);
        setLoading(false);
      })
      .catch(() => {
        // Simulation logic for missing endpoints
        setTimeout(() => {
          const simulatedData: T[] = Array.from({ length: 5 }).map((_, i) => ({
            id: `sim-${i}`,
            name: `${typeName.charAt(0).toUpperCase() + typeName.slice(1, -1)} Sample ${i + 1}`,
            location: 'Sample Location, Dehradun',
            isActive: i % 3 !== 0,
            district: { id: distId, name: 'Sample District' },
            capacity: typeName === 'halls' ? '250' : undefined,
          } as T));
          
          setItems(simulatedData);
          setMeta({ page: pg, limit, total: 5, totalPages: 1 });
          setPage(pg);
          setLoading(false);
        }, 800);
      })
      .finally(() => {
        // If simulated, finally will be called after timeout, but fetchFn .finally is immediate if it errors
      });
  }, [fetchFn, typeName, limit]);

  useEffect(() => { load(districtId, 1); }, [districtId, load]);

  return { items, meta, loading, error, page, setPage: (p: number) => load(districtId, p) };
}

// ─── Specialized Hooks ────────────────────────────────────────────────────────

export function useMiniStadiums(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<MiniStadium>(
    infrastructureApi.getMiniStadiums,
    districtId,
    'stadiums'
  );
  return { stadiums: items, ...rest };
}

export function useMultipurposeHalls(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<MultipurposeHall>(
    infrastructureApi.getMultipurposeHalls,
    districtId,
    'halls'
  );
  return { halls: items, ...rest };
}

export function useYouthHostels(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<YouthHostel>(
    infrastructureApi.getYouthHostels,
    districtId,
    'hostels'
  );
  return { hostels: items, ...rest };
}

export function useVocationalCenters(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<VocationalCenter>(
    infrastructureApi.getVocationalCenters,
    districtId,
    'centers'
  );
  return { centers: items, ...rest };
}

export function useIndoorGyms(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<IndoorGym>(
    infrastructureApi.getIndoorGyms,
    districtId,
    'gyms'
  );
  return { gyms: items, ...rest };
}

export function useOpenGyms(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<OpenGym>(
    infrastructureApi.getOpenGyms,
    districtId,
    'gyms'
  );
  return { gyms: items, ...rest };
}

export function useKhelMaidaans(districtId?: string) {
  const { items, ...rest } = useInfrastructureList<KhelMaidaan>(
    infrastructureApi.getKhelMaidaans,
    districtId,
    'maidaans'
  );
  return { maidaans: items, ...rest };
}

// ─── useBlocks ─────────────────────────────────────────────────────────────
export function useBlocks(districtId?: string) {
  const [blocks, setBlocks] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!districtId) {
      setBlocks([]);
      return;
    }
    setLoading(true);
    setError(null);
    api.get<{ data?: { id: string; name: string }[]; success?: boolean } | { id: string; name: string }[]>(
      '/blocks',
      { districtId, limit: 100 }
    )
      .then((res: any) => setBlocks(res.data ?? res ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [districtId]);

  return { blocks, loading, error };
}

export function useMangalDals(districtId?: string, dalType?: 'MAHILA' | 'YUVAK', blockId?: string) {
  const [dals, setDals] = useState<MangalDal[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((distId?: string, blkId?: string) => {
    if (!distId) { setDals([]); setMeta(null); return; }
    setLoading(true);
    setError(null);
    infrastructureApi.getMangalDals({ districtId: distId, ...(blkId ? { blockId: blkId } : {}), dalType, limit: 200 })
      .then(res => { setDals(res.data); setMeta(res.meta); })
      .catch(err => setError(err.message ?? 'Failed to load Mangal Dals'))
      .finally(() => setLoading(false));
  }, [dalType]);

  useEffect(() => { load(districtId, blockId); }, [districtId, blockId, load]);

  return { dals, meta, loading, error };
}
