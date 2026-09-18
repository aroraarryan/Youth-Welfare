'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOfficerCmTrophyDetail, useOfficerUpdateRegistration } from '@/hooks/useOfficerCmTrophy';
import { RegistrationStatus } from '@/lib/api/registrations';

const STATUSES: RegistrationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];
const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full';

export default function OfficerCmTrophyRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error } = useOfficerCmTrophyDetail(id);
  const updateMutation = useOfficerUpdateRegistration();

  const [status, setStatus] = useState<RegistrationStatus>('PENDING');
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (data?.data) {
      setStatus(data.data.status);
      setRejectionReason((data.data as unknown as { rejectionReason?: string }).rejectionReason ?? '');
    }
  }, [data]);

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (isError || !data) return <div className="p-6 text-sm text-red-500">{(error as Error)?.message ?? 'Failed to load registration.'}</div>;

  const r = data.data;

  const handleSave = async () => {
    setMessage(null);
    try {
      await updateMutation.mutateAsync({ id, data: { status, rejectionReason: status === 'REJECTED' ? rejectionReason : null } });
      setMessage({ type: 'success', text: 'Registration updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message ?? 'Failed to update.' });
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline mb-4">&larr; Back</button>
      <h1 className="text-xl font-bold text-gray-900 mb-1">{r.fullName}</h1>
      <p className="text-sm text-gray-500 mb-6 font-mono">{r.registrationNo}</p>

      {message && (
        <div className={`mb-4 text-sm rounded-lg px-4 py-2 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Father&apos;s Name:</span> {r.fathersName}</div>
          <div><span className="text-gray-500">Mother&apos;s Name:</span> {r.mothersName}</div>
          <div><span className="text-gray-500">Sport:</span> {r.sport?.name ?? '—'}</div>
          <div><span className="text-gray-500">Age Category:</span> {r.ageCategory}</div>
          <div><span className="text-gray-500">Gender:</span> {r.gender}</div>
          <div><span className="text-gray-500">Nyay Panchayat:</span> {r.nyayPanchayat?.name ?? '—'}</div>
          <div><span className="text-gray-500">Mobile:</span> {r.mobile ?? '—'}</div>
          <div><span className="text-gray-500">Email:</span> {r.email ?? '—'}</div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as RegistrationStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {status === 'REJECTED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
            <textarea className={selectClass} rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
