"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";

interface BlockData {
  id: string;
  name: string;
  boOfficer: { id: number; name: string; isActive: boolean; email: string } | null;
  ymdCount: number;
  mmdCount: number;
  activeYmd: number;
  activeMmd: number;
  infraCount: number;
  infraByType: Record<string, number>;
  flags: string[];
}

interface DistrictData {
  id: string;
  name: string;
  hindiName: string | null;
  doOfficer: { id: number; name: string; isActive: boolean; email: string } | null;
  totalBlocks: number;
  activeBlocks: number;
  totalYmd: number;
  totalMmd: number;
  activeYmd: number;
  activeMmd: number;
  infraByType: Record<string, number>;
  multipurposeHalls: number;
  miniStadiums: number;
  blocks: BlockData[];
  flags: string[];
}

const INFRA_LABELS: Record<string, string> = {
  YOUTH_HOSTEL:      "Youth Hostels",
  VOCATIONAL_CENTER: "Vocational Centers",
  INDOOR_GYM:        "Indoor Gyms",
  OPEN_GYM:          "Open Gyms",
  KHEL_MAIDAAN:      "Khel Maidaan",
};

const FLAG_COLOR: Record<string, string> = {
  "No Block Officer": "bg-red-100 text-red-700 border-red-200",
  "No YMD":           "bg-orange-100 text-orange-700 border-orange-200",
  "No MMD":           "bg-pink-100 text-pink-700 border-pink-200",
  "No Infra":         "bg-purple-100 text-purple-700 border-purple-200",
  "Expired Dals":     "bg-amber-100 text-amber-700 border-amber-200",
};

