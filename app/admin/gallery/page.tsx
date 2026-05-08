"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

const TABS: { label: string; value: GalleryStatus }[] = [
  { label: "Awaiting Approval", value: "DO_APPROVED" },
  { label: "Published",         value: "APPROVED"    },
  { label: "Rejected",          value: "REJECTED"    },
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

export default function AdminGalleryPage() {
  const router = useRouter();
  const [tab, setTab]                     = useState<GalleryStatus>("DO_APPROVED");
  const [items, setItems]                 = useState<GalleryItem[]>([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async (status: GalleryStatus) => {
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

  const handleApprove = async (id: string) => {
    setActionLoading(id + ":approve");
    try {
      const res = await fetch(`/api/admin/gallery/${id}/approve`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Gallery Approvals</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Final approval step — publish district-approved submissions to the public gallery.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3 text-sm text-blue-800">
        <i className="fas fa-info-circle mt-0.5 text-blue-500 flex-shrink-0" />
        <span>
          Submissions here have already been reviewed by the District Officer.
          Approving publishes them to the public gallery. Rejecting removes them from the queue.
        </span>
      </div>

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
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
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
            {items.map((item) => (
              <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Image thumbnails */}
                  <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
                    {item.mediaUrls.slice(0, 3).map((url, i) => (
                      <div key={i} className="w-24 h-20 sm:w-20 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative flex-shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 2 && item.mediaUrls.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                            +{item.mediaUrls.length - 3}
                          </div>
                        )}
                      </div>
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
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                          >
                            {actionLoading === item.id + ":approve"
                              ? <i className="fas fa-circle-notch fa-spin" />
                              : <i className="fas fa-globe" />}
                            Publish to Gallery
                          </button>

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
                            <button
                              onClick={() => setConfirmRejectId(item.id)}
                              disabled={!!actionLoading}
                              className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                            >
                              <i className="fas fa-times" /> Reject
                            </button>
                          )}
                        </div>
                      )}

                      {/* Common Actions for Published or Rejected items */}
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
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={!!actionLoading}
                              className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {actionLoading === item.id + ":delete"
                                ? <i className="fas fa-circle-notch fa-spin" />
                                : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-bold text-gray-400 hover:text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5"
                          >
                            <i className="fas fa-trash-alt" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
