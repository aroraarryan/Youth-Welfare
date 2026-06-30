'use client';

import { useState, useEffect } from 'react';
import { useDistricts, useBlocks } from '@/hooks/useInfrastructure';
import { useCreateInfra, useUpdateInfra } from '@/hooks/useOfficer';
import LocationPicker from './LocationPicker';
import PlaceAutocomplete from './PlaceAutocomplete';
import { APIProvider } from '@vis.gl/react-google-maps';
import { InfraType, InfrastructureItem } from '@/lib/api/officerApi';
import { OfficerProfile } from '@/lib/api/officerApi';

type InfraFormType = 'HALL' | 'STADIUM' | 'YOUTH_HOSTEL' | 'VOCATIONAL_CENTER' | 'INDOOR_GYM' | 'OPEN_GYM' | 'KHEL_MAIDAAN';

interface InfrastructureFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  type: InfraFormType;
  mode?: 'create' | 'edit';
  initialData?: InfrastructureItem;
  officer: OfficerProfile;
  /** Admin override: provide these to bypass officer hooks */
  saveFn?: (payload: any) => Promise<any>;
  updateFn?: (id: string, payload: any) => Promise<any>;
  isPendingOverride?: boolean;
}

const typeLabels: Record<string, string> = {
  HALL:               'Multipurpose Hall',
  STADIUM:            'Mini Stadium',
  YOUTH_HOSTEL:       'Youth Hostel',
  VOCATIONAL_CENTER:  'Vocational Training Center',
  INDOOR_GYM:         'Indoor Gym',
  OPEN_GYM:           'Open Gym',
  KHEL_MAIDAAN:       'Khel Maidaan',
};

const sidebarSteps = ['Basic Information', 'Geographic Location', 'Point of Contact', 'Core Facilities'];

async function uploadToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return null;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  return data.secure_url ?? null;
}

function onlyDigits(val: string, max = 10) {
  return val.replace(/\D/g, '').slice(0, max);
}

interface ImageItem {
  file?: File;
  preview: string;
  uploadedUrl?: string;
}

