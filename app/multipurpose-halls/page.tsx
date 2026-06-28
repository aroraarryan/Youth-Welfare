'use client';

import { useState, useEffect } from 'react';
import PageHero from '@/components/PageHero';
import { useDistricts, useMultipurposeHalls } from '@/hooks/useInfrastructure';
import InfraCard from '@/components/InfraCard';
import InfraDetailModal from '@/components/InfraDetailModal';
import { MultipurposeHall, infrastructureApi } from '@/lib/api/infrastructure';

export default function MultipurposeHallsPage() {
  const { districts, loading: loadingDistricts } = useDistricts();
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);

  const [totalHalls, setTotalHalls] = useState<number | null>(null);
  useEffect(() => {
    infrastructureApi.getMultipurposeHalls({ limit: 1 })
      .then(res => setTotalHalls(res.meta?.total ?? null))
      .catch(() => {});
  }, []);

  const { halls, loading, error } = useMultipurposeHalls(selectedDistrictId || undefined);
  const [selectedHall, setSelectedHall] = useState<MultipurposeHall | null>(null);

  return (
    <>
      <PageHero
        hindiTitle="बहुउद्देशीय हॉल"
        title="Multipurpose Halls — Infrastructure"
        subtitle="Government Multipurpose Halls available for youth programs and community events"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Infrastructure' }, { label: 'Multipurpose Halls' }]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: totalHalls !== null ? String(totalHalls) : '—', label: 'Halls' },
          { value: '2026', label: 'Updated' },
        ]}
      />

      <div className="max-w-[1280px] mx-auto mb-24 px-6">
        {/* District Selector - Refined Design */}
        <div className="relative mt-8 z-20 mb-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a8a] shadow-sm">
                <i className="fas fa-map-marked-alt text-2xl" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-[#1e293b] leading-tight">Explore Districts</h3>
                <p className="text-[#64748b] text-xs lg:text-sm font-medium mt-1">Select a region to find facilities in your area.</p>
              </div>
            </div>
            
            <div className="relative w-full max-w-[340px] group">
              <select
                value={selectedDistrictId}
                onChange={e => setSelectedDistrictId(e.target.value)}
                disabled={loadingDistricts}
                className="w-full pl-6 pr-12 py-4 text-sm font-bold border-2 border-gray-100 rounded-2xl appearance-none bg-gray-50/50 cursor-pointer focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all disabled:opacity-60 text-[#1e293b]"
              >
                <option value="">Choose a District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#1e3a8a] transition-colors">
                <i className="fas fa-chevron-down text-xs" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[400px]">
          {selectedDistrictId ? (
            <>
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-3">
                    <span className="w-6 h-[2px] bg-blue-100" /> Infrastructure Directory
                  </h4>
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1e293b] leading-tight">
                    {selectedDistrict?.name} <span className="text-[#1e3a8a]/40 italic">Halls</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-[#1e3a8a] rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                   <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   {halls.length} Result{halls.length !== 1 ? 's' : ''} Found
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] h-[420px] animate-pulse border border-gray-100 shadow-sm" />
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 rounded-[3rem] p-16 text-center border border-red-100 max-w-xl mx-auto shadow-sm">
                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-500 shadow-md mx-auto mb-8">
                      <i className="fas fa-exclamation-triangle text-3xl" />
                   </div>
                   <h3 className="text-xl font-black text-red-900 mb-3">Unable to Load Data</h3>
                   <p className="text-red-600/70 text-sm font-medium leading-relaxed">{error}</p>
                   <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200">
                      Try Again
                   </button>
                </div>
              ) : halls.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-gray-100 shadow-inner">
                    <i className="fas fa-building text-4xl text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1e293b] mb-4">No Halls Registered</h3>
                  <p className="text-[#64748b] font-medium leading-relaxed max-w-sm mx-auto">
                    We currently don't have any multipurpose halls registered for {selectedDistrict?.name}. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {halls.map(h => (
                    <InfraCard
                      key={h.id}
                      name={h.name}
                      location={h.location}
                      districtName={h.district.name}
                      imageUrl={h.imageUrls?.[0]}
                      isActive={h.isActive}
                      onClick={() => setSelectedHall(h)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 rounded-[4rem] blur-2xl -z-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-16 lg:p-24 text-center border border-white shadow-xl overflow-hidden relative">
                <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-50">
                    <i className="fas fa-city text-5xl text-[#1e3a8a]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-black text-[#1e293b] mb-6 tracking-tight leading-tight">
                    Your Discovery <br/><span className="text-[#1e3a8a]">Starts Here</span>
                  </h3>
                  <p className="text-lg lg:text-xl text-[#64748b] font-medium leading-relaxed">
                    Select a district from the selector above to unlock the full directory of multipurpose halls and community venues in your region.
                  </p>
                  
                  <div className="mt-16 flex items-center justify-center gap-6">
                    <div className="flex -space-x-3">
                       {[...Array(4)].map((_, i) => (
                         <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            <i className="fas fa-user" />
                         </div>
                       ))}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join thousands exploring today</p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-blue-100 rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-blue-100 rounded-br-3xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      <InfraDetailModal 
        isOpen={!!selectedHall}
        onClose={() => setSelectedHall(null)}
        data={selectedHall ? {
          name: selectedHall.name,
          location: selectedHall.location,
          districtName: selectedHall.district.name,
          facilities: selectedHall.facilities,
          pocName: selectedHall.pocName,
          pocPhone: selectedHall.pocPhone,
          pocEmail: selectedHall.pocEmail,
          imageUrls: selectedHall.imageUrls,
          latitude: selectedHall.latitude,
          longitude: selectedHall.longitude
        } : null}
      />
    </>
  );
}
