'use client';

import { useState } from 'react';
import Image from 'next/image';
import PageHero from '@/components/PageHero';
import { contactApi } from '@/lib/api/contact';
import { ApiError } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', message: '', agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await contactApi.submit({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
      });
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', message: '', agree: false });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        hindiTitle="संपर्क करें"
        title="Contact Us — Youth Welfare & PRD Department"
        subtitle="Uttarakhand Secretariat, Subhash Road, Dehradun · Official Contact & Grievance Portal"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
        stats={[
          { value: '13',    label: 'Districts' },
          { value: '24/7',  label: 'Support' },
          { value: '2026',  label: 'Edition' },
        ]}
      />

      <section className="py-16 px-5">
        <div className="max-w-[1200px] mx-auto flex gap-10 flex-wrap">
          {/* Left: Dept info */}
          <div className="flex-none w-[380px]">
            <div className="flex items-center gap-4 mb-8">
              <Image src="/images/logo.png" alt="Department Logo" width={80} height={80} className="object-contain" />
              <div>
                <h2 className="text-xl font-bold text-[#1e3a8a] m-0">Youth Welfare and PRD Department</h2>
                <p className="text-sm text-[#6b7280] m-0">Government of Uttarakhand</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { icon: 'fas fa-home',     text: '05, Tapovan Ashram Rd, Ladpur, Dehradun, Uttarakhand 248008' },
                { icon: 'fas fa-phone',    text: '+91-93687 76459' },
                { icon: 'fas fa-envelope', text: 'ykprd.uk@gmail.com' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-[#1e3a8a]`} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-sm text-[#374151] m-0 font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-3 mt-8">
              {[
                { href: 'https://instagram.com', icon: 'fab fa-instagram',   bg: '#c13584', title: 'Instagram' },
                { href: 'https://linkedin.com',  icon: 'fab fa-linkedin-in', bg: '#0077b5', title: 'LinkedIn' },
                { href: 'https://facebook.com',  icon: 'fab fa-facebook-f',  bg: '#1877f2', title: 'Facebook' },
                { href: 'https://twitter.com',   icon: 'fab fa-twitter',     bg: '#1da1f2', title: 'Twitter' },
                { href: 'https://youtube.com',   icon: 'fab fa-youtube',     bg: '#ff0000', title: 'YouTube' },
              ].map(s => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.title}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm hover:scale-110 transition-transform"
                  style={{ background: s.bg }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="flex-1 min-w-[300px] bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e2e8f0]">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mt-0 mb-1">Get in touch</h2>
            <p className="text-[#6b7280] mt-0 mb-6 text-sm">We&apos;d love to hear from you. Please fill out this form.</p>

            {success && (
              <div className="mb-5 px-4 py-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                Message sent! We will get back to you soon.
              </div>
            )}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">First name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                    required
                    className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Last name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                    required
                    className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Phone number</label>
                <div className="flex">
                  <select className="px-3 py-3 border-2 border-[#e5e7eb] border-r-0 rounded-l-lg text-sm bg-[#f9fafb] text-[#374151] focus:outline-none">
                    <option>IN</option>
                    <option>US</option>
                  </select>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 (555) 000-0000"
                    required
                    className="flex-1 px-4 py-3 border-2 border-[#e5e7eb] rounded-r-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Leave us a message..."
                  rows={5}
                  required
                  className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={form.agree}
                  onChange={e => setForm({ ...form, agree: e.target.checked })}
                  required
                  className="w-4 h-4 accent-[#1e3a8a]"
                />
                <label htmlFor="agree" className="text-sm text-[#374151]">
                  You agree to our friendly privacy policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold py-4 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
              >
                {submitting ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