export default function InfrastructureForm({
  onSuccess,
  onCancel,
  type,
  mode = 'create',
  initialData,
  officer,
  saveFn,
  updateFn,
  isPendingOverride,
}: InfrastructureFormProps) {
  const { districts } = useDistricts();

  const isDO          = officer.role === 'DO_PRD';
  const isBO          = officer.role === 'BO_PRD';
  const isSuperAdmin  = officer.role === 'SUPER_ADMIN';

  // Resolve officer's district UUID from the district list
  const officerDistrictId = districts.find(
    (d) => d.name.toLowerCase().includes(officer.district.toLowerCase())
  )?.id ?? '';

  const [form, setForm] = useState({
    name:       initialData?.name ?? '',
    location:   initialData?.location ?? '',
    districtId: initialData?.districtId ?? '',
    blockId:    initialData?.blockId ?? '',
    pocName:    initialData?.pocName ?? '',
    pocPhone:   initialData?.pocPhone ?? '',
    pocEmail:   initialData?.pocEmail ?? '',
    facilities: initialData?.facilities ?? '',
    isActive:   initialData?.isActive !== false,
    latitude:   initialData?.latitude ?? null,
    longitude:  initialData?.longitude ?? null,
  });

  // Images state (up to 5)
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initialData?.imageUrls ?? []).map((url) => ({ preview: url, uploadedUrl: url }))
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Block dropdown (for DO_PRD and SUPER_ADMIN who can pick a district)
  const blockDistrictId = (isDO || isSuperAdmin) ? (form.districtId || officerDistrictId) : '';
  const { blocks } = useBlocks(blockDistrictId || undefined);

  const createMutation = useCreateInfra(type as InfraType);
  const updateMutation = useUpdateInfra(type as InfraType);

  // Auto-fill district for DO_PRD/BO_PRD
  useEffect(() => {
    if ((isDO || isBO) && officerDistrictId && !form.districtId) {
      setForm((f) => ({ ...f, districtId: officerDistrictId }));
    }
  }, [officerDistrictId, isDO, isBO]);

  const typeLabel = typeLabels[type] || 'Infrastructure';
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 images.');
      e.target.value = '';
      return;
    }
    setFormError('');

    const newItems: ImageItem[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
    e.target.value = '';

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && preset) {
      setUploadingCount((c) => c + files.length);
      const uploads = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      setImages((prev) => {
        const updated = [...prev];
        let slot = updated.length - files.length;
        uploads.forEach((url) => {
          if (url && updated[slot]) updated[slot].uploadedUrl = url;
          slot++;
        });
        return updated;
      });
      setUploadingCount((c) => c - files.length);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const item = prev[idx];
      if (item?.preview && !item.uploadedUrl) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Phone validation
    if (form.pocPhone && !/^\d{10}$/.test(form.pocPhone)) {
      setFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    const imageUrls = images
      .map((img) => img.uploadedUrl ?? (img.file ? '' : img.preview))
      .filter(Boolean);

    const payload = {
      name:       form.name,
      location:   form.location,
      districtId: form.districtId || officerDistrictId,
      blockId:    form.blockId || undefined,
      pocName:    form.pocName,
      pocPhone:   form.pocPhone,
      pocEmail:   form.pocEmail || undefined,
      imageUrls,
      facilities: form.facilities,
      isActive:   form.isActive,
      latitude:   form.latitude,
      longitude:  form.longitude,
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
          await (updateMutation.mutateAsync as any)({ id: initialData.id, data: payload });
        } else {
          await (createMutation.mutateAsync as any)(payload);
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
          {mode === 'edit' ? 'Updated!' : 'Registered!'}
        </h2>
        <p className="text-[#6b7280] mb-6">
          The {typeLabel} has been successfully {mode === 'edit' ? 'updated' : 'added'}.
        </p>
        <div className="bg-[#eff6ff] border-2 border-[#1e3a8a] rounded-xl px-8 py-4">
          <p className="text-sm text-[#6b7280] mb-1">Entity Name</p>
          <p className="text-xl font-bold text-[#1e3a8a] tracking-tight truncate max-w-[300px]">{form.name}</p>
        </div>
      </div>
    );
  }

  const inp  = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-all bg-white hover:border-gray-300";
  const sel  = inp + " appearance-none cursor-pointer";
  const area = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-all bg-white hover:border-gray-300 resize-none";
  const isMutating = (isPendingOverride ?? (createMutation.isPending || updateMutation.isPending)) || uploadingCount > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar */}
      <aside className="lg:w-[260px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
          <h3 className="text-base font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
            <i className="fas fa-list-check" /> Form Sections
          </h3>
          <div className="flex flex-col gap-4">
            {sidebarSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm text-gray-500 py-1">
                <span className="w-8 h-8 bg-[#eff6ff] text-[#1e3a8a] rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
          {/* Jurisdiction badge */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Your Jurisdiction</p>
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
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle" /> {formError}
          </div>
        )}

        {/* Section 01: Basic Info */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">01</span>
            {typeLabel} Basic Details
          </legend>
          <div className="grid gap-6 py-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Infrastructure Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={`e.g. ${typeLabel} - Dehradun Central`} className={inp} />
            </div>

            {/* Location + District row */}
            <div className={`grid grid-cols-1 gap-6 ${!isDO && !isBO ? 'md:grid-cols-2' : ''}`}>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Full Location/Address <span className="text-red-500">*</span></label>
                <PlaceAutocomplete 
                  defaultValue={form.location}
                  onPlaceSelect={(place) => {
                    if (place && place.geometry?.location) {
                      const newLat = place.geometry.location.lat();
                      const newLng = place.geometry.location.lng();
                      setForm(f => ({ 
                        ...f, 
                        location: place.formatted_address || '', 
                        latitude: newLat, 
                        longitude: newLng 
                      }));
                    } else {
                      set('location', '');
                    }
                  }}
                  className={inp}
                  placeholder="Search for building, street or landmark..."
                />
              </div>

              {/* District selector: hidden for BO_PRD, read-only for DO_PRD */}
              {!isBO && (
                <div className="relative">
                  <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">
                    District <span className="text-red-500">*</span>
                    {isDO && <span className="ml-2 text-[10px] text-teal-600 normal-case font-normal">(your jurisdiction)</span>}
                  </label>
                  {isDO ? (
                    <input type="text" readOnly value={officer.district} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
                  ) : (
                    <>
                      <select required value={form.districtId} onChange={(e) => set('districtId', e.target.value)} className={sel}>
                        <option value="">Select District</option>
                        {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <i className="fas fa-chevron-down absolute right-4 bottom-4 text-gray-400 pointer-events-none text-xs" />
                    </>
                  )}
                </div>
              )}

              {/* BO_PRD: show read-only district + block */}
              {isBO && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">District</label>
                    <input type="text" readOnly value={officer.district} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
                  </div>
                  {officer.block && (
                    <div>
                      <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Block</label>
                      <input type="text" readOnly value={officer.block} className={inp + ' bg-gray-50 cursor-not-allowed text-gray-500'} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Block selector for DO_PRD / SUPER_ADMIN */}
            {(isDO || isSuperAdmin) && (
              <div className="relative">
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Block <span className="text-xs text-gray-400 normal-case font-normal">(optional)</span></label>
                <select
                  value={form.blockId}
                  onChange={(e) => set('blockId', e.target.value)}
                  disabled={!blockDistrictId}
                  className={sel + ' disabled:opacity-50'}
                >
                  <option value="">— All Blocks / District-wide —</option>
                  {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-4 bottom-4 text-gray-400 pointer-events-none text-xs" />
              </div>
            )}

            {/* Status toggle */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Status <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => set('isActive', true)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    form.isActive
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-circle text-xs" /> Active
                </button>
                <button
                  type="button"
                  onClick={() => set('isActive', false)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    !form.isActive
                      ? 'bg-red-50 border-red-400 text-red-600'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-ban text-xs" /> Disabled
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {form.isActive ? 'Visible on public pages.' : 'Hidden from public pages.'}
              </p>
            </div>

            {/* Multi-Image Upload (up to 5) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-[#374151] uppercase tracking-tight">
                  Infrastructure Images <span className="text-xs text-gray-400 normal-case font-normal">(up to 5)</span>
                </label>
                <span className="text-[10px] font-bold text-gray-400">{images.length} / 5</span>
              </div>
              {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                <p className="text-[11px] text-amber-500 mb-2 italic">Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + UPLOAD_PRESET to enable image uploads.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#e5e7eb] group bg-gray-50">
                    <img src={img.preview} alt={`Infrastructure image ${idx + 1}`} className="w-full h-full object-cover" />
                    {!img.uploadedUrl && img.file && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-times text-[10px]" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="relative aspect-square border-2 border-dashed border-[#e5e7eb] rounded-xl flex flex-col items-center justify-center bg-gray-50/50 hover:border-[#1e3a8a] hover:bg-blue-50/30 transition-all cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <i className="fas fa-plus text-[#1e3a8a] text-lg mb-1 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold text-gray-400">Add Image</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">PNG, JPG or WebP · max 5MB each</p>
            </div>
          </div>
        </fieldset>

        {/* Section 02: Geographic Location */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">02</span>
            Geographic Location
          </legend>
          <div className="py-4 space-y-4">
            <p className="text-xs text-gray-500">
              Pin the exact location of the {typeLabel} on the map below. This helps the public find the facility easily.
            </p>
            <LocationPicker 
              lat={form.latitude} 
              lng={form.longitude} 
              onChange={(lat, lng, address) => {
                setForm(f => ({ 
                  ...f, 
                  latitude: lat, 
                  longitude: lng,
                  location: address || f.location // Update address if map provides one
                }));
              }} 
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Latitude</label>
                <input type="text" readOnly value={form.latitude?.toFixed(6) ?? 'Not set'} className={inp + " bg-gray-50 cursor-not-allowed"} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Longitude</label>
                <input type="text" readOnly value={form.longitude?.toFixed(6) ?? 'Not set'} className={inp + " bg-gray-50 cursor-not-allowed"} />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 03: POC */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">03</span>
            Point of Contact Details
          </legend>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">POC Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={form.pocName} onChange={(e) => set('pocName', e.target.value)} placeholder="Contact person's name" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={form.pocPhone}
                  onChange={(e) => set('pocPhone', onlyDigits(e.target.value))}
                  placeholder="10-digit mobile number"
                  className={inp}
                />
                {form.pocPhone && form.pocPhone.length < 10 && (
                  <p className="text-[11px] text-red-500 mt-1">{10 - form.pocPhone.length} more digit{form.pocPhone.length < 9 ? 's' : ''} required</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Email Address</label>
              <input type="email" value={form.pocEmail} onChange={(e) => set('pocEmail', e.target.value)} placeholder="poc@example.com" className={inp} />
            </div>
          </div>
        </fieldset>

        {/* Section 04: Facilities */}
        <fieldset className="bg-white rounded-2xl p-6 pt-5 border border-gray-200 shadow-sm min-w-0">
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-3 mb-2 pb-1 border-b border-gray-100 w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm shadow-sm">04</span>
            Core Facilities
          </legend>
          <div className="py-4">
            <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-tight">Available Facilities <span className="text-red-500">*</span></label>
            <textarea required rows={5} value={form.facilities} onChange={(e) => set('facilities', e.target.value)} placeholder="List facilities e.g. Badminton Court, Sound System, Parking, etc." className={area} />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
          <button
            type="submit"
            disabled={isMutating}
            className="w-full md:w-auto bg-[#1e3a8a] text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#1e40af] transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#1e3a8a]/20"
          >
            {isMutating ? <i className="fas fa-circle-notch fa-spin" /> : <i className={mode === 'edit' ? 'fas fa-save' : 'fas fa-plus'} />}
            {mode === 'edit' ? 'Save Changes' : 'Add Infrastructure'}
          </button>
          <button type="button" onClick={onCancel} className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
            Cancel
          </button>
        </div>
      </form>
      </APIProvider>
    </div>
  );
}
