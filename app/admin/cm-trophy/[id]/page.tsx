'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAdminCmTrophyDetail } from '@/hooks/useAdminCmTrophy';

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

export default function CmTrophyApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useAdminCmTrophyDetail(id);
  const r = data?.data;

  return (
    <div className="p-6">
      <div className="mb-5 text-sm">
        <Link href="/admin/cm-trophy" className="text-[#1e3a8a] font-semibold hover:underline">CM Trophy</Link>
        <span className="text-gray-400"> / Application Detail</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading application…</p>
        </div>
      ) : isError || !r ? (
        <div className="text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error)?.message || 'Application not found.'}</p>
        </div>
      ) : (
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
            <Field label="Achievements" value={null} />

            <Field label="Education Qualification" value={null} />
            <Field label="Education Institution" value={null} />
            <Field label="Category" value={null} />

            <Field label="Has Disability" value={r.hasDisability ? 'Yes' : 'No'} />
            <Field label="Registration Level" value={r.registrationLevel?.toLowerCase()} />
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
        </div>
      )}
    </div>
  );
}
