'use client';

import { useState } from 'react';
import { useDistricts } from '@/hooks/useInfrastructure';
import { useOfficerInfra, useDeleteInfra } from '@/hooks/useOfficer';
import { useCurrentOfficer } from '@/hooks/useOfficer';
import { InfraType, InfrastructureItem } from '@/lib/api/officerApi';
import InfrastructureForm from './InfrastructureForm';

interface InfrastructurePageProps {
  type: InfraType;
  title: string;
  newLabel: string;
  icon: string;
}

export default function InfrastructurePage({
  type,
  title,
  newLabel,
  icon,
}: InfrastructurePageProps) {
  const { data: officer, isLoading: officerLoading } = useCurrentOfficer();
  const { districts } = useDistricts();

  const isDO = officer?.role === 'DO_PRD';

  // Normalize underscores/extra spaces before matching officer.district → District record
  const normDistrict = (s: string) => s.toLowerCase().replace(/[_\s]+/g, ' ').trim();
  const officerDistrictId = districts.find(
    (d) => officer && normDistrict(d.name) === normDistrict(officer.district)
  )?.id ?? '';

  const [filterDistrictId, setFilterDistrictId] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editItem, setEditItem] = useState<InfrastructureItem | null>(null);
  const [page, setPage] = useState(1);

  // Use officer's district as default scope unless overridden by filter
  const activeDistrictId = filterDistrictId || officerDistrictId || undefined;

  const { data, isLoading, isError, error, refetch } = useOfficerInfra(
    type,
    activeDistrictId,
    page
  );

  const deleteMutation = useDeleteInfra(type);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  if (officerLoading) {
    return <div className="p-6 text-gray-500 text-sm">Loading…</div>;
  }
  if (!officer) return null;

  const items = data?.data ?? [];
  const meta = data?.meta;

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
              {view === 'edit' ? `Edit ${title}` : `Register New ${title}`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {view === 'edit' ? 'Update existing record' : 'Define facility details and save'}
            </p>
          </div>
        </div>
        <InfrastructureForm
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
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className={`${icon} text-teal-600`} />
            {title}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {officer.district}{officer.block ? ` › ${officer.block}` : ''}
          </p>
        </div>
        <button
          onClick={() => setView('create')}
          className="bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <i className="fas fa-plus" />
          {newLabel}
        </button>
      </div>

      {/* District filter for DO_PRD (they can switch view) */}
      {isDO && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center shadow-sm">
          <label className="text-xs font-semibold text-gray-500 uppercase">Filter by District:</label>
          <select
            value={filterDistrictId}
            onChange={(e) => { setFilterDistrictId(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] bg-white"
          >
            <option value="">— My District ({officer.district}) —</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {filterDistrictId && (
            <button
              onClick={() => setFilterDistrictId('')}
              className="text-sm text-gray-400 hover:text-blue-600 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
            <p className="text-sm">Loading {title.toLowerCase()}…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500 text-sm mb-3">{(error as Error).message}</p>
            <button onClick={() => refetch()} className="text-xs text-blue-600 hover:underline">
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className={`${icon} text-3xl mb-3 text-gray-200`} />
            <p className="text-sm font-medium">No {title.toLowerCase()} found.</p>
            <button
              onClick={() => setView('create')}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              + Register the first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">POC</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium max-w-[200px] truncate">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-[13px]">{item.location || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-[13px]">
                      {item.pocName || '—'}
                      {item.pocPhone && <span className="block text-[11px] text-gray-400">{item.pocPhone}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium uppercase">
                        {item.district.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        item.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => { setEditItem(item); setView('edit'); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 font-medium bg-white">Previous</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-1.5 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 font-medium bg-white">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
