'use client';

import { useState } from 'react';
import { useDistricts, useBlocks } from '@/hooks/useInfrastructure';
import { useCurrentOfficer, useOfficerMangalDals, useDeleteMangalDal } from '@/hooks/useOfficer';
import MangalDalRegistrationForm from './MangalDalRegistrationForm';

function exportToCSV(dals: any[], filename: string) {
  const now = new Date();
  const headers = ['S.No', 'Dept. S.No', 'Village Name', 'Affiliation No', 'Chairperson', 'District', 'Block', 'Affiliation Date', 'Renewal Date', 'Status'];
  const rows = dals.map((d, i) => {
    const expired = d.renewalDate && new Date(d.renewalDate) < now;
    return [
      i + 1,
      d.serialNo ?? '',
      d.name,
      d.affiliationNo,
      d.chairperson,
      d.block?.district?.name ?? '',
      d.block?.name ?? '',
      d.affiliationDate ? new Date(d.affiliationDate).toLocaleDateString('en-IN') : '',
      d.renewalDate   ? new Date(d.renewalDate).toLocaleDateString('en-IN')   : '',
      expired ? 'Expired' : 'Active',
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

interface MangalDalPageProps {
  type: 'MAHILA' | 'YUVAK';
}

export default function MangalDalPage({ type }: MangalDalPageProps) {
  const { data: officer, isLoading: officerLoading } = useCurrentOfficer();
  const { districts } = useDistricts();

  const isDO = officer?.role === 'DO_PRD';

  const normDistrict = (s: string) => s.toLowerCase().replace(/[_\s]+/g, ' ').trim();
  const officerDistrictId = districts.find(
    (d) => officer && normDistrict(d.name) === normDistrict(officer.district)
  )?.id ?? '';

  const [filterDistrictId, setFilterDistrictId] = useState('');
  const [filterBlockId, setFilterBlockId] = useState('');
  const [filterExpired, setFilterExpired] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'date_desc' | 'date_asc'>('name_asc');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editItem, setEditItem] = useState<any | null>(null);

  const activeDistrictId = filterDistrictId || officerDistrictId || undefined;

  const { blocks } = useBlocks(activeDistrictId);

  const { data, isLoading, isError, error, refetch } = useOfficerMangalDals(
    type,
    activeDistrictId,
    filterBlockId || undefined,
    page,
    sortBy,
    filterExpired
  );

  const deleteMutation = useDeleteMangalDal();

  const dals = data?.data ?? [];
  const meta = data?.meta;

  const typeLabel = type === 'MAHILA' ? 'Mahila' : 'Yuvak';

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const resetPage = () => setPage(1);

  if (officerLoading) return <div className="p-6 text-gray-500 text-sm">Loading…</div>;
  if (!officer) return null;

  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => { setView('list'); setEditItem(null); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <i className="fas fa-arrow-left" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {view === 'edit' ? `Edit ${typeLabel} Mangal Dal` : `New ${typeLabel} Mangal Dal Registration`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details to register a dal</p>
          </div>
        </div>
        <MangalDalRegistrationForm
          type={type}
          mode={view}
          initialData={editItem ?? undefined}
          officer={officer}
          onSuccess={() => { setView('list'); setEditItem(null); refetch(); }}
          onCancel={() => { setView('list'); setEditItem(null); }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{typeLabel} Mangal Dal</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {officer.district}{officer.block ? ` › ${officer.block}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportToCSV(dals, `${typeLabel}_Mangal_Dal.csv`)}
            disabled={dals.length === 0}
            className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-file-excel" /> Export Excel
          </button>
          <button
            onClick={() => setView('create')}
            className="bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus" />
            New {typeLabel} Mangal Dal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center shadow-sm">
        {isDO && (
          <select
            value={filterDistrictId}
            onChange={(e) => { setFilterDistrictId(e.target.value); setFilterBlockId(''); resetPage(); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] bg-white"
          >
            <option value="">— My District ({officer.district}) —</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <select
          value={filterBlockId}
          onChange={(e) => { setFilterBlockId(e.target.value); resetPage(); }}
          disabled={isLoading || blocks.length === 0}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] bg-white disabled:opacity-50"
        >
          <option value="">{blocks.length > 0 ? 'All Blocks' : 'No Blocks'}</option>
          {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select
          value={filterExpired}
          onChange={(e) => { setFilterExpired(e.target.value as any); resetPage(); }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as any); resetPage(); }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] bg-white"
        >
          <option value="name_asc">Sort: Name A–Z</option>
          <option value="name_desc">Sort: Name Z–A</option>
          <option value="date_desc">Sort: Newest first</option>
          <option value="date_asc">Sort: Oldest first</option>
        </select>
        {(filterDistrictId || filterBlockId || filterExpired !== 'all' || sortBy !== 'name_asc') && (
          <button
            onClick={() => { setFilterDistrictId(''); setFilterBlockId(''); setFilterExpired('all'); setSortBy('name_asc'); resetPage(); }}
            className="text-sm text-gray-400 hover:text-blue-600 font-medium"
          >
            Clear
          </button>
        )}
        {meta && (
          <span className="text-xs text-gray-400 ml-auto">{meta.total} records</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
            <p className="text-sm">Loading Mangal Dals…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500 text-sm mb-3">{(error as Error).message}</p>
            <button onClick={() => refetch()} className="text-xs text-blue-600 hover:underline">Try again</button>
          </div>
        ) : dals.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fas fa-users text-3xl mb-3 text-gray-200" />
            <p className="text-sm font-medium">No {typeLabel} Mangal Dals found.</p>
            <button onClick={() => setView('create')} className="mt-4 text-sm text-blue-600 hover:underline">
              + Register the first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Dept. S.No</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Village Name</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Affiliation No</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Chairperson</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Block</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dals.map((dal: any, idx: number) => {
                  const expired = dal.renewalDate && new Date(dal.renewalDate) < new Date();
                  return (
                  <tr key={dal.id} className={`hover:bg-gray-50 transition-colors ${expired ? 'bg-red-50/40' : ''}`}>
                    <td className="px-6 py-4 text-gray-600 font-mono text-[12px]">{(page - 1) * 50 + idx + 1}</td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-[12px]">{dal.serialNo ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {dal.name}
                      {expired && <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Expired</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-[12px]">{dal.affiliationNo}</td>
                    <td className="px-6 py-4 text-gray-600">{dal.chairperson}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium uppercase">
                        {dal.block?.district?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {dal.block?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => { setEditItem(dal); setView('edit'); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dal.id, dal.name)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[13px] text-gray-500 px-1">
          <p>
            Page <span className="font-semibold text-gray-700">{meta.page}</span> of{' '}
            <span className="font-semibold text-gray-700">{meta.totalPages}</span> (
            <span className="font-semibold text-gray-700">{meta.total}</span> total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-4 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 font-medium bg-white"
            >
              Previous
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-4 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 font-medium bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
