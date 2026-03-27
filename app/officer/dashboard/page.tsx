'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Officer {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  district: string;
  block: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export default function OfficerDashboardPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/officer/me`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) { router.push('/officer/login'); return; }
        const data = await res.json();
        if (data.success) setOfficer(data.officer);
      })
      .catch(() => router.push('/officer/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="p-6 text-gray-500 text-sm">Loading…</div>;
  }

  if (!officer) return null;

  const roleLabel = officer.role === 'DO_PRD' ? 'District Officer (PRD)' : 'Block Officer (PRD)';
  const joinDate = new Date(officer.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const lastLogin = officer.lastLogin
    ? new Date(officer.lastLogin).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'First login';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Welcome, {officer.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{roleLabel}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 col-span-2 md:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Profile</h3>
          <div className="space-y-3">
            <Row label="Name" value={officer.name} />
            <Row label="Username" value={officer.username} mono />
            <Row label="Email" value={officer.email || '—'} />
            <Row label="Role" value={roleLabel} />
            <Row label="District" value={officer.district} />
            <Row label="Block" value={officer.block || '—'} />
            <Row
              label="Status"
              value={
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  officer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {officer.isActive ? 'Active' : 'Inactive'}
                </span>
              }
            />
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Account Activity</h3>
          <div className="space-y-3">
            <Row label="Member since" value={joinDate} />
            <Row label="Last login" value={lastLogin} />
          </div>
        </div>

        {/* Jurisdiction Card */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-teal-800 mb-2">Your Jurisdiction</h3>
          <p className="text-2xl font-bold text-teal-700">{officer.district}</p>
          {officer.block && (
            <p className="text-sm text-teal-600 mt-0.5">{officer.block} Block</p>
          )}
          <p className="text-xs text-teal-500 mt-2">Uttarakhand PRD</p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}
