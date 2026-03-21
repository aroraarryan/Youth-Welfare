'use client';

import { useState } from 'react';
import PageHero from '@/components/PageHero';
import { useDistricts, useMangalDals } from '@/hooks/useInfrastructure';

export default function YuvakMangalDalPage() {
  const { districts, loading: loadingDistricts } = useDistricts();
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);

  const { dals, loading, error } = useMangalDals(selectedDistrictId || undefined, 'YUVAK');

  return (
    <>
      <PageHero
        hindiTitle="युवक मंगल दल"
        title="Yuvak Mangal Dal — Community Initiative"
        subtitle="Empowering Youth of Uttarakhand through community-led Yuvak Mangal Dals"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Yuvak Mangal Dal' }]}
        stats={[
          { value: '13',    label: 'Districts' },
          { value: '4000+', label: 'Active Dals' },
          { value: '1.2L+', label: 'Members' },
        ]}
      />

      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] rounded-2xl p-8 mb-10 border border-[#bfdbfe]">
          <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">About Yuvak Mangal Dal</h2>
          <p className="text-[#6b7280] leading-relaxed">
            Yuvak Mangal Dals (YMDs) are youth-led community organisations registered under the Department of
            Youth Welfare and PRD, Uttarakhand. They focus on sports, cultural activities, community service,
            and youth empowerment across the state.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm mb-8 flex flex-col items-center gap-5 border border-[#e2e8f0]">
          <h3 className="text-2xl text-[#2c3e50] font-semibold">Find Yuvak Mangal Dals by District</h3>
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

        <div className="min-h-[200px]">
          {selectedDistrictId && (
            <>
              {loading ? (
                <div className="text-center py-20 text-[#9ca3af]">
                  <i className="fas fa-spinner fa-spin text-2xl mb-4 block" />Loading…
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-400">{error}</div>
              ) : dals.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#9ca3af] text-lg">No YMDs found for {selectedDistrict?.name} yet.</p>
                </div>
              ) : (
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {dals.map(dal => (
                    <div key={dal.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#e2e8f0] hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center text-2xl">🏃‍♂️</div>
                        <h3 className="text-base font-bold text-[#1e293b]">{dal.name}</h3>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-[#6b7280]">
                        <span className="flex items-center gap-2">
                          <i className="fas fa-map-marker-alt text-[#1e3a8a] w-4" />{dal.block.name} Block
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fas fa-hashtag text-[#1e3a8a] w-4" />Affiliation: {dal.affiliationNo}
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fas fa-user-tie text-[#1e3a8a] w-4" />Chairperson: {dal.chairperson}
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
              <span className="text-5xl mb-4 block">🏃‍♂️</span>
              <p className="text-[#9ca3af] text-lg">Select a district to view Yuvak Mangal Dals</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
