'use client';

import { useMemo, useState, useEffect } from 'react';
import { infrastructureApi } from '@/lib/api/infrastructure';
import PageHero from '@/components/PageHero';
import { useDistricts, useBlocks, useMangalDals } from '@/hooks/useInfrastructure';

export default function MahilaMangalDalPage() {
  const { districts, loading: loadingDistricts } = useDistricts();
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [totalDals, setTotalDals] = useState<number | null>(null);

  useEffect(() => {
    infrastructureApi.getMangalDals({ dalType: 'MAHILA', limit: 1 })
      .then(res => setTotalDals(res.meta?.total ?? null)).catch(() => {});
  }, []);

  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const { blocks, loading: loadingBlocks } = useBlocks(selectedDistrictId || undefined);
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const { dals, meta, loading, error, page, setPage } = useMangalDals(selectedDistrictId || undefined, 'MAHILA', selectedBlockId || undefined);

  const sortedDals = useMemo(
    () => [...dals].sort((a, b) =>
      String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { sensitivity: 'base' })
    ),
    [dals]
  );

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrictId(e.target.value);
    setSelectedBlockId('');
  };

  return (
    <>
      <PageHero
        hindiTitle="महिला मंगल दल"
        title="Mahila Mangal Dal — Community Initiative"
        subtitle="Empowering Women of Uttarakhand through community-led Mahila Mangal Dals"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Mahila Mangal Dal' }]}
        stats={[
          { value: '13', label: 'Districts' },
          { value: totalDals !== null ? String(totalDals) : '—', label: 'Active Dals' },
          { value: '2026', label: 'Updated' },
        ]}
      />

      <div className="max-w-[1280px] mx-auto mb-24 px-6">
        {/* About */}
        <div className="bg-gradient-to-r from-[#fdf2f8] to-[#fce7f3] rounded-[2rem] p-6 lg:p-8 mt-8 mb-6 border border-[#f9a8d4]">
          <h2 className="text-xl font-black text-[#be185d] mb-2">About Mahila Mangal Dal</h2>
          <p className="text-[#6b7280] leading-relaxed text-sm">
            Mahila Mangal Dals (MMDs) are women-led community organisations registered under the Department of
            Youth Welfare and PRD, Uttarakhand. They work on women empowerment, health awareness, skill development,
            and community upliftment across all 13 districts of the state.
          </p>
        </div>

        {/* Selector */}
        <div className="relative z-20 mb-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-[#be185d] shadow-sm">
                <i className="fas fa-map-marked-alt text-2xl" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-[#1e293b] leading-tight">Explore Districts</h3>
                <p className="text-[#64748b] text-xs lg:text-sm font-medium mt-1">Select a region to find Mahila Mangal Dals in your area.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-[240px] group">
                <select
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  disabled={loadingDistricts}
                  className="w-full pl-6 pr-12 py-4 text-sm font-bold border-2 border-gray-100 rounded-2xl appearance-none bg-gray-50/50 cursor-pointer focus:outline-none focus:border-[#be185d] focus:bg-white transition-all disabled:opacity-60 text-[#1e293b]"
                >
                  <option value="">Choose a District</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#be185d] transition-colors">
                  <i className="fas fa-chevron-down text-xs" />
                </div>
              </div>

              <div className="relative w-full sm:w-[240px] group">
                <select
                  value={selectedBlockId}
                  onChange={e => setSelectedBlockId(e.target.value)}
                  disabled={!selectedDistrictId || loadingBlocks}
                  className="w-full pl-6 pr-12 py-4 text-sm font-bold border-2 border-gray-100 rounded-2xl appearance-none bg-gray-50/50 cursor-pointer focus:outline-none focus:border-[#be185d] focus:bg-white transition-all disabled:opacity-60 text-[#1e293b]"
                >
                  <option value="">{loadingBlocks ? 'Loading…' : 'All Blocks'}</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#be185d] transition-colors">
                  <i className="fas fa-chevron-down text-xs" />
                </div>
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
                    <span className="w-6 h-[2px] bg-pink-100" /> Community Directory
                  </h4>
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1e293b] leading-tight">
                    {selectedDistrict?.name}
                    {selectedBlock && <><span className="text-[#be185d]/40 italic"> › </span><span className="text-[#be185d]/40 italic">{selectedBlock.name}</span></>}
                    {' '}<span className="text-[#be185d]/40 italic">Mahila Dals</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-[#be185d] rounded-full text-[10px] font-black uppercase tracking-widest border border-pink-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  {meta ? meta.total : dals.length} Result{(meta ? meta.total : dals.length) !== 1 ? 's' : ''} Found
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] h-[260px] animate-pulse border border-gray-100 shadow-sm" />
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
              ) : dals.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-gray-100 shadow-inner">
                    <i className="fas fa-users text-4xl text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1e293b] mb-4">No Dals Registered</h3>
                  <p className="text-[#64748b] font-medium leading-relaxed max-w-sm mx-auto">
                    No Mahila Mangal Dals found for {selectedBlock ? selectedBlock.name + ' block' : selectedDistrict?.name}. Please check back later.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedDals.map(dal => (
                      <div key={dal.id} className="bg-white rounded-[2rem] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(190,24,93,0.12)] hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#be185d] shadow-sm flex-shrink-0">
                            <i className="fas fa-users text-lg" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-[#1e293b] uppercase leading-tight truncate">{dal.name}</h3>
                            <p className="text-[10px] text-[#be185d] font-bold uppercase tracking-widest mt-0.5">Serial #{dal.serialNo}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5 text-sm text-[#64748b]">
                          <span className="flex items-center gap-2.5">
                            <i className="fas fa-map-marker-alt text-[#be185d] w-3.5 text-xs" />
                            <span className="font-medium">{dal.block.name} Block</span>
                          </span>
                          <span className="flex items-center gap-2.5">
                            <i className="fas fa-hashtag text-[#be185d] w-3.5 text-xs" />
                            <span>Affiliation: <span className="font-semibold text-[#1e293b]">{dal.affiliationNo}</span></span>
                          </span>
                          <span className="flex items-center gap-2.5">
                            <i className="fas fa-user-tie text-[#be185d] w-3.5 text-xs" />
                            <span className="font-medium truncate">{dal.chairperson}</span>
                          </span>
                          <span className="flex items-center gap-2.5">
                            <i className="fas fa-calendar text-[#be185d] w-3.5 text-xs" />
                            <span>{new Date(dal.affiliationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className="px-5 py-2.5 rounded-xl border-2 border-gray-100 text-sm font-bold text-[#64748b] hover:border-[#be185d] hover:text-[#be185d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-black transition-colors ${p === page ? 'bg-[#be185d] text-white shadow-lg shadow-pink-200' : 'border-2 border-gray-100 text-[#64748b] hover:border-[#be185d] hover:text-[#be185d]'}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= meta.totalPages}
                        className="px-5 py-2.5 rounded-xl border-2 border-gray-100 text-sm font-bold text-[#64748b] hover:border-[#be185d] hover:text-[#be185d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-[4rem] blur-2xl -z-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-16 lg:p-24 text-center border border-white shadow-xl overflow-hidden relative">
                <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-50">
                    <i className="fas fa-users text-5xl text-[#be185d]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-black text-[#1e293b] mb-6 tracking-tight leading-tight">
                    Your Discovery <br /><span className="text-[#be185d]">Starts Here</span>
                  </h3>
                  <p className="text-lg lg:text-xl text-[#64748b] font-medium leading-relaxed">
                    Select a district from the selector above to unlock the full directory of Mahila Mangal Dals in your region.
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
                <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-pink-100 rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-pink-100 rounded-br-3xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
