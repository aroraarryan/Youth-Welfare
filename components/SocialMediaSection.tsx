'use client';

import { useState } from 'react';

type Tab = 'instagram' | 'youtube' | 'facebook';

const INSTAGRAM_HANDLE = 'officialukprd';
const FACEBOOK_PAGE = 'DepartmentofYouthWelfare';

const YOUTUBE_VIDEOS = [
  'FOPOzwOJDhI',
  'aunnzhuQgLY',
  'hEZHpYWOTjM',
];

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C' },
  { id: 'youtube',  label: 'YouTube',   icon: 'fa-brands fa-youtube',    color: '#FF0000' },
  { id: 'facebook', label: 'Facebook',  icon: 'fa-brands fa-facebook-f', color: '#1877F2' },
];

export default function SocialMediaSection() {
  const [activeTab, setActiveTab] = useState<Tab>('instagram');


  const fbSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    `https://www.facebook.com/${FACEBOOK_PAGE}`
  )}&tabs=timeline&width=1200&height=640&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=en_US`;

  return (
    <section className="bg-gray-50 py-14 px-4 sm:px-10">
      <div className="max-w-[1300px] mx-auto">
        {/* Heading */}
        <p className="text-center text-sm font-semibold text-[#1e3a8a] uppercase tracking-widest mb-2">
          Our Social Media
        </p>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
          Stay Connected With Us Through Our Social Media Channels
        </h2>

        {/* Tab bar */}
        <div className="flex gap-2 sm:gap-8 border-b border-gray-200 mb-8 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#1e3a8a] text-[#1e3a8a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={tab.icon} style={{ color: activeTab === tab.id ? tab.color : undefined }} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Instagram */}
        {activeTab === 'instagram' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full">
            <iframe
              title="Instagram profile"
              src={`https://www.instagram.com/${INSTAGRAM_HANDLE}/embed`}
              width="100%"
              height="640"
              style={{ border: 0, display: 'block', width: '100%' }}
              allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

{/* YouTube grid */}
        {activeTab === 'youtube' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {YOUTUBE_VIDEOS.map((vid, i) => (
              <div key={`${vid}-${i}`} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <iframe
                  title={`YouTube video ${i + 1}`}
                  src={`https://www.youtube.com/embed/${vid}`}
                  width="100%"
                  height="215"
                  style={{ border: 0, display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Facebook page plugin */}
        {activeTab === 'facebook' && (
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full max-w-[500px]">
              <iframe
                title="Facebook page"
                src={fbSrc}
                width="500"
                height="640"
                style={{ border: 0, overflow: 'hidden', display: 'block', width: '100%' }}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
                scrolling="no"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
