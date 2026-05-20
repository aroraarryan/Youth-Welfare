'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export type PortalSession =
  | { kind: 'officer'; name: string; role: string; dashboardUrl: '/officer/dashboard'; logoutUrl: '/api/officer/logout' }
  | { kind: 'admin';   name: string; role: string; dashboardUrl: '/admin/dashboard';   logoutUrl: '/api/admin/logout' }
  | null;

/**
 * Probes /api/officer/me and /api/admin/me on mount to detect whether an
 * officer or admin httpOnly cookie is still valid. Officer takes precedence
 * if both are somehow set.
 */
export function usePortalSession() {
  const [session, setSession] = useState<PortalSession>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const pathname = usePathname();

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [officerRes, adminRes] = await Promise.all([
          fetch('/api/officer/me', { credentials: 'include' }),
          fetch('/api/admin/me',   { credentials: 'include' }),
        ]);

        if (cancelled) return;

        if (officerRes.ok) {
          const data = await officerRes.json();
          if (data?.officer) {
            setSession({
              kind: 'officer',
              name: data.officer.name ?? data.officer.username ?? 'Officer',
              role: data.officer.role ?? '',
              dashboardUrl: '/officer/dashboard',
              logoutUrl: '/api/officer/logout',
            });
            return;
          }
        }

        if (adminRes.ok) {
          const data = await adminRes.json();
          const a = data?.admin ?? data;
          if (a) {
            setSession({
              kind: 'admin',
              name: a.username ?? a.name ?? 'Admin',
              role: 'ADMIN',
              dashboardUrl: '/admin/dashboard',
              logoutUrl: '/api/admin/logout',
            });
            return;
          }
        }

        setSession(null);
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pathname, tick]);

  return { session, loading, refresh };
}
