export type TreatmentCategoryId = 'weight-loss' | 'hair-growth' | 'sexual-health';

export interface HeroActionItem {
  id: TreatmentCategoryId | 'consultation';
  label: string;
  isPrimaryCta: boolean;
  categoryTarget?: TreatmentCategoryId;
  thumbnailSrc: string;
  thumbnailAlt: string;
  thumbBgClass: string;
}

export interface PlanSlide {
  index: number;
  kicker: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
}

export interface ClinicalPathwayItem {
  id: TreatmentCategoryId;
  stepNumber: string;
  categoryLabel: string;
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  videoAlt: string;
  videoPosition: 'left' | 'right';
  backgroundHex: string;
  stats: {
    efficacyLabel: string;
    efficacyValue: string;
    resultsLabel: string;
    resultsValue: string;
  };
  checklist: string[];
  protocolDetails: {
    activeIngredients: string;
    clinicalSchedule: string;
    pharmacyDispensing: string;
  };
}

export const TRUST_BAR_ITEMS: string[] = [
  'FREE AND DISCRETE SHIPPING',
  '100% ONLINE PROCESS',
  'USED AND TRUSTED BY MILLIONS AROUND THE WORLD',
  'FULLY CONFIDENTIAL',
];

export const HERO_ACTIONS: HeroActionItem[] = [
  {
    id: 'weight-loss',
    label: 'Medical weight loss',
    isPrimaryCta: false,
    categoryTarget: 'weight-loss',
    thumbnailSrc: '/assets/images/medical_weight_loss_studio_pen_1794672846543.jpg',
    thumbnailAlt: 'GLP-1 weight loss treatment preview',
    thumbBgClass: 'bg-[#DCE3EC]',
  },
  {
    id: 'hair-growth',
    label: 'Hair growth',
    isPrimaryCta: false,
    categoryTarget: 'hair-growth',
    thumbnailSrc: '/assets/images/bento_hair_growth_dropper_1794669036350.jpg',
    thumbnailAlt: 'Hair growth serum dropper preview',
    thumbBgClass: 'bg-[#E5DEC9]',
  },
  {
    id: 'sexual-health',
    label: 'Sexual Health',
    isPrimaryCta: false,
    categoryTarget: 'sexual-health',
    thumbnailSrc: '/assets/images/bento_sexual_health_tablet_1794669036887.jpg',
    thumbnailAlt: 'Sexual health treatment preview',
    thumbBgClass: 'bg-[#E8D8CC]',
  },
  {
    id: 'consultation',
    label: 'Start consultation',
    isPrimaryCta: true,
    thumbnailSrc: '/assets/images/bento_plan_portrait_1794669035151.jpg',
    thumbnailAlt: 'Expert medical consultation preview',
    thumbBgClass: 'bg-[#981D1B]',
  },
];

export const PLAN_CAROUSEL_SLIDES: PlanSlide[] = [
  {
    index: 0,
    kicker: 'WEIGHT MANAGEMENT',
    title: 'A plan built around you',
    subtitle: 'Physician-guided GLP-1 protocols tailored to your metabolic profile.',
    ctaLabel: 'Explore weight loss',
  },
  {
    index: 1,
    kicker: 'WEIGHT MANAGEMENT',
    title: 'A plan built around you',
    subtitle: 'Ongoing doctor check-ins and discreet home delivery every month.',
    ctaLabel: 'Explore weight loss',
  },
  {
    index: 2,
    kicker: 'WEIGHT MANAGEMENT',
    title: 'A plan built around you',
    subtitle: 'Clinically proven results with 100% online follow-up support.',
    ctaLabel: 'Explore weight loss',
  },
];

export const PATHWAYS_INTRO = {
  heading: 'Focused Clinical Pathways',
  subtitle: 'Precision treatment protocols designed for sustained biological optimization.',
};

