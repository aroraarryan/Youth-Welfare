'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tokenStore } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      tokenStore.set(token);
    }
    router.replace('/');
  }, [router, searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <i className="fas fa-spinner fa-spin text-3xl text-[#6366f1] mb-4" />
        <p className="text-[#6b7280]">Signing you in…</p>
      </div>
    </div>
  );
}
