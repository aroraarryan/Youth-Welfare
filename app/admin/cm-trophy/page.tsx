'use client';

import RegistrationsDashboard from '@/components/cm-trophy/RegistrationsDashboard';
import {
  useAdminCmTrophyList,
  useAdminCmTrophyStats,
  useAdminCmTrophyWeeklyTrend,
  useAdminPermissions,
} from '@/hooks/useAdminCmTrophy';
import { adminCmTrophyApi } from '@/lib/api/adminCmTrophyApi';

export default function CmTrophyAdminPage() {
  const { canExportBankDetails } = useAdminPermissions();
  return (
    <RegistrationsDashboard
      title="CM Trophy"
      subtitle="CM Championship Trophy 2026-27 registrations"
      detailHref={(id) => `/admin/cm-trophy/${id}`}
      useList={useAdminCmTrophyList}
      useStats={useAdminCmTrophyStats}
      useTrend={useAdminCmTrophyWeeklyTrend}
      exportBatch={(filters, cursor) => adminCmTrophyApi.exportBatch(filters, cursor)}
      showBankColumns={canExportBankDetails}
    />
  );
}
