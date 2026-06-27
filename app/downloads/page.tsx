'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCategory } from '@/lib/api/documents';


const categories: { key: DocumentCategory; label: string }[] = [
  { key: 'CIRCULARS',         label: 'Circular/GO' },
  { key: 'SCHEME_GUIDELINES', label: 'Scheme Guidelines' },
  { key: 'FORMS',             label: 'Forms' },
  { key: 'REPORTS',           label: 'Reports/Info' },
];


function toDownloadUrl(url: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
  }
  return url;
}

function toViewUrl(url: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
}

export default function DownloadsPage() {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('CIRCULARS');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  let debounceTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const { documents, meta, loading, error, page, setPage } =
    useDocuments(activeCategory, debouncedSearch, selectedYear, selectedMonth, 'DOWNLOADS');

  const handleCategoryChange = (key: DocumentCategory) => {
    setActiveCategory(key);
    setSearch('');
    setDebouncedSearch('');
    clearTimeout(debounceTimer);
  };

  const handleYearChange = (val: string) => {
    const yr = val ? parseInt(val, 10) : undefined;
    setSelectedYear(yr);
    if (!yr) setSelectedMonth(undefined);
  };

  return (
    <>
      <PageHero
        hindiTitle="डाउनलोड"
        title="Downloads — Youth Welfare & PRD Department"
        subtitle="Access official forms, circular/GO, scheme documents & reports · Department of Youth Welfare and PRD, Uttarakhand"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Downloads' }]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: `${meta?.total ?? '—'}`, label: 'Documents' },
          { value: '2026', label: 'Edition' },
        ]}
      />

      <main className="max-w-[1200px] mx-auto px-5 py-12">
        {/* Category selector */}
        <div className="flex gap-3 mb-8 justify-start sm:justify-center overflow-x-auto no-scrollbar pb-2 sm:pb-0 sm:flex-wrap px-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 border-2 rounded-lg text-sm sm:text-base font-medium cursor-pointer transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                  : 'bg-white text-[#333] border-[#e1e8ed] hover:bg-[#f8f9fa] hover:border-[#cbd5e1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center gap-3">
          <div className="relative w-full sm:flex-1 sm:max-w-[500px]">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full pl-11 pr-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedYear ?? ''}
              onChange={e => handleYearChange(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors bg-white sm:min-w-[120px]"
            >
              <option value="">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={selectedMonth ?? ''}
              onChange={e => setSelectedMonth(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              disabled={!selectedYear}
              className="flex-1 sm:flex-none px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors bg-white sm:min-w-[130px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">All Months</option>
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">

          {/* Mobile card list */}
          <div className="block md:hidden">
            {loading ? (
              <div className="text-center py-10 text-[#9ca3af] text-sm">
                <i className="fas fa-spinner fa-spin mr-2" />Loading documents…
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10 text-[#9ca3af] text-sm">
                {debouncedSearch
                  ? `No documents found for "${debouncedSearch}"`
                  : 'No documents available in this category.'}
              </div>
            ) : (
              <div className="divide-y divide-[#f0f0f0]">
                {documents.map((doc, i) => {
                  const displayDate = new Date(doc.documentDate ?? doc.uploadedAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  const fileIcon = doc.fileType === 'PDF' ? 'fa-file-pdf'
                    : doc.fileType === 'DOCX' ? 'fa-file-word'
                    : doc.fileType === 'XLSX' ? 'fa-file-excel'
                    : 'fa-file';
                  return (
                    <div key={doc.id} className="px-4 py-4 flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#fee2e2] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className={`fas ${fileIcon} text-red-600 text-sm`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e293b] leading-snug">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-[#6b7280]">{displayDate}</span>
                          {doc.pages && <span className="text-xs text-[#6b7280]">{doc.pages} pg</span>}
                          <span className="bg-[#dbeafe] text-[#1e40af] text-[10px] font-semibold px-2 py-0.5 rounded-full">{doc.fileType}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-1">
                        <a
                          href={toViewUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#374151] text-xs font-semibold flex items-center gap-1"
                        >
                          <i className="fas fa-eye text-xs" /> View
                        </a>
                        <a
                          href={toDownloadUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e3a8a] text-xs font-semibold flex items-center gap-1"
                        >
                          <i className="fas fa-download text-xs" /> Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Document Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#374151] border-b border-[#e2e8f0]">Pages</th>
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
                    const displayDate = new Date(doc.documentDate ?? doc.uploadedAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    });
                    const fileIcon = doc.fileType === 'PDF' ? 'fa-file-pdf'
                      : doc.fileType === 'DOCX' ? 'fa-file-word'
                      : doc.fileType === 'XLSX' ? 'fa-file-excel'
                      : 'fa-file';
                    return (
                      <tr key={doc.id} className="border-b border-[#f0f0f0] hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#6b7280]">{(page - 1) * 10 + i + 1}</td>
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
                          <div className="flex items-center gap-3">
                            <a
                              href={toViewUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[#374151] text-sm font-medium hover:text-[#1e3a8a] transition-colors"
                            >
                              <i className="fas fa-eye" /> View
                            </a>
                            <a
                              href={toDownloadUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[#1e3a8a] text-sm font-medium hover:text-[#1e40af] transition-colors"
                            >
                              <i className="fas fa-download" /> Download
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
