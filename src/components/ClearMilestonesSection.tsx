import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MILESTONES_INTRO,
  MILESTONE_TABS,
  TreatmentCategoryId,
  getMilestoneSwitchTimings,
  getMilestoneTabById,
} from '../utils/treatments';

interface ClearMilestonesSectionProps {
  externalSelectedCategory: TreatmentCategoryId | null;
  externalSelectionTrigger: number;
  onQualifyClick: (category: TreatmentCategoryId, sourceLabel: string) => void;
}

type CardAnimPhase = 'idle' | 'collapsing' | 'collapsing-fast' | 'expanding';

// Fixed vertical geometry so the 3 dots stay in an identical common place across all tabs
const DESKTOP_CARD_HEIGHT_PX = 172;
const DESKTOP_CARD_GAP_PX = 16;
const DESKTOP_ROW_STRIDE_PX = DESKTOP_CARD_HEIGHT_PX + DESKTOP_CARD_GAP_PX; // 188px
const DESKTOP_DOT_TOP_OFFSETS: [number, number, number] = [
  22,
  22 + DESKTOP_ROW_STRIDE_PX,
  22 + DESKTOP_ROW_STRIDE_PX * 2,
];

const MOBILE_CARD_HEIGHT_PX = 188;
const MOBILE_CARD_GAP_PX = 12;
const MOBILE_ROW_STRIDE_PX = MOBILE_CARD_HEIGHT_PX + MOBILE_CARD_GAP_PX; // 200px
const MOBILE_DOT_TOP_OFFSETS: [number, number, number] = [
  22,
  22 + MOBILE_ROW_STRIDE_PX,
  22 + MOBILE_ROW_STRIDE_PX * 2,
];

interface TimelineDotProps {
  index: number;
  topPx: number;
  testIdPrefix: string;
  rippleWaveId: number;
  isRippleActive: boolean;
  isDotScaledUp: boolean;
  prefersReducedMotion: boolean;
  positionClassName: string;
}

