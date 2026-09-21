'use client';

import { useState } from 'react';

const PRESET_REASONS = [
  'Male above 19 are not eligible to participate in CM Championship Trophy',
  'Invalid aadhar details provided',
  'False Documents',
];

export function RejectReasonModal({
  onConfirm, onCancel, isSubmitting,
}: { onConfirm: (reason: string) => void; onCancel: () => void; isSubmitting: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [remark, setRemark] = useState('');
  const reason = selected ?? remark.trim();
  const canSubmit = reason.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <i className="fas fa-times text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Reject Request</h3>
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ve rejected this request. Please add a remark so the user understands the reason.
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-800 mb-2">Select a Reason</p>
        <div className="flex flex-col gap-2 mb-4">
          {PRESET_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelected(selected === r ? null : r)}
              className={`text-left text-sm px-4 py-2.5 rounded-lg border ${
                selected === r ? 'border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]' : 'border-gray-300 text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <label className="text-sm font-semibold text-gray-800">
          Add Remark <span className="font-normal text-gray-400">(required if no reason selected above)</span>
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1.5 mb-5"
          rows={3}
          placeholder="Enter your remark..."
          value={remark}
          disabled={!!selected}
          onChange={(e) => setRemark(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50">
            Go Back
          </button>
          <button
            onClick={() => canSubmit && onConfirm(reason)}
            disabled={!canSubmit || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Rejecting…' : 'Yes, Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
