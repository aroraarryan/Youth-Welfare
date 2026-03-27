"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DoOfficer {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
}

interface District {
  name: string;
  doOfficer: DoOfficer | null;
  totalBlocks: number;
  activeBlocks: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/admin/dashboard`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.success) setDistricts(data.districts);
        else setError(data.error || "Failed to load dashboard.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Dashboard</h2>

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {districts.map((d) => (
          <div key={d.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{d.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  d.doOfficer?.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {d.doOfficer?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              DO: {d.doOfficer?.name ?? <span className="italic text-gray-400">Not assigned</span>}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Blocks</span>
              <span className="font-medium">
                {d.activeBlocks} / {d.totalBlocks} active
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: d.totalBlocks > 0 ? `${(d.activeBlocks / d.totalBlocks) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
