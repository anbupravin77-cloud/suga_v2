/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeaderAndTrustBar } from './components/HeaderAndTrustBar';
import { HeroSection } from './components/HeroSection';
import { BentoGridSection } from './components/BentoGridSection';
import { FocusedClinicalPathwaysSection } from './components/FocusedClinicalPathwaysSection';
import { ClearMilestonesSection } from './components/ClearMilestonesSection';
import {
  ConsultationModal,
  LoginModal,
  AboutModal,
  ProtocolModal,
} from './components/InteractiveModals';
import {
  ClinicalPathwayItem,
  TreatmentCategoryId,
  PATHWAY_TARGET_PROGRESS,
  computeScrollYForPathwayProgress,
} from './utils/treatments';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryId | null>(null);
  const [milestoneSelectionTrigger, setMilestoneSelectionTrigger] = useState<number>(0);
  const [consultationState, setConsultationState] = useState<{
    isOpen: boolean;
    category: TreatmentCategoryId;
    sourceLabel?: string;
  }>({
    isOpen: false,
    category: 'weight-loss',
  });
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalPathwayItem | null>(
    null
  );
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Smooth-scroll to the target product progress p (Weight Loss: 0.05, Hair: 0.50, Sexual Health: 0.85)
  // below the sticky header and activate the matching tab in ClearMilestonesSection
  const handleNavigateToPathwayProduct = (category: TreatmentCategoryId) => {
    setActiveCategory(category);
    setMilestoneSelectionTrigger((prev) => prev + 1);

    const wrapperEl = document.getElementById('pathways-scroll-wrapper');
    const stageEl = document.getElementById('pathways-sticky-stage');

    if (wrapperEl && stageEl) {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const stageRect = stageEl.getBoundingClientRect();
      const headerEl = document.getElementById('site-header');
      const headerH = headerEl
        ? Math.round(headerEl.getBoundingClientRect().height)
        : parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--header-h')
          ) || 115;

      const wrapperTop = wrapperRect.top + scrollY;
      const wrapperHeight = wrapperEl.offsetHeight || wrapperRect.height;
      const stageHeight =
        stageEl.offsetHeight || stageRect.height || window.innerHeight - headerH;
      const targetP = PATHWAY_TARGET_PROGRESS[category];

      const targetScrollY = computeScrollYForPathwayProgress(
        targetP,
        wrapperTop,
        wrapperHeight,
        stageHeight,
        headerH
      );

      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      return;
    }

    // Fallback when flowing bands are rendered
    const fallbackBandEl = document.getElementById(`pathway-${category}`);
    if (fallbackBandEl) {
      fallbackBandEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectHeroBentoCategory = (category: TreatmentCategoryId) => {
    setActiveCategory((prev) => (prev === category ? null : category));
    const cardMap: Record<TreatmentCategoryId, string> = {
      'weight-loss': 'card-weight-loss',
      'hair-growth': 'card-hair-growth',
      'sexual-health': 'card-sexual-health',
    };
    const targetEl = document.getElementById(cardMap[category]);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleStartConsultation = (
    category: TreatmentCategoryId = 'weight-loss',
    sourceLabel?: string
  ) => {
    setConsultationState({
      isOpen: true,
      category,
      sourceLabel,
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] bg-subtle-noise text-[#14352B] flex flex-col">
      {/* Header + Solid Cream Trust Strip Marquee */}
      <HeaderAndTrustBar
        activeCategory={activeCategory}
        onSelectCategory={handleNavigateToPathwayProduct}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onResetFilter={() => setActiveCategory(null)}
      />

      {/* Main Content: Section 1 (Hero), Section 2 (Bento Grid), Section 3 (Focused Clinical Pathways), Section 4 (Clear Milestones) */}
      <main className="flex-1">
        <HeroSection
          activeCategory={activeCategory}
          onSelectCategory={handleSelectHeroBentoCategory}
          onStartConsultation={(cat) =>
            handleStartConsultation(cat ?? 'weight-loss', 'Start consultation')
          }
        />

        <BentoGridSection
          activeCategory={activeCategory}
          onExploreTreatment={(cat, sourceTitle) =>
            handleStartConsultation(cat, sourceTitle)
          }
        />

        <FocusedClinicalPathwaysSection
          onStartConsultation={(cat, sourceTitle) =>
            handleStartConsultation(cat, sourceTitle)
          }
          onViewProtocol={(pathway) => handleNavigateToPathwayProduct(pathway.id)}
        />

        <ClearMilestonesSection
          externalSelectedCategory={activeCategory}
          externalSelectionTrigger={milestoneSelectionTrigger}
          onQualifyClick={(cat, label) => handleStartConsultation(cat, label)}
        />
      </main>

      {/* Interactive Modals */}
      <ConsultationModal
        isOpen={consultationState.isOpen}
        initialCategory={consultationState.category}
        sourceLabel={consultationState.sourceLabel}
        onClose={() => setConsultationState((prev) => ({ ...prev, isOpen: false }))}
      />

      <ProtocolModal
        pathway={selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        onStartConsultation={(cat, title) => handleStartConsultation(cat, title)}
      />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onStartConsultation={() =>
          handleStartConsultation('weight-loss', 'Start consultation')
        }
      />
    </div>
  );
}
