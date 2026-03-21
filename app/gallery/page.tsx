import Image from 'next/image';
import PageHero from '@/components/PageHero';

const galleryImages = [
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.26 (1).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.26.jpeg',     alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.27 (1).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.27 (2).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.27.jpeg',     alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.28 (1).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.28 (2).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.28.jpeg',     alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.29 (1).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.29 (2).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.29.jpeg',     alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.30 (1).jpeg', alt: 'Youth Welfare Event' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.30.jpeg',     alt: 'Youth Welfare Event' },
  { src: '/images/gallery/new.jpeg',                                        alt: 'Youth Welfare Event' },
];

export const metadata = {
  title: 'Gallery | Youth Welfare & PRD, Uttarakhand',
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        hindiTitle="फोटो गैलरी"
        title="Photo Gallery — Youth Welfare & PRD Department"
        subtitle="Capturing moments from youth programs, events, and initiatives across Uttarakhand"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: '50+', label: 'Events' },
          { value: '2026', label: 'Edition' },
        ]}
      />

      <main className="max-w-[1400px] mx-auto px-5 py-12">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="break-inside-avoid overflow-hidden rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-[#e2e8f0] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
