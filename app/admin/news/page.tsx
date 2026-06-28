"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  location?: string;
  publishedAt?: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  imageUrl: "",
  location: "",
  publishedAt: "",
  isFeatured: false,
  isPublished: true,
};

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error("Cloudinary is not configured.");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [news, setNews]               = useState<NewsItem[]>([]);
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingItem, setEditingItem]     = useState<NewsItem | null>(null);
  const [form, setForm]                   = useState({ ...emptyForm });
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [saving, setSaving]               = useState(false);
  const [formError, setFormError]         = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState<string | null>(null);

  const cloudinaryConfigured = !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const load = useCallback(async (page = 1, q = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "10", page: String(page) });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/admin/news?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setNews(data.data ?? []);
      setTotal(data.meta?.total ?? data.data?.length ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
      setCurrentPage(page);
    } catch {
      setError("Failed to load news.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(1, search); }, [search, load]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setForm({
      title:       item.title,
      content:     item.content,
      excerpt:     item.excerpt ?? "",
      imageUrl:    item.imageUrl ?? "",
      location:    item.location ?? "",
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : "",
      isFeatured:  item.isFeatured,
      isPublished: item.isPublished,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setForm((f) => ({ ...f, imageUrl: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    let imageUrl = form.imageUrl.trim();

    if (selectedFile) {
      if (!cloudinaryConfigured) {
        setFormError("Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, or enter a URL manually.");
        return;
      }
      setUploading(true);
      setUploadProgress("Uploading image to Cloudinary…");
      try {
        imageUrl = await uploadToCloudinary(selectedFile);
        setUploadProgress("Upload complete.");
      } catch (err: any) {
        setFormError(err.message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title:       form.title.trim(),
        content:     form.content.trim(),
        excerpt:     form.excerpt.trim() || null,
        imageUrl:    imageUrl || null,
        location:    form.location.trim() || null,
        publishedAt: form.publishedAt ? `${form.publishedAt}T00:00:00.000Z` : null,
        isFeatured:  form.isFeatured,
        isPublished: form.isPublished,
      };

      const url    = editingItem ? `/api/admin/news/${editingItem.id}` : "/api/admin/news";
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save.");

      setIsModalOpen(false);
      load(currentPage, search);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    setActionLoading(item.id + ":toggle");
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setNews((prev) => prev.map((n) => n.id === item.id ? { ...n, isPublished: !item.isPublished } : n));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + ":delete");
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setConfirmDeleteId(null);
      const nextPage = news.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      load(nextPage, search);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-600 focus:bg-white transition-all";

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-800">News Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage news articles published on the public portal.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchInput(""); setSearch(""); }
                }}
                placeholder="Search news…"
                className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-blue-600 transition-all w-44"
              />
            </div>
            {(search || searchInput) && (
              <button
                type="button"
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                <i className="fas fa-times" />
              </button>
            )}
          </form>
          <button
            onClick={openAdd}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <i className="fas fa-plus" /> Add News
          </button>
        </div>
      </div>

      {!cloudinaryConfigured && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start gap-2">
          <i className="fas fa-exclamation-triangle mt-0.5 flex-shrink-0" />
          <span>
            <strong>Cloudinary not configured.</strong> Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in your <code>.env.local</code> to enable image uploads. You can still add news by entering an image URL directly.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* News list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" /> Loading…
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-newspaper text-4xl mb-3 block text-gray-200" />
            <p className="text-sm mb-3">
              {search ? "No news matching your search." : "No news articles yet."}
            </p>
            {!search && (
              <button onClick={openAdd} className="text-blue-600 text-sm font-semibold hover:underline">
                Add the first article
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                News · {total} article{total !== 1 ? "s" : ""}
                {search && (
                  <span className="ml-2 font-normal normal-case text-blue-600">
                    matching "{search}"
                  </span>
                )}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {news.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  {/* Thumbnail */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-newspaper text-gray-400 text-lg" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                        {item.excerpt && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {item.location && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <i className="fas fa-map-marker-alt text-[9px]" /> {item.location}
                            </span>
                          )}
                          {item.publishedAt && (
                            <span className="text-[11px] text-gray-400">
                              {formatDate(item.publishedAt)}
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-white flex items-center gap-1">
                              <i className="fas fa-star text-[8px]" /> Featured
                            </span>
                          )}
                          {item.isPublished ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.imageUrl && (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview image"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <i className="fas fa-image text-xs" />
                          </a>
                        )}
                        <button
                          onClick={() => handleTogglePublish(item)}
                          disabled={!!actionLoading}
                          title={item.isPublished ? "Unpublish" : "Publish"}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                            item.isPublished
                              ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {actionLoading === item.id + ":toggle"
                            ? <i className="fas fa-circle-notch fa-spin text-xs" />
                            : <i className={`fas ${item.isPublished ? "fa-eye-slash" : "fa-eye"} text-xs`} />}
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <i className="fas fa-pen text-xs" />
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] text-red-600 font-medium whitespace-nowrap">Delete?</span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={!!actionLoading}
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {actionLoading === item.id + ":delete"
                                ? <i className="fas fa-circle-notch fa-spin" />
                                : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-bold text-gray-400"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            disabled={!!actionLoading}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <i className="fas fa-trash-alt text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => load(currentPage - 1, search)}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-chevron-left mr-1 text-xs" /> Prev
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => load(currentPage + 1, search)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <i className="fas fa-chevron-right ml-1 text-xs" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto overflow-y-auto max-h-[calc(100vh-2rem)]">
            <div className="bg-blue-700 p-5 text-white flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold">
                {editingItem ? "Edit News Article" : "Add News Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0" /> {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chief Minister launches Youth Welfare Scheme"
                  className={inp}
                />
              </div>

              {/* Location + Published At */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Dehradun"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Published At
                  </label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className={inp}
                  />
                </div>
              </div>


              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full article body…"
                  rows={6}
                  className={inp + " resize-none"}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Image
                </label>

                {/* Current image thumbnail when editing */}
                {editingItem && form.imageUrl && !selectedFile && (
                  <div className="mb-2 flex items-center gap-2">
                    <img
                      src={form.imageUrl}
                      alt="Current"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                    <span className="text-xs text-gray-500">Current image</span>
                  </div>
                )}

                {cloudinaryConfigured ? (
                  <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <i
                        className={`fas ${
                          selectedFile ? "fa-check-circle text-green-500" : "fa-cloud-upload-alt text-gray-400"
                        } text-2xl`}
                      />
                      <span
                        className={`text-sm font-medium text-center ${
                          selectedFile ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        {selectedFile ? selectedFile.name : "Click to upload image"}
                      </span>
                      {selectedFile && (
                        <span className="text-xs text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                      {!selectedFile && (
                        <span className="text-xs text-gray-400">or paste a URL below</span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {uploadProgress && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <i className="fas fa-circle-notch fa-spin" /> {uploadProgress}
                      </p>
                    )}
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 border-t border-gray-200" />
                      <span className="text-xs text-gray-400">or enter URL manually</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm({ ...form, imageUrl: e.target.value });
                        if (e.target.value) setSelectedFile(null);
                      }}
                      placeholder="https://… image URL"
                      className={inp}
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://… image URL"
                      className={inp}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Configure Cloudinary env vars to enable direct image uploads.
                    </p>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-blue-700"
                  />
                  <span className="text-sm font-semibold text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-blue-700"
                  />
                  <span className="text-sm font-semibold text-gray-700">Publish immediately</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl border border-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-[2] py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {(saving || uploading) ? (
                    <><i className="fas fa-circle-notch fa-spin" /> {uploading ? "Uploading…" : "Saving…"}</>
                  ) : (
                    <><i className={editingItem ? "fas fa-save" : "fas fa-plus"} /> {editingItem ? "Save Changes" : "Add Article"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