export const CLINICAL_PATHWAYS: ClinicalPathwayItem[] = [
  {
    id: 'weight-loss',
    stepNumber: '01',
    categoryLabel: 'Metabolic Health Protocol',
    title: 'Medical Weight Loss',
    description:
      'The revolutionary GLP 1 peptide helps re-balance the appetite and satiety cycle and help you reach an ideal body weight naturally.',
    videoSrc: '/assets/aistudio/floating_medicines__1__9d6ecad7.mp4',
    posterSrc: '/assets/images/medical_weight_loss_studio_pen_1794672846543.jpg',
    videoAlt: 'Illustrative animation of floating medication devices',
    videoPosition: 'left',
    backgroundHex: '#D9DADD',
    stats: {
      efficacyLabel: 'Efficacy',
      efficacyValue: 'Avg. 15% weight reduction',
      resultsLabel: 'Expected results',
      resultsValue: 'Noticeable in 4–8 weeks',
    },
    checklist: [
      'Doctor-prescribed GLP-1 medications',
      'Regulates hunger and metabolic signals',
      'Ongoing dose titration & clinician support',
    ],
    protocolDetails: {
      activeIngredients: 'Semaglutide / Liraglutide GLP-1 Receptor Agonists',
      clinicalSchedule: 'Once-weekly subcutaneous auto-injector pen with monthly titration',
      pharmacyDispensing: 'Cold-chain temperature-controlled discreet home delivery',
    },
  },
  {
    id: 'hair-growth',
    stepNumber: '02',
    categoryLabel: 'Follicular Density & Regrowth',
    title: 'Hair Restoration',
    description:
      'Combat DHT-driven thinning at the root with customized oral and topical combinations of Finasteride and Minoxidil.',
    videoSrc: '/assets/aistudio/suga_hair_growth_zero_gravity_duet_8s_06eb1106.mp4',
    posterSrc: '/assets/images/bento_hair_growth_dropper_1794669036350.jpg',
    videoAlt: 'Illustrative animation of gently floating hair treatment bottles',
    videoPosition: 'right',
    backgroundHex: '#D3DCF7',
    stats: {
      efficacyLabel: 'Efficacy',
      efficacyValue: '92% stopped further loss',
      resultsLabel: 'Expected results',
      resultsValue: 'Visible density in 90–120 days',
    },
    checklist: [
      'Clinically proven active ingredients',
      'Custom formulas for men & women',
      'Protects active & dormant follicles',
    ],
    protocolDetails: {
      activeIngredients: 'Topical Minoxidil 5% + Finasteride 0.25% Serum & Oral Support',
      clinicalSchedule: 'Daily precision dropper application to targeted scalp regions',
      pharmacyDispensing: 'Quarterly dermatologist-reviewed refills in plain packaging',
    },
  },
  {
    id: 'sexual-health',
    stepNumber: '03',
    categoryLabel: 'Performance & Endocrine Care',
    title: 'Sexual Health',
    description:
      'Confidential, discreet, clinically proven medications to enhance your vitality and improve your sexual health.',
    videoSrc: '/assets/aistudio/suga_sexual_health_zero_gravity_8s_dfcdf4cd.mp4',
    posterSrc: '/assets/images/bento_sexual_health_tablet_1794669036887.jpg',
    videoAlt: 'Illustrative animation of a floating treatment bottle and blue tablet',
    videoPosition: 'left',
    backgroundHex: '#F2C6CF',
    stats: {
      efficacyLabel: 'Efficacy',
      efficacyValue: '95% clinical response rate',
      resultsLabel: 'Expected results',
      resultsValue: 'Works in 30–60 minutes',
    },
    checklist: [
      'On-demand or daily dosing',
      '100% online & 100% confidential',
      'Delivered in unbranded discreet boxes',
    ],
    protocolDetails: {
      activeIngredients: 'Sildenafil Citrate / Tadalafil PDE5 Inhibitor Protocols',
      clinicalSchedule: 'Tailored daily micro-dosing or rapid-onset as-needed tablets',
      pharmacyDispensing: '100% confidential physician review and unbranded shipping',
    },
  },
];

export interface MilestoneStep {
  stepNumber: string;
  timeframeBadge: string;
  title: string;
  description: string;
}

export interface MilestoneCategoryTab {
  id: TreatmentCategoryId;
  tabLabel: string;
  backgroundHex: string;
  originYPercent: number;
  milestones: [MilestoneStep, MilestoneStep, MilestoneStep];
}

export const MILESTONES_INTRO = {
  heading: 'Clear Milestones from Day 1.',
  subtitle:
    'Expect real, measurable physiological changes with continuous medical guidance.',
  ctaLabel: 'See if you qualify today',
  timelineHeaderLeft: 'TREATMENT TIMELINE',
  timelineHeaderRight: '03 MILESTONES',
};

