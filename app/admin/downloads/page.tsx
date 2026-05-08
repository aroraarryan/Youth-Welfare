"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type DocumentCategory = "FORMS" | "CIRCULARS" | "SCHEME_GUIDELINES" | "REPORTS";
type FileType = "PDF" | "DOCX" | "XLSX" | "OTHER";

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  fileType: FileType;
  fileUrl: string;
  pages: number | null;
  isPublished: boolean;
  uploadedAt: string;
}

const CATEGORIES: { key: DocumentCategory; label: string }[] = [
  { key: "FORMS",             label: "Forms" },
  { key: "CIRCULARS",         label: "Circular / GO" },
  { key: "SCHEME_GUIDELINES", label: "Scheme Guidelines" },
  { key: "REPORTS",           label: "Reports" },
];

const FILE_TYPES: { key: FileType; label: string; accept: string }[] = [
  { key: "PDF",   label: "PDF",        accept: ".pdf,application/pdf" },
  { key: "DOCX",  label: "Word (DOCX)", accept: ".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { key: "XLSX",  label: "Excel (XLSX)", accept: ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { key: "OTHER", label: "Other",      accept: "*" },
];

const FILE_ICON: Record<FileType, string> = {
  PDF:   "fa-file-pdf text-red-500",
  DOCX:  "fa-file-word text-blue-500",
  XLSX:  "fa-file-excel text-green-600",
  OTHER: "fa-file text-gray-500",
};

const emptyForm = {
  title: "",
  category: "FORMS" as DocumentCategory,
  fileType: "PDF" as FileType,
  fileUrl: "",
  description: "",
  pages: "",
  isPublished: true,
};

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error("Cloudinary is not configured.");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);

  // Use 'raw' resource type for non-image files (PDFs, DOCX, XLSX)
  const resourceType = file.type.startsWith("image/") ? "image" : "raw";
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }
  return data.secure_url as string;
}