function FlagBadge({ text }: { text: string }) {
  const cls = FLAG_COLOR[text] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cls} flex items-center gap-1`}>
      <i className="fas fa-exclamation-triangle text-[8px]" /> {text}
    </span>
  );
}

export default function DistrictDetailPage() {
  const params = useParams();
  const router = useRouter();
  const districtName = decodeURIComponent(params.name as string);

  const [data, setData] = useState<DistrictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockSearch, setBlockSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/district-analytics?name=${encodeURIComponent(districtName)}`)
      .then(async (res) => {
        if (res.status === 401) { router.push("/admin/login"); return; }
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.error || "Failed to load district data.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [districtName, router]);

  const filteredBlocks = data?.blocks.filter(b =>
    !blockSearch || b.name.toLowerCase().includes(blockSearch.toLowerCase())
  ) ?? [];

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-gray-400 text-sm">
      <i className="fas fa-circle-notch fa-spin" /> Loading district data…
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
    </div>
  );

  if (!data) return null;

  function exportToExcel() {
    if (!data) return;

    const INFRA_COLS: { key: string; label: string }[] = [
      { key: "HALL",              label: "Multipurpose Hall" },
      { key: "STADIUM",           label: "Mini Stadium" },
      { key: "OPEN_GYM",          label: "Open Gym" },
      { key: "KHEL_MAIDAAN",      label: "Khel Maidaan" },
      { key: "YOUTH_HOSTEL",      label: "Youth Hostel" },
      { key: "INDOOR_GYM",        label: "Indoor Gym" },
      { key: "VOCATIONAL_CENTER", label: "Vocational Training Center" },
    ];

    const headers = [
      "Block Name",
      "Mahila Mangal Dal (MMD)",
      "Yuvak Mangal Dal (YMD)",
      ...INFRA_COLS.map(c => c.label),
    ];

    const rows = data.blocks.map(b => [
      b.name,
      b.mmdCount,
      b.ymdCount,
      ...INFRA_COLS.map(c => b.infraByType?.[c.key] ?? 0),
    ]);

    const totalsRow = [
      "TOTAL",
      data.blocks.reduce((s, b) => s + b.mmdCount, 0),
      data.blocks.reduce((s, b) => s + b.ymdCount, 0),
      ...INFRA_COLS.map(c =>
        data.blocks.reduce((s, b) => s + (b.infraByType?.[c.key] ?? 0), 0)
      ),
    ];

    const sheetData = [
      [`${data.name} District — Infrastructure & Mangal Dal Report`],
      [],
      headers,
      ...rows,
      [],
      totalsRow,
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 28 },
      { wch: 26 },
      { wch: 26 },
      ...INFRA_COLS.map(() => ({ wch: 28 })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, data.name);
    XLSX.writeFile(wb, `${data.name}_District_Report.xlsx`);
  }

  const expiredDals = (data.totalYmd - data.activeYmd) + (data.totalMmd - data.activeMmd);
  const allInfraTotal = Object.values(data.infraByType).reduce((s, v) => s + v, 0) + data.multipurposeHalls + data.miniStadiums;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <i className="fas fa-chevron-right text-[10px]" />
        <span className="text-gray-800 font-semibold">{data.name}</span>
        {data.hindiName && <span className="text-gray-400 text-xs">({data.hindiName})</span>}
      </div>

      {/* District header + flags */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{data.name} District</h1>
            {data.hindiName && <p className="text-base text-gray-400 mt-0.5">{data.hindiName}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {data.flags.map(f => <FlagBadge key={f} text={f} />)}
              {data.flags.length === 0 && (
                <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <i className="fas fa-check-circle text-green-500" /> No issues
                </span>
              )}
            </div>
          </div>

          {/* Export Excel button */}
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start"
          >
            <i className="fas fa-file-excel" />
            Export Excel
          </button>

          {/* DO Officer card */}
          <div className={`flex-shrink-0 rounded-xl p-4 min-w-[220px] ${data.doOfficer ? 'bg-blue-50 border border-blue-100' : 'bg-amber-50 border border-amber-200'}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">District Officer</p>
            {data.doOfficer ? (
              <>
                <p className="text-sm font-bold text-gray-800">{data.doOfficer.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${data.doOfficer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {data.doOfficer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {data.doOfficer.email && (
                  <a href={`mailto:${data.doOfficer.email}`} className="text-[11px] text-blue-600 hover:underline mt-1.5 block truncate">
                    <i className="fas fa-envelope text-[9px] mr-1" />{data.doOfficer.email}
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-amber-700 font-semibold flex items-center gap-1.5">
                <i className="fas fa-exclamation-triangle text-amber-500" /> Not assigned
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Blocks",  value: data.totalBlocks,    icon: "fa-th-large",      color: "blue"   },
          { label: "Active BOs",    value: data.activeBlocks,   icon: "fa-user-check",    color: "green"  },
          { label: "YMD (Active)",  value: `${data.activeYmd}/${data.totalYmd}`, icon: "fa-running", color: "indigo" },
          { label: "MMD (Active)",  value: `${data.activeMmd}/${data.totalMmd}`, icon: "fa-female",  color: "pink"   },
          { label: "Expired Dals",  value: expiredDals,         icon: "fa-calendar-times", color: expiredDals > 0 ? "amber" : "gray" },
          { label: "Total Infra",   value: allInfraTotal,       icon: "fa-building",      color: "teal"   },
        ].map(s => (
          <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm`}>
            <i className={`fas ${s.icon} text-${s.color}-500 text-lg mb-1.5 block`} />
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Infrastructure breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Infrastructure Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Multipurpose Halls", count: data.multipurposeHalls },
            { label: "Mini Stadiums",      count: data.miniStadiums      },
            ...Object.entries(data.infraByType).map(([k, v]) => ({ label: INFRA_LABELS[k] ?? k, count: v })),
          ].map(({ label, count }) => (
            <div key={label} className={`rounded-lg border p-3 text-center ${count === 0 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${count === 0 ? 'text-red-400' : 'text-gray-800'}`}>{count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{label}</p>
              {count === 0 && <p className="text-[9px] text-red-400 font-bold mt-1 uppercase">Missing</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Blocks section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Blocks</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data.totalBlocks} blocks in {data.name}</p>
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search block…"
              value={blockSearch}
              onChange={e => setBlockSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 w-48"
            />
          </div>
        </div>

        {filteredBlocks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No blocks found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBlocks.map((block) => (
              <div key={block.id} className={`p-4 hover:bg-gray-50 transition-colors ${block.flags.length > 0 ? 'border-l-4 border-l-amber-400' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                  {/* Block info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="text-sm font-bold text-gray-800">{block.name}</h4>
                      {block.flags.length > 0
                        ? block.flags.map(f => <FlagBadge key={f} text={f} />)
                        : <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded font-medium">✓ OK</span>
                      }
                    </div>

                    {/* BO Officer */}
                    {block.boOfficer ? (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                        <i className="fas fa-user-tie text-blue-400 w-3.5" />
                        <span className="font-medium">{block.boOfficer.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${block.boOfficer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {block.boOfficer.isActive ? "Active" : "Inactive"}
                        </span>
                        {block.boOfficer.email && (
                          <a href={`mailto:${block.boOfficer.email}`} className="text-blue-500 hover:underline hidden sm:block truncate max-w-[180px]">
                            {block.boOfficer.email}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium mb-1.5 flex items-center gap-1">
                        <i className="fas fa-exclamation-triangle text-[10px]" /> No Block Officer assigned
                      </p>
                    )}
                  </div>

                  {/* Block stats */}
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <div className="text-center bg-indigo-50 rounded-lg px-3 py-1.5 min-w-[60px]">
                      <p className="text-base font-bold text-indigo-700">{block.activeYmd}<span className="text-xs text-indigo-400">/{block.ymdCount}</span></p>
                      <p className="text-[10px] text-indigo-500 font-medium">YMD</p>
                    </div>
                    <div className="text-center bg-pink-50 rounded-lg px-3 py-1.5 min-w-[60px]">
                      <p className="text-base font-bold text-pink-700">{block.activeMmd}<span className="text-xs text-pink-400">/{block.mmdCount}</span></p>
                      <p className="text-[10px] text-pink-500 font-medium">MMD</p>
                    </div>
                    <div className="text-center bg-teal-50 rounded-lg px-3 py-1.5 min-w-[60px]">
                      <p className="text-base font-bold text-teal-700">{block.infraCount}</p>
                      <p className="text-[10px] text-teal-500 font-medium">Infra</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