export const MILESTONE_TABS: MilestoneCategoryTab[] = [
  {
    id: 'weight-loss',
    tabLabel: 'Weight Loss',
    backgroundHex: '#D9DADD',
    originYPercent: 16,
    milestones: [
      {
        timeframeBadge: 'MONTH 1',
        stepNumber: 'STEP 01',
        title: 'Metabolic Reset',
        description:
          "Initial micro-dose titration minimizes side effects while dampening constant food cravings and biological 'food noise'.",
      },
      {
        timeframeBadge: 'MONTHS 2–3',
        stepNumber: 'STEP 02',
        title: 'Consistent Loss',
        description:
          'Steady 1–2 lbs weekly reduction. Improved insulin sensitivity, increased daytime energy, and reduced visceral fat.',
      },
      {
        timeframeBadge: 'MONTHS 4–6+',
        stepNumber: 'STEP 03',
        title: 'Target Stability',
        description:
          'Reach your personal target weight. Physician evaluates maintenance dosing to lock in sustainable metabolic health.',
      },
    ],
  },
  {
    id: 'hair-growth',
    tabLabel: 'Hair Regrowth',
    backgroundHex: '#D3DCF7',
    originYPercent: 42,
    milestones: [
      {
        timeframeBadge: 'MONTHS 1–2',
        stepNumber: 'STEP 01',
        title: 'Follicle Stabilization',
        description:
          'DHT inhibition begins. Normal initial shedding of weak hairs as miniaturized follicles enter the active anagen growth phase.',
      },
      {
        timeframeBadge: 'MONTHS 3–4',
        stepNumber: 'STEP 02',
        title: 'Initial Regrowth',
        description:
          'Early signs of thickening along the crown and hairline. Faint vellus hairs transition into stronger terminal strands.',
      },
      {
        timeframeBadge: 'MONTHS 6+',
        stepNumber: 'STEP 03',
        title: 'Peak Density',
        description:
          'Noticeably denser coverage, reduced scalp visibility, and strengthened hair shafts with permanent daily routine.',
      },
    ],
  },
  {
    id: 'sexual-health',
    tabLabel: 'Sexual Health',
    backgroundHex: '#F2C6CF',
    originYPercent: 68,
    milestones: [
      {
        timeframeBadge: 'DAY 1',
        stepNumber: 'STEP 01',
        title: 'Immediate Efficacy',
        description:
          'On-demand or daily protocol delivers reliable blood flow within 30 to 60 minutes of ingestion.',
      },
      {
        timeframeBadge: 'WEEKS 2–4',
        stepNumber: 'STEP 02',
        title: 'Confidence Restored',
        description:
          'Elimination of performance anxiety. Daily micro-dosing allows completely spontaneous, natural intimacy.',
      },
      {
        timeframeBadge: 'ONGOING',
        stepNumber: 'STEP 03',
        title: 'Continuous Optimization',
        description:
          'Regular check-ins with your Suga physician to fine-tune dosage, refill automatically, and monitor total vascular health.',
      },
    ],
  },
];

export function getMilestoneTabById(id: TreatmentCategoryId): MilestoneCategoryTab {
  return MILESTONE_TABS.find((t) => t.id === id) ?? MILESTONE_TABS[0];
}

export interface MilestoneSwitchTimings {
  enableRipple: boolean;
  bgTransitionMs: number;
  rippleDurationMs: number;
  secondRippleDelayMs: number;
  collapseDurationMs: number;
  dotPulseDelayMs: number;
  dotPulseDurationMs: number;
  expandStartMs: number;
  expandDurationMs: number;
  expandStaggerMs: number;
  mobileAccordionHeightMs: number;
  reducedMotionFadeMs: number;
}

export function getMilestoneSwitchTimings(
  isInterruptedMidAnimation: boolean,
  prefersReducedMotion = false
): MilestoneSwitchTimings {
  if (prefersReducedMotion) {
    return {
      enableRipple: false,
      bgTransitionMs: 200,
      rippleDurationMs: 0,
      secondRippleDelayMs: 0,
      collapseDurationMs: 0,
      dotPulseDelayMs: 0,
      dotPulseDurationMs: 0,
      expandStartMs: 0,
      expandDurationMs: 200,
      expandStaggerMs: 0,
      mobileAccordionHeightMs: 200,
      reducedMotionFadeMs: 200,
    };
  }

  const collapseMs = isInterruptedMidAnimation ? 160 : 320;
  const dotPulseDelay = isInterruptedMidAnimation ? 120 : 240;

  return {
    enableRipple: true,
    bgTransitionMs: 600,
    rippleDurationMs: 700,
    secondRippleDelayMs: 140,
    collapseDurationMs: collapseMs,
    dotPulseDelayMs: dotPulseDelay,
    dotPulseDurationMs: 300,
    expandStartMs: collapseMs,
    expandDurationMs: 480,
    expandStaggerMs: 90,
    mobileAccordionHeightMs: 300,
    reducedMotionFadeMs: 200,
  };
}


