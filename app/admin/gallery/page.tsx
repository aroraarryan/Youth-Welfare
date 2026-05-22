"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageLightbox from "@/components/ImageLightbox";

type GalleryStatus = "DO_APPROVED" | "APPROVED" | "REJECTED";

interface GalleryItem {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  district: { id: string; name: string } | null;
  blockName: string | null;
  description: string;
  mediaUrls: string[];
  status: GalleryStatus;
  reviewNotes: string | null;
  isHidden: boolean;
  createdAt: string;
}

type MainTab = "DO_APPROVED" | "APPROVED" | "REJECTED" | "UPLOAD";

const TABS: { label: string; value: MainTab }[] = [
  { label: "Awaiting Approval", value: "DO_APPROVED" },
  { label: "Published",         value: "APPROVED"    },
  { label: "Rejected",          value: "REJECTED"    },
  { label: "Upload Photo",      value: "UPLOAD"       },
];

const STATUS_STYLE: Record<string, string> = {
  DO_APPROVED: "bg-blue-100 text-blue-700",
  APPROVED:    "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  DO_APPROVED: "District Approved",
  APPROVED:    "Published",
  REJECTED:    "Rejected",
};

// ─── Department Upload Form ───────────────────────────────────────────────────

function DepartmentUploadForm() {
  const [files, setFiles]           = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).filter((f) => f.type.startsWith("image/"));
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) { setError("Upload at least one photo."); return; }
    if (!description.trim()) { setError("Description is required."); return; }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("upload_preset", preset!);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST", body: fd,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Photo upload failed");
        urls.push(data.secure_url as string);
        setUploadProgress(Math.round(((i + 1) / files.length) * 80));
      }

      setUploadProgress(90);
      const res = await fetch("/api/admin/gallery/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), mediaUrls: urls }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to publish");
      }

      setUploadProgress(100);
      setSuccess(true);
      setFiles([]);
      setPreviews([]);
      setDescription("");
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-2xl">
      <h3 className="text-base font-semibold text-gray-800 mb-1">Publish Department Photo</h3>
      <p className="text-xs text-gray-500 mb-5">Photos published here appear in the Department section of the public gallery.</p>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <i className="fas fa-check-circle" /> Photos published to gallery successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Photos <span className="text-red-500">*</span></label>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <i className="fas fa-cloud-upload-alt text-2xl text-gray-300 mb-2 block" />
            <p className="text-sm text-gray-500">Click to select photos</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the event or occasion…"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Upload progress */}
        {uploading && uploadProgress > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Uploading…</span><span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {uploading
            ? <><i className="fas fa-circle-notch fa-spin" /> Publishing…</>
            : <><i className="fas fa-globe" /> Publish to Gallery</>}
        </button>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const router = useRouter();
  const [tab, setTab]                     = useState<MainTab>("DO_APPROVED");
  const [items, setItems]                 = useState<GalleryItem[]>([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  // Selective publish state
  const [selectingId, setSelectingId]       = useState<string | null>(null);
  const [selectedUrls, setSelectedUrls]     = useState<Record<string, Set<string>>>({});

  const load = useCallback(async (status: MainTab) => {
    if (status === "UPLOAD") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gallery?status=${status}&limit=50`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setItems(data.data ?? []);
    } catch {
      setError("Failed to load gallery submissions.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(tab); }, [tab, load]);

  // ── Selective publish helpers ──
  const startSelecting = (item: GalleryItem) => {
    setSelectingId(item.id);
    setSelectedUrls((prev) => ({
      ...prev,
      [item.id]: new Set(item.mediaUrls), // all selected by default
    }));
  };

  const toggleUrl = (itemId: string, url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev[itemId] ?? []);
      next.has(url) ? next.delete(url) : next.add(url);
      return { ...prev, [itemId]: next };
    });
  };

  const handleApprove = async (id: string) => {
    const urls = selectedUrls[id];
    const selected = urls ? Array.from(urls) : [];
    setActionLoading(id + ":approve");
    try {
      const res = await fetch(`/api/admin/gallery/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedUrls: selected }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + ":reject");
    try {
      const res = await fetch(`/api/admin/gallery/${id}/reject`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmRejectId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentlyHidden: boolean) => {
    const action = currentlyHidden ? "unhide" : "hide";
    setActionLoading(id + ":" + action);
    try {
      const res = await fetch(`/api/admin/gallery/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, isHidden: !currentlyHidden } : i));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + ":delete");
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmDeleteId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
    <div className="p-6 max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Gallery Approvals</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Final approval step — publish district-approved submissions to the public gallery.
        </p>
      </div>

      {tab !== "UPLOAD" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3 text-sm text-blue-800">
          <i className="fas fa-info-circle mt-0.5 text-blue-500 flex-shrink-0" />
          <span>
            Submissions here have already been reviewed by the District Officer.
            Approving publishes them to the public gallery. Rejecting removes them from the queue.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto no-scrollbar max-w-full">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.value
                ? "bg-blue-700 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.value === "UPLOAD" && <i className="fas fa-upload mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload form */}
      {tab === "UPLOAD" && <DepartmentUploadForm />}

      {/* Submissions list */}
      {tab !== "UPLOAD" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-images text-3xl mb-2 text-gray-200 block" />
              {tab === "DO_APPROVED"
                ? "No submissions awaiting approval."
                : tab === "APPROVED"
                ? "No published submissions yet."
                : "No rejected submissions."}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const isSelecting = selectingId === item.id;
                const selSet = selectedUrls[item.id] ?? new Set(item.mediaUrls);
                const selectedCount = selSet.size;

                return (
                  <div key={item.id} className="hover:bg-gray-50 transition-colors">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Image thumbnails */}
                        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
                          {item.mediaUrls.slice(0, 3).map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightbox({ images: item.mediaUrls, index: i })}
                              className="w-24 h-20 sm:w-20 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all group"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover group-hover:brightness-90 transition-all" />
                              {i === 2 && item.mediaUrls.length > 3 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                  +{item.mediaUrls.length - 3}
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <i className="fas fa-expand text-white text-sm drop-shadow" />
                              </div>
                            </button>
                          ))}
                          {item.mediaUrls.length === 0 && (
                            <div className="w-24 h-20 sm:w-20 sm:h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                              <i className="fas fa-image text-xl" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-800">{item.fullName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLE[item.status] ?? "bg-gray-100 text-gray-500"}`}>
                                {STATUS_LABEL[item.status] ?? item.status}
                              </span>
                              {item.isHidden && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-700">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 mt-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <i className="fas fa-phone-alt text-[9px] text-gray-400" />
                              {item.mobile}
                            </span>
                            {item.email && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <i className="fas fa-envelope text-[9px] text-gray-400" />
                                {item.email}
                              </span>
                            )}
                            {item.district && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <i className="fas fa-map-marker-alt text-[9px] text-gray-400" />
                                {item.district.name}{item.blockName && ` › ${item.blockName}`}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{item.description}</p>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            {item.status === "DO_APPROVED" && (
                              <div className="flex flex-wrap gap-2">
                                {/* Publish button — opens selection panel */}
                                {!isSelecting && (
                                  <button
                                    onClick={() => startSelecting(item)}
                                    disabled={!!actionLoading}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                                  >
                                    <i className="fas fa-globe" />
                                    Publish to Gallery
                                  </button>
                                )}

                                {confirmRejectId === item.id ? (
                                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                    <span className="text-xs text-red-600 font-medium">Reject this?</span>
                                    <button
                                      onClick={() => handleReject(item.id)}
                                      disabled={!!actionLoading}
                                      className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                      {actionLoading === item.id + ":reject"
                                        ? <i className="fas fa-circle-notch fa-spin" />
                                        : "Yes, Reject"}
                                    </button>
                                    <button
                                      onClick={() => setConfirmRejectId(null)}
                                      className="text-xs font-bold text-gray-400 hover:text-gray-600"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  !isSelecting && (
                                    <button
                                      onClick={() => setConfirmRejectId(item.id)}
                                      disabled={!!actionLoading}
                                      className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                                    >
                                      <i className="fas fa-times" /> Reject
                                    </button>
                                  )
                                )}

                                {!isSelecting && (
                                  <div className="flex flex-wrap gap-2">
                                    {confirmDeleteId === item.id ? (
                                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">Delete permanently?</span>
                                        <button onClick={() => handleDelete(item.id)} disabled={!!actionLoading} className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                                          {actionLoading === item.id + ":delete" ? <i className="fas fa-circle-notch fa-spin" /> : "Confirm"}
                                        </button>
                                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteId(item.id)} disabled={!!actionLoading} className="px-3 py-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5">
                                        <i className="fas fa-trash-alt" /> Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Actions for Published / Rejected */}
                            {item.status !== "DO_APPROVED" && (
                              <div className="flex flex-wrap gap-2">
                                {item.status === "APPROVED" && (
                                  <button
                                    onClick={() => handleToggleVisibility(item.id, item.isHidden)}
                                    disabled={!!actionLoading}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                      item.isHidden
                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {actionLoading === item.id + ":hide" || actionLoading === item.id + ":unhide"
                                      ? <i className="fas fa-circle-notch fa-spin" />
                                      : item.isHidden ? <i className="fas fa-eye" /> : <i className="fas fa-eye-slash" />}
                                    {item.isHidden ? "Unhide" : "Hide"}
                                  </button>
                                )}

                                {confirmDeleteId === item.id ? (
                                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                    <span className="text-xs text-red-600 font-medium whitespace-nowrap">Delete permanently?</span>
                                    <button onClick={() => handleDelete(item.id)} disabled={!!actionLoading} className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                                      {actionLoading === item.id + ":delete" ? <i className="fas fa-circle-notch fa-spin" /> : "Confirm"}
                                    </button>
                                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeleteId(item.id)} disabled={!!actionLoading} className="px-3 py-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5">
                                    <i className="fas fa-trash-alt" /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Selective publish panel ── */}
                    {isSelecting && (
                      <div className="border-t border-green-100 bg-green-50 px-5 py-4">
                        <p className="text-xs font-semibold text-green-800 mb-3">
                          Select photos to publish ({selectedCount} of {item.mediaUrls.length} selected)
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {item.mediaUrls.map((url, i) => {
                            const checked = selSet.has(url);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => toggleUrl(item.id, url)}
                                className={`relative w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                  checked
                                    ? "border-green-500 ring-2 ring-green-300"
                                    : "border-gray-300 opacity-50"
                                }`}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  checked ? "bg-green-500 text-white" : "bg-white/80 text-gray-400"
                                }`}>
                                  {checked ? <i className="fas fa-check" /> : <i className="fas fa-times" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={selectedCount === 0 || !!actionLoading}
                            className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                          >
                            {actionLoading === item.id + ":approve"
                              ? <><i className="fas fa-circle-notch fa-spin" /> Publishing…</>
                              : <><i className="fas fa-globe" /> Confirm Publish ({selectedCount} photo{selectedCount !== 1 ? "s" : ""})</>}
                          </button>
                          <button
                            onClick={() => setSelectingId(null)}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

    {lightbox && (
      <ImageLightbox
        images={lightbox.images}
        initialIndex={lightbox.index}
        onClose={() => setLightbox(null)}
      />
    )}
    </>
  );
}
