'use client';

import { useState } from 'react';
import {
  useCurrentOfficer,
  useUpdateProfile,
  useGalleryPending,
  useApproveGallery,
  useRejectGallery,
} from '@/hooks/useOfficer';
import { uploadOfficerPhoto } from '@/lib/api/officerApi';

export default function OfficerDashboardPage() {
  const { data: officer, isLoading } = useCurrentOfficer();
  const updateProfile = useUpdateProfile();
  const { data: pendingGallery } = useGalleryPending();
  const approveGallery = useApproveGallery();
  const rejectGallery = useRejectGallery();

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', username: '', phone: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  if (isLoading) return <div className="p-6 text-gray-500 text-sm">Loading…</div>;
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

  const startEdit = () => {
    setProfileForm({
      name: officer.name,
      email: officer.email,
      username: officer.username,
      phone: officer.phone ?? '',
    });
    setPhotoFile(null);
    setPhotoPreview(officer.profilePhotoUrl ?? null);
    setProfileMsg('');
    setProfileErr('');
    setEditMode(true);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    const payload: any = {};
    if (profileForm.name !== officer.name)         payload.name = profileForm.name;
    if (profileForm.email !== officer.email)       payload.email = profileForm.email;
    if (profileForm.username !== officer.username) payload.username = profileForm.username;
    if (profileForm.phone !== (officer.phone ?? '')) payload.phone = profileForm.phone || null;

    if (photoFile) {
      try {
        setPhotoUploading(true);
        payload.profilePhotoUrl = await uploadOfficerPhoto(photoFile);
      } catch {
        setProfileErr('Photo upload failed. Try again.');
        setPhotoUploading(false);
        return;
      } finally {
        setPhotoUploading(false);
      }
    } else if (photoPreview === null && officer.profilePhotoUrl) {
      payload.profilePhotoUrl = null;
    }

    if (Object.keys(payload).length === 0) { setEditMode(false); return; }
    try {
      await updateProfile.mutateAsync(payload);
      setProfileMsg('Profile updated successfully.');
      setPhotoFile(null);
      setEditMode(false);
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwErr('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await updateProfile.mutateAsync({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwForm(false);
    } catch (err: any) {
      setPwErr(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const pendingItems = pendingGallery?.data ?? [];

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const currentPhoto = officer.profilePhotoUrl;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-800">Welcome, {officer.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{roleLabel}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Profile</h3>
            {!editMode && (
              <button onClick={startEdit} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                <i className="fas fa-pen text-[10px]" /> Edit
              </button>
            )}
          </div>
          {editMode ? (
            <form onSubmit={handleProfileSave} className="space-y-3">
              {profileErr && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{profileErr}</p>}

              {/* Photo upload */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block uppercase font-semibold">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-14 h-14 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                      <i className="fas fa-user text-xl" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5">
                      {photoUploading ? (
                        <><i className="fas fa-circle-notch fa-spin" /> Uploading…</>
                      ) : (
                        <><i className="fas fa-camera" /> Change photo</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setPhotoFile(f);
                          setPhotoPreview(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      >
                        <i className="fas fa-trash-alt" /> Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Name</label>
                <input className={inp} value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Email</label>
                <input type="email" className={inp} value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Username</label>
                <input className={inp} value={profileForm.username} onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Phone</label>
                <input
                  type="tel"
                  className={inp}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending || photoUploading}
                  className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {(updateProfile.isPending || photoUploading) ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-save" />}
                  Save
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {profileMsg && <p className="text-xs text-green-600 bg-green-50 p-2 rounded">{profileMsg}</p>}

              {/* Avatar in view mode */}
              {currentPhoto && (
                <div className="flex justify-center mb-2">
                  <img src={currentPhoto} alt="profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                </div>
              )}

              <Row label="Name"     value={officer.name} />
              <Row label="Username" value={officer.username} mono />
              <Row label="Email"    value={officer.email || '—'} />
              <Row label="Phone"    value={officer.phone || '—'} />
              <Row label="Role"     value={roleLabel} />
              <Row label="District" value={officer.district} />
              <Row label="Block"    value={officer.block || '—'} />
              <Row label="Status"   value={
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${officer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {officer.isActive ? 'Active' : 'Inactive'}
                </span>
              } />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Activity Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Account Activity</h3>
            <div className="space-y-3">
              <Row label="Member since" value={joinDate} />
              <Row label="Last login"   value={lastLogin} />
            </div>
          </div>

          {/* Jurisdiction Card */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-teal-800 mb-2">Your Jurisdiction</h3>
            <p className="text-2xl font-bold text-teal-700">{officer.district}</p>
            {officer.block && <p className="text-sm text-teal-600 mt-0.5">{officer.block} Block</p>}
            <p className="text-xs text-teal-500 mt-2">Uttarakhand PRD</p>
          </div>
        </div>
      </div>

      {/* ── Change Password Card ────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <i className="fas fa-lock text-orange-500 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Change Password</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Update your login password</p>
            </div>
          </div>
          <button
            onClick={() => { setShowPwForm((v) => !v); setPwMsg(''); setPwErr(''); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <i className={`fas ${showPwForm ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`} />
            {showPwForm ? 'Cancel' : 'Change'}
          </button>
        </div>

        {pwMsg && !showPwForm && (
          <div className="px-5 py-3 bg-green-50 border-b border-green-100">
            <p className="text-xs text-green-700 flex items-center gap-2">
              <i className="fas fa-check-circle" /> {pwMsg}
            </p>
          </div>
        )}

        {showPwForm && (
          <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
            {pwErr && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-xs flex items-center gap-2">
                <i className="fas fa-exclamation-circle" /> {pwErr}
              </div>
            )}
            {pwMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-xs flex items-center gap-2">
                <i className="fas fa-check-circle" /> {pwMsg}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block uppercase font-semibold">Current Password</label>
                <input
                  type="password"
                  required
                  className={inp}
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block uppercase font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  className={inp}
                  placeholder="Min. 6 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block uppercase font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className={inp}
                  placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowPwForm(false); setPwErr(''); setPwMsg(''); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwLoading}
                className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-60 flex items-center gap-2 transition-colors"
              >
                {pwLoading ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-lock" />}
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Gallery Requests Section — visible only to Block Officers and Super Admins */}
      {officer.role !== 'DO_PRD' && (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-images text-purple-500" />
              Gallery Requests
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Review photo submissions from your block. Approved entries go to Admin for final publication.
            </p>
          </div>
          {pendingItems.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingItems.length} Pending
            </span>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fas fa-check-circle text-3xl mb-2 text-green-300" />
            <p className="text-sm">No pending gallery requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingItems.map((item: any) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start hover:bg-gray-50 transition-colors">
                {/* Media preview */}
                <div className="w-full sm:w-24 h-48 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {item.mediaUrls?.[0] ? (
                    <img src={item.mediaUrls[0]} alt="submission" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <i className="fas fa-image text-2xl" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.fullName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <i className="fas fa-phone-alt text-[9px] text-gray-400" />{item.mobile}
                        </span>
                        {item.email && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <i className="fas fa-envelope text-[9px] text-gray-400" />{item.email}
                          </span>
                        )}
                        {item.district && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <i className="fas fa-map-marker-alt text-[9px] text-gray-400" />
                            {item.district.name}{item.blockName && ` › ${item.blockName}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3">{item.description}</p>
                  {item.mediaUrls?.length > 1 && (
                    <p className="text-[10px] text-gray-400 mt-1">{item.mediaUrls.length} images</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => approveGallery.mutate({ id: item.id })}
                      disabled={approveGallery.isPending || rejectGallery.isPending}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-check" /> Send for Admin Approval
                    </button>
                    <button
                      onClick={() => rejectGallery.mutate({ id: item.id })}
                      disabled={approveGallery.isPending || rejectGallery.isPending}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-times" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
