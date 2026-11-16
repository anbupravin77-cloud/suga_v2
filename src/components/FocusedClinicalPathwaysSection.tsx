import React, { useEffect, useRef, useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import {
  CLINICAL_PATHWAYS,
  PATHWAYS_INTRO,
  ClinicalPathwayItem,
  TreatmentCategoryId,
  evaluateMasterTimeline,
} from '../utils/treatments';

/**
 * Controls whether the pinned scroll-driven stage runs on mobile viewports (< 768px).
 * Set to true by default per specification; if false, mobile falls back to flowing bands.
 */
export const PINNED_ON_MOBILE = true;

interface FocusedClinicalPathwaysSectionProps {
  onStartConsultation: (category: TreatmentCategoryId, sourceTitle: string) => void;
  onViewProtocol: (pathway: ClinicalPathwayItem) => void;
}

const BAND_TOP_GRADIENTS: [string, string, string] = [
  'linear-gradient(to bottom, #F6F3EC 0%, rgba(246, 243, 236, 0) 100%)',
  'linear-gradient(to bottom, #D9DADD 0%, rgba(217, 218, 221, 0) 100%)',
  'linear-gradient(to bottom, #D3DCF7 0%, rgba(211, 220, 247, 0) 100%)',
];

export const FocusedClinicalPathwaysSection: React.FC<
  FocusedClinicalPathwaysSectionProps
> = ({ onStartConsultation, onViewProtocol }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lavenderLayerRef = useRef<HTMLDivElement | null>(null);
  const pinkLayerRef = useRef<HTMLDivElement | null>(null);
  const productRefs = useRef<(HTMLElement | null)[]>([null, null, null]);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  // True by default so enhanced pinned mode renders immediately on first paint;
  // switches to false only if JS timeline initialization throws or fails.
  const [timelineHealthy, setTimelineHealthy] = useState<boolean>(true);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  const usePinnedMode =
    !prefersReducedMotion &&
    timelineHealthy &&
    (PINNED_ON_MOBILE || !isMobileViewport);

  // Track prefers-reduced-motion and mobile viewport width
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    setPrefersReducedMotion(motionQuery.matches);
    setIsMobileViewport(mobileQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobileViewport(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    mobileQuery.addEventListener('change', handleMobileChange);
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      mobileQuery.removeEventListener('change', handleMobileChange);
    };
  }, []);

  // Single passive rAF-throttled scroll timeline for Enhanced Pinned Mode
  // Caches geometry on mount, window resize, and ResizeObserver (never calls getBoundingClientRect in scroll loop)
  useEffect(() => {
    if (!usePinnedMode) return;
    if (typeof window === 'undefined') return;

    const wrapperEl = wrapperRef.current;
    const stageEl = stageRef.current;
    if (!wrapperEl || !stageEl) {
      setTimelineHealthy(false);
      return;
    }

    let wrapperTop = 0;
    let wrapperHeight = 1;
    let stageHeight = 1;
    let headerH = 115;
    let lastP = -1;
    let rafId: number | null = null;

    const applyTimelineAtProgress = (p: number, force = false) => {
      if (
        !force &&
        lastP >= 0 &&
        Math.abs(p - lastP) < 0.0005 &&
        p !== 0 &&
        p !== 1
      ) {
        return;
      }
      lastP = p;

      const state = evaluateMasterTimeline(p);
      wrapperEl.dataset.scrollProgress = p.toFixed(4);

      if (lavenderLayerRef.current) {
        lavenderLayerRef.current.style.opacity = state.lavenderOpacity.toFixed(4);
      }
      if (pinkLayerRef.current) {
        pinkLayerRef.current.style.opacity = state.pinkOpacity.toFixed(4);
      }

      for (let i = 0; i < 3; i += 1) {
        const prodEl = productRefs.current[i];
        if (!prodEl) continue;
        const motion = state.products[i as 0 | 1 | 2];
        const isInactive = motion.opacity <= 0.001;

        prodEl.style.opacity = isInactive ? '0' : motion.opacity.toFixed(4);
        prodEl.style.transform = `translate3d(0, ${motion.translateY.toFixed(2)}px, 0)`;
        prodEl.style.visibility = isInactive ? 'hidden' : 'visible';
        prodEl.style.pointerEvents = isInactive ? 'none' : 'auto';
      }
    };

    const computeCurrentProgress = (): number => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const scrollableDistance = Math.max(1, wrapperHeight - stageHeight);
      const raw = (scrollY - wrapperTop + headerH) / scrollableDistance;
      if (raw <= 0) return 0;
      if (raw >= 1) return 1;
      return raw;
    };

    const measureGeometry = () => {
      try {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const wrapperRect = wrapperEl.getBoundingClientRect();
        const stageRect = stageEl.getBoundingClientRect();
        const headerEl = document.getElementById('site-header');

        headerH = headerEl
          ? Math.round(headerEl.getBoundingClientRect().height)
          : parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue('--header-h')
            ) || 115;

        wrapperTop = wrapperRect.top + scrollY;
        wrapperHeight = Math.max(1, wrapperEl.offsetHeight || wrapperRect.height);
        stageHeight = Math.max(
          1,
          stageEl.offsetHeight || stageRect.height || window.innerHeight - headerH
        );

        applyTimelineAtProgress(computeCurrentProgress(), true);
      } catch {
        setTimelineHealthy(false);
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        applyTimelineAtProgress(computeCurrentProgress(), false);
      });
    };

    const handleResize = () => {
      measureGeometry();
      window.requestAnimationFrame(() => {
        measureGeometry();
      });
    };

    measureGeometry();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureGeometry();
      });
      resizeObserver.observe(wrapperEl);
      resizeObserver.observe(stageEl);
      const headerEl = document.getElementById('site-header');
      if (headerEl) resizeObserver.observe(headerEl);
      const mainEl = document.querySelector('main');
      if (mainEl) resizeObserver.observe(mainEl);
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [usePinnedMode]);

  // Video playback orchestration:
  // In Pinned Mode: three invisible sentinels + IntersectionObserver play ONLY the active product video and pause the others.
  // In Fallback Mode: IntersectionObserver on each video plays when visible and pauses when off-screen.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prefersReducedMotion) {
      videoRefs.current.forEach((v) => {
        if (v) v.pause();
      });
      return;
    }

    if (typeof IntersectionObserver === 'undefined') return;

    if (usePinnedMode) {
      const activeSentinels = new Set<number>();

      const syncActiveVideo = () => {
        // Pick the lowest or highest intersecting sentinel index, or pause all if none intersect
        let activeIdx = -1;
        if (activeSentinels.has(0)) activeIdx = 0;
        if (activeSentinels.has(1)) activeIdx = 1;
        if (activeSentinels.has(2)) activeIdx = 2;

        videoRefs.current.forEach((video, idx) => {
          if (!video) return;
          if (idx === activeIdx) {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else {
            video.pause();
          }
        });
      };

      const sentinelObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            const idx = Number(target.dataset.sentinelIndex);
            if (Number.isNaN(idx)) continue;
            if (entry.isIntersecting) {
              activeSentinels.add(idx);
            } else {
              activeSentinels.delete(idx);
            }
          }
          syncActiveVideo();
        },
        {
          // Observe a horizontal band across the middle of the viewport so only the active sentinel triggers
          rootMargin: '-45% 0px -45% 0px',
          threshold: 0,
        }
      );

      sentinelRefs.current.forEach((sentinel) => {
        if (sentinel) sentinelObserver.observe(sentinel);
      });

      return () => sentinelObserver.disconnect();
    }

    // Fallback flowing-band video observer
    const fallbackVideoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      {
        rootMargin: '80px 0px 80px 0px',
        threshold: 0.15,
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) fallbackVideoObserver.observe(video);
    });

    return () => fallbackVideoObserver.disconnect();
  }, [usePinnedMode, prefersReducedMotion]);

  // Prevent visible restart flicker at loop boundary
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.duration && vid.duration - vid.currentTime <= 0.06) {
      vid.currentTime = 0.01;
      vid.play().catch(() => {});
    }
  };

  const renderProductContent = (
    pathway: ClinicalPathwayItem,
    index: number,
    isPinnedLayout: boolean
  ) => {
    const isVideoRight = pathway.videoPosition === 'right';
    const hasVideoError = Boolean(videoErrors[pathway.id]);

    return (
      <div
        className={`w-full max-w-[1100px] mx-auto px-[20px] md:px-8 min-w-0 grid grid-cols-1 items-center ${
          isPinnedLayout
            ? 'gap-3.5 sm:gap-5 md:gap-12 lg:gap-14'
            : 'gap-6 md:gap-12 lg:gap-14'
        } ${
          isVideoRight
            ? 'md:grid-cols-[1fr_45%]'
            : 'md:grid-cols-[45%_1fr]'
        }`}
      >
        {/* VIDEO COLUMN (Always top on mobile; alternating left/right on laptop) */}
        <div
          className={`w-full max-w-full min-w-0 ${
            isVideoRight ? 'md:order-2' : 'md:order-1'
          }`}
        >
          <div
            className={`relative w-full max-w-full min-w-0 mx-auto rounded-2xl md:rounded-3xl overflow-hidden bg-[#F6F3EC]/65 shadow-[0_14px_34px_-14px_rgba(20,53,43,0.14)] ring-1 ring-[#14352B]/10 ${
              isPinnedLayout
                ? 'aspect-[16/10] max-h-[200px] sm:max-h-[240px] md:max-h-none md:aspect-[4/3.6]'
                : 'aspect-[4/3] md:aspect-[4/3.6]'
            }`}
          >
            {!hasVideoError ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={pathway.videoSrc}
                poster={pathway.posterSrc}
                aria-label={pathway.videoAlt}
                width={800}
                height={600}
                autoPlay={index === 0 && !prefersReducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                onTimeUpdate={handleVideoTimeUpdate}
                onError={() =>
                  setVideoErrors((prev) => ({
                    ...prev,
                    [pathway.id]: true,
                  }))
                }
                className="w-full h-full object-cover block"
              />
            ) : (
              <img
                src={pathway.posterSrc}
                alt={pathway.videoAlt}
                width={800}
                height={600}
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/30"
            />
          </div>
        </div>

        {/* TEXT COLUMN (No per-child scroll stagger delays or animated blur) */}
        <div
          className={`w-full max-w-full min-w-0 ${
            isVideoRight ? 'md:order-1' : 'md:order-2'
          } flex flex-col items-start text-left`}
        >
          <span className="max-w-full min-w-0 text-[10.5px] md:text-[11.5px] font-bold tracking-[0.15em] uppercase text-[#14352B]/75 leading-tight">
            {pathway.categoryLabel}
          </span>

          <h3 className="mt-1 md:mt-2 max-w-full min-w-0 text-[24px] sm:text-[26px] md:text-[36px] lg:text-[40px] font-bold tracking-[-0.035em] leading-[1.08] text-[#14352B]">
            {pathway.title}
          </h3>

          <p className="mt-1.5 md:mt-3.5 max-w-full md:max-w-[52ch] min-w-0 text-[13.5px] sm:text-[14.5px] md:text-[16px] leading-[1.45] md:leading-[1.6] text-[#14352B]/85">
            {pathway.description}
          </p>

          {/* Stats Card (Solid translucent fill — no backdrop-blur filter) */}
          <div className="mt-3 md:mt-6 w-full max-w-full md:max-w-md min-w-0 grid grid-cols-2 rounded-xl md:rounded-2xl bg-[#F6F3EC]/75 border border-[#14352B]/12">
            <div className="min-w-0 max-w-full p-2.5 sm:p-3.5 md:py-4 md:px-5">
              <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#14352B]/65 leading-tight break-words">
                {pathway.stats.efficacyLabel}
              </div>
              <strong className="mt-0.5 md:mt-1 block text-[13px] md:text-[16px] font-bold text-[#14352B] leading-snug tabular-nums break-words">
                {pathway.stats.efficacyValue}
              </strong>
            </div>
            <div className="min-w-0 max-w-full p-2.5 sm:p-3.5 md:py-4 md:px-5 border-l border-[#14352B]/12">
              <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#14352B]/65 leading-tight break-words">
                {pathway.stats.resultsLabel}
              </div>
              <strong className="mt-0.5 md:mt-1 block text-[13px] md:text-[16px] font-bold text-[#14352B] leading-snug tabular-nums break-words">
                {pathway.stats.resultsValue}
              </strong>
            </div>
          </div>

          {/* Checklist Items */}
          <ul className="mt-3 md:mt-5 flex flex-col gap-1.5 sm:gap-2.5 w-full max-w-full min-w-0">
            {pathway.checklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 md:gap-3 max-w-full min-w-0 text-[13px] sm:text-[13.5px] md:text-[15px] font-medium text-[#14352B] leading-tight"
              >
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#14352B] text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[2.5]" />
                </span>
                <span className="min-w-0 max-w-full break-words">{item}</span>
              </li>
            ))}
          </ul>

          {/* Action Buttons Row */}
          <div className="mt-3.5 sm:mt-5 md:mt-7 flex flex-row items-center gap-2.5 md:gap-3.5 w-full md:w-auto max-w-full min-w-0">
            <button
              type="button"
              onClick={() => onViewProtocol(pathway)}
              className="flex-1 md:flex-initial min-w-0 max-w-full h-[42px] sm:h-[46px] md:h-[48px] px-4 md:px-6 rounded-full border border-[#14352B]/30 bg-[#F6F3EC]/70 hover:bg-[#14352B] text-[#14352B] hover:text-white text-[13px] sm:text-[13.5px] md:text-[14px] font-semibold tracking-[-0.01em] transition-colors duration-200 flex items-center justify-center whitespace-nowrap cursor-pointer"
            >
              View protocol
            </button>
            <button
              type="button"
              onClick={() => onStartConsultation(pathway.id, pathway.title)}
              className="group flex-1 md:flex-initial min-w-0 max-w-full h-[42px] sm:h-[46px] md:h-[48px] px-4 md:px-6 rounded-full bg-[#B82927] hover:bg-[#A32220] text-white text-[13px] sm:text-[13.5px] md:text-[14px] font-semibold tracking-[-0.01em] shadow-[0_6px_18px_-4px_rgba(184,41,39,0.38)] hover:shadow-[0_10px_22px_-4px_rgba(184,41,39,0.5)] transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Start consultation</span>
              <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="focused-clinical-pathways"
      aria-labelledby="pathways-section-heading"
      data-pathway-mode={usePinnedMode ? 'pinned' : 'fallback'}
      style={{ scrollMarginTop: 'var(--header-h, 115px)' }}
      className="relative w-full max-w-full"
    >
      {/* 1. Heading & Subtitle in Normal Page Flow (48px above, 24px below, centred, visible immediately) */}
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-12 pb-6 text-center">
        <h2
          id="pathways-section-heading"
          className="text-[28px] md:text-[clamp(2.2rem,4vw,3.4rem)] font-bold tracking-[-0.035em] leading-[1.1] text-[#14352B]"
        >
          {PATHWAYS_INTRO.heading}
        </h2>
        <p className="mt-2.5 md:mt-3.5 text-[15px] md:text-[17.5px] text-[#14352B]/80 leading-[1.45] md:leading-relaxed max-w-2xl mx-auto">
          {PATHWAYS_INTRO.subtitle}
        </p>
      </div>

      {/* 2A. ENHANCED PINNED MODE: 500vh laptop / 420vh mobile wrapper with 100svh - var(--header-h) sticky stage */}
      {usePinnedMode ? (
        <div
          id="pathways-scroll-wrapper"
          ref={wrapperRef}
          data-scroll-progress="0.0000"
          className="relative w-full max-w-full h-[420vh] md:h-[500vh]"
        >
          {/* Three invisible scroll-band sentinels for IntersectionObserver video playback control */}
          <div
            ref={(el) => {
              sentinelRefs.current[0] = el;
            }}
            data-sentinel-index={0}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[31%] invisible"
          />
          <div
            ref={(el) => {
              sentinelRefs.current[1] = el;
            }}
            data-sentinel-index={1}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[31%] h-[33%] invisible"
          />
          <div
            ref={(el) => {
              sentinelRefs.current[2] = el;
            }}
            data-sentinel-index={2}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[64%] h-[36%] invisible"
          />

          {/* Sticky Stage (uses svh, never vh; no overflow:hidden on ancestors) */}
          <div
            id="pathways-sticky-stage"
            ref={stageRef}
            style={{
              top: 'var(--header-h, 115px)',
              height: 'calc(100svh - var(--header-h, 115px))',
            }}
            className="sticky w-full max-w-full flex items-center justify-center"
          >
            {/* Three stacked full-size background layers: Grey (#D9DADD) base, Lavender (#D3DCF7), Pink (#F2C6CF) */}
            <div
              id="pathway-bg-grey"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[#D9DADD] z-0"
            />
            <div
              id="pathway-bg-lavender"
              ref={lavenderLayerRef}
              aria-hidden="true"
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 bg-[#D3DCF7] will-change-[opacity,transform] z-[1]"
            />
            <div
              id="pathway-bg-pink"
              ref={pinkLayerRef}
              aria-hidden="true"
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 bg-[#F2C6CF] will-change-[opacity,transform] z-[2]"
            />

            {/* Soft 80px gradient seam at top edge of stage (cream #F6F3EC into transparent) */}
            <div
              aria-hidden="true"
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, #F6F3EC 0%, rgba(246, 243, 236, 0) 100%)',
              }}
              className="pointer-events-none absolute inset-x-0 top-0 h-[80px] z-[3]"
            />

            {/* Three Product Blocks stacked in one grid cell; Product 1 visible at p=0 with no observer gate */}
            <div className="relative z-10 w-full max-w-full grid grid-cols-1 items-center py-3 md:py-8">
              {CLINICAL_PATHWAYS.map((pathway, index) => {
                const isFirst = index === 0;
                return (
                  <article
                    key={pathway.id}
                    id={`pathway-${pathway.id}`}
                    ref={(el) => {
                      productRefs.current[index] = el;
                    }}
                    style={{
                      opacity: isFirst ? 1 : 0,
                      transform: isFirst
                        ? 'translate3d(0, 0px, 0)'
                        : 'translate3d(0, 12px, 0)',
                      visibility: isFirst ? 'visible' : 'hidden',
                      pointerEvents: isFirst ? 'auto' : 'none',
                    }}
                    className="[grid-area:1/1] w-full max-w-full will-change-[opacity,transform]"
                  >
                    {renderProductContent(pathway, index, true)}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 2B. FALLBACK FLOWING-BAND LAYOUT (used for prefers-reduced-motion, timeline failure, or mobile when PINNED_ON_MOBILE=false) */
        <div
          id="pathways-fallback-bands"
          className="relative w-full max-w-full flex flex-col"
        >
          {CLINICAL_PATHWAYS.map((pathway, index) => {
            const prodIndex = index as 0 | 1 | 2;
            return (
              <article
                key={pathway.id}
                id={`pathway-${pathway.id}`}
                style={{
                  backgroundColor: pathway.backgroundHex,
                  scrollMarginTop: 'var(--header-h, 115px)',
                }}
                className="relative w-full max-w-full py-12 md:py-20"
              >
                <div
                  aria-hidden="true"
                  style={{ backgroundImage: BAND_TOP_GRADIENTS[prodIndex] }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-[80px] z-0"
                />
                <div className="relative z-10 w-full max-w-full">
                  {renderProductContent(pathway, index, false)}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
