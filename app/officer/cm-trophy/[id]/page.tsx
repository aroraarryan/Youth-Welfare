'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOfficerCmTrophyDetail, useOfficerUpdateRegistration } from '@/hooks/useOfficerCmTrophy';
import { RegistrationStatus } from '@/lib/api/registrations';

const STATUSES: RegistrationStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];
const selectClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function DocCard({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null;
  const isImage = /\.(jpe?g|png|webp|gif)$/i.test(url);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 w-24 text-center">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[#1e3a8a]">
          <i className="fas fa-file-alt text-2xl" />
        </div>
      )}
      <span className="text-xs text-gray-600">{label}</span>
    </a>
  );
}

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
    <div className="p-6">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline mb-4">&larr; Back</button>

      {message && (
        <div className={`mb-4 text-sm rounded-lg px-4 py-2 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <Field label="Name" value={r.fullName} />
          <Field label="Application Code" value={r.registrationNo} />
          <Field label="Email" value={r.email} />

          <Field label="Phone" value={r.mobile} />
          <Field label="DOB" value={r.dob ? new Date(r.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
          <Field label="Gender" value={r.gender?.toLowerCase()} />

          <Field label="Age Category" value={r.ageCategory?.toLowerCase()} />
          <Field label="Aadhar Number" value={r.aadharNumber} />
          <Field label="Father Name" value={r.fathersName} />

          <Field label="Mother Name" value={r.mothersName} />
          <Field label="Bank Name" value={r.bankName} />
          <Field label="Account Holder Name" value={r.accountHolderName} />

          <Field label="Bank Account Number" value={r.accountNumber} />
          <Field label="IFSC Code" value={r.ifscCode} />
          <Field label="Has Disability" value={r.hasDisability ? 'Yes' : 'No'} />

          <Field label="Registration Level" value={r.registrationLevel?.toLowerCase()} />
          <Field label="District" value={r.district?.name} />
          <Field label="Block" value={r.block?.name} />

          <Field label="Sansad" value={r.sansad?.name} />
          <Field label="Vidhan Sabha" value={r.vidhanSabha?.name} />
          <Field label="Nyay Panchayat" value={r.nyayPanchayat?.name} />

          <Field label="Sport" value={r.sport?.name} />
          <Field label="Events" value={(r.selectedEvents || []).join(', ')} />
          <Field label="Status" value={r.status?.toLowerCase()} />

          <Field
            label="Applied On"
            value={r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null}
          />

          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-gray-400">Address</p>
            <p className="font-semibold text-gray-800 mt-0.5">{r.address || '—'}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs text-gray-400 mb-3">Documents</p>
          <div className="flex flex-wrap gap-5">
            <DocCard label="Photo" url={r.photoUrl} />
            <DocCard label="Passbook / Cheque" url={r.passbookOrChequeUrl} />
            <DocCard label="Birth / Education Certificate" url={r.birthEducationCertificateUrl} />
            <DocCard label="Residence Proof" url={r.residenceProofUrl} />
            <DocCard label="Disability Certificate" url={r.disabilityCertificateUrl} />
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-5 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as RegistrationStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {status === 'REJECTED' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <textarea className={selectClass} rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="mt-4 text-sm font-semibold bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-40"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
