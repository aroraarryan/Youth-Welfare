"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Grievance {
  id: string;
  name: string;
  email: string;
  mobile: string;
  atomId: string | null;
  problem: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export default function AdminCmTrophyGrievancePage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (f: typeof filter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (f === "resolved") params.set("isResolved", "true");
      if (f === "unresolved") params.set("isResolved", "false");
      const res = await fetch(`/api/admin/cm-trophy/grievance?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setGrievances(data.data ?? []);
      setTotal(data.meta?.total ?? data.data?.length ?? 0);
    } catch {
      setError("Failed to load grievances.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(filter); }, [filter, load]);

  const handleResolve = async (id: string) => {
    setActionLoading(id + ":resolve");
    try {
      const res = await fetch(`/api/admin/cm-trophy/grievance/${id}/resolve`, { method: "PATCH", headers: { "Content-Type": "application/json" } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setGrievances((prev) => prev.map((g) => g.id === id ? { ...g, isResolved: true, resolvedAt: new Date().toISOString() } : g));
      if (selected?.id === id) setSelected((g) => g ? { ...g, isResolved: true, resolvedAt: new Date().toISOString() } : g);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + ":delete");
    try {
      const res = await fetch(`/api/admin/cm-trophy/grievance/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setGrievances((prev) => prev.filter((g) => g.id !== id));
      if (selected?.id === id) setSelected(null);
      setConfirmDeleteId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">CM Trophy Grievances</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Grievances submitted through the CM Championship Trophy 2026-27 public portal.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-circle" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><i className="fas fa-times" /></button>
        </div>
      )}

      {/* Stats + Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(["unresolved", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                filter === f ? "bg-blue-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "unresolved" ? "Open" : f === "resolved" ? "Resolved" : "All"}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">{total} grievance{total !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grievance list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-circle-notch fa-spin text-2xl mb-2 block" /> Loading…
            </div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <i className="fas fa-circle-exclamation text-3xl mb-3 block text-gray-200" />
              <p className="text-sm">No {filter !== "all" ? filter : ""} grievances.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {grievances.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === g.id ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">{g.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {g.isResolved ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">Resolved</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Open</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1">{g.email} · {g.mobile}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{g.problem}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(g.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <i className="fas fa-circle-exclamation text-4xl mb-3 text-gray-200" />
              <p className="text-sm">Select a grievance to view details</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-800">{selected.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Submitted {formatDate(selected.createdAt)}</p>
                </div>
                {selected.isResolved ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                    <i className="fas fa-check mr-1" />Resolved
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Open</span>
                )}
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline break-all">
                    {selected.email}
                  </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Mobile</p>
                  <a href={`tel:${selected.mobile}`} className="text-sm text-blue-600 hover:underline">
                    {selected.mobile}
                  </a>
                </div>
              </div>

              {selected.atomId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Atom Id</p>
                  <p className="text-sm text-gray-700">{selected.atomId}</p>
                </div>
              )}

              {/* Problem */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Problem</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.problem}</p>
              </div>

              {selected.resolvedAt && (
                <p className="text-xs text-green-600">
                  <i className="fas fa-check-circle mr-1" />Resolved on {formatDate(selected.resolvedAt)}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!selected.isResolved && (
                  <button
                    onClick={() => handleResolve(selected.id)}
                    disabled={!!actionLoading}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {actionLoading === selected.id + ":resolve"
                      ? <i className="fas fa-circle-notch fa-spin" />
                      : <i className="fas fa-check-circle" />}
                    Mark Resolved
                  </button>
                )}
                {confirmDeleteId === selected.id ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1">
                    <span className="text-xs text-red-600 font-medium">Delete permanently?</span>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      disabled={!!actionLoading}
                      className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50 ml-auto"
                    >
                      {actionLoading === selected.id + ":delete" ? <i className="fas fa-circle-notch fa-spin" /> : "Yes"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(selected.id)}
                    disabled={!!actionLoading}
                    className="px-4 py-2.5 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 border border-red-100 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    <i className="fas fa-trash-alt" /> Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
