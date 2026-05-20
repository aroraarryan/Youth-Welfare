'use client';

import { useState, useEffect } from 'react';
import { useDistricts, useBlocks } from '@/hooks/useInfrastructure';
import { useCreateMangalDal, useUpdateMangalDal } from '@/hooks/useOfficer';
import { OfficerProfile } from '@/lib/api/officerApi';

interface MangalDalRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  type: 'MAHILA' | 'YUVAK';
  mode?: 'create' | 'edit';
  initialData?: any; // MangalDal
  officer: OfficerProfile;
  /** Admin override: provide these to bypass officer hooks */
  saveFn?: (payload: any) => Promise<any>;
  updateFn?: (id: string, payload: any) => Promise<any>;
  isPendingOverride?: boolean;
}

const sidebarSteps = ['Dal Information', 'Office Bearers', 'Location & Registration'];

export default function MangalDalRegistrationForm({
  onSuccess,
  onCancel,
  type,
  mode = 'create',
  initialData,
  officer,
  saveFn,
  updateFn,
  isPendingOverride,
}: MangalDalRegistrationFormProps) {
  const { districts } = useDistricts();
  const isDO = officer.role === 'DO_PRD';
  const isBO = officer.role === 'BO_PRD';

  const officerDistrictId = districts.find(
    (d) => d.name.toLowerCase().includes(officer.district.toLowerCase())
  )?.id ?? '';

  const [form, setForm] = useState({
    name:           initialData?.name ?? '',
    presidentName:  initialData?.chairperson ?? '',
    presidentPhone: initialData?.chairpersonPhone ?? '',
    secretaryName:  initialData?.secretaryName ?? '',
    secretaryPhone: initialData?.secretaryPhone ?? '',
    districtId:     initialData?.block?.district?.id ?? '',
    blockId:        initialData?.block?.id ?? '',
    registrationNo: initialData?.affiliationNo ?? '',
    serialNo:       initialData?.serialNo?.toString() ?? '',
    validityFrom:   initialData?.affiliationDate?.split('T')[0] ?? '',
    validityDate:   initialData?.renewalDate?.split('T')[0] ?? '',
  });

  const { blocks, loading: loadingBlocks } = useBlocks(
    form.districtId || undefined
  );

  const createMutation = useCreateMangalDal();
  const updateMutation = useUpdateMangalDal();

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const typeLabel = type === 'MAHILA' ? 'Mahila' : 'Yuvak';
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-fill district for DO_PRD / BO_PRD
  useEffect(() => {
    if ((isDO || isBO) && officerDistrictId && !form.districtId) {
      setForm((f) => ({ ...f, districtId: officerDistrictId }));
    }
  }, [officerDistrictId, isDO, isBO]);

  // Auto-fill block for BO_PRD
  useEffect(() => {
    if (isBO && officer.block && blocks.length > 0 && !form.blockId) {
      const matched = blocks.find((b) =>
        b.name.toLowerCase().includes(officer.block!.toLowerCase())
      );
      if (matched) setForm((f) => ({ ...f, blockId: matched.id }));
    }
  }, [blocks, isBO, officer.block]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const districtId = form.districtId || officerDistrictId;

    if (!form.blockId) {
      setFormError('Please select a block.');
      return;
    }

    const payload = {
      dalType:         type,
      name:            form.name.trim().toUpperCase(),
      serialNo:        parseInt(form.serialNo) || 1,
      affiliationNo:   form.registrationNo.trim().toUpperCase(),
      chairperson:      form.presidentName,
      chairpersonPhone: form.presidentPhone.trim() || undefined,
      secretaryName:    form.secretaryName.trim() || undefined,
      secretaryPhone:   form.secretaryPhone.trim() || undefined,
      affiliationDate: form.validityFrom
        ? new Date(form.validityFrom).toISOString()
        : new Date().toISOString(),
      renewalDate:     form.validityDate
        ? new Date(form.validityDate).toISOString()
        : undefined,
      blockId: form.blockId,
    };

    try {
      if (saveFn || updateFn) {
        // Admin mode: use injected callbacks
        if (mode === 'edit' && initialData && updateFn) {
          await updateFn(initialData.id, payload);
        } else if (saveFn) {
          await saveFn(payload);
        }
      } else {
        // Officer mode: use officer hooks
        if (mode === 'edit' && initialData) {
          await updateMutation.mutateAsync({ id: initialData.id, data: payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
      }
      setSubmitted(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-check text-green-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">
          {mode === 'edit' ? 'Dal Updated!' : 'Dal Registered Successfully!'}
        </h2>
        <p className="text-[#6b7280] mb-6">
          The {typeLabel} Mangal Dal has been {mode === 'edit' ? 'updated' : 'added'}.
        </p>
        <div className="bg-[#eff6ff] border-2 border-[#1e3a8a] rounded-xl px-8 py-4">
          <p className="text-sm text-[#6b7280] mb-1">Registration Reference</p>
          <p className="text-xl font-bold text-[#1e3a8a] tracking-widest uppercase">
            {form.registrationNo || 'PENDING'}
          </p>
        </div>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-all bg-white hover:border-gray-300";
  const sel = inp + " appearance-none cursor-pointer";
  const isMutating = isPendingOverride ?? (createMutation.isPending || updateMutation.isPending);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar */}
      <aside className="lg:w-[260px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
          <h3 className="text-base font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
            <i className="fas fa-list-check" /> Form Sections
          </h3>
          <div className="flex flex-col gap-3">
            {sidebarSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm text-gray-500 py-1">
                <span className="w-8 h-8 bg-[#eff6ff] text-[#1e3a8a] rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Jurisdiction</p>
            <p className="text-sm font-semibold text-teal-700">{officer.district}</p>
            {officer.block && <p className="text-xs text-teal-500">{officer.block} Block</p>}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button onClick={onCancel} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">
              <i className="fas fa-arrow-left text-xs" /> Cancel & Return
            </button>
          </div>
        </div>
      </aside>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle" /> {formError}
          </div>
        )}

        {/* Section 1: Dal Info */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">01</span>
            {typeLabel} Mangal Dal Information
          </legend>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Name of the Village <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value.toUpperCase())} placeholder={`e.g. VILLAGE NAME`} className={inp + ' uppercase'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Serial No. <span className="text-red-500">*</span></label>
                <input type="number" required min="1" value={form.serialNo} onChange={(e) => set('serialNo', e.target.value)} placeholder="Dept. serial no." className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Affiliation No. <span className="text-red-500">*</span></label>
                <input type="text" required value={form.registrationNo} onChange={(e) => set('registrationNo', e.target.value)} placeholder="Official Affiliation ID" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Affiliation Date <span className="text-red-500">*</span></label>
                <input type="date" required value={form.validityFrom} onChange={(e) => set('validityFrom', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Renewal Date</label>
                <input type="date" value={form.validityDate} onChange={(e) => set('validityDate', e.target.value)} className={inp} />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 2: Office Bearers */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">02</span>
            Chairperson & Secretary Details
          </legend>
          <div className="grid gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-50">Chairperson</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.presidentName} onChange={(e) => set('presidentName', e.target.value)} placeholder="Chairperson's name" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase">Mobile Number</label>
                  <input type="tel" inputMode="numeric" maxLength={10} value={form.presidentPhone} onChange={(e) => set('presidentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" className={inp} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-50">Secretary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase">Full Name</label>
                  <input type="text" value={form.secretaryName} onChange={(e) => set('secretaryName', e.target.value)} placeholder="Secretary's name" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase">Mobile Number</label>
                  <input type="tel" inputMode="numeric" maxLength={10} value={form.secretaryPhone} onChange={(e) => set('secretaryPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" className={inp} />
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 3: Location */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">03</span>
            Location Details
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* District */}
            {isBO ? (
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">District</label>
                <input type="text" readOnly value={officer.district} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
              </div>
            ) : isDO ? (
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">District <span className="text-teal-600 text-[10px] normal-case font-normal ml-1">(your jurisdiction)</span></label>
                <input type="text" readOnly value={officer.district} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
              </div>
            ) : (
              <div className="relative">
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">District <span className="text-red-500">*</span></label>
                <select required value={form.districtId} onChange={(e) => { set('districtId', e.target.value); set('blockId', ''); }} className={sel}>
                  <option value="">Select District</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-4 bottom-4 text-gray-400 pointer-events-none text-xs" />
              </div>
            )}
            {/* Block */}
            {isBO ? (
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Block <span className="text-teal-600 text-[10px] normal-case font-normal ml-1">(auto-filled)</span></label>
                <input type="text" readOnly value={officer.block || ''} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
              </div>
            ) : (
              <div className="relative">
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Block <span className="text-red-500">*</span></label>
                <select required disabled={!form.districtId || loadingBlocks} value={form.blockId} onChange={(e) => set('blockId', e.target.value)} className={sel}>
                  <option value="">{loadingBlocks ? 'Loading Blocks…' : 'Select Block'}</option>
                  {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-4 bottom-4 text-gray-400 pointer-events-none text-xs" />
              </div>
            )}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
          <button type="submit" disabled={isMutating} className="w-full md:w-auto bg-[#1e3a8a] text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#1e40af] transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#1e3a8a]/20">
            {isMutating ? <i className="fas fa-circle-notch fa-spin" /> : <i className={mode === 'edit' ? 'fas fa-save' : 'fas fa-paper-plane'} />}
            {mode === 'edit' ? 'Save Changes' : 'Register This Dal'}
          </button>
          <button type="button" onClick={onCancel} className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
        </div>
      </form>
    </div>
  );
}
