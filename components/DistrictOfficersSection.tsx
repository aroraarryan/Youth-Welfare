'use client';

import { useState, useEffect, useRef } from 'react';
import { useDistricts } from '@/hooks/useInfrastructure';

interface Officer {
  id: number;
  name: string;
  role: 'DO_PRD' | 'BO_PRD';
  district: string;
  block: string | null;
  email: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default function DistrictOfficersSection() {
  const { districts, loading: loadingDistricts } = useDistricts();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDistrict) { setOfficers([]); return; }
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/officers/public?district=${encodeURIComponent(selectedDistrict)}`)
      .then(r => r.json())
      .then(d => setOfficers(d.data ?? []))
      .catch(() => setError('Failed to load officers'))
      .finally(() => setLoading(false));
  }, [selectedDistrict]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doOfficer = officers.find(o => o.role === 'DO_PRD');
  const boOfficers = officers.filter(o => o.role === 'BO_PRD');

  return (
    <div className="mt-[52px] pt-9 border-t-2 border-[#e2e8f0]">
      <div className="mb-7 pb-4 border-b-2 border-[#e2e8f0] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#1e3a8a] mt-0 mb-1.5">District Officers</h2>
          <p className="text-[15px] text-[#6b7280] m-0">
            Department of Youth Welfare and PRD — Field Officers
          </p>
        </div>
        <div className="relative min-w-[220px]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !loadingDistricts && setDropdownOpen(o => !o)}
            disabled={loadingDistricts}
            className="w-full px-4 py-2.5 border-2 border-[#e2e8f0] rounded-xl text-sm font-semibold text-gray-700 bg-white text-left focus:outline-none focus:border-[#1e3a8a] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-between"
          >
            <span>{selectedDistrict || 'Select District'}</span>
            <i className={`fas fa-chevron-down text-[#9ca3af] text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border-2 border-[#e2e8f0] rounded-xl shadow-lg max-h-64 overflow-y-auto">
              <div
                className="px-4 py-2.5 text-sm text-[#9ca3af] cursor-pointer hover:bg-[#f8fafc]"
                onClick={() => { setSelectedDistrict(''); setDropdownOpen(false); }}
              >
                Select District
              </div>
              {districts.map(d => (
                <div
                  key={d.id}
                  className={`px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-[#eff6ff] hover:text-[#1e3a8a] transition-colors ${selectedDistrict === d.name ? 'bg-[#eff6ff] text-[#1e3a8a]' : 'text-gray-700'}`}
                  onClick={() => { setSelectedDistrict(d.name); setDropdownOpen(false); }}
                >
                  {d.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!selectedDistrict ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <i className="fas fa-map-marker-alt text-4xl mb-3 block text-[#dde3f0]" />
          <p className="text-base">Select a district to view its officers</p>
        </div>
      ) : loading ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-3 block" />
          <p className="text-sm">Loading officers…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400 text-sm">{error}</div>
      ) : officers.length === 0 ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <i className="fas fa-user-slash text-4xl mb-3 block text-[#dde3f0]" />
          <p className="text-base">No officers found for {selectedDistrict} district.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {doOfficer && (
            <div>
              <p className="text-xs font-bold text-[#1e3a8a] uppercase tracking-widest mb-3">District Officer</p>
              <div className="flex flex-row items-stretch border border-[#bfdbfe] rounded-xl bg-[#eff6ff] shadow-[0_2px_10px_rgba(0,0,0,0.06)] max-w-sm">
                <div className="flex-none w-[72px] flex flex-col items-center justify-center rounded-l-xl text-white/40 text-3xl"
                  style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)' }}>
                  <i className="fas fa-user-shield" />
                </div>
                <div className="flex-1 p-3 flex flex-col gap-1">
                  <h4 className="text-[13px] font-bold text-[#1a202c] m-0 leading-snug">{doOfficer.name}</h4>
                  <p className="text-[11px] font-semibold text-[#1e3a8a] m-0 italic">District Officer (PRD)</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5 flex items-center gap-1">
                    <i className="fas fa-map-marker-alt text-[10px]" /> {doOfficer.district}
                  </p>
                  {doOfficer.email && (
                    <a href={`mailto:${doOfficer.email}`} className="text-[11px] text-[#1e3a8a] hover:underline flex items-center gap-1 mt-1">
                      <i className="fas fa-envelope text-[10px]" /> {doOfficer.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {boOfficers.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#0d7e6b] uppercase tracking-widest mb-3">Block Officers ({boOfficers.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {boOfficers.map(off => (
                  <div key={off.id} className="flex flex-row items-stretch border border-[#e2e8f0] rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                    <div className="flex-none w-[64px] flex flex-col items-center justify-center rounded-l-xl text-white/30 text-2xl"
                      style={{ background: 'linear-gradient(135deg,#0d7e6b 0%,#15a589 100%)' }}>
                      <i className="fas fa-user-tie" />
                    </div>
                    <div className="flex-1 p-3 flex flex-col gap-1">
                      <h4 className="text-[12.5px] font-bold text-[#1a202c] m-0 leading-snug break-words">{off.name}</h4>
                      <p className="text-[11px] font-semibold text-[#0d7e6b] m-0 italic">Block Officer (PRD)</p>
                      {off.block && (
                        <p className="text-[11px] text-[#6b7280] mt-0.5 flex items-center gap-1">
                          <i className="fas fa-map-marker-alt text-[10px]" /> {off.block}
                        </p>
                      )}
                      {off.email && (
                        <a href={`mailto:${off.email}`} className="text-[11px] text-[#4a5568] hover:text-[#1e3a8a] flex items-center gap-1 mt-1 break-all">
                          <i className="fas fa-envelope text-[10px]" /> {off.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