export default function AdminDownloadsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("FORMS");
  const [documents, setDocuments]  = useState<Document[]>([]);
  const [total, setTotal]          = useState(0);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc]   = useState<Document | null>(null);
  const [form, setForm]               = useState({ ...emptyForm });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading]     = useState<string | null>(null);

  const cloudinaryConfigured = !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const load = useCallback(async (cat: DocumentCategory) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/documents?category=${cat}&limit=50`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setDocuments(data.data ?? []);
      setTotal(data.meta?.total ?? data.data?.length ?? 0);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(activeCategory); }, [activeCategory, load]);

  const openAdd = () => {
    setEditingDoc(null);
    setForm({ ...emptyForm, category: activeCategory });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setForm({
      title:       doc.title,
      category:    doc.category,
      fileType:    doc.fileType,
      fileUrl:     doc.fileUrl,
      description: doc.description ?? "",
      pages:       doc.pages != null ? String(doc.pages) : "",
      isPublished: doc.isPublished,
    });
    setSelectedFile(null);
    setUploadProgress("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setForm((f) => ({ ...f, fileUrl: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    let fileUrl = form.fileUrl.trim();

    // If a file was selected, upload it first
    if (selectedFile) {
      if (!cloudinaryConfigured) {
        setFormError("Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, or enter a URL manually.");
        return;
      }
      setUploading(true);
      setUploadProgress("Uploading to Cloudinary…");
      try {
        fileUrl = await uploadToCloudinary(selectedFile);
        setUploadProgress("Upload complete.");
      } catch (err: any) {
        setFormError(err.message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!fileUrl) {
      setFormError("Please upload a file or enter a URL.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title:       form.title.trim(),
        category:    form.category,
        fileType:    form.fileType,
        fileUrl,
        description: form.description.trim() || null,
        pages:       form.pages ? parseInt(form.pages, 10) : null,
        isPublished: form.isPublished,
      };

      const url    = editingDoc ? `/api/admin/documents/${editingDoc.id}` : "/api/admin/documents";
      const method = editingDoc ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save.");

      setIsModalOpen(false);
      load(activeCategory);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (doc: Document) => {
    setActionLoading(doc.id + ":toggle");
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, isPublished: !doc.isPublished } : d));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + ":delete");
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const currentAccept = FILE_TYPES.find((f) => f.key === form.fileType)?.accept ?? "*";
  const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-600 focus:bg-white transition-all";

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Downloads Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage documents available for public download.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
        >
          <i className="fas fa-plus" /> Add Document
        </button>
      </div>

      {!cloudinaryConfigured && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start gap-2">
          <i className="fas fa-exclamation-triangle mt-0.5 flex-shrink-0" />
          <span>
            <strong>Cloudinary not configured.</strong> Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in your <code>.env.local</code> to enable file uploads. You can still add documents by entering a direct URL.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><i className="fas fa-times" /></button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeCategory === cat.key ? "bg-blue-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" /> Loading…
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-file-download text-4xl mb-3 block text-gray-200" />
            <p className="text-sm mb-3">No documents in this category.</p>
            <button onClick={openAdd} className="text-blue-600 text-sm font-semibold hover:underline">Add the first document</button>
          </div>
        ) : (
          <div>
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {CATEGORIES.find((c) => c.key === activeCategory)?.label} · {total} document{total !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${FILE_ICON[doc.fileType]} text-lg`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                        {doc.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{doc.fileType}</span>
                          {doc.pages && <span className="text-[11px] text-gray-400">{doc.pages} pages</span>}
                          <span className="text-[11px] text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {doc.isPublished ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Draft</span>
                          )}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="Preview"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <i className="fas fa-external-link-alt text-xs" />
                        </a>
                        <button onClick={() => handleTogglePublish(doc)} disabled={!!actionLoading} title={doc.isPublished ? "Unpublish" : "Publish"}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${doc.isPublished ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600" : "text-gray-400 hover:bg-green-50 hover:text-green-600"}`}>
                          {actionLoading === doc.id + ":toggle"
                            ? <i className="fas fa-circle-notch fa-spin text-xs" />
                            : <i className={`fas ${doc.isPublished ? "fa-eye-slash" : "fa-eye"} text-xs`} />}
                        </button>
                        <button onClick={() => openEdit(doc)} title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <i className="fas fa-pen text-xs" />
                        </button>
                        {confirmDeleteId === doc.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] text-red-600 font-medium whitespace-nowrap">Delete?</span>
                            <button onClick={() => handleDelete(doc.id)} disabled={!!actionLoading}
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                              {actionLoading === doc.id + ":delete" ? <i className="fas fa-circle-notch fa-spin" /> : "Yes"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-gray-400">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(doc.id)} disabled={!!actionLoading} title="Delete"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                            <i className="fas fa-trash-alt text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
            <div className="bg-blue-700 p-5 text-white flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold">{editingDoc ? "Edit Document" : "Add New Document"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center">
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0" /> {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Document Title <span className="text-red-500">*</span></label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Report 2025" className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
                    className={inp + " appearance-none cursor-pointer"}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">File Type <span className="text-red-500">*</span></label>
                  <select required value={form.fileType}
                    onChange={(e) => { setForm({ ...form, fileType: e.target.value as FileType }); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className={inp + " appearance-none cursor-pointer"}>
                    {FILE_TYPES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              {/* File upload section */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  File <span className="text-red-500">*</span>
                </label>
                {cloudinaryConfigured ? (
                  <div>
                    {/* Cloudinary upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <i className={`fas ${selectedFile ? "fa-check-circle text-green-500" : "fa-cloud-upload-alt text-gray-400"} text-2xl`} />
                      <span className={`text-sm font-medium text-center ${selectedFile ? "text-green-700" : "text-gray-500"}`}>
                        {selectedFile ? selectedFile.name : `Click to upload ${form.fileType} file`}
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
                    <input ref={fileInputRef} type="file" accept={currentAccept} onChange={handleFileSelect} className="hidden" />
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
                    <input type="url" value={form.fileUrl}
                      onChange={(e) => { setForm({ ...form, fileUrl: e.target.value }); if (e.target.value) setSelectedFile(null); }}
                      placeholder="https://... (overrides file upload if both are set)"
                      className={inp} />
                  </div>
                ) : (
                  <div>
                    <input type="url" required value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                      placeholder="https://drive.google.com/... or any direct download link" className={inp} />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Configure Cloudinary env vars to enable direct file uploads. For now, paste a Google Drive, Dropbox, or any public URL.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional brief description…" rows={2} className={inp + " resize-none"} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Pages</label>
                  <input type="number" min={1} value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    placeholder="e.g. 12" className={inp} />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-blue-700" />
                    <span className="text-sm font-semibold text-gray-700">Publish immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl border border-gray-200 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-[2] py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {(saving || uploading) ? (
                    <><i className="fas fa-circle-notch fa-spin" /> {uploading ? "Uploading…" : "Saving…"}</>
                  ) : (
                    <><i className={editingDoc ? "fas fa-save" : "fas fa-plus"} /> {editingDoc ? "Save Changes" : "Add Document"}</>
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
