'use client';

import { useState } from 'react';

const stats = [
  { label: 'Youth Registered',    value: '1258635' },
  { label: 'Listed Youth Schemes', value: '118' },
  { label: 'Student Schemes',      value: '26' },
];

export default function FloatingSearchUI() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeBtn, setActiveBtn] = useState<'scheme' | 'advance'>('scheme');

  const handleSchemeBtn = () => { setActiveBtn('scheme'); setShowAdvanced(false); };
  const handleAdvanceBtn = () => { setActiveBtn('advance'); setShowAdvanced(true); };

  return (
    <div className="w-full px-5 py-6 bg-white">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-5 p-6 rounded-2xl">
        {/* Top row */}
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <div className="flex gap-3 items-center flex-shrink-0">
            <button
              onClick={handleSchemeBtn}
              className={`border-none rounded-xl cursor-pointer font-semibold h-12 px-5 text-sm transition-all ${
                activeBtn === 'scheme'
                  ? 'bg-white text-[#374151] border-2 border-[#e5e7eb] shadow'
                  : 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]'
              }`}
            >
              Search with Scheme Name
            </button>
            <button
              onClick={handleAdvanceBtn}
              className={`border-none rounded-xl cursor-pointer font-semibold h-12 px-5 text-sm transition-all ${
                activeBtn === 'advance'
                  ? 'bg-white text-[#374151] border-2 border-[#e5e7eb] shadow'
                  : 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]'
              }`}
            >
              Advance Search
            </button>
          </div>

          {/* Marquee */}
          <div className="flex-1 min-w-0">
            <div
              className="text-white px-5 py-3 rounded-xl overflow-hidden whitespace-nowrap relative h-12 flex items-center shadow-[0_4px_12px_rgba(55,48,163,0.3)]"
              style={{ background: 'linear-gradient(135deg,#3730a3 0%,#1e1b4b 100%)' }}
            >
              <span
                className="text-sm font-medium whitespace-nowrap inline-block"
                style={{ animation: 'scroll-text 25s linear infinite' }}
              >
                Single Platform for Youth of Uttarakhand to get information related to Jobs, Skill development,
                Vocational Training, Employment, Self-Employment, Higher Education, Competitive Examination,
                Carrier Counselling, Sports, Health, Secondary Education, Start-Up, Sewayojan etc.
              </span>
            </div>
          </div>
        </div>

        {/* Advanced search row */}
        {showAdvanced && (
          <div className="flex gap-6 flex-wrap items-end">
            <div className="flex gap-5 flex-1 flex-wrap">
              {[
                { label: 'Scheme Categories', options: ['Select Scheme Category', 'Education & Scholarship', 'Business & Entrepreneurship', 'Skill Development', 'Employment', 'Health & Wellness'] },
                { label: 'Age',               options: ['Select Age', '18-25', '26-35', '36-45', 'Above 45'] },
                { label: 'Select State',      options: ['Select Government', 'Central Government', 'State Government', 'Local Government'] },
              ].map(f => (
                <div key={f.label} className="min-w-[200px] flex-1">
                  <label className="block text-sm font-semibold text-[#374151] mb-2 uppercase tracking-wide">{f.label}</label>
                  <select className="w-full px-5 py-4 border-2 border-[#e5e7eb] rounded-lg text-lg text-[#374151] bg-white cursor-pointer focus:outline-none focus:border-[#1e3a8a] appearance-none pr-10">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button className="bg-[#10b981] hover:bg-[#059669] text-white border-none px-6 rounded-lg text-lg font-semibold cursor-pointer flex items-center gap-2 h-14 transition-all hover:-translate-y-px">
                <i className="fas fa-search" /> Search
              </button>
            </div>
            <StatsCard />
          </div>
        )}

        {/* Normal search row */}
        {!showAdvanced && (
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-1 border-2 border-[#e5e7eb] rounded-lg overflow-hidden max-w-[600px]">
              <input
                type="text"
                placeholder="Search with Scheme Name"
                className="flex-1 px-5 py-4 text-base text-[#374151] outline-none bg-white"
              />
              <button className="bg-[#1e3a8a] text-white px-6 border-none cursor-pointer text-lg hover:bg-[#1e40af] transition-colors">
                <i className="fas fa-search" />
              </button>
            </div>
            <StatsCard />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard() {
  return (
    <div className="flex gap-8 bg-[#f8fafc] rounded-xl px-6 py-4 border border-[#e2e8f0] flex-shrink-0">
      {[
        { label: 'Youth Registered',     value: '1258635' },
        { label: 'Listed Youth Schemes', value: '118' },
        { label: 'Student Schemes',      value: '26' },
      ].map(s => (
        <div key={s.label} className="text-center">
          <div className="text-xs text-[#6b7280] font-medium mb-1">{s.label}</div>
          <div className="text-xl font-bold text-[#1e3a8a]">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
