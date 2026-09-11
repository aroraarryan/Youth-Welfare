'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  useEmailTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  usePreviewEmail,
  useSendBulkEmail,
} from '@/hooks/useAdminEmail';
import type { EmailTemplate, EmailSendResponse } from '@/lib/api/adminEmailApi';

const inputClass =
  'border border-gray-300 rounded-md px-3 py-2 text-sm w-full disabled:opacity-50 disabled:bg-gray-50';

function TemplateFormModal({
  initial,
  onClose,
}: {
  initial: EmailTemplate | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const saving = create.isPending || update.isPending;

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    const data = { name: name.trim(), subject: subject.trim(), body };
    if (initial) {
      await update.mutateAsync({ id: initial.id, data });
    } else {
      await create.mutateAsync(data);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">{initial ? 'Edit' : 'New'} Template</h3>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-xs font-semibold text-gray-500 mt-3 mb-1">Subject</label>
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Regarding your application {{Application Code}}"
        />
        <label className="block text-xs font-semibold text-gray-500 mt-3 mb-1">Body (HTML)</label>
        <textarea
          className={`${inputClass} font-mono`}
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Dear {{Name}},&#10;&#10;..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Use <code className="bg-gray-100 px-1 rounded">{'{{columnName}}'}</code> to insert data
          from your Excel file, matching its header names.
        </p>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !subject.trim() || !body.trim()}
            className="bg-[#1e3a8a] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1e2f6b] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SendEmailPage() {
  const { data: templatesRes, isLoading } = useEmailTemplates();
  const deleteTemplate = useDeleteTemplate();
  const preview = usePreviewEmail();
  const sendBulk = useSendBulkEmail();

  const templates = templatesRes?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState<EmailTemplate | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState('');
  const [sendResult, setSendResult] = useState<EmailSendResponse | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSendResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      setRows(parsed);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
  }

  async function handlePreview() {
    if (!selectedTemplate || rows.length === 0) return;
    await preview.mutateAsync({ templateId: selectedTemplate.id, sampleRow: rows[0] });
  }

  async function handleSend() {
    if (!selectedTemplate || rows.length === 0) return;
    setSendResult(null);
    const res = await sendBulk.mutateAsync({ templateId: selectedTemplate.id, rows });
    setSendResult(res);
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Send Email</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Merge an Excel file of recipients into a template and send via SMTP.
        </p>
      </div>

      {/* Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Templates</h3>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="bg-[#1e3a8a] text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[#1e2f6b]"
          >
            + New Template
          </button>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-gray-400">No templates yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.subject}</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setFormOpen(true);
                    }}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => setDeleting(t)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Send</h3>

        <label className="block text-xs font-semibold text-gray-500 mb-1">Template</label>
        <select
          className={inputClass}
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          <option value="">Select a template…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-gray-500 mt-4 mb-1">
          Excel file (.xlsx, .xls)
        </label>
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm" />
        {rows.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {rows.length} rows parsed from {fileName}. Columns: {columns.join(', ')}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePreview}
            disabled={!selectedTemplate || rows.length === 0 || preview.isPending}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {preview.isPending ? 'Rendering…' : 'Preview'}
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedTemplate || rows.length === 0 || sendBulk.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {sendBulk.isPending ? 'Sending…' : `Send to ${rows.length || 0} recipients`}
          </button>
        </div>

        {preview.data && (
          <div className="mt-4 border border-gray-200 rounded-md p-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Subject: {preview.data.data.subject}
            </p>
            <div
              className="text-sm bg-white border border-gray-200 rounded p-3"
              dangerouslySetInnerHTML={{ __html: preview.data.data.html }}
            />
          </div>
        )}

        {sendResult && (
          <div className="mt-4 border border-gray-200 rounded-md p-3">
            <p className="text-sm font-semibold">
              <span className="text-green-700">{sendResult.sent} sent</span>
              {sendResult.failed > 0 && (
                <span className="text-red-600 ml-3">{sendResult.failed} failed</span>
              )}
            </p>
            {sendResult.failed > 0 && (
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                {sendResult.results
                  .filter((r) => r.status === 'FAILED')
                  .map((r) => (
                    <li key={r.row}>
                      Row {r.row}
                      {r.email ? ` (${r.email})` : ''}: {r.error}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <TemplateFormModal
          initial={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <p className="text-sm text-gray-700 mb-4">
              Delete template &quot;{deleting.name}&quot;? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="text-sm text-gray-500">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteTemplate.mutateAsync(deleting.id);
                  setDeleting(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
