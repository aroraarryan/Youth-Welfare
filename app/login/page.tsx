'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <main
      className="min-h-[80vh] flex items-center justify-center py-15 px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)' }}
    >
      {/* Diagonal white bottom shape */}
      <div
        className="absolute bottom-0 left-0 w-full h-[60%] bg-white z-10"
        style={{ clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 100%)' }}
      />

      <div className="bg-white rounded-2xl py-12 px-10 w-full max-w-[420px] shadow-[0_25px_50px_rgba(0,0,0,0.1)] text-center relative z-20">
        <div className="mb-5">
          <p className="text-[#6b7280] text-sm font-medium mb-1">WELCOME BACK 👋</p>
          <h2 className="text-2xl font-semibold text-[#1f2937] m-0">Continue to your Account.</h2>
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="bg-[#e3f2fd] text-[#333] border-none py-3 px-5 w-full rounded-lg flex items-center justify-center gap-2.5 font-medium cursor-pointer text-sm hover:bg-[#bbdefb] transition-colors"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 rounded-full" />
          Log In with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <hr className="flex-1 border-none h-px bg-[#e0e0e0]" />
          <span className="px-4 text-[#666] text-sm">Or use Email</span>
          <hr className="flex-1 border-none h-px bg-[#e0e0e0]" />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-5">
            <label className="block text-[11px] text-[#9ca3af] uppercase font-medium mb-1.5 tracking-wide">EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="johndoe@email.com"
              required
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-md text-sm bg-[#f9fafb] outline-none focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] text-[#9ca3af] uppercase font-medium mb-1.5 tracking-wide">PASSWORD</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••••••••••"
                required
                className="w-full px-4 py-3 pr-10 border border-[#e5e7eb] rounded-md text-sm bg-[#f9fafb] outline-none focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#6366f1]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[#9ca3af] cursor-pointer text-base"
              >
                <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f2937] hover:bg-[#374151] disabled:opacity-60 text-white border-none py-3.5 rounded-md text-sm font-semibold cursor-pointer uppercase tracking-wide mb-6 transition-all hover:-translate-y-px flex items-center justify-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : <>CONTINUE <i className="fas fa-arrow-right" /></>}
          </button>
        </form>

        <p className="text-sm text-[#6b7280]">
          Are you a Newbie?{' '}
          <Link href="/register" className="text-[#6366f1] no-underline font-semibold hover:underline">
            GET STARTED - IT&apos;S FREE
          </Link>
        </p>
      </div>
    </main>
  );
}
