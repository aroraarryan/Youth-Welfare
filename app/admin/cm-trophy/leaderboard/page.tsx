'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import CmTrophyLeaderboardTable, { LeaderboardRow } from '@/components/CmTrophyLeaderboardTable';
import { useAdminCmTrophyLeaderboard, useUpdateCmTrophyLeaderboard } from '@/hooks/useAdminCmTrophy';

type MedalField = 'gold' | 'silver' | 'bronze';

function sortRows(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort(
    (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.districtName.localeCompare(b.districtName)
  );
}

export default function AdminCmTrophyLeaderboardPage() {
  const { data, isLoading, isError, error } = useAdminCmTrophyLeaderboard();
  const updateMutation = useUpdateCmTrophyLeaderboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.data) setRows(sortRows(data.data));
  }, [data]);

  const handleChange = (districtId: string, field: MedalField, value: number) => {
    setRows((prev) => sortRows(prev.map((r) => (r.districtId === districtId ? { ...r, [field]: value } : r))));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setSaveMessage(null);
    try {
      await updateMutation.mutateAsync(
        rows.map((r) => ({ districtId: r.districtId, gold: r.gold, silver: r.silver, bronze: r.bronze }))
      );
      setSaveMessage('Leaderboard updated successfully.');
    } catch (e) {
      setSaveMessage((e as Error).message ?? 'Failed to save.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

    setRows((prev) =>
      sortRows(
        prev.map((r) => {
          const match = parsed.find((row) => {
            const name = String(row.District ?? row.district ?? '').trim().toLowerCase();
            return name === r.districtName.trim().toLowerCase();
          });
          if (!match) return r;
          return {
            ...r,
            gold: Number(match.Gold ?? match.gold ?? r.gold) || 0,
            silver: Number(match.Silver ?? match.silver ?? r.silver) || 0,
            bronze: Number(match.Bronze ?? match.bronze ?? r.bronze) || 0,
          };
        })
      )
    );
    setSaveMessage('Excel data loaded — review below, then click Save Changes.');
    e.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">CM Trophy 2026-27 — District Leaderboard</h1>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <i className="fas fa-file-excel mr-2 text-green-600" />
            Upload Excel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Expected Excel columns: <span className="font-mono">District, Gold, Silver, Bronze</span> — district names must match exactly.
      </p>

      {saveMessage && (
        <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">{saveMessage}</div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading leaderboard…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error).message}</p>
        </div>
      ) : (
        <CmTrophyLeaderboardTable entries={rows} onChange={handleChange} />
      )}
    </div>
  );
}
