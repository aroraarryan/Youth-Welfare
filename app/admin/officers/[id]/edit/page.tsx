"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

const DISTRICTS = [
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
  "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh",
  "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi",
];

interface FormState {
  name: string;
  email: string;
  district: string;
  block: string;
  role: string;
  is_active: boolean;
}

export default function EditOfficerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    district: "",
    block: "",
    role: "BO_PRD",
    is_active: true,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/admin/officers/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.success) {
          const o = data.officer;
          setForm({
            name: o.name,
            email: o.email,
            district: o.district,
            block: o.block ?? "",
            role: o.role,
            is_active: o.isActive,
          });
        } else {
          setErrors([data.error || "Failed to load officer."]);
        }
      })
      .catch(() => setErrors(["Network error."]))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/officers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok || !data.success) {
        setErrors(data.errors || [data.error || "Failed to update officer."]);
      } else {
        router.push("/admin/officers");
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500 text-sm">Loading…</div>;
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/officers" className="text-blue-600 hover:underline text-sm">
          ← Officers
        </Link>
        <h2 className="text-xl font-bold text-gray-800">Edit Officer</h2>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="list-disc list-inside text-sm text-red-700 space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="BO_PRD">BO_PRD</option>
            <option value="DO_PRD">DO_PRD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
          <select
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select district…</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block {form.role === "BO_PRD" ? "*" : "(optional)"}
          </label>
          <input
            type="text"
            required={form.role === "BO_PRD"}
            value={form.block}
            onChange={(e) => setForm({ ...form, block: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href="/admin/officers"
            className="px-5 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
