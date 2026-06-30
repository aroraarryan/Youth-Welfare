'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const slides = [
  {
    src: '/images/carousel/cm-championship-trophy-closing-ceremony-2026.jpeg',
    alt: 'Chief Minister Pushkar Singh Dhami with youth athletes at the closing ceremony of Mukhyamantri Championship Trophy Uttarakhand 2025-26, February 2026',
    caption: 'Mukhyamantri Championship Trophy 2025–26 · Closing Ceremony',
  },
  {
    src: '/images/carousel/cm-championship-trophy-presentation-2026.jpeg',
    alt: 'Trophy presentation at Mukhyamantri Championship Trophy 2025-26 closing ceremony with flower petals raining on stage',
    caption: 'Mukhyamantri Championship Trophy 2025–26 · Trophy Presentation',
  },
  {
    src: '/images/carousel/prd-personnel-parade-drill.jpeg',
    alt: 'Prantiya Rakshak Dal (PRD) personnel in uniform performing parade drill formation on a sports ground',
    caption: 'Prantiya Rakshak Dal · Annual Parade & Drill',
  },
  {
    src: '/images/carousel/young-leaders-dialogue-2026-samvad-dehradun.jpeg',
    alt: 'Uttarakhand youth delegation with CM Pushkar Singh Dhami at Mukhya Sevak Sadan, Dehradun, ahead of Viksit Bharat Young Leaders Dialogue 2026',
    caption: 'Viksit Bharat Young Leaders Dialogue 2026 · Samvad with CM',
  },
  {
    src: '/images/carousel/young-leaders-dialogue-2026-flag-off.jpeg',
    alt: 'Flag-off ceremony for Uttarakhand youth delegation to Viksit Bharat Young Leaders Dialogue 2026 in New Delhi, with delegates in traditional regional attire',
    caption: 'Viksit Bharat Young Leaders Dialogue 2026 · Flag-Off Ceremony',
  },
  {
    src: '/images/carousel/young-leaders-dialogue-2026-youth-delegation.jpeg',
    alt: 'Uttarakhand youth delegates in traditional Garhwali and Kumaoni attire at the Viksit Bharat Young Leaders Dialogue 2026 flag-off',
    caption: 'Viksit Bharat Young Leaders Dialogue 2026 · Youth Delegation',
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % slides.length) + slides.length) % slides.length);
  }, []);

  const startAuto = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, 5000);
  }, []);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  return (
    <div
      className="carousel-container w-full max-w-full overflow-hidden relative rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
    >
      <div className="carousel w-full relative h-[250px] sm:h-[400px] lg:h-[550px] overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`carousel-slide${i === current ? ' active' : ''}`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {i === current && slide.caption && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/65 to-transparent pt-8 pb-4 px-4 sm:px-6">
                <p className="text-white text-[11px] sm:text-xs lg:text-sm font-semibold tracking-wide drop-shadow-lg">
                  {slide.caption}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Arrows */}
        <button
          className="carousel-arrow prev"
          onClick={() => goTo(current - 1)}
          aria-label="Previous slide"
        >
          &#8249;
        </button>
        <button
          className="carousel-arrow next"
          onClick={() => goTo(current + 1)}
          aria-label="Next slide"
        >
          &#8250;
        </button>

        {/* Indicators */}
        <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`carousel-indicator${i === current ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
