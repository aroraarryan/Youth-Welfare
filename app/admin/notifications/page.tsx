"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  url?: string;
  documentUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: "",
  message: "",
  url: "",
  documentUrl: "",
  isPublished: true,
};

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error("Cloudinary is not configured.");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("resource_type", "raw");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }
  return data.secure_url as string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [items, setItems]             = useState<NotificationItem[]>([]);
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingItem, setEditingItem]     = useState<NotificationItem | null>(null);
  const [form, setForm]                   = useState({ ...emptyForm });
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [saving, setSaving]               = useState(false);
  const [formError, setFormError]         = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState<string | null>(null);

  const load = useCallback(async (page = 1, q = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "10", page: String(page) });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/admin/notifications?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setItems(data.data ?? []);
      setTotal(data.meta?.total ?? data.data?.length ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
      setCurrentPage(page);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(1, ""); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1, searchInput);
    setSearch(searchInput);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (item: NotificationItem) => {
    setEditingItem(item);
    setForm({
      title:       item.title,
      message:     item.message,
      url:         item.url ?? "",
      documentUrl: item.documentUrl ?? "",
      isPublished: item.isPublished,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setIsModalOpen(false);
    setEditingItem(null);
    setForm({ ...emptyForm });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    if (!form.message.trim()) { setFormError("Message is required."); return; }

    setSaving(true);
    try {
      let documentUrl = form.documentUrl;

      if (selectedFile) {
        setUploading(true);
        setUploadProgress("Uploading document...");
        documentUrl = await uploadToCloudinary(selectedFile);
        setUploading(false);
        setUploadProgress("Upload complete.");
      }

      const payload = {
        title:       form.title.trim(),
        message:     form.message.trim(),
        url:         form.url.trim() || null,
        documentUrl: documentUrl || null,
        isPublished: form.isPublished,
      };

      const method = editingItem ? "PATCH" : "POST";
      const url    = editingItem
        ? `/api/admin/notifications/${editingItem.id}`
        : `/api/admin/notifications`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed.");
      }

      closeModal();
      load(currentPage, search);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      load(currentPage, search);
    } catch {
      alert("Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublish = async (item: NotificationItem) => {
    setActionLoading(item.id + "-pub");
    try {
      await fetch(`/api/admin/notifications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      load(currentPage, search);
    } catch {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} notification{total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="fas fa-plus" /> New Notification
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-md">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a]"
          />
        </div>
        <button
          type="submit"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(""); setSearch(""); load(1, ""); }}
            className="text-gray-400 hover:text-gray-600 px-3"
          >
            <i className="fas fa-times" />
          </button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid md:grid-cols-[1fr_2fr_120px_100px_100px_120px_100px] bg-gray-50 border-b border-gray-100">
          {['Title', 'Message', 'URL', 'Document', 'Published', 'Created', 'Actions'].map(h => (
            <div key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_2fr_120px_100px_100px_120px_100px] border-b border-gray-50 animate-pulse p-4 gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-3 bg-gray-100 rounded w-3/4" />
              ))}
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <i className="fa-solid fa-bell-slash text-4xl mb-4 block opacity-30" />
            <p className="text-sm font-medium">No notifications yet. Create one above.</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="grid md:grid-cols-[1fr_2fr_120px_100px_100px_120px_100px] border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              <div className="px-4 py-4 text-sm font-semibold text-gray-800 flex items-center">
                {item.title}
              </div>
              <div className="px-4 py-4 text-sm text-gray-600 flex items-center">
                <span className="line-clamp-2">{item.message}</span>
              </div>
              <div className="px-4 py-4 flex items-center">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#1e3a8a] text-xs font-semibold hover:underline flex items-center gap-1">
                    <i className="fa-solid fa-link text-[10px]" /> Link
                  </a>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </div>
              <div className="px-4 py-4 flex items-center">
                {item.documentUrl ? (
                  <a href={item.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                    <i className="fa-solid fa-file-pdf" /> View
                  </a>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </div>
              <div className="px-4 py-4 flex items-center">
                <button
                  onClick={() => togglePublish(item)}
                  disabled={actionLoading === item.id + "-pub"}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    item.isPublished
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {item.isPublished ? 'Live' : 'Draft'}
                </button>
              </div>
              <div className="px-4 py-4 text-xs text-gray-400 flex items-center">
                {formatDate(item.createdAt)}
              </div>
              <div className="px-4 py-4 flex items-center gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <i className="fas fa-edit" /> Edit
                </button>
                <button
                  onClick={() => setConfirmDeleteId(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => load(currentPage - 1, search)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => load(currentPage + 1, search)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">
                {editingItem ? 'Edit Notification' : 'New Notification'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a]"
                  placeholder="Notification title..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a] resize-none"
                  placeholder="Full notification message..."
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Link URL <span className="text-gray-400 font-normal normal-case text-xs">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a]"
                  placeholder="https://..."
                />
              </div>

              {/* Document */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Document <span className="text-gray-400 font-normal normal-case text-xs">(optional — PDF, DOCX, etc.)</span>
                </label>
                <div className="space-y-3">
                  {/* Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-300 mb-1 block" />
                    <p className="text-xs text-gray-500">
                      {selectedFile ? selectedFile.name : 'Click to upload document'}
                    </p>
                    {uploadProgress && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">{uploadProgress}</p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setSelectedFile(f); setForm(prev => ({ ...prev, documentUrl: "" })); }
                    }}
                  />
                  {/* Or manual URL */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">or paste URL</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <input
                    type="url"
                    value={form.documentUrl}
                    onChange={e => { setForm(f => ({ ...f, documentUrl: e.target.value })); setSelectedFile(null); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1e3a8a]"
                    placeholder="https://...document.pdf"
                  />
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]" />
                </label>
                <span className="text-sm font-semibold text-gray-700">
                  {form.isPublished ? 'Published (live)' : 'Draft (hidden)'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {saving || uploading ? (
                  <><i className="fas fa-spinner fa-spin" /> {uploading ? 'Uploading...' : 'Saving...'}</>
                ) : (
                  <><i className="fas fa-check" /> {editingItem ? 'Update' : 'Create'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete Notification?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={!!actionLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {actionLoading ? <i className="fas fa-spinner fa-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
