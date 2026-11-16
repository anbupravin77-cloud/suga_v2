import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRUST_BAR_ITEMS,
  HERO_ACTIONS,
  PLAN_CAROUSEL_SLIDES,
  PATHWAYS_INTRO,
  CLINICAL_PATHWAYS,
  MILESTONES_INTRO,
  MILESTONE_TABS,
  getMilestoneTabById,
  getMilestoneSwitchTimings,
  getNextSlideIndex,
  normalizeSlideIndex,
  validateConsultationIntake,
  evaluateMasterTimeline,
  interpolatePathwayBackgroundColor,
  PATHWAY_TARGET_PROGRESS,
  computeScrollYForPathwayProgress,
} from './treatments';

test('preserves exact trust bar and hero button labels from client screenshots', () => {
  assert.deepEqual(TRUST_BAR_ITEMS, [
    'FREE AND DISCRETE SHIPPING',
    '100% ONLINE PROCESS',
    'USED AND TRUSTED BY MILLIONS AROUND THE WORLD',
    'FULLY CONFIDENTIAL',
  ]);

  assert.deepEqual(
    HERO_ACTIONS.map((a) => a.label),
    ['Medical weight loss', 'Hair growth', 'Sexual Health', 'Start consultation']
  );
});

test('preserves exact Focused Clinical Pathways headings, stats, checklists, and backgrounds', () => {
  assert.equal(PATHWAYS_INTRO.heading, 'Focused Clinical Pathways');
  assert.equal(
    PATHWAYS_INTRO.subtitle,
    'Precision treatment protocols designed for sustained biological optimization.'
  );
  assert.equal(CLINICAL_PATHWAYS.length, 3);

  assert.deepEqual(
    CLINICAL_PATHWAYS.map((p) => ({
      title: p.title,
      bg: p.backgroundHex,
      pos: p.videoPosition,
    })),
    [
      { title: 'Medical Weight Loss', bg: '#D9DADD', pos: 'left' },
      { title: 'Hair Restoration', bg: '#D3DCF7', pos: 'right' },
      { title: 'Sexual Health', bg: '#F2C6CF', pos: 'left' },
    ]
  );
});

test('preserves exact Clear Milestones from Day 1 copy, tab labels, backgrounds, and 9 milestone cards', () => {
  assert.equal(MILESTONES_INTRO.heading, 'Clear Milestones from Day 1.');
  assert.equal(
    MILESTONES_INTRO.subtitle,
    'Expect real, measurable physiological changes with continuous medical guidance.'
  );
  assert.equal(MILESTONES_INTRO.ctaLabel, 'See if you qualify today');
  assert.deepEqual(
    MILESTONE_TABS.map((t) => ({
      id: t.id,
      label: t.tabLabel,
      bg: t.backgroundHex,
      titles: t.milestones.map((m) => m.title),
    })),
    [
      {
        id: 'weight-loss',
        label: 'Weight Loss',
        bg: '#D9DADD',
        titles: ['Metabolic Reset', 'Consistent Loss', 'Target Stability'],
      },
      {
        id: 'hair-growth',
        label: 'Hair Regrowth',
        bg: '#D3DCF7',
        titles: ['Follicle Stabilization', 'Initial Regrowth', 'Peak Density'],
      },
      {
        id: 'sexual-health',
        label: 'Sexual Health',
        bg: '#F2C6CF',
        titles: ['Immediate Efficacy', 'Confidence Restored', 'Continuous Optimization'],
      },
    ]
  );
  assert.equal(getMilestoneTabById('hair-growth').tabLabel, 'Hair Regrowth');

  const normalTimings = getMilestoneSwitchTimings(false, false);
  assert.equal(normalTimings.enableRipple, true);
  assert.equal(normalTimings.rippleDurationMs, 700);
  assert.equal(normalTimings.secondRippleDelayMs, 140);
  assert.equal(normalTimings.collapseDurationMs, 320);
  assert.equal(normalTimings.dotPulseDelayMs, 240);
  assert.equal(normalTimings.dotPulseDurationMs, 300);
  assert.equal(normalTimings.expandStartMs, 320);
  assert.equal(normalTimings.expandDurationMs, 480);
  assert.equal(normalTimings.expandStaggerMs, 90);

  const fastTimings = getMilestoneSwitchTimings(true, false);
  assert.equal(fastTimings.collapseDurationMs, 160);
  assert.equal(fastTimings.dotPulseDelayMs, 120);
  assert.equal(fastTimings.expandStartMs, 160);

  const reducedTimings = getMilestoneSwitchTimings(false, true);
  assert.equal(reducedTimings.enableRipple, false);
  assert.equal(reducedTimings.reducedMotionFadeMs, 200);
});

