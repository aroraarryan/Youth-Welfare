"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      tokenStore.set(token);
    }

    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <p>Signing you in…</p>
    </div>
  );
}
