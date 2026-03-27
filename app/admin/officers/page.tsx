"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_PASSWORD = "Welfare@123";

interface Officer {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  district: string;
  block: string | null;
  isActive: boolean;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

interface ConfirmModal {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
}

export default function OfficersPage() {
  const router = useRouter();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ district: "", role: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ConfirmModal | null>(null);

  const fetchOfficers = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.district) params.set("district", filters.district);
      if (filters.role) params.set("role", filters.role);
      if (filters.status) params.set("status", filters.status);
      params.set("page", String(page));

      try {
        const res = await fetch(`/api/admin/officers?${params}`);
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.success) {
          setOfficers(data.officers);
          setDistricts(data.districts);
          setPagination(data.pagination);
        } else {
          setMessage({ type: "error", text: data.error || "Failed to load officers." });
        }
      } catch {
        setMessage({ type: "error", text: "Network error." });
      } finally {
        setLoading(false);
      }
    },
    [filters, router]
  );

  useEffect(() => { fetchOfficers(1); }, [fetchOfficers]);

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggle = (officer: Officer) => {
    const action = officer.isActive ? "Deactivate" : "Activate";
    setModal({
      title: `${action} Officer`,
      message: `Are you sure you want to ${action.toLowerCase()} "${officer.name}"?`,
      confirmLabel: action,
      confirmClass: officer.isActive
        ? "bg-red-600 hover:bg-red-700 text-white"
        : "bg-green-600 hover:bg-green-700 text-white",
      onConfirm: async () => {
        setModal(null);
        const res = await fetch(`/api/admin/officers/${officer.id}/toggle`, {
          method: "PATCH",
        });
        const data = await res.json();
        setMessage({
          type: data.success ? "success" : "error",
          text: data.success ? "Officer status updated." : (data.error || "Failed to toggle status."),
        });
        if (data.success) fetchOfficers(pagination.page);
      },
    });
  };

  const handleResetPassword = (officer: Officer) => {
    setModal({
      title: "Reset Password",
      message: `Reset password for "${officer.name}" to Welfare@123?`,
      confirmLabel: "Reset Password",
      confirmClass: "bg-orange-600 hover:bg-orange-700 text-white",
      onConfirm: async () => {
        setModal(null);
        const res = await fetch(`/api/admin/officers/${officer.id}/reset-password`, {
          method: "PATCH",
        });
        const data = await res.json();
        setMessage({
          type: data.success ? "success" : "error",
          text: data.message || data.error || "Done.",
        });
      },
    });
  };

  const handleDelete = (officer: Officer) => {
    setModal({
      title: "Delete Officer",
      message: `Delete "${officer.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700 text-white",
      onConfirm: async () => {
        setModal(null);
        const res = await fetch(`/api/admin/officers/${officer.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Officer deleted." });
          fetchOfficers(pagination.page);
        } else {
          setMessage({ type: "error", text: data.error || "Failed to delete." });
        }
      },
    });
  };

  return (
    <div className="p-6">
      {/* Confirm Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">{modal.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{modal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={modal.onConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-md ${modal.confirmClass}`}
              >
                {modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">Officers</h2>
        <Link
          href="/admin/officers/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          + New Officer
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
          <button className="ml-2 font-bold" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3">
        <select
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="DO_PRD">DO_PRD</option>
          <option value="BO_PRD">BO_PRD</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={() => setFilters({ district: "", role: "", status: "" })}
          className="text-sm text-gray-500 hover:text-gray-700 px-2"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-10">Loading…</p>
        ) : officers.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-10">No officers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Username</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Password</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600">District</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Block</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {officers.map((o) => {
                  const pwVisible = visiblePasswords.has(o.id);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 font-medium">{o.name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{o.username}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-700">
                            {pwVisible ? DEFAULT_PASSWORD : "••••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(o.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title={pwVisible ? "Hide password" : "Show password"}
                          >
                            {pwVisible ? (
                              // eye-off
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              // eye
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {o.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.district}</td>
                      <td className="px-4 py-3 text-gray-500">{o.block ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          o.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {o.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/admin/officers/${o.id}/edit`} className="text-xs text-blue-600 hover:underline">
                            Edit
                          </Link>
                          <button onClick={() => handleResetPassword(o)} className="text-xs text-orange-600 hover:underline">
                            Reset Pwd
                          </button>
                          <button onClick={() => handleToggle(o)} className="text-xs text-gray-600 hover:underline">
                            {o.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDelete(o)} className="text-xs text-red-600 hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchOfficers(pagination.page - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOfficers(pagination.page + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
