'use client';

import { useState, useEffect } from 'react';
import { infrastructureApi, District } from '@/lib/api/infrastructure';
import { useBlocks } from '@/hooks/useInfrastructure';
import { submitGallery } from '@/lib/api/officerApi';

interface PhotoSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MediaItem {
  file: File;
  preview: string;
  isVideo: boolean;
  uploadedUrl?: string;
}

async function uploadToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return null;

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith('video/') ? 'video' : 'image'}/upload`,
    { method: 'POST', body: fd }
  );
  const data = await res.json();
  return data.secure_url ?? null;
}

export default function PhotoSubmissionModal({ isOpen, onClose }: PhotoSubmissionModalProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    playerMobile: '',
    playerEmail: '',
    districtId: '',
    blockName: '',
    description: '',
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const { blocks, loading: loadingBlocks } = useBlocks(form.districtId || undefined);

  useEffect(() => {
    if (isOpen) {
      setLoadingDistricts(true);
      infrastructureApi.getDistricts()
        .then((res) => setDistricts(res.data))
        .catch(() => {})
        .finally(() => setLoadingDistricts(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.playerMobile)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (mediaItems.length === 0) {
      setError('Please upload at least one photo or video.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      let mediaUrls: string[] = [];
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (cloudName) {
        // Upload all files to Cloudinary
        const uploads = await Promise.all(mediaItems.map((item) => uploadToCloudinary(item.file)));
        mediaUrls = uploads.filter(Boolean) as string[];
      }
      // If Cloudinary not configured, submit without media URLs (officer can still see the request)

      await submitGallery({
        fullName:   form.fullName,
        mobile:     form.playerMobile,
        email:      form.playerEmail || undefined,
        districtId: form.districtId || undefined,
        blockName:  form.blockName || undefined,
        description: form.description,
        mediaUrls,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (mediaItems.length + files.length > 5) {
      setError('You can only upload a maximum of 5 files.');
      return;
    }
    setError('');
    const newItems: MediaItem[] = files.map((file) => ({
      file,
      isVideo: file.type.startsWith('video/'),
      preview: URL.createObjectURL(file),
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetAndClose = () => {
    setSuccess(false);
    setError('');
    setForm({ fullName: '', playerMobile: '', playerEmail: '', districtId: '', blockName: '', description: '' });
    setMediaItems([]);
    onClose();
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-green-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2">Submission Received!</h2>
          <p className="text-gray-500 mb-8">Your gallery submission has been received and is pending officer review.</p>
          <button onClick={resetAndClose} className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-bold hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-100">
            Done
          </button>
        </div>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl text-sm text-[#1e293b] outline-none focus:border-[#1e3a8a] transition-all bg-gray-50/50";
  const labelStyle = "block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative my-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30 rounded-t-[32px]">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Gallery Submission</h2>
            <p className="text-sm text-gray-500 mt-1">Upload photos/videos of your events or achievements</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-all shadow-sm">
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <div>
            <label className={labelStyle}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Enter name" className={inp} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>Mobile Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={10}
                value={form.playerMobile}
                onChange={(e) => setForm({ ...form, playerMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit mobile"
                className={inp}
              />
              {form.playerMobile && form.playerMobile.length < 10 && (
                <p className="text-[11px] text-red-500 mt-1">{10 - form.playerMobile.length} more digit{form.playerMobile.length < 9 ? 's' : ''} required</p>
              )}
            </div>
            <div>
              <label className={labelStyle}>Email Address</label>
              <input type="email" value={form.playerEmail} onChange={(e) => setForm({ ...form, playerEmail: e.target.value })} placeholder="you@example.com" className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelStyle}>District <span className="text-red-500">*</span></label>
              <select required value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value, blockName: '' })} className={inp + " appearance-none cursor-pointer"} disabled={loadingDistricts}>
                <option value="">Select District</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Block <span className="text-red-500">*</span></label>
              <select required value={form.blockName} onChange={(e) => setForm({ ...form, blockName: e.target.value })} disabled={!form.districtId || loadingBlocks} className={inp + " appearance-none cursor-pointer disabled:opacity-50"}>
                <option value="">{form.districtId ? 'Select Block' : 'Select District First'}</option>
                {blocks.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Event Description <span className="text-red-500">*</span></label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell us about this event, the date, and its significance..." rows={3} className={inp + " resize-none"} />
          </div>

          {/* Media Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelStyle + " mb-0"}>Photos & Videos (Up to 5) <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-bold text-gray-400">{mediaItems.length} / 5</span>
            </div>
            {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
              <p className="text-[10px] text-amber-500 mb-2 italic">Cloudinary not configured — photos will be submitted without images. Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + UPLOAD_PRESET to enable.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mediaItems.map((item, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                  {item.isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      <i className="fas fa-video text-[#1e3a8a] text-xl mb-1" />
                      <p className="text-[10px] text-gray-500 font-medium truncate w-full">{item.file.name}</p>
                    </div>
                  ) : (
                    <img src={item.preview} alt={item.file?.name ? `Preview of ${item.file.name}` : 'Photo preview'} className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removeMedia(idx)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-trash-alt text-xs" />
                  </button>
                </div>
              ))}
              {mediaItems.length < 5 && (
                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:border-[#1e3a8a] hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <i className="fas fa-plus text-[#1e3a8a] text-lg mb-1 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-400">Add More</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">Supported: JPG, PNG, MP4 · Max 20MB per video</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || mediaItems.length === 0}
              className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-bold hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><i className="fas fa-circle-notch fa-spin" /> Uploading…</>
              ) : (
                <><i className="fas fa-cloud-upload-alt" /> Submit Gallery Entry</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
