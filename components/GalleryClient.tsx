'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import PhotoSubmissionModal from '@/components/PhotoSubmissionModal';

interface GalleryImage {
  id: string;
  fullName: string;
  description: string;
  mediaUrls: string[];
  district?: { name: string } | null;
  blockName?: string | null;
  createdAt: string;
}

interface FlatImage {
  src: string;
  alt: string;
  name: string;
  location: string | null;
  blockName: string | null;
  description: string;
  createdAt: string;
}

type GalleryTab = 'department' | 'users';

const fetchGallery = (source: 'DEPARTMENT' | 'USER') =>
  fetch(`/api/gallery?source=${source}&limit=100`)
    .then((r) => r.json())
    .then((d) => d.data as GalleryImage[]);

export default function GalleryClient() {
  const [tab, setTab] = useState<GalleryTab>('department');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightbox, setLightbox] = useState<FlatImage | null>(null);

  const [fullscreen, setFullscreen] = useState(false);

  const closeLightbox = useCallback(() => { setLightbox(null); setFullscreen(false); }, []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (fullscreen) setFullscreen(false); else closeLightbox(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, fullscreen, closeLightbox]);

  const downloadImage = useCallback(async (src: string, name: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  }, []);

  const { data: deptImages = [] } = useQuery({
    queryKey: ['gallery', 'DEPARTMENT'],
    queryFn: () => fetchGallery('DEPARTMENT'),
    staleTime: 60 * 1000,
  });

  const { data: userImages = [] } = useQuery({
    queryKey: ['gallery', 'USER'],
    queryFn: () => fetchGallery('USER'),
    staleTime: 60 * 1000,
  });

  const activeItems = tab === 'department' ? deptImages : userImages;

  const flatImages: FlatImage[] = activeItems.flatMap((item) =>
    item.mediaUrls.map((src) => ({
      src,
      alt: item.fullName,
      name: item.fullName,
      location: item.district?.name ?? null,
      blockName: item.blockName ?? null,
      description: item.description,
      createdAt: item.createdAt,
    }))
  );

  return (
    <>
      {/* CTA banner */}
      <div className="bg-[#1e3a8a] text-white py-12 px-5 mb-0">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Share Your Achievement!</h2>
              <p className="text-blue-100/80 max-w-[500px] text-sm sm:text-base">Did you participate in a competition? Upload your photo and details to be featured in our official gallery.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-[#10b981] hover:bg-[#059669] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <i className="fas fa-camera text-xl" />
              Submit Your Photo
            </button>
          </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-5 py-10">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setTab('department')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              tab === 'department'
                ? 'bg-[#1e3a8a] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-building mr-2" />
            Uploaded by Department
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              tab === 'users'
                ? 'bg-[#1e3a8a] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-users mr-2" />
            Uploaded by Users
          </button>
        </div>

        {flatImages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-images text-5xl mb-4 text-gray-200" />
            <p className="text-lg font-medium">
              {tab === 'department' ? 'No department photos yet.' : 'No approved photos yet.'}
            </p>
            {tab === 'users' && (
              <p className="text-sm mt-1">Be the first to submit!</p>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {flatImages.map((img, i) => (
              <div
                key={i}
                onClick={() => setLightbox(img)}
                className="relative break-inside-avoid overflow-hidden rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-[#e2e8f0] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-1">
                    {img.name && img.name !== 'Department' && (
                      <p className="text-white/90 text-xs font-semibold flex items-center gap-1 drop-shadow">
                        <i className="fas fa-user text-[10px] text-[#10b981]" />
                        {img.name}
                      </p>
                    )}
                    {img.location && (
                      <p className="text-white/80 text-xs flex items-center gap-1 drop-shadow">
                        <i className="fas fa-map-marker-alt text-[10px] text-[#10b981]" />
                        {img.location}
                      </p>
                    )}
                    <p className="text-white text-xs font-medium leading-relaxed drop-shadow-lg line-clamp-2">{img.description}</p>
                    <div className="w-8 h-0.5 bg-[#10b981] mt-2 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PhotoSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors text-sm"
              aria-label="Close"
            >
              <i className="fas fa-times" />
            </button>

            {/* Image */}
            <div className="relative w-full md:w-[60%] bg-black flex-shrink-0 min-h-[250px] md:min-h-0">
              <Image
                src={lightbox.src}
                alt={lightbox.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              {/* Image action toolbar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => downloadImage(lightbox.src, lightbox.alt)}
                  className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                  title="Download"
                >
                  <i className="fas fa-download text-[10px]" />
                  Download
                </button>
                <button
                  onClick={() => setFullscreen(true)}
                  className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                  title="Full screen"
                >
                  <i className="fas fa-expand text-[10px]" />
                  Full screen
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4 p-6 overflow-y-auto md:w-[40%]">
              {lightbox.name && lightbox.name !== 'Department' && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Submitted by</p>
                  <p className="text-gray-800 font-semibold flex items-center gap-2">
                    <i className="fas fa-user text-[#10b981] text-sm" />
                    {lightbox.name}
                  </p>
                </div>
              )}

              {(lightbox.location || lightbox.blockName) && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
                  <div className="flex flex-col gap-1">
                    {lightbox.location && (
                      <p className="text-gray-700 flex items-center gap-2 text-sm">
                        <i className="fas fa-map-marker-alt text-[#10b981]" />
                        {lightbox.location}
                      </p>
                    )}
                    {lightbox.blockName && (
                      <p className="text-gray-600 flex items-center gap-2 text-sm pl-5">
                        {lightbox.blockName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{lightbox.description}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <i className="fas fa-calendar-alt" />
                  {new Date(lightbox.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen overlay */}
      {lightbox && fullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <Image
            src={lightbox.src}
            alt={lightbox.alt}
            fill
            className="object-contain"
            sizes="100vw"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Exit full screen"
          >
            <i className="fas fa-compress" />
          </button>
        </div>
      )}
    </>
  );
}
