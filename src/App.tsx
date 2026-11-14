/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeaderAndTrustBar } from './components/HeaderAndTrustBar';
import { HeroSection } from './components/HeroSection';
import { BentoGridSection } from './components/BentoGridSection';
import { FocusedClinicalPathwaysSection } from './components/FocusedClinicalPathwaysSection';
import {
  ConsultationModal,
  LoginModal,
  AboutModal,
  ProtocolModal,
} from './components/InteractiveModals';
import { ClinicalPathwayItem, TreatmentCategoryId } from './utils/treatments';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryId | null>(null);
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

  const handleSelectCategory = (category: TreatmentCategoryId) => {
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
        onSelectCategory={handleSelectCategory}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onResetFilter={() => setActiveCategory(null)}
      />

      {/* Main Content: Section 1 (Hero), Section 2 (Bento Grid), Section 3 (Focused Clinical Pathways) */}
      <main className="flex-1">
        <HeroSection
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
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
          onViewProtocol={(pathway) => setSelectedProtocol(pathway)}
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
