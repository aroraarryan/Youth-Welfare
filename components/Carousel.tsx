'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const slides = [
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.26 (1).jpeg', alt: 'Youth Welfare Event 1' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.27 (1).jpeg', alt: 'Youth Welfare Event 2' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.28 (2).jpeg', alt: 'Youth Welfare Event 3' },
  { src: '/images/gallery/WhatsApp Image 2026-02-24 at 18.07.29.jpeg',     alt: 'Youth Welfare Event 4' },
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
      <div className="carousel w-full relative h-[500px] overflow-hidden">
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
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
