'use client';

import { useState } from 'react';
import {
  useAllGallery,
  useApproveGallery,
  useRejectGallery,
  useUpdateGallery,
  useDeleteGallery,
  useCurrentOfficer,
} from '@/hooks/useOfficer';

type StatusFilter = 'PENDING' | 'DO_APPROVED' | 'REJECTED' | '';

export default function OfficerGalleryPage() {
  const { data: officer } = useCurrentOfficer();
  const isBO = officer?.role === 'BO_PRD';
  const isDO = officer?.role === 'DO_PRD';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [editDesc, setEditDesc]             = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useAllGallery(statusFilter || undefined);
  const approve = useApproveGallery();
  const reject  = useRejectGallery();
  const update  = useUpdateGallery();
  const del     = useDeleteGallery();

  const items = data?.data ?? [];

  const startEdit = (item: any) => { setEditingId(item.id); setEditDesc(item.description); };
  const saveEdit  = (id: string) => update.mutate({ id, data: { description: editDesc } }, { onSuccess: () => setEditingId(null) });
  const confirmDelete = (id: string) => del.mutate(id, { onSuccess: () => setConfirmDeleteId(null) });

  const statusBadge = (status: string) => {
    const style: Record<string, string> = {
      PENDING:     'bg-amber-100 text-amber-700',
      DO_APPROVED: 'bg-blue-100 text-blue-700',
      APPROVED:    'bg-green-100 text-green-700',
      REJECTED:    'bg-red-100 text-red-600',
    };
    const label: Record<string, string> = {
      PENDING:     'Pending Review',
      DO_APPROVED: 'Sent for Final Approval',
      APPROVED:    'Published',
      REJECTED:    'Rejected',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${style[status] ?? 'bg-gray-100 text-gray-500'}`}>
        {label[status] ?? status}
      </span>
    );
  };

  const tabs: { label: string; value: StatusFilter }[] = isBO
    ? [
        { label: 'Pending Review',        value: 'PENDING'     },
        { label: 'Sent for Admin Approval', value: 'DO_APPROVED' },
        { label: 'Rejected',              value: 'REJECTED'    },
      ]
    : [
        { label: 'All',      value: ''          },
        { label: 'Pending',  value: 'PENDING'   },
        { label: 'Approved', value: 'DO_APPROVED' },
        { label: 'Rejected', value: 'REJECTED'  },
      ];

  // DO_PRD has no gallery review role
  if (isDO) {
    return (
      <div className="p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Gallery Management</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3 text-sm text-blue-800">
          <i className="fas fa-info-circle mt-0.5 text-blue-500 flex-shrink-0 text-lg" />
          <div>
            <p className="font-semibold">Gallery review is handled by Block Officers.</p>
            <p className="mt-1 text-blue-700">Block Officers review submissions from their specific block and forward approved entries to the Admin for final publication.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Gallery Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isBO
            ? 'Review gallery submissions from your block. Approved entries go to Admin for final publication.'
            : 'View and manage gallery submissions.'}
        </p>
      </div>

      {isBO && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3 text-sm text-blue-800">
          <i className="fas fa-info-circle mt-0.5 text-blue-500 flex-shrink-0" />
          <span>Step 1 of 2 — You review submissions from your block. After your approval, the Admin publishes them to the public gallery.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-images text-3xl mb-2 text-gray-200 block" />
            No submissions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(items as any[]).map((item) => (
              <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4 items-start">
                  {/* Thumbnails */}
                  <div className="flex gap-2 flex-shrink-0">
                    {item.mediaUrls?.slice(0, 3).map((url: string, i: number) => (
                      <div key={i} className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 2 && item.mediaUrls.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                            +{item.mediaUrls.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!item.mediaUrls || item.mediaUrls.length === 0) && (
                      <div className="w-20 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
                        <i className="fas fa-image text-xl" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{item.fullName}</span>
                        {statusBadge(item.status)}
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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

                    {/* Description */}
                    {editingId === item.id ? (
                      <div className="space-y-2 mb-3">
                        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(item.id)} disabled={update.isPending}
                            className="px-3 py-1.5 bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-teal-800 disabled:opacity-50 flex items-center gap-1.5">
                            {update.isPending ? <i className="fas fa-circle-notch fa-spin" /> : <i className="fas fa-save" />} Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                    )}

                    {/* Actions */}
                    {editingId !== item.id && (
                      <div className="flex flex-wrap gap-2">
                        {/* BO_PRD: can approve PENDING → DO_APPROVED (then admin publishes) */}
                        {isBO && item.status === 'PENDING' && (
                          <button onClick={() => approve.mutate({ id: item.id })} disabled={approve.isPending}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
                            <i className="fas fa-check" /> Send for Admin Approval
                          </button>
                        )}
                        {isBO && item.status === 'PENDING' && (
                          <button onClick={() => reject.mutate({ id: item.id })} disabled={reject.isPending}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1.5">
                            <i className="fas fa-times" /> Reject
                          </button>
                        )}
                        <button onClick={() => startEdit(item)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 flex items-center gap-1.5">
                          <i className="fas fa-pen" /> Edit
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                            <span className="text-xs text-red-600 font-medium">Delete?</span>
                            <button onClick={() => confirmDelete(item.id)} disabled={del.isPending}
                              className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50">
                              {del.isPending ? <i className="fas fa-circle-notch fa-spin" /> : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(item.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 flex items-center gap-1.5">
                            <i className="fas fa-trash" /> Delete
                          </button>
                        )}
                      </div>
                    )}
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