/**
 * Standard Hermite smoothstep easing (0 -> 1) within [edge0, edge1].
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mixRgbSmooth(
  colorA: [number, number, number],
  colorB: [number, number, number],
  edge0: number,
  edge1: number,
  p: number
): string {
  const s = smoothstep(edge0, edge1, p);
  const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * s);
  const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * s);
  const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * s);
  return `rgb(${r}, ${g}, ${b})`;
}

export interface ProductMotionState {
  opacity: number;
  translateY: number;
  isVisible: boolean;
}

export interface MasterTimelineState {
  p: number;
  backgroundColor: string;
  products: [ProductMotionState, ProductMotionState, ProductMotionState];
  activeVideoIndex: 0 | 1 | 2 | null;
}

const PRODUCT_RANGES: Array<{
  enterStart: number | null;
  enterEnd: number;
  holdEnd: number;
  exitEnd: number | null;
}> = [
  // Product 1: visible 0.00–0.22 (no enter delay), exits 0.22–0.26
  { enterStart: null, enterEnd: 0.0, holdEnd: 0.22, exitEnd: 0.26 },
  // Product 2: enters 0.32–0.38, holds to 0.58, exits 0.58–0.62
  { enterStart: 0.32, enterEnd: 0.38, holdEnd: 0.58, exitEnd: 0.62 },
  // Product 3: enters 0.68–0.74 and stays visible to p = 1 with no exit
  { enterStart: 0.68, enterEnd: 0.74, holdEnd: 1.0, exitEnd: null },
];

export function computeProductMotion(
  p: number,
  index: 0 | 1 | 2,
  reducedMotion = false
): ProductMotionState {
  const range = PRODUCT_RANGES[index];

  // Before enterStart (for products 2 & 3)
  if (range.enterStart !== null && p < range.enterStart) {
    return {
      opacity: 0,
      translateY: reducedMotion ? 0 : 24,
      isVisible: false,
    };
  }

  // After exitEnd (for products 1 & 2)
  if (range.exitEnd !== null && p > range.exitEnd) {
    return {
      opacity: 0,
      translateY: 0,
      isVisible: false,
    };
  }

  // Enter segment (for products 2 & 3)
  if (range.enterStart !== null && p <= range.enterEnd) {
    const s = smoothstep(range.enterStart, range.enterEnd, p);
    return {
      opacity: s,
      translateY: reducedMotion ? 0 : 24 * (1 - s),
      isVisible: s > 0.001,
    };
  }

  // Hold segment (or Product 3 all the way to p = 1)
  if (range.exitEnd === null || p <= range.holdEnd) {
    return {
      opacity: 1,
      translateY: 0,
      isVisible: true,
    };
  }

  // Exit segment: range.holdEnd -> range.exitEnd
  const s = smoothstep(range.holdEnd, range.exitEnd, p);
  return {
    opacity: 1 - s,
    translateY: reducedMotion ? 0 : -24 * s,
    isVisible: 1 - s > 0.001,
  };
}

/**
 * Background keyframes:
 * - Grey (#D9DADD) until 0.22
 * - Lavender (#D3DCF7) by 0.32, hold to 0.58
 * - Pink (#F2C6CF) by 0.68, hold until the end (p = 1.00). Never returns to cream.
 */
export function interpolatePathwayBackgroundColor(progress: number): string {
  const p = Math.max(0, Math.min(1, progress));
  const grey = hexToRgb('#D9DADD');
  const lavender = hexToRgb('#D3DCF7');
  const pink = hexToRgb('#F2C6CF');

  if (p <= 0.22) {
    return `rgb(${grey[0]}, ${grey[1]}, ${grey[2]})`;
  }
  if (p <= 0.32) {
    return mixRgbSmooth(grey, lavender, 0.22, 0.32, p);
  }
  if (p <= 0.58) {
    return `rgb(${lavender[0]}, ${lavender[1]}, ${lavender[2]})`;
  }
  if (p <= 0.68) {
    return mixRgbSmooth(lavender, pink, 0.58, 0.68, p);
  }
  return `rgb(${pink[0]}, ${pink[1]}, ${pink[2]})`;
}

export interface TextStepMotion {
  opacity: number;
  translateY: number;
}

