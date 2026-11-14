import React, { useEffect, useRef, useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import {
  CLINICAL_PATHWAYS,
  PATHWAYS_INTRO,
  ClinicalPathwayItem,
  MasterTimelineState,
  TreatmentCategoryId,
  evaluateMasterTimeline,
} from '../utils/treatments';

interface FocusedClinicalPathwaysSectionProps {
  onStartConsultation: (category: TreatmentCategoryId, sourceTitle: string) => void;
  onViewProtocol: (pathway: ClinicalPathwayItem) => void;
}

export const FocusedClinicalPathwaysSection: React.FC<
  FocusedClinicalPathwaysSectionProps
> = ({ onStartConsultation, onViewProtocol }) => {
  const headingRef = useRef<HTMLDivElement | null>(null);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [hasHeadingEntered, setHasHeadingEntered] = useState<boolean>(false);
  const [hasProduct1Entered, setHasProduct1Entered] = useState<boolean>(false);
  const [timeline, setTimeline] = useState<MasterTimelineState>(() =>
    evaluateMasterTimeline(0, false)
  );

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setHasHeadingEntered(true);
      setHasProduct1Entered(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setHasHeadingEntered(true);
        setHasProduct1Entered(true);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Observe section heading for smooth fade-up reveal
  useEffect(() => {
    const el = headingRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasHeadingEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasHeadingEntered(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Trigger Product 1's one-time staggered text entrance when the stage is meaningfully in the viewport
  useEffect(() => {
    if (hasProduct1Entered) return;
    const stageEl = stageRef.current;
    if (!stageEl || typeof IntersectionObserver === 'undefined') {
      setHasProduct1Entered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasProduct1Entered(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [hasProduct1Entered]);

  // Single Master Timeline Driven Exclusively by Scroll Progress p (0 to 1) Across the 600vh Scroll Wrapper
  useEffect(() => {
    let rafId: number | null = null;

    const updateTimelineFromScroll = () => {
      rafId = null;
      const wrapperEl = scrollWrapperRef.current;
      const stageEl = stageRef.current;
      if (!wrapperEl || !stageEl) return;

      const wrapperRect = wrapperEl.getBoundingClientRect();
      const headerEl = document.getElementById('site-header');
      const headerH = headerEl ? headerEl.offsetHeight : 115;
      const stageH = stageEl.offsetHeight || Math.max(1, window.innerHeight - headerH);
      const totalScrollable = Math.max(1, wrapperRect.height - stageH);

      const rawP = (headerH - wrapperRect.top) / totalScrollable;
      const clampedP = Math.max(0, Math.min(1, rawP));

      setTimeline(evaluateMasterTimeline(clampedP, prefersReducedMotion));
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateTimelineFromScroll);
      }
    };

    updateTimelineFromScroll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [prefersReducedMotion]);

  // Play ONLY the active product's video based on the master timeline; pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (timeline.activeVideoIndex === idx) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [timeline.activeVideoIndex]);

  // Prevent visible restart flicker at loop boundary
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.duration && vid.duration - vid.currentTime <= 0.06) {
      vid.currentTime = 0.01;
      vid.play().catch(() => {});
    }
  };

  /**
   * Staggered text entrance animation for every product (Product 1, Product 2, and Product 3).
   * When a product is active, each step (0: Category Label, 1: Title, 2: Description,
   * 3: Stats Card, 4..6: Checklist Items, 7: Buttons Row) cascades upward with an 80ms step delay.
   */
  const getStaggeredTextStyle = (
    productIndex: 0 | 1 | 2,
    stepOrder: number
  ): React.CSSProperties => {
    if (prefersReducedMotion) return {};

    const prodMotion = timeline.products[productIndex];
    const isProductActive =
      productIndex === 0
        ? hasProduct1Entered && prodMotion.isVisible && timeline.p <= 0.24
        : prodMotion.isVisible && prodMotion.opacity > 0.08;

    return {
      opacity: isProductActive ? 1 : 0,
      transform: isProductActive
        ? 'translate3d(0, 0, 0)'
        : 'translate3d(0, 22px, 0)',
      transitionProperty: 'opacity, transform',
      transitionDuration: isProductActive ? '620ms' : '260ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      transitionDelay: isProductActive ? `${stepOrder * 75}ms` : '0ms',
    };
  };

  const getVideoCardStyle = (productIndex: 0 | 1 | 2): React.CSSProperties => {
    if (prefersReducedMotion) return {};
    const prodMotion = timeline.products[productIndex];
    const isProductActive =
      productIndex === 0
        ? hasProduct1Entered && prodMotion.isVisible && timeline.p <= 0.24
        : prodMotion.isVisible && prodMotion.opacity > 0.05;

    return {
      opacity: isProductActive ? 1 : 0,
      transform: isProductActive
        ? 'translate3d(0, 0, 0) scale(1)'
        : 'translate3d(0, 20px, 0) scale(0.97)',
      transitionProperty: 'opacity, transform',
      transitionDuration: isProductActive ? '640ms' : '260ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      transitionDelay: '0ms',
    };
  };

  return (
    <section
      id="focused-clinical-pathways"
      aria-labelledby="pathways-section-heading"
      data-scroll-progress={timeline.p.toFixed(3)}
      className="relative w-full max-w-full"
    >
      {/* 1. Heading & Subtitle in NORMAL Page Flow (48px above, 24px below, centred, with staggered reveal) */}
      <div
        ref={headingRef}
        className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-12 pb-6 text-center"
      >
        <h2
          id="pathways-section-heading"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: hasHeadingEntered ? 1 : 0,
                  transform: hasHeadingEntered
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, 20px, 0)',
                  transition:
                    'opacity 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
                }
          }
          className="text-[28px] md:text-[clamp(2.2rem,4vw,3.4rem)] font-bold tracking-[-0.035em] leading-[1.1] text-[#14352B]"
        >
          {PATHWAYS_INTRO.heading}
        </h2>
        <p
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: hasHeadingEntered ? 1 : 0,
                  transform: hasHeadingEntered
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, 20px, 0)',
                  transition:
                    'opacity 560ms cubic-bezier(0.22, 1, 0.36, 1) 90ms, transform 560ms cubic-bezier(0.22, 1, 0.36, 1) 90ms',
                }
          }
          className="mt-2.5 md:mt-3.5 text-[15px] md:text-[17.5px] text-[#14352B]/80 leading-[1.45] md:leading-relaxed max-w-2xl mx-auto"
        >
          {PATHWAYS_INTRO.subtitle}
        </p>
      </div>

      {/* 2. Scroll Wrapper (~600vh tall) Containing One Sticky Stage */}
      <div
        ref={scrollWrapperRef}
        id="pathways-scroll-wrapper"
        className="relative w-full h-[600vh]"
      >
        {/* Single Sticky Stage: position: sticky; top: var(--header-h); height: calc(100svh - var(--header-h)) */}
        <div
          ref={stageRef}
          style={{
            backgroundColor: timeline.backgroundColor,
          }}
          className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] w-full max-w-full flex items-center justify-center"
        >
          {/* Soft 80px Top-Edge Gradient (Cream #F6F3EC to stage grey/transparent) so it eases in as it scrolls up */}
          <div
            aria-hidden="true"
            style={{
              opacity: Math.max(0, 1 - timeline.p * 6),
            }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[80px] bg-[linear-gradient(to_bottom,#F6F3EC_0%,rgba(246,243,236,0)_100%)] z-0"
          />

          {/* Stacked Grid Stage: All 3 products occupy the exact same grid cell (grid-area: 1 / 1) */}
          <div className="relative z-10 w-full max-w-[1100px] mx-auto px-[20px] md:px-8 h-full grid items-center min-w-0">
            {CLINICAL_PATHWAYS.map((pathway, index) => {
              const prodIndex = index as 0 | 1 | 2;
              const prodMotion = timeline.products[prodIndex];
              const isVideoRight = pathway.videoPosition === 'right';

              return (
                <article
                  key={pathway.id}
                  id={`pathway-${pathway.id}`}
                  style={{
                    opacity: prodMotion.opacity,
                    transform: `translate3d(0, ${prodMotion.translateY}px, 0)`,
                  }}
                  className={`[grid-area:1/1] w-full max-w-full min-w-0 ${
                    prodMotion.isVisible
                      ? 'z-10 pointer-events-auto'
                      : 'z-0 pointer-events-none'
                  }`}
                >
                  {/*
                    Mobile (<768px): Spacious single column with responsive svh-scaled breathing room and a large 4:3 video window.
                    Laptop (>=768px): Two columns vertically centred, video ~45% width, alternating left/right.
                  */}
                  <div
                    className={`w-full max-w-full min-w-0 grid grid-cols-1 gap-[clamp(14px,2.2svh,22px)] md:gap-12 lg:gap-14 items-center ${
                      isVideoRight
                        ? 'md:grid-cols-[1fr_45%]'
                        : 'md:grid-cols-[45%_1fr]'
                    }`}
                  >
                    {/* VIDEO COLUMN (Always top on mobile; left/right on laptop) */}
                    <div
                      style={getVideoCardStyle(prodIndex)}
                      className={`w-full max-w-full min-w-0 ${
                        isVideoRight ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <div className="relative w-full max-w-full min-w-0 aspect-[4/3] h-[clamp(165px,28svh,255px)] md:h-auto md:aspect-[4/3.6] mx-auto rounded-2xl md:rounded-3xl overflow-hidden bg-white/45 shadow-[0_18px_44px_-16px_rgba(20,53,43,0.16)] ring-1 ring-[#14352B]/10">
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          src={pathway.videoSrc}
                          poster={pathway.posterSrc}
                          aria-label={pathway.videoAlt}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          onTimeUpdate={handleVideoTimeUpdate}
                          className="w-full h-full object-cover block"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/30"
                        />
                      </div>
                    </div>

                    {/* TEXT COLUMN WITH STAGGERED ENTRANCE */}
                    <div
                      className={`w-full max-w-full min-w-0 ${
                        isVideoRight ? 'md:order-1' : 'md:order-2'
                      } flex flex-col items-start text-left`}
                    >
                      {/* Step 1: Category Label */}
                      <span
                        style={getStaggeredTextStyle(prodIndex, 1)}
                        className="max-w-full min-w-0 text-[11px] md:text-[11.5px] font-bold tracking-[0.15em] uppercase text-[#14352B]/75 leading-tight"
                      >
                        {pathway.categoryLabel}
                      </span>

                      {/* Step 2: Title */}
                      <h3
                        style={getStaggeredTextStyle(prodIndex, 2)}
                        className="mt-[clamp(4px,0.9svh,8px)] md:mt-2 max-w-full min-w-0 text-[26px] md:text-[36px] lg:text-[40px] font-bold tracking-[-0.035em] leading-[1.1] md:leading-[1.08] text-[#14352B]"
                      >
                        {pathway.title}
                      </h3>

                      {/* Step 3: Description */}
                      <p
                        style={getStaggeredTextStyle(prodIndex, 3)}
                        className="mt-[clamp(8px,1.4svh,12px)] md:mt-3.5 max-w-full md:max-w-[52ch] min-w-0 text-[14px] md:text-[16px] leading-[1.48] md:leading-[1.6] text-[#14352B]/85"
                      >
                        {pathway.description}
                      </p>

                      {/* Step 4: Stats Card */}
                      <div
                        style={getStaggeredTextStyle(prodIndex, 4)}
                        className="mt-[clamp(12px,2svh,18px)] md:mt-6 w-full max-w-full md:max-w-md min-w-0 grid grid-cols-2 rounded-xl md:rounded-2xl bg-white/60 backdrop-blur-sm border border-[#14352B]/12"
                      >
                        <div className="min-w-0 max-w-full p-[clamp(9px,1.5svh,14px)] md:py-4 md:px-5">
                          <div className="text-[10.5px] md:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#14352B]/65 leading-tight break-words">
                            {pathway.stats.efficacyLabel}
                          </div>
                          <strong className="mt-1 block text-[13px] md:text-[16px] font-bold text-[#14352B] leading-snug tabular-nums break-words">
                            {pathway.stats.efficacyValue}
                          </strong>
                        </div>
                        <div className="min-w-0 max-w-full p-[clamp(9px,1.5svh,14px)] md:py-4 md:px-5 border-l border-[#14352B]/12">
                          <div className="text-[10.5px] md:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#14352B]/65 leading-tight break-words">
                            {pathway.stats.resultsLabel}
                          </div>
                          <strong className="mt-1 block text-[13px] md:text-[16px] font-bold text-[#14352B] leading-snug tabular-nums break-words">
                            {pathway.stats.resultsValue}
                          </strong>
                        </div>
                      </div>

                      {/* Steps 5..7: Checklist Items (Each item staggers individually!) */}
                      <ul className="mt-[clamp(12px,2svh,18px)] md:mt-5 flex flex-col gap-[clamp(8px,1.3svh,12px)] md:gap-2.5 w-full max-w-full min-w-0">
                        {pathway.checklist.map((item, itemIdx) => (
                          <li
                            key={item}
                            style={getStaggeredTextStyle(prodIndex, 5 + itemIdx)}
                            className="flex items-center gap-2.5 md:gap-3 max-w-full min-w-0 text-[13.5px] md:text-[15px] font-medium text-[#14352B] leading-tight"
                          >
                            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#14352B] text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[2.5]" />
                            </span>
                            <span className="min-w-0 max-w-full break-words">{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Step 8: Buttons Row */}
                      <div
                        style={getStaggeredTextStyle(prodIndex, 8)}
                        className="mt-[clamp(14px,2.2svh,22px)] md:mt-7 flex flex-row items-center gap-3 md:gap-3.5 w-full md:w-auto max-w-full min-w-0"
                      >
                        <button
                          type="button"
                          onClick={() => onViewProtocol(pathway)}
                          className="flex-1 md:flex-initial min-w-0 max-w-full h-[clamp(44px,6svh,48px)] md:h-[48px] px-3 md:px-6 rounded-full border border-[#14352B]/30 bg-white/55 hover:bg-[#14352B] text-[#14352B] hover:text-white text-[13.5px] md:text-[14px] font-semibold tracking-[-0.01em] transition-all duration-200 flex items-center justify-center whitespace-nowrap cursor-pointer"
                        >
                          View protocol
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onStartConsultation(pathway.id, pathway.title)
                          }
                          className="group flex-1 md:flex-initial min-w-0 max-w-full h-[clamp(44px,6svh,48px)] md:h-[48px] px-3 md:px-6 rounded-full bg-[#B82927] hover:bg-[#A32220] text-white text-[13.5px] md:text-[14px] font-semibold tracking-[-0.01em] shadow-[0_6px_18px_-4px_rgba(184,41,39,0.4)] hover:shadow-[0_10px_22px_-4px_rgba(184,41,39,0.52)] transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap cursor-pointer"
                        >
                          <span>Start consultation</span>
                          <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
