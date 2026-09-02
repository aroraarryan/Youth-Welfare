'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { cmTrophyGrievanceApi } from '@/lib/api/cmTrophyGrievance';
import { ApiError } from '@/lib/api';

export default function CmTrophyGrievancePage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', atomId: '', problem: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await cmTrophyGrievanceApi.submit({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        atomId: form.atomId || undefined,
        problem: form.problem,
      });
      setSuccess(true);
      setForm({ name: '', email: '', mobile: '', atomId: '', problem: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        hindiTitle="सीएम चैंपियनशिप ट्रॉफी 2026-27 — शिकायत पोर्टल"
        title="CM Championship Trophy 2026-27 — Grievance Portal"
        subtitle="Report an issue related to the CM Championship Trophy 2026-27"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'CM Championship Trophy 2026-27 Grievance Portal' },
        ]}
        stats={[
          { value: '13', label: 'Districts' },
          { value: '2026-27', label: 'Edition' },
        ]}
      />

      <section className="py-10 sm:py-16 px-4 sm:px-5">
        <div className="max-w-[800px] mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e2e8f0]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mt-0 mb-1">File a Grievance</h2>
          <p className="text-[#6b7280] mt-0 mb-6 text-sm">
            Let us know about any issue you faced with the CM Championship Trophy 2026-27. We will get back to you shortly.
          </p>

          {success && (
            <div className="mb-5 px-4 py-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
              Grievance submitted! We will get back to you soon.
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Atom Id <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.atomId}
                onChange={e => setForm({ ...form, atomId: e.target.value })}
                placeholder="Atom Id"
                className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Problem</label>
              <textarea
                value={form.problem}
                onChange={e => setForm({ ...form, problem: e.target.value })}
                placeholder="Describe the issue you faced..."
                rows={5}
                required
                className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold py-4 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
            >
              {submitting ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : 'Submit Grievance'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
