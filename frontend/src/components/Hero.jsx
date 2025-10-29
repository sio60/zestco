import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SLIDES = Array.from(
  { length: 7 },
  (_, i) => `/slides/slide${i + 1}.png`
);
const AUTOPLAY_MS = 5000;

export default function Hero({ slides = DEFAULT_SLIDES, fit = "contain" }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const safeSlides = useMemo(
    () => (slides?.length ? slides : DEFAULT_SLIDES),
    [slides]
  );

  const next = () => setIdx((p) => (p + 1) % safeSlides.length);
  const prev = () =>
    setIdx((p) => (p - 1 + safeSlides.length) % safeSlides.length);

  // autoplay
  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, safeSlides.length]);

  // touch swipe
  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const TH = 40;
    if (dx > TH) prev();
    if (dx < -TH) next();
    touchStartX.current = null;
  };

  return (
    <section
      className={`hero ${fit === "cover" ? "is-cover" : "is-contain"}`}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* slides */}
      <div
        className="hero__track"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {safeSlides.map((src, i) => (
          <div className="hero__slide" key={src}>
            <img src={src} alt={`Slide ${i + 1}`} />
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        className="hero__arrow hero__prev"
        aria-label="Previous slide"
        onClick={prev}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="hero__arrow hero__next"
        aria-label="Next slide"
        onClick={next}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* dots */}
      <div className="hero__dots" role="tablist" aria-label="Slides">
        {safeSlides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={idx === i}
            aria-label={`Go to slide ${i + 1}`}
            className={`hero__dot ${idx === i ? "is-active" : ""}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>

      {/* bottom wave */}
      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C120,96 240,112 360,112 C480,112 600,96 720,80 C840,64 960,48 1080,64 C1200,80 1320,112 1440,112 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
