'use client';

import { useEffect, useState } from 'react';
import RegistrationsDashboard from '@/components/cm-trophy/RegistrationsDashboard';
import {
  useOfficerCmTrophyList,
  useOfficerCmTrophyStats,
  useOfficerCmTrophyWeeklyTrend,
} from '@/hooks/useOfficerCmTrophy';
import { officerCmTrophyApi } from '@/lib/api/officerCmTrophyApi';
import { officerApi } from '@/lib/api/officerApi';

// Same dashboard as the admin page (stats, weekly chart, filters, export). The server
// scopes every call to the officer's block (BO_PRD) or district (DO_PRD); the flags below
// only hide/lock the controls that would be meaningless for that officer.
export default function OfficerCmTrophyRegistrationsPage() {
  const [me, setMe] = useState<{ isDistrictOfficer: boolean; districtId?: string; blockId?: string; vidhanSabhas: { id: string; name: string }[]; nodalIds: string[] } | null>(null);

  useEffect(() => {
    officerApi
      .me()
      .then((res) =>
        setMe({
          isDistrictOfficer: res.officer.role === 'DO_PRD',
          districtId: res.officer.districtId ?? undefined,
          blockId: res.officer.blockId ?? undefined,
          vidhanSabhas: res.officer.vidhanSabhas ?? [],
          nodalIds: (res.officer.nodalVidhanSabhas ?? []).map((v) => v.id),
        }),
      )
      .catch(() => setMe({ isDistrictOfficer: false, vidhanSabhas: [], nodalIds: [] }));
  }, []);

  // Wait for the role so a district officer never briefly sees the unlocked filters.
  if (!me) return <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>;
  const isNodal = !me.isDistrictOfficer && me.nodalIds.length > 0;

  return (
    <RegistrationsDashboard
      title="CM Trophy — Registrations"
      subtitle={me.isDistrictOfficer ? 'Registrations from your district, all levels.' : 'All levels in your block.'}
      vidhanSabhaBadges={!me.isDistrictOfficer ? me.vidhanSabhas.map((v) => (me.nodalIds.includes(v.id) ? `${v.name} · Nodal` : v.name)) : undefined}
      detailHref={(id) => `/officer/cm-trophy/${id}`}
      actionLabel="View"
      useList={useOfficerCmTrophyList}
      useStats={useOfficerCmTrophyStats}
      useTrend={useOfficerCmTrophyWeeklyTrend}
      exportBatch={(filters, cursor) => officerCmTrophyApi.exportBatch(filters, cursor)}
      showLevelFilter={me.isDistrictOfficer || isNodal}
      showDistrictFilters={me.isDistrictOfficer}
      lockedDistrictId={me.isDistrictOfficer ? me.districtId : undefined}
      showSansadVidhanSabhaFilters={me.isDistrictOfficer}
      officerVidhanSabhaOptions={!me.isDistrictOfficer ? me.vidhanSabhas : undefined}
      accent="officer"
    />
  );
}
