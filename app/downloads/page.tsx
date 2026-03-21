'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCategory } from '@/lib/api/documents';

const categories: { key: DocumentCategory; label: string }[] = [
  { key: 'FORMS',             label: 'Forms' },
  { key: 'CIRCULARS',         label: 'Circulars' },
  { key: 'SCHEME_GUIDELINES', label: 'Scheme Guidelines' },
  { key: 'REPORTS',           label: 'Reports' },
];


export default function DownloadsPage() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('FORMS');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce on search input
  let debounceTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const { documents, meta, loading, error, page, setPage } =
    useDocuments(activeCategory, debouncedSearch);

  const handleCategoryChange = (key: DocumentCategory) => {
    setActiveCategory(key);
    setSearch('');
    setDebouncedSearch('');
    clearTimeout(debounceTimer);
  };

  return (
    <>
      <PageHero
        hindiTitle="डाउनलोड"
        title="Downloads — Youth Welfare & PRD Department"
        subtitle="Access official forms, circulars, scheme documents & reports · Department of Youth Welfare and PRD, Uttarakhand"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Downloads' }]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: `${meta?.total ?? '—'}`, label: 'Documents' },
          { value: '2026', label: 'Edition' },
        ]}
      />

      <main className="max-w-[1200px] mx-auto px-5 py-12">
        {/* Category selector */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-5 py-2.5 border-2 rounded-lg text-base font-medium cursor-pointer transition-all ${
                activeCategory === cat.key
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                  : 'bg-white text-[#333] border-[#e1e8ed] hover:bg-[#f8f9fa] hover:border-[#cbd5e1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-[500px]">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full pl-11 pr-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        )}

        {/* Documents table */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">#</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Document Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Size</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#9ca3af] text-sm">
                    <i className="fas fa-spinner fa-spin mr-2" />Loading documents…
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#9ca3af] text-sm">
                    {debouncedSearch
                      ? `No documents found for "${debouncedSearch}"`
                      : 'No documents available in this category.'}
                  </td>
                </tr>
              ) : (
                documents.map((doc, i) => {
                  const displayDate = new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  const fileIcon = doc.fileType === 'PDF' ? 'fa-file-pdf'
                    : doc.fileType === 'DOCX' ? 'fa-file-word'
                    : doc.fileType === 'XLSX' ? 'fa-file-excel'
                    : 'fa-file';
                  return (
                    <tr key={doc.id} className="border-b border-[#f0f0f0] hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#fee2e2] rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className={`fas ${fileIcon} text-red-600 text-sm`} />
                          </div>
                          <span className="text-sm font-medium text-[#1e293b]">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{displayDate}</td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{doc.pages ? `${doc.pages} pg` : '—'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#dbeafe] text-[#1e40af] text-xs font-semibold px-2.5 py-1 rounded-full">
                          {doc.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#1e3a8a] text-sm font-medium hover:text-[#1e40af] transition-colors"
                        >
                          <i className="fas fa-download" /> Download
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#374151] disabled:opacity-40 hover:bg-[#f8fafc] transition-colors"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <span className="text-sm text-[#6b7280]">Page {page} of {meta.totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= meta.totalPages}
              className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#374151] disabled:opacity-40 hover:bg-[#f8fafc] transition-colors"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