test('master timeline enforces zero-gap background layers, product keyframes, and target scroll positions', () => {
  // Background starts grey #D9DADD (0.00-0.27), lavender #D3DCF7 by 0.35 (holds to 0.60), pink #F2C6CF by 0.68 (holds to 1.0)
  assert.equal(interpolatePathwayBackgroundColor(0.0), 'rgb(217, 218, 221)');
  assert.equal(interpolatePathwayBackgroundColor(0.27), 'rgb(217, 218, 221)');
  assert.equal(interpolatePathwayBackgroundColor(0.35), 'rgb(211, 220, 247)');
  assert.equal(interpolatePathwayBackgroundColor(0.60), 'rgb(211, 220, 247)');
  assert.equal(interpolatePathwayBackgroundColor(0.68), 'rgb(242, 198, 207)');
  assert.equal(interpolatePathwayBackgroundColor(1.0), 'rgb(242, 198, 207)');

  // Overlay opacities (Lavender 0->1 over 0.27-0.35, Pink 0->1 over 0.60-0.68, never fade out)
  assert.equal(evaluateMasterTimeline(0.27).lavenderOpacity, 0);
  assert.equal(evaluateMasterTimeline(0.35).lavenderOpacity, 1);
  assert.equal(evaluateMasterTimeline(0.80).lavenderOpacity, 1);
  assert.equal(evaluateMasterTimeline(0.60).pinkOpacity, 0);
  assert.equal(evaluateMasterTimeline(0.68).pinkOpacity, 1);
  assert.equal(evaluateMasterTimeline(1.0).pinkOpacity, 1);

  // Product 1: visible 0.00-0.27 with no enter delay, exits 0.27-0.315
  assert.equal(evaluateMasterTimeline(0.0).products[0].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.0).products[0].isVisible, true);
  assert.equal(evaluateMasterTimeline(0.27).products[0].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.32).products[0].isVisible, false);

  // Product 2: enters 0.305-0.35, holds to 0.60, exits 0.60-0.645
  assert.equal(evaluateMasterTimeline(0.30).products[1].isVisible, false);
  assert.equal(evaluateMasterTimeline(0.35).products[1].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.50).products[1].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.60).products[1].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.65).products[1].isVisible, false);

  // Product 3: enters 0.635-0.68 and stays visible to p = 1.0 with no exit
  assert.equal(evaluateMasterTimeline(0.63).products[2].isVisible, false);
  assert.equal(evaluateMasterTimeline(0.68).products[2].opacity, 1);
  assert.equal(evaluateMasterTimeline(0.85).products[2].opacity, 1);
  assert.equal(evaluateMasterTimeline(1.0).products[2].opacity, 1);
  assert.equal(evaluateMasterTimeline(1.0).products[2].isVisible, true);

  // Zero-blank-gap invariant: at every p in [0, 1], at least one product is visible
  for (let i = 0; i <= 100; i += 1) {
    const p = i / 100;
    const state = evaluateMasterTimeline(p);
    const maxOpacity = Math.max(
      state.products[0].opacity,
      state.products[1].opacity,
      state.products[2].opacity
    );
    assert.ok(maxOpacity > 0, `Expected non-zero product opacity at p=${p}, got ${maxOpacity}`);
  }

  // Target progress and scrollY calculation
  assert.equal(PATHWAY_TARGET_PROGRESS['weight-loss'], 0.05);
  assert.equal(PATHWAY_TARGET_PROGRESS['hair-growth'], 0.50);
  assert.equal(PATHWAY_TARGET_PROGRESS['sexual-health'], 0.85);
  assert.equal(
    computeScrollYForPathwayProgress(0.5, 2000, 4500, 785, 115),
    Math.round(2000 - 115 + 0.5 * (4500 - 785))
  );
});

test('carousel index helpers wrap cleanly across 3 slides', () => {
  assert.equal(PLAN_CAROUSEL_SLIDES.length, 3);
  assert.equal(getNextSlideIndex(0, 3), 1);
  assert.equal(getNextSlideIndex(1, 3), 2);
  assert.equal(getNextSlideIndex(2, 3), 0);
  assert.equal(normalizeSlideIndex(-1, 3), 2);
  assert.equal(normalizeSlideIndex(4, 3), 1);
});

test('consultation intake validator checks required fields and age', () => {
  assert.equal(
    validateConsultationIntake({
      category: 'weight-loss',
      fullName: '',
      email: 'patient@example.com',
      age: '34',
    }).valid,
    false
  );

  assert.equal(
    validateConsultationIntake({
      category: 'hair-growth',
      fullName: 'Aarav Sharma',
      email: 'invalid-email',
      age: '34',
    }).valid,
    false
  );

  assert.equal(
    validateConsultationIntake({
      category: 'sexual-health',
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      age: '16',
    }).valid,
    false
  );

  assert.equal(
    validateConsultationIntake({
      category: 'weight-loss',
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      age: '34',
    }).valid,
    true
  );
});
