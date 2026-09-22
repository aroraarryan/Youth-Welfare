"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/api/uploads";
import ImageLightbox from "@/components/ImageLightbox";

type MediaType = "IMAGE" | "DOCUMENT";
type FileType = "PDF" | "DOCX" | "XLSX" | "OTHER";

interface Media {
  id: string;
  mediaType: MediaType;
  fileType: FileType | null;
  title: string | null;
  description: string | null;
  fileUrl: string;
  createdAt: string;
}

const TABS: { key: "ALL" | MediaType; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "IMAGE", label: "Images" },
  { key: "DOCUMENT", label: "Documents" },
];

const FILE_ICON: Record<FileType, string> = {
  PDF: "fa-file-pdf text-red-500",
  DOCX: "fa-file-word text-blue-500",
  XLSX: "fa-file-excel text-green-600",
  OTHER: "fa-file text-gray-500",
};

const extToFileType = (name: string): FileType => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "DOCX";
  if (ext === "xls" || ext === "xlsx") return "XLSX";
  return "OTHER";
};

const MAX_IMAGE_MB = 10;
const MAX_DOC_MB = 25;

export default function AdminCmTrophyMediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"ALL" | MediaType>("ALL");
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<MediaType>("IMAGE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [formError, setFormError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const load = useCallback(async (t: "ALL" | MediaType) => {
    setLoading(true);
    setError(null);
    try {
      const params = t !== "ALL" ? `?mediaType=${t}` : "";
      const res = await fetch(`/api/admin/cm-trophy/media${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setItems(data.data ?? []);
    } catch {
      setError("Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(tab); }, [tab, load]);

  const openUpload = () => {
    setUploadType("IMAGE");
    setTitle("");
    setDescription("");
    setSelectedFiles([]);
    setFormError("");
    setUploadProgress("");
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files ?? []));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (selectedFiles.length === 0) { setFormError("Please choose at least one file."); return; }

    const maxMb = uploadType === "IMAGE" ? MAX_IMAGE_MB : MAX_DOC_MB;
    const oversized = selectedFiles.find((f) => f.size > maxMb * 1024 * 1024);
    if (oversized) {
      setFormError(`"${oversized.name}" is too large. Max ${maxMb}MB.`);
      return;
    }

    setUploading(true);
    try {
      // Sequential so failures point at the specific file and progress reads clearly.
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(selectedFiles.length > 1 ? `Uploading ${i + 1} of ${selectedFiles.length}…` : "Uploading…");

        const url = await uploadFile(file, {
          folder: "cm-trophy-media",
          resourceType: uploadType === "IMAGE" ? "image" : "raw",
        });
        if (!url) throw new Error(`Failed to upload "${file.name}".`);

        const payload: Record<string, any> = {
          mediaType: uploadType,
          title: (selectedFiles.length > 1 ? "" : title.trim()) || null,
          description: description.trim() || null,
          fileUrl: url,
        };
        if (uploadType === "DOCUMENT") payload.fileType = extToFileType(file.name);

        const res = await fetch("/api/admin/cm-trophy/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed to save "${file.name}".`);
      }

      setIsModalOpen(false);
      load(tab);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/cm-trophy/media/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      setItems((prev) => prev.filter((m) => m.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const images = items.filter((m) => m.mediaType === "IMAGE");
  const inp = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-600 focus:bg-white transition-all";

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-800">CM Trophy Media</h2>
          <p className="text-sm text-gray-500 mt-0.5">Upload and manage images and documents for CM Trophy. Admin-only.</p>
        </div>
        <button
          onClick={openUpload}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
        >
          <i className="fas fa-upload" /> Upload
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><i className="fas fa-times" /></button>
        </div>
      )}

      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? "bg-blue-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-photo-film text-4xl mb-3 block text-gray-200" />
            <p className="text-sm mb-3">No media uploaded yet.</p>
            <button onClick={openUpload} className="text-blue-600 text-sm font-semibold hover:underline">Upload the first file</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((m) => (
              <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {m.mediaType === "IMAGE" ? (
                  <button
                    onClick={() => setLightboxIndex(images.findIndex((im) => im.id === m.id))}
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200"
                  >
                    <img src={m.fileUrl} alt={m.title ?? "image"} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${FILE_ICON[m.fileType ?? "OTHER"]} text-lg`} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.title || "Untitled"}</p>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{m.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {m.mediaType === "IMAGE" ? "Image" : m.fileType}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(m.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a href={m.fileUrl} download target="_blank" rel="noopener noreferrer" title="Download"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i className="fas fa-download text-xs" />
                  </a>
                  {confirmDeleteId === m.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-red-600 font-medium whitespace-nowrap">Delete?</span>
                      <button onClick={() => handleDelete(m.id)} disabled={!!actionLoading}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                        {actionLoading === m.id ? <i className="fas fa-circle-notch fa-spin" /> : "Yes"}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] font-bold text-gray-400">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(m.id)} disabled={!!actionLoading} title="Delete"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                      <i className="fas fa-trash-alt text-xs" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images.map((im) => im.fileUrl)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
            <div className="bg-blue-700 p-5 text-white flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold">Upload Media</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center">
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0" /> {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Type</label>
                <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
                  {(["IMAGE", "DOCUMENT"] as MediaType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setUploadType(t); setSelectedFiles([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className={`flex-1 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                        uploadType === t ? "bg-blue-700 text-white shadow-sm" : "text-gray-600 hover:bg-white"
                      }`}
                    >
                      {t === "IMAGE" ? "Image" : "Document"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Files <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedFiles.length > 0 ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <i className={`fas ${selectedFiles.length > 0 ? "fa-check-circle text-green-500" : "fa-cloud-upload-alt text-gray-400"} text-2xl`} />
                  <span className={`text-sm font-medium text-center ${selectedFiles.length > 0 ? "text-green-700" : "text-gray-500"}`}>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""} selected`
                      : `Click to choose ${uploadType === "IMAGE" ? "images" : "documents"}`}
                  </span>
                  {selectedFiles.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={uploadType === "IMAGE" ? "image/*" : ".pdf,.doc,.docx,.xlsx"}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFiles.length > 1 && (
                  <ul className="mt-2 max-h-24 overflow-y-auto text-xs text-gray-500 space-y-0.5">
                    {selectedFiles.map((f, i) => <li key={i} className="truncate">{f.name}</li>)}
                  </ul>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  Max {uploadType === "IMAGE" ? MAX_IMAGE_MB : MAX_DOC_MB}MB per file. Select multiple to upload at once.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Title {selectedFiles.length > 1 && <span className="normal-case font-normal text-gray-400">(ignored for multiple files)</span>}
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={selectedFiles.length > 1}
                  placeholder="e.g. Opening Ceremony Photo" className={inp + " disabled:opacity-50"} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief description…" rows={2} className={inp + " resize-none"} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl border border-gray-200 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-[2] py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {uploading ? (
                    <><i className="fas fa-circle-notch fa-spin" /> {uploadProgress || "Uploading…"}</>
                  ) : (
                    <><i className="fas fa-upload" /> Upload{selectedFiles.length > 1 ? ` ${selectedFiles.length} files` : ""}</>
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
