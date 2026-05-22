import PageHero from '@/components/PageHero';
import GalleryClient from '@/components/GalleryClient';

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

      <GalleryClient />
    </>
  );
}
