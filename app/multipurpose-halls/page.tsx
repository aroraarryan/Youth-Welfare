'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { useDistricts, useMultipurposeHalls } from '@/hooks/useInfrastructure';

export default function MultipurposeHallsPage() {
  const { districts, loading: loadingDistricts } = useDistricts();
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);

  const { halls, loading, error } = useMultipurposeHalls(selectedDistrictId || undefined);

  return (
    <>
      <PageHero
        hindiTitle="बहुउद्देशीय हॉल"
        title="Multipurpose Halls — Infrastructure"
        subtitle="Government Multipurpose Halls available for youth programs and community events"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Infrastructure' }, { label: 'Multipurpose Halls' }]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: '80+', label: 'Halls' },
          { value: '2026', label: 'Updated' },
        ]}
      />

      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-8 flex flex-col items-center gap-5">
          <h3 className="text-2xl text-[#2c3e50] font-semibold">Find Multipurpose Halls by District</h3>
          <div className="relative w-full max-w-[400px]">
            <select
              value={selectedDistrictId}
              onChange={e => setSelectedDistrictId(e.target.value)}
              disabled={loadingDistricts}
              className="w-full px-5 py-3 text-lg border-2 border-[#e0e0e0] rounded-lg appearance-none bg-white cursor-pointer focus:outline-none focus:border-[#1e3a8a] transition-colors disabled:opacity-60"
            >
              <option value="">Select District</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8c8d] pointer-events-none" />
          </div>
        </div>

        <div className="min-h-[300px]">
          {selectedDistrictId && (
            <>
              <div className="mb-5 pb-2 border-b-[3px] border-[#1e3a8a] inline-block">
                <h2 className="text-[2rem] text-[#2c3e50]">{selectedDistrict?.name} — Multipurpose Halls</h2>
              </div>

              {loading ? (
                <div className="text-center py-20 text-[#9ca3af]">
                  <i className="fas fa-spinner fa-spin text-2xl mb-4 block" />Loading halls…
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-400">{error}</div>
              ) : halls.length === 0 ? (
                <div className="text-center py-20">
                  <i className="fas fa-building text-4xl text-[#d1d5db] mb-4 block" />
                  <p className="text-[#9ca3af] text-lg">No halls found for {selectedDistrict?.name} yet.</p>
                </div>
              ) : (
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {halls.map(h => (
                    <div key={h.id} className="bg-white rounded-xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center text-xl">🏛️</div>
                        <h3 className="text-base font-bold text-[#1e293b]">{h.name}</h3>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-[#6b7280]">
                        {h.location && (
                          <span className="flex items-center gap-2">
                            <i className="fas fa-map-marker-alt text-[#1e3a8a] w-4" />{h.location}
                          </span>
                        )}
                        {h.capacity && (
                          <span className="flex items-center gap-2">
                            <i className="fas fa-users text-[#1e3a8a] w-4" />{h.capacity} persons capacity
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <i className={`fas fa-circle text-xs w-4 ${h.isActive ? 'text-green-500' : 'text-red-400'}`} />
                          {h.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!selectedDistrictId && (
            <div className="text-center py-20">
              <i className="fas fa-building text-5xl text-[#d1d5db] mb-4 block" />
              <p className="text-[#9ca3af] text-lg">Select a district to view Multipurpose Halls</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