const PermanentTimelineDot: React.FC<TimelineDotProps> = ({
  index,
  topPx,
  testIdPrefix,
  rippleWaveId,
  isRippleActive,
  isDotScaledUp,
  prefersReducedMotion,
  positionClassName,
}) => {
  return (
    <div
      aria-hidden="true"
      data-testid={`${testIdPrefix}-dot-${index}`}
      style={{ top: `${topPx}px` }}
      className={`pointer-events-none absolute w-[12px] h-[12px] flex items-center justify-center z-20 ${positionClassName}`}
    >
      {/* Two 12px ripple rings with 1.5px forest-green border at 45% opacity -> scale 1 to 3.2, fade to 0 over 700ms (2nd delayed 140ms) */}
      {!prefersReducedMotion && isRippleActive && rippleWaveId > 0 && (
        <>
          <span
            key={`ripple-${rippleWaveId}-1`}
            data-testid={`${testIdPrefix}-ripple-${index}-1`}
            style={{
              animation:
                'milestoneDotRipple 700ms cubic-bezier(0.22, 1, 0.36, 1) 0ms 1 normal forwards',
            }}
            className="pointer-events-none absolute inset-0 w-[12px] h-[12px] rounded-full border-[1.5px] border-[#14352B] opacity-0"
          />
          <span
            key={`ripple-${rippleWaveId}-2`}
            data-testid={`${testIdPrefix}-ripple-${index}-2`}
            style={{
              animation:
                'milestoneDotRipple 700ms cubic-bezier(0.22, 1, 0.36, 1) 140ms 1 normal forwards',
            }}
            className="pointer-events-none absolute inset-0 w-[12px] h-[12px] rounded-full border-[1.5px] border-[#14352B] opacity-0"
          />
        </>
      )}

      {/* Permanent 12px forest green (#14352B) dot with 3px cream (#F6F3EC) ring */}
      <span
        style={{
          transform:
            !prefersReducedMotion && isDotScaledUp ? 'scale(1.3)' : 'scale(1)',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="block w-[12px] h-[12px] rounded-full bg-[#14352B] shadow-[0_0_0_3px_#F6F3EC]"
      />
    </div>
  );
};

export const ClearMilestonesSection: React.FC<ClearMilestonesSectionProps> = ({
  externalSelectedCategory,
  externalSelectionTrigger,
  onQualifyClick,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mobileRowRefs = useRef<Record<TreatmentCategoryId, HTMLButtonElement | null>>({
    'weight-loss': null,
    'hair-growth': null,
    'sexual-health': null,
  });

  // Timer refs for clean cancellation and mid-animation interruption
  const hoverTimeoutRef = useRef<number | null>(null);
  const expandTimeoutRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const dotPulseUpTimeoutRef = useRef<number | null>(null);
  const dotPulseDownTimeoutRef = useRef<number | null>(null);
  const rippleCleanupTimeoutRef = useRef<number | null>(null);
  const mobilePanelSwitchTimeoutRef = useRef<number | null>(null);
  const mobileScrollTimeoutRef = useRef<number | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [hasSectionEntered, setHasSectionEntered] = useState<boolean>(true);
  const [hasInitialEntranceFinished, setHasInitialEntranceFinished] =
    useState<boolean>(true);

  // Active tab state (Weight Loss open/selected by default)
  const [activeTabId, setActiveTabId] = useState<TreatmentCategoryId>('weight-loss');
  // Displayed card content (updates at the collapse-to-expand handoff point so old & new cards never overlap)
  const [displayedTabId, setDisplayedTabId] =
    useState<TreatmentCategoryId>('weight-loss');
  // Open mobile accordion row (only one row open at a time; Weight Loss by default)
  const [openMobileTabId, setOpenMobileTabId] =
    useState<TreatmentCategoryId>('weight-loss');

  // Card animation phase & permanent dot pulse / ripple states
  const [cardPhase, setCardPhase] = useState<CardAnimPhase>('idle');
  const [rippleWaveId, setRippleWaveId] = useState<number>(0);
  const [isRippleActive, setIsRippleActive] = useState<boolean>(false);
  const [isDotScaledUp, setIsDotScaledUp] = useState<boolean>(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    if (mq.matches) {
      setHasSectionEntered(true);
      setHasInitialEntranceFinished(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setHasSectionEntered(true);
        setHasInitialEntranceFinished(true);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Section scroll-into-view first entrance (visible by default; progressive reveal only when below fold)
  useEffect(() => {
    const el = sectionRef.current;
    if (
      !el ||
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setHasSectionEntered(true);
      setHasInitialEntranceFinished(true);
      return;
    }

    const vh = window.innerHeight || 900;
    const rect = el.getBoundingClientRect();
    if (rect.top <= vh * 1.12) {
      setHasSectionEntered(true);
      setHasInitialEntranceFinished(true);
      return;
    }

    setHasSectionEntered(false);
    setHasInitialEntranceFinished(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasSectionEntered(true);
            setHasInitialEntranceFinished(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px 14% 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const clearAnimationTimers = useCallback(() => {
    const refs = [
      expandTimeoutRef,
      settleTimeoutRef,
      dotPulseUpTimeoutRef,
      dotPulseDownTimeoutRef,
      rippleCleanupTimeoutRef,
      mobilePanelSwitchTimeoutRef,
      mobileScrollTimeoutRef,
    ];
    for (const r of refs) {
      if (r.current !== null) {
        window.clearTimeout(r.current);
        r.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
      clearAnimationTimers();
    };
  }, [clearAnimationTimers]);

  const triggerTabSwitch = useCallback(
    (targetId: TreatmentCategoryId, options?: { scrollMobileRow?: boolean }) => {
      const isMidAnimation = cardPhase !== 'idle';

      // If already settled on targetId and not mid-animation, do nothing
      if (targetId === activeTabId && !isMidAnimation) {
        return;
      }

      clearAnimationTimers();

      const timings = getMilestoneSwitchTimings(
        isMidAnimation,
        prefersReducedMotion
      );

      // At 0ms: background colour starts easing to the new tab's colour (600ms)
      setActiveTabId(targetId);

      if (prefersReducedMotion) {
        setDisplayedTabId(targetId);
        setOpenMobileTabId(targetId);
        setCardPhase('idle');
        setIsRippleActive(false);
        setIsDotScaledUp(false);
        if (options?.scrollMobileRow) {
          const btn = mobileRowRefs.current[targetId];
          btn?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
        return;
      }

      // At 0ms: Ripple starts (two rings over 700ms, second delayed 140ms)
      setRippleWaveId((prev) => prev + 1);
      setIsRippleActive(true);
      setIsDotScaledUp(false);

      rippleCleanupTimeoutRef.current = window.setTimeout(() => {
        setIsRippleActive(false);
      }, timings.rippleDurationMs + timings.secondRippleDelayMs + 30);

      // 0–320ms (or 0–160ms if interrupted mid-animation at double speed):
      // Outgoing cards collapse into their own dots (scale 0.05, translateX toward dot, opacity 0)
      setCardPhase(isMidAnimation ? 'collapsing-fast' : 'collapsing');

      // Mobile accordion height choreo: collapse open cards into dots -> animate old panel closed (300ms) & new panel open (300ms)
      const mobileSwitchDelay = isMidAnimation ? 100 : 180;
      mobilePanelSwitchTimeoutRef.current = window.setTimeout(() => {
        setOpenMobileTabId(targetId);
      }, mobileSwitchDelay);

      // At ~240ms (or 120ms if interrupted): each dot scales 1 -> 1.3 -> 1 over 300ms as its card arrives
      dotPulseUpTimeoutRef.current = window.setTimeout(() => {
        setIsDotScaledUp(true);
      }, timings.dotPulseDelayMs);

      dotPulseDownTimeoutRef.current = window.setTimeout(() => {
        setIsDotScaledUp(false);
      }, timings.dotPulseDelayMs + 150);

      // At 320ms (or 160ms if interrupted): swap card content to latest target and expand out from each dot (320–800ms, staggered 90ms)
      expandTimeoutRef.current = window.setTimeout(() => {
        setDisplayedTabId(targetId);
        setCardPhase('expanding');
      }, timings.expandStartMs);

      // Return phase to idle after the last staggered card finishes expanding
      const totalDuration =
        timings.expandStartMs +
        timings.expandDurationMs +
        2 * timings.expandStaggerMs;
      settleTimeoutRef.current = window.setTimeout(() => {
        setCardPhase('idle');
      }, totalDuration);

      // On mobile tap: after panel opens, smooth-scroll the tapped row to just below the header and ticker
      if (options?.scrollMobileRow) {
        const scrollDelay = mobileSwitchDelay + timings.mobileAccordionHeightMs + 30;
        mobileScrollTimeoutRef.current = window.setTimeout(() => {
          const btn = mobileRowRefs.current[targetId];
          btn?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, scrollDelay);
      }
    },
    [activeTabId, cardPhase, clearAnimationTimers, prefersReducedMotion]
  );

  // Respond to external links ('View protocol' buttons and Header/Hero category links)
  useEffect(() => {
    if (!externalSelectedCategory || externalSelectionTrigger === 0) return;
    triggerTabSwitch(externalSelectedCategory, { scrollMobileRow: false });
  }, [externalSelectedCategory, externalSelectionTrigger, triggerTabSwitch]);

  // Laptop hover intent: switch after cursor rests on a tab for 120ms
  const handleDesktopTabMouseEnter = (targetId: TreatmentCategoryId) => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      triggerTabSwitch(targetId);
    }, 120);
  };

  const handleDesktopTabMouseLeave = () => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleDesktopTabImmediate = (targetId: TreatmentCategoryId) => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    triggerTabSwitch(targetId);
  };

  const handleMobileAccordionTap = (targetId: TreatmentCategoryId) => {
    if (targetId === activeTabId && openMobileTabId === targetId && cardPhase === 'idle') {
      const btn = mobileRowRefs.current[targetId];
      btn?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }
    triggerTabSwitch(targetId, { scrollMobileRow: true });
  };

  const activeTabConfig = getMilestoneTabById(activeTabId);
  const displayedTabConfig = getMilestoneTabById(displayedTabId);

  // Compute card transform & transition styles for Desktop and Mobile
  const getCardAnimationStyle = (
    cardIdx: number,
    dotTranslateX: string,
    isMobileCard: boolean,
    isRowOpen = true
  ): React.CSSProperties => {
    if (prefersReducedMotion) {
      const visible = hasInitialEntranceFinished && isRowOpen;
      return {
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      };
    }

    // Transform origin at the card's own dot position (left edge, dot's vertical centre = 28px)
    const origin = '0px 28px';

    if (!hasInitialEntranceFinished || !isRowOpen) {
      return {
        transformOrigin: origin,
        opacity: 0,
        transform: `translate3d(${dotTranslateX}, 0, 0) scale(0.05)`,
        transition: 'none',
      };
    }

    if (cardPhase === 'collapsing') {
      const collapseDur = isMobileCard ? 220 : 320;
      return {
        transformOrigin: origin,
        opacity: 0,
        transform: `translate3d(${dotTranslateX}, 0, 0) scale(0.05)`,
        transition: `transform ${collapseDur}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${collapseDur}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    if (cardPhase === 'collapsing-fast') {
      const fastDur = isMobileCard ? 110 : 160;
      return {
        transformOrigin: origin,
        opacity: 0,
        transform: `translate3d(${dotTranslateX}, 0, 0) scale(0.049)`,
        transition: `transform ${fastDur}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${fastDur}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }

    // 'expanding' or 'idle': expand out from its own dot (scale 0.05 to 1, opacity 0 to 1), staggered 90ms
    const expandDur = isMobileCard ? 360 : 480;
    const staggerMs = isMobileCard ? 70 : 90;
    const delay = cardIdx * staggerMs;

    return {
      transformOrigin: origin,
      opacity: 1,
      transform: 'translate3d(0, 0, 0) scale(1)',
      transition: `transform ${expandDur}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity ${expandDur}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="clear-milestones-section"
      aria-labelledby="milestones-section-heading"
      style={{
        backgroundColor: activeTabConfig.backgroundHex,
        scrollMarginTop: 'var(--header-h, 115px)',
        transition: prefersReducedMotion
          ? 'background-color 200ms cubic-bezier(0.22, 1, 0.36, 1)'
          : 'background-color 600ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="relative w-full max-w-full py-[48px] md:py-[72px]"
    >
      {/* 160px Top Gradient Seam from #F2C6CF (end colour of Focused Clinical Pathways) to active tab colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[160px] bg-[linear-gradient(to_bottom,#F2C6CF_0%,rgba(242,198,207,0)_100%)] z-0"
      />

      {/* Aligned Container (max-w-[1100px], same left edge as Focused Clinical Pathways) */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-[20px] md:px-8 min-w-0">
        {/* Heading (28px on mobile) & Subtitle (15px on mobile) */}
        <div className="max-w-4xl text-left">
          <h2
            id="milestones-section-heading"
            style={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: hasSectionEntered ? 1 : 0,
                    transform: hasSectionEntered
                      ? 'translate3d(0, 0, 0)'
                      : 'translate3d(0, 20px, 0)',
                    transition:
                      'opacity 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }
            }
            className="text-[28px] md:text-[clamp(2.2rem,4vw,3.4rem)] font-bold tracking-[-0.035em] leading-[1.1] text-[#14352B] [text-wrap:balance]"
          >
            Clear Milestones from Day&nbsp;1.
          </h2>
          <p
            style={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: hasSectionEntered ? 1 : 0,
                    transform: hasSectionEntered
                      ? 'translate3d(0, 0, 0)'
                      : 'translate3d(0, 20px, 0)',
                    transition:
                      'opacity 560ms cubic-bezier(0.22, 1, 0.36, 1) 60ms, transform 560ms cubic-bezier(0.22, 1, 0.36, 1) 60ms',
                  }
            }
            className="mt-2.5 md:mt-3.5 text-[15px] md:text-[17.5px] text-[#14352B]/80 leading-[1.45] md:leading-relaxed max-w-2xl"
          >
            {MILESTONES_INTRO.subtitle}
          </p>
        </div>

        {/* ===================================================================== */}
        {/* MOBILE LAYOUT (<768px): Accordion with 3 Full-Width Rows + Timeline  */}
        {/* ===================================================================== */}
        <div className="md:hidden mt-6 flex flex-col gap-[12px] w-full max-w-full min-w-0">
          {MILESTONE_TABS.map((tab) => {
            const isRowOpen = openMobileTabId === tab.id;
            const tabMilestones = tab.milestones;

            return (
              <div
                key={`mobile-acc-${tab.id}`}
                className="w-full max-w-full min-w-0 flex flex-col"
              >
                {/* Accordion Row Button */}
                <button
                  ref={(el) => {
                    mobileRowRefs.current[tab.id] = el;
                  }}
                  type="button"
                  id={`mobile-accordion-button-${tab.id}`}
                  aria-expanded={isRowOpen}
                  aria-controls={`mobile-accordion-panel-${tab.id}`}
                  onClick={() => handleMobileAccordionTap(tab.id)}
                  style={{
                    scrollMarginTop: 'calc(var(--header-h, 115px) + 12px)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  className="w-full min-h-[56px] px-[20px] py-3 rounded-[16px] bg-[#F6F3EC] border border-[#14352B]/[0.14] flex items-center justify-between gap-3 text-left cursor-pointer select-none shadow-[0_6px_20px_-8px_rgba(20,53,43,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14352B]"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {/* 10px Category Colour Swatch */}
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: tab.backgroundHex }}
                      className="w-[10px] h-[10px] rounded-full shrink-0 border border-[#14352B]/20"
                    />
                    <span className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-[#14352B] truncate">
                      {tab.tabLabel}
                    </span>
                  </span>

                  {/* Rotating Chevron on the Right */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`w-5 h-5 text-[#14352B] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isRowOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Collapsible Accordion Panel (300ms height animation) */}
                <div
                  id={`mobile-accordion-panel-${tab.id}`}
                  role="region"
                  aria-labelledby={`mobile-accordion-button-${tab.id}`}
                  style={{
                    gridTemplateRows: isRowOpen ? '1fr' : '0fr',
                    transition: prefersReducedMotion
                      ? 'grid-template-rows 200ms cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'grid-template-rows 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="grid w-full max-w-full min-w-0"
                >
                  <div className="[overflow:clip] min-h-0 w-full max-w-full min-w-0 -mx-[8px] px-[8px]">
                    <div className="pt-3 pb-1 relative w-full max-w-full min-w-0">
                      {/* Dedicated Permanent Timeline Rail (Fixed common positions for the vertical line and 3 dots) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-3 left-0 w-[28px] z-20"
                      >
                        <div
                          style={{
                            top: `${MOBILE_DOT_TOP_OFFSETS[0] + 6}px`,
                            height: `${
                              MOBILE_DOT_TOP_OFFSETS[2] - MOBILE_DOT_TOP_OFFSETS[0]
                            }px`,
                            transformOrigin: 'top',
                            transform:
                              prefersReducedMotion || hasInitialEntranceFinished
                                ? 'scaleY(1)'
                                : 'scaleY(0)',
                            transition: prefersReducedMotion
                              ? 'none'
                              : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                          className="pointer-events-none absolute left-[11px] w-[2px] bg-[#14352B]/25"
                        />
                        {[0, 1, 2].map((dotIdx) => (
                          <PermanentTimelineDot
                            key={`mobile-rail-dot-${tab.id}-${dotIdx}`}
                            index={dotIdx}
                            topPx={MOBILE_DOT_TOP_OFFSETS[dotIdx]}
                            testIdPrefix={`mobile-${tab.id}`}
                            rippleWaveId={rippleWaveId}
                            isRippleActive={isRippleActive}
                            isDotScaledUp={isDotScaledUp}
                            prefersReducedMotion={prefersReducedMotion}
                            positionClassName="left-[6px]"
                          />
                        ))}
                      </div>

                      {/* Fixed-Height Card Slots so card heights & dot alignments are uniform across all tabs */}
                      <div className="flex flex-col gap-[12px] w-full max-w-full min-w-0">
                        {tabMilestones.map((step, cardIdx) => (
                          <article
                            key={`mobile-card-${tab.id}-${cardIdx}`}
                            style={{
                              height: `${MOBILE_CARD_HEIGHT_PX}px`,
                              ...getCardAnimationStyle(
                                cardIdx,
                                '-16px',
                                true,
                                isRowOpen
                              ),
                            }}
                            className="w-[calc(100%-28px)] ml-[28px] min-w-0 rounded-[20px] bg-[#F6F3EC]/92 border border-[#14352B]/[0.14] p-5 shadow-[0_12px_32px_-12px_rgba(20,53,43,0.10)] flex flex-col justify-start"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#14352B] text-[#F6F3EC] text-[10.5px] font-bold tracking-[0.1em] uppercase shrink-0">
                                {step.timeframeBadge}
                              </span>
                              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#14352B]/55 shrink-0">
                                {step.stepNumber}
                              </span>
                            </div>

                            <h3 className="mt-2.5 text-[19px] font-bold tracking-[-0.025em] leading-[1.2] text-[#14352B] break-words">
                              {step.title}
                            </h3>

                            <p className="mt-1.5 text-[14px] leading-[1.5] text-[#14352B]/80 break-words">
                              {step.description}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mobile Full-Width Red CTA Button at the Bottom, 48px Tall */}
          <div className="mt-2 w-full">
            <button
              type="button"
              onClick={() =>
                onQualifyClick(activeTabId, MILESTONES_INTRO.ctaLabel)
              }
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="w-full h-[48px] px-6 rounded-full bg-[#B82927] hover:bg-[#A32220] text-white text-[14px] font-semibold tracking-[-0.01em] shadow-[0_6px_18px_-4px_rgba(184,41,39,0.4)] transition-all duration-200 flex items-center justify-center whitespace-nowrap cursor-pointer select-none"
            >
              {MILESTONES_INTRO.ctaLabel}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* LAPTOP / DESKTOP LAYOUT (>=768px): Two-Column Grid                    */}
        {/* ===================================================================== */}
        <div className="hidden md:grid md:mt-11 md:grid-cols-12 md:gap-12 items-start min-w-0 max-w-full">
          {/* LEFT COLUMN (Desktop): Tab List + Red 'See if you qualify today' Pill */}
          <div className="md:col-span-5 flex flex-col items-start min-w-0 max-w-full pt-5">
            <div
              role="tablist"
              aria-label="Treatment milestone categories"
              className="w-full flex flex-col border-t border-[#14352B]/12"
            >
              {MILESTONE_TABS.map((tab, idx) => {
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`milestone-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`milestone-panel-${tab.id}`}
                    onMouseEnter={() => handleDesktopTabMouseEnter(tab.id)}
                    onMouseLeave={handleDesktopTabMouseLeave}
                    onClick={() => handleDesktopTabImmediate(tab.id)}
                    onFocus={() => handleDesktopTabImmediate(tab.id)}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      ...(prefersReducedMotion
                        ? {}
                        : {
                            opacity: hasSectionEntered ? 1 : 0,
                            transform: hasSectionEntered
                              ? 'translate3d(0, 0, 0)'
                              : 'translate3d(0, 18px, 0)',
                            transition: `opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) ${
                              120 + idx * 60
                            }ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) ${
                              120 + idx * 60
                            }ms`,
                          }),
                    }}
                    className="group relative w-full py-5 border-b border-[#14352B]/12 flex items-center text-left cursor-pointer select-none focus-visible:outline-none"
                  >
                    {/* 3px Forest Green Bar on the Left of Active Tab */}
                    <span
                      aria-hidden="true"
                      className={`w-[3px] h-9 rounded-full bg-[#14352B] transition-all duration-300 ${
                        isActive
                          ? 'opacity-100 scale-y-100 mr-3.5'
                          : 'opacity-0 scale-y-50 mr-0 w-0'
                      }`}
                    />
                    <span
                      className={`text-[28px] lg:text-[32px] font-bold tracking-[-0.03em] leading-[1.15] transition-colors duration-300 ${
                        isActive
                          ? 'text-[#14352B]'
                          : 'text-[#14352B]/45 group-hover:text-[#14352B]/75'
                      }`}
                    >
                      {tab.tabLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Red Filled Pill CTA: 'See if you qualify today' */}
            <div
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      opacity: hasSectionEntered ? 1 : 0,
                      transform: hasSectionEntered
                        ? 'translate3d(0, 0, 0)'
                        : 'translate3d(0, 18px, 0)',
                      transition:
                        'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) 320ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 320ms',
                    }
              }
              className="mt-7"
            >
              <button
                type="button"
                onClick={() =>
                  onQualifyClick(activeTabId, MILESTONES_INTRO.ctaLabel)
                }
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-[46px] px-6 rounded-full bg-[#B82927] hover:bg-[#A32220] text-white text-[14px] font-semibold tracking-[-0.01em] shadow-[0_6px_18px_-4px_rgba(184,41,39,0.4)] hover:shadow-[0_10px_22px_-4px_rgba(184,41,39,0.52)] transition-all duration-200 whitespace-nowrap cursor-pointer select-none"
              >
                {MILESTONES_INTRO.ctaLabel}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop): Timeline Header + Dedicated Permanent Line/Dots Rail + Cards in overflow: clip */}
          <div className="md:col-span-7 w-full max-w-full min-w-0">
            {/* Timeline Top Header Row: TREATMENT TIMELINE | 03 MILESTONES */}
            <div className="flex items-center justify-between pl-[44px] pb-3 text-[11px] font-bold tracking-[0.14em] uppercase text-[#14352B]/70">
              <span>{MILESTONES_INTRO.timelineHeaderLeft}</span>
              <span>{MILESTONES_INTRO.timelineHeaderRight}</span>
            </div>

            {/* Cards & Timeline Wrapper with overflow: clip so nothing overlaps the tab list */}
            <div className="[overflow:clip] relative w-full max-w-full min-w-0 py-2">
              <div className="relative w-full max-w-full min-w-0">
                {/* Dedicated Permanent Timeline Rail (Fixed common place for the vertical line and 3 dots, completely independent of card text size) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-[44px] z-20"
                >
                  {/* Permanent 2px Vertical Line connecting the 3 fixed dot centers */}
                  <div
                    data-testid="desktop-timeline-line"
                    style={{
                      top: `${DESKTOP_DOT_TOP_OFFSETS[0] + 6}px`,
                      height: `${
                        DESKTOP_DOT_TOP_OFFSETS[2] - DESKTOP_DOT_TOP_OFFSETS[0]
                      }px`,
                      transformOrigin: 'top',
                      transform:
                        prefersReducedMotion || hasInitialEntranceFinished
                          ? 'scaleY(1)'
                          : 'scaleY(0)',
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className="pointer-events-none absolute left-[19px] w-[2px] bg-[#14352B]/25"
                  />

                  {/* 3 Permanent 12px Dots at fixed common vertical offsets (22px, 210px, 398px) */}
                  {[0, 1, 2].map((dotIdx) => (
                    <PermanentTimelineDot
                      key={`desktop-rail-dot-${dotIdx}`}
                      index={dotIdx}
                      topPx={DESKTOP_DOT_TOP_OFFSETS[dotIdx]}
                      testIdPrefix="desktop-timeline"
                      rippleWaveId={rippleWaveId}
                      isRippleActive={isRippleActive}
                      isDotScaledUp={isDotScaledUp}
                      prefersReducedMotion={prefersReducedMotion}
                      positionClassName="left-[14px]"
                    />
                  ))}
                </div>

                {/* 3 Uniform-Height Milestone Cards (each 172px tall, 16px gap) */}
                <div
                  role="tabpanel"
                  id={`milestone-panel-${displayedTabConfig.id}`}
                  aria-labelledby={`milestone-tab-${displayedTabConfig.id}`}
                  className="relative w-full max-w-full min-w-0 flex flex-col gap-[16px]"
                >
                  {displayedTabConfig.milestones.map((step, cardIdx) => (
                    <article
                      key={`desktop-milestone-slot-${cardIdx}`}
                      data-testid={`desktop-milestone-card-${cardIdx}`}
                      style={{
                        height: `${DESKTOP_CARD_HEIGHT_PX}px`,
                        ...getCardAnimationStyle(
                          cardIdx,
                          '-24px',
                          false,
                          true
                        ),
                      }}
                      className="w-[calc(100%-44px)] ml-[44px] min-w-0 rounded-[20px] bg-[#F6F3EC]/92 border border-[#14352B]/[0.14] p-6 shadow-[0_12px_32px_-12px_rgba(20,53,43,0.10)] flex flex-col justify-start"
                    >
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#14352B] text-[#F6F3EC] text-[10.5px] font-bold tracking-[0.1em] uppercase shrink-0">
                          {step.timeframeBadge}
                        </span>
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#14352B]/55 shrink-0">
                          {step.stepNumber}
                        </span>
                      </div>

                      <h3 className="mt-3 text-[22px] font-bold tracking-[-0.025em] leading-[1.2] text-[#14352B] break-words">
                        {step.title}
                      </h3>

                      <p className="mt-1.5 text-[15px] leading-[1.55] text-[#14352B]/80 break-words">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
