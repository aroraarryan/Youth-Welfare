import Image from 'next/image';

// ponytail: pinned to a single static hero image for now — no rotation/arrows/
// indicators needed for one slide. Restore the multi-slide version (git log)
// when more images are ready to rotate back in.
const slide = {
  src: '/images/IMG_4083.jpg',
  alt: 'Mero Yuva — Welcome to Youth Welfare & PRD Uttarakhand',
  caption: 'Mero Yuva · Empowering Youth, Building Tomorrow',
};

export default function Carousel() {
  return (
    <div className="carousel-container w-full max-w-full overflow-hidden relative">
      <div className="carousel w-full relative h-[200px] sm:h-[400px] lg:h-[640px] overflow-hidden">
        <div className="carousel-slide active">
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority
            className="object-cover object-center"
            quality={90}
            sizes="100vw"
          />
          {slide.caption && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/65 to-transparent pt-8 pb-4 px-4 sm:px-6">
              <p className="text-white text-[11px] sm:text-xs lg:text-sm font-semibold tracking-wide drop-shadow-lg">
                {slide.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
