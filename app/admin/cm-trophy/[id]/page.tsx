'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAdminCmTrophyDetail, useUpdateRegistration, useUpdateRegistrationStatus } from '@/hooks/useAdminCmTrophy';
import { RejectReasonModal } from '@/components/cm-trophy/RejectReasonModal';
import { useDistricts, useBlocks } from '@/hooks/useInfrastructure';
import { useSansads, useVidhanSabhas, useNyayPanchayats } from '@/hooks/useCmTrophyGeo';
import { sportsApi, CmTrophySportOption } from '@/lib/api/sports';

const inputClass = 'w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-800 mt-0.5';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function EditField({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <input type={type} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function EditSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
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

const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
const AGE_CATEGORIES = ['UNDER_14', 'UNDER_19', 'WOMENS_19_25', 'PARA_OPEN'];
const REG_LEVELS = ['NYAY_PANCHAYAT', 'VIDHAN_SABHA', 'SANSAD', 'STATE'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];

type FormState = {
  fullName: string; email: string; mobile: string; dob: string; gender: string; ageCategory: string;
  aadharNumber: string; fathersName: string; mothersName: string; address: string;
  bankName: string; accountHolderName: string; accountNumber: string; ifscCode: string;
  hasDisability: boolean; registrationLevel: string; status: string;
  districtId: string; blockId: string; sansadId: string; vidhanSabhaId: string; nyayPanchayatId: string;
  sportId: string; selectedEvents: string[];
};

export default function CmTrophyApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useAdminCmTrophyDetail(id);
  const updateRegistration = useUpdateRegistration();
  const updateStatus = useUpdateRegistrationStatus();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const r = data?.data;

  const [username, setUsername] = useState('');
  useEffect(() => {
    fetch('/api/admin/me').then((res) => res.json()).then((d) => setUsername(d?.admin?.username ?? '')).catch(() => {});
  }, []);
  const canEdit = username === 'superadmin';

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [sportOptions, setSportOptions] = useState<CmTrophySportOption[]>([]);
  const [sportOptionsLoading, setSportOptionsLoading] = useState(false);

  useEffect(() => {
    if (!form?.ageCategory) { setSportOptions([]); return; }
    setSportOptionsLoading(true);
    sportsApi.listByCmTrophyCategory(form.ageCategory)
      .then((res) => setSportOptions(res.data))
      .catch(() => setSportOptions([]))
      .finally(() => setSportOptionsLoading(false));
  }, [form?.ageCategory]);

  const selectedSport = sportOptions.find((s) => s.sportId === form?.sportId);
  const eligibleEvents = (selectedSport?.events ?? []).filter((e) => !e.gender || e.gender === form?.gender);
  const normalEvents = eligibleEvents.filter((e) => !e.isFreeBonus);
  const bonusEvent = eligibleEvents.find((e) => e.isFreeBonus);
  const maxEventsSelectable = selectedSport?.maxEventsSelectable ?? 1;
  const normalSelectedCount = (form?.selectedEvents ?? []).filter((v) => v !== bonusEvent?.name).length;

  // Skip clearing selectedEvents on the very first render of an edit session (initial load from saved data).
  const skipNextEventsReset = useRef(false);
  useEffect(() => {
    if (skipNextEventsReset.current) { skipNextEventsReset.current = false; return; }
    setForm((f) => (f ? { ...f, selectedEvents: [] } : f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.sportId, form?.gender]);

  const toggleNormalEvent = (name: string) => {
    setForm((f) => {
      if (!f) return f;
      const isBonus = name === bonusEvent?.name;
      if (isBonus) return f;
      if (maxEventsSelectable === 1) {
        const kept = bonusEvent && f.selectedEvents.includes(bonusEvent.name) ? [bonusEvent.name] : [];
        return { ...f, selectedEvents: f.selectedEvents.includes(name) ? kept : [...kept, name] };
      }
      if (f.selectedEvents.includes(name)) return { ...f, selectedEvents: f.selectedEvents.filter((v) => v !== name) };
      if (normalSelectedCount >= maxEventsSelectable) return f;
      return { ...f, selectedEvents: [...f.selectedEvents, name] };
    });
  };

  const toggleBonusEvent = () => {
    if (!bonusEvent) return;
    setForm((f) => (f ? {
      ...f,
      selectedEvents: f.selectedEvents.includes(bonusEvent.name)
        ? f.selectedEvents.filter((v) => v !== bonusEvent.name)
        : [...f.selectedEvents, bonusEvent.name],
    } : f));
  };

  const { districts } = useDistricts();
  const { blocks } = useBlocks(form?.districtId || undefined);
  const { sansads } = useSansads();
  const { vidhanSabhas } = useVidhanSabhas(form?.sansadId || undefined);
  const { nyayPanchayats } = useNyayPanchayats(form?.vidhanSabhaId || undefined);

  const startEdit = () => {
    if (!r) return;
    setForm({
      fullName: r.fullName ?? '',
      email: r.email ?? '',
      mobile: r.mobile ?? '',
      dob: r.dob ? r.dob.slice(0, 10) : '',
      gender: r.gender ?? '',
      ageCategory: r.ageCategory ?? '',
      aadharNumber: r.aadharNumber ?? '',
      fathersName: r.fathersName ?? '',
      mothersName: r.mothersName ?? '',
      address: r.address ?? '',
      bankName: r.bankName ?? '',
      accountHolderName: r.accountHolderName ?? '',
      accountNumber: r.accountNumber ?? '',
      ifscCode: r.ifscCode ?? '',
      hasDisability: r.hasDisability ?? false,
      registrationLevel: r.registrationLevel ?? '',
      status: r.status ?? '',
      districtId: r.district?.id ?? '',
      blockId: r.block?.id ?? '',
      sansadId: r.sansad?.id ?? '',
      vidhanSabhaId: r.vidhanSabha?.id ?? '',
      nyayPanchayatId: r.nyayPanchayat?.id ?? '',
      sportId: r.sport?.id ?? '',
      selectedEvents: r.selectedEvents || [],
    });
    skipNextEventsReset.current = true;
    setEditing(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSave = () => {
    if (!form) return;
    updateRegistration.mutate(
      { id, data: { ...form } },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between text-sm">
        <div>
          <Link href="/admin/cm-trophy" className="text-[#1e3a8a] font-semibold hover:underline">CM Trophy</Link>
          <span className="text-gray-400"> / Application Detail</span>
        </div>
        {r && !editing && (
          <div className="flex gap-2">
            {canEdit && (
              <button onClick={startEdit} className="bg-[#1e3a8a] hover:bg-[#162c68] text-white text-sm font-medium px-4 py-1.5 rounded-md">
                <i className="fas fa-pen mr-2" />Edit
              </button>
            )}
            <button
              onClick={() => updateStatus.mutate({ id, status: 'APPROVED' })}
              disabled={updateStatus.isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-md disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={updateStatus.isPending}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-md disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
        {editing && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              disabled={updateRegistration.isPending}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateRegistration.isPending}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
            >
              {updateRegistration.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {updateRegistration.isError && (
        <p className="text-red-500 text-sm mb-4">{(updateRegistration.error as Error).message}</p>
      )}
      {updateStatus.isError && (
        <p className="text-red-500 text-sm mb-4">{(updateStatus.error as Error).message}</p>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading application…</p>
        </div>
      ) : isError || !r ? (
        <div className="text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error)?.message || 'Application not found.'}</p>
        </div>
      ) : editing && form ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <EditField label="Name" value={form.fullName} onChange={(v) => set('fullName', v)} />
            <Field label="Application Code" value={r.registrationNo} />
            <EditField label="Email" value={form.email} onChange={(v) => set('email', v)} />

            <EditField label="Phone" value={form.mobile} onChange={(v) => set('mobile', v)} />
            <EditField label="DOB" type="date" value={form.dob} onChange={(v) => set('dob', v)} />
            <EditSelect label="Gender" value={form.gender} onChange={(v) => set('gender', v)} options={GENDERS.map((g) => ({ value: g, label: g.toLowerCase() }))} />

            <EditSelect label="Age Category" value={form.ageCategory} onChange={(v) => set('ageCategory', v)} options={AGE_CATEGORIES.map((c) => ({ value: c, label: c.toLowerCase() }))} />
            <EditField label="Aadhar Number" value={form.aadharNumber} onChange={(v) => set('aadharNumber', v)} />
            <EditField label="Father Name" value={form.fathersName} onChange={(v) => set('fathersName', v)} />

            <EditField label="Mother Name" value={form.mothersName} onChange={(v) => set('mothersName', v)} />
            <EditField label="Bank Name" value={form.bankName} onChange={(v) => set('bankName', v)} />
            <EditField label="Account Holder Name" value={form.accountHolderName} onChange={(v) => set('accountHolderName', v)} />

            <EditField label="Bank Account Number" value={form.accountNumber} onChange={(v) => set('accountNumber', v)} />
            <EditField label="IFSC Code" value={form.ifscCode} onChange={(v) => set('ifscCode', v)} />
            <EditSelect label="Has Disability" value={form.hasDisability ? 'yes' : 'no'} onChange={(v) => set('hasDisability', v === 'yes')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />

            <EditSelect label="Registration Level" value={form.registrationLevel} onChange={(v) => set('registrationLevel', v)} options={REG_LEVELS.map((l) => ({ value: l, label: l.toLowerCase() }))} />
            <EditSelect label="District" value={form.districtId} onChange={(v) => set('districtId', v)} options={districts.map((d) => ({ value: d.id, label: d.name }))} />
            <EditSelect label="Block" value={form.blockId} onChange={(v) => set('blockId', v)} options={blocks.map((b) => ({ value: b.id, label: b.name }))} />

            <EditSelect label="Sansad" value={form.sansadId} onChange={(v) => set('sansadId', v)} options={sansads.map((s) => ({ value: s.id, label: s.name }))} />
            <EditSelect label="Vidhan Sabha" value={form.vidhanSabhaId} onChange={(v) => set('vidhanSabhaId', v)} options={vidhanSabhas.map((v) => ({ value: v.id, label: v.name }))} />
            <EditSelect label="Nyay Panchayat" value={form.nyayPanchayatId} onChange={(v) => set('nyayPanchayatId', v)} options={nyayPanchayats.map((n) => ({ value: n.id, label: n.name }))} />

            <div>
              <p className="text-xs text-gray-400">Sport</p>
              <select
                className={inputClass}
                value={form.sportId}
                onChange={(e) => set('sportId', e.target.value)}
                disabled={!form.ageCategory || sportOptionsLoading}
              >
                <option value="">
                  {sportOptionsLoading ? 'Loading sports…' : !form.ageCategory ? 'Select age category first' : '—'}
                </option>
                {sportOptions.map((s) => <option key={s.sportId} value={s.sportId}>{s.name}</option>)}
              </select>
            </div>

            {normalEvents.length > 0 && (
              <div>
                <p className="text-xs text-gray-400">{`Event${maxEventsSelectable > 1 ? 's' : ''} (choose ${maxEventsSelectable})`}</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  {normalEvents.map((ev) => {
                    const checked = form.selectedEvents.includes(ev.name);
                    const capReached = maxEventsSelectable > 1 && !checked && normalSelectedCount >= maxEventsSelectable;
                    return (
                      <label
                        key={ev.name}
                        className={'flex items-center gap-2 text-sm text-gray-700' + (capReached ? ' opacity-40 cursor-not-allowed' : ' cursor-pointer')}
                      >
                        <input
                          type={maxEventsSelectable > 1 ? 'checkbox' : 'radio'}
                          name="edit-event"
                          checked={checked}
                          disabled={capReached}
                          onChange={() => toggleNormalEvent(ev.name)}
                          className="w-4 h-4 accent-[#1e3a8a]"
                        />
                        {ev.name}
                      </label>
                    );
                  })}
                </div>
                {bonusEvent && (
                  <label className="flex items-center gap-2 text-sm text-[#1e3a8a] font-medium cursor-pointer mt-2 pt-2 border-t border-gray-200">
                    <input
                      type="checkbox"
                      checked={form.selectedEvents.includes(bonusEvent.name)}
                      onChange={toggleBonusEvent}
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    + {bonusEvent.name} (Free Event)
                  </label>
                )}
              </div>
            )}
            <EditSelect label="Status" value={form.status} onChange={(v) => set('status', v)} options={STATUSES.map((s) => ({ value: s, label: s.toLowerCase() }))} />

            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-gray-400">Address</p>
              <textarea className={inputClass} rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
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
            {r.status === 'REJECTED' && r.rejectionReason && (
              <Field label="Rejection Reason" value={r.rejectionReason} />
            )}
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

      {showRejectModal && (
        <RejectReasonModal
          isSubmitting={updateStatus.isPending}
          onCancel={() => setShowRejectModal(false)}
          onConfirm={(reason) =>
            updateStatus.mutate(
              { id, status: 'REJECTED', rejectionReason: reason },
              { onSuccess: () => setShowRejectModal(false) }
            )
          }
        />
      )}
    </div>
  );
}