/**
 * Computes staggered opacity and translateY (in px) for individual text elements
 * (stepIndex 0..5: categoryLabel, title, description, stats, checklist, buttons)
 * inside each product pathway on desktop scroll.
 */
export function computeTextStepMotion(
  p: number,
  productIndex: 0 | 1 | 2,
  stepIndex: number,
  hasProduct1Entered = true,
  reducedMotion = false
): TextStepMotion {
  if (reducedMotion) {
    const base = computeProductMotion(p, productIndex, true);
    return { opacity: base.opacity, translateY: 0 };
  }

  const clampedStep = Math.max(0, Math.min(5, stepIndex));

  // Product 1: visible 0.00–0.22 (initial entrance driven by hasProduct1Entered), exits 0.22–0.26 with stagger
  if (productIndex === 0) {
    if (!hasProduct1Entered) {
      return { opacity: 0, translateY: 22 };
    }
    if (p <= 0.22) {
      return { opacity: 1, translateY: 0 };
    }
    if (p > 0.26) {
      return { opacity: 0, translateY: -24 };
    }
    const exitStart = 0.22 + clampedStep * 0.003;
    const exitEnd = Math.min(0.26, exitStart + 0.025);
    const s = smoothstep(exitStart, exitEnd, p);
    return {
      opacity: 1 - s,
      translateY: -24 * s,
    };
  }

  // Product 2: enters 0.32–0.38 with per-element stagger, holds to 0.58, exits 0.58–0.62
  if (productIndex === 1) {
    if (p < 0.32) {
      return { opacity: 0, translateY: 24 };
    }
    if (p > 0.62) {
      return { opacity: 0, translateY: -24 };
    }
    const enterStart = 0.32 + clampedStep * 0.007;
    const enterEnd = enterStart + 0.042;
    if (p < enterEnd) {
      const s = smoothstep(enterStart, enterEnd, p);
      return {
        opacity: s,
        translateY: 24 * (1 - s),
      };
    }
    if (p <= 0.58) {
      return { opacity: 1, translateY: 0 };
    }
    const exitStart = 0.58 + clampedStep * 0.003;
    const exitEnd = Math.min(0.62, exitStart + 0.025);
    const s = smoothstep(exitStart, exitEnd, p);
    return {
      opacity: 1 - s,
      translateY: -24 * s,
    };
  }

  // Product 3: enters 0.68–0.74 with per-element stagger and stays visible to p = 1.0
  if (p < 0.68) {
    return { opacity: 0, translateY: 24 };
  }
  const enterStart = 0.68 + clampedStep * 0.007;
  const enterEnd = enterStart + 0.042;
  if (p < enterEnd) {
    const s = smoothstep(enterStart, enterEnd, p);
    return {
      opacity: s,
      translateY: 24 * (1 - s),
    };
  }
  return { opacity: 1, translateY: 0 };
}

/**
 * Single master timeline evaluator driven purely by p (0 to 1).
 */
export function evaluateMasterTimeline(
  rawProgress: number,
  reducedMotion = false
): MasterTimelineState {
  const p = Math.max(0, Math.min(1, rawProgress));

  const prod0 = computeProductMotion(p, 0, reducedMotion);
  const prod1 = computeProductMotion(p, 1, reducedMotion);
  const prod2 = computeProductMotion(p, 2, reducedMotion);

  let activeVideoIndex: 0 | 1 | 2 | null = null;
  if (prod0.isVisible) activeVideoIndex = 0;
  else if (prod1.isVisible) activeVideoIndex = 1;
  else if (prod2.isVisible) activeVideoIndex = 2;

  return {
    p,
    backgroundColor: interpolatePathwayBackgroundColor(p),
    products: [prod0, prod1, prod2],
    activeVideoIndex,
  };
}

export function getNextSlideIndex(currentIndex: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0;
  return (currentIndex + 1) % totalSlides;
}

export function normalizeSlideIndex(targetIndex: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0;
  const mod = targetIndex % totalSlides;
  return mod < 0 ? mod + totalSlides : mod;
}

export function validateConsultationIntake(input: {
  category: TreatmentCategoryId;
  fullName: string;
  email: string;
  age: string;
}): { valid: boolean; error?: string } {
  const name = input.fullName.trim();
  const email = input.email.trim();
  const ageNum = Number(input.age);

  if (!name || name.length < 2) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (!input.age || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 110) {
    return { valid: false, error: 'You must be 18 or older to start a consultation.' };
  }
  return { valid: true };
}
