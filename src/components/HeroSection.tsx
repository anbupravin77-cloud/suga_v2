import React, { useState } from 'react';
import { ArrowUpRight, Stethoscope } from 'lucide-react';
import { HERO_ACTIONS, TreatmentCategoryId } from '../utils/treatments';

interface HeroSectionProps {
  activeCategory: TreatmentCategoryId | null;
  onSelectCategory: (category: TreatmentCategoryId) => void;
  onStartConsultation: (category?: TreatmentCategoryId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeCategory,
  onSelectCategory,
  onStartConsultation,
}) => {
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  return (
    <section
      aria-labelledby="hero-main-heading"
      className="relative pt-14 pb-12 sm:pt-18 sm:pb-15 px-4 sm:px-8 max-w-[1180px] mx-auto"
    >
      <div className="max-w-[860px] mx-auto text-center">
        {/* Main Headline: Tightened letter-spacing, deep forest green (#14352B), increased size contrast between sans and serif italic */}
        <h1
          id="hero-main-heading"
          className="text-[clamp(2.15rem,4.1vw,3.55rem)] font-bold tracking-[-0.045em] leading-[1.08] text-[#14352B] [text-wrap:balance]"
        >
          Clinically proven, FDA (USA) approved, treatments{' '}
          <span className="font-editorial italic font-normal text-[1.14em] tracking-[-0.02em] leading-[1.02] text-[#14352B] inline-block">
            prescribed by experts.
          </span>
        </h1>

        {/* 4 Equal-Height Pill Buttons: 1px hairline borders, soft shadow, circular thumbnails of identical size, subtle hover lift, arrow fills green on hover */}
        <div
          role="group"
          aria-label="Treatment categories and consultation"
          className="mt-10 sm:mt-12 max-w-[760px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {HERO_ACTIONS.map((action) => {
            const hasThumbError = thumbErrors[action.id];
            const isSelected =
              !action.isPrimaryCta && activeCategory === action.categoryTarget;

            return (
              <button
                key={action.id}
                type="button"
                aria-pressed={action.isPrimaryCta ? undefined : isSelected}
                onClick={() => {
                  if (action.isPrimaryCta) {
                    onStartConsultation(activeCategory ?? 'weight-loss');
                  } else if (action.categoryTarget) {
                    onSelectCategory(action.categoryTarget);
                  }
                }}
                className={`group relative h-[68px] pl-3.5 pr-4 py-2.5 rounded-full border transition-all duration-300 ease-out flex items-center justify-between gap-4 whitespace-nowrap shrink-0 cursor-pointer text-left hover:-translate-y-0.5 ${
                  action.isPrimaryCta
                    ? 'bg-[#B82927] hover:bg-[#A32220] text-white border-[#9E1F1D] shadow-[0_6px_20px_-6px_rgba(184,41,39,0.38)] hover:shadow-[0_12px_26px_-6px_rgba(184,41,39,0.5)]'
                    : isSelected
                    ? 'bg-white text-[#14352B] border-[#14352B] ring-1 ring-[#14352B]/20 shadow-[0_6px_18px_-6px_rgba(20,53,43,0.14)]'
                    : 'bg-white/95 hover:bg-white text-[#14352B] border-[#14352B]/14 hover:border-[#14352B]/35 shadow-[0_4px_14px_-4px_rgba(20,53,43,0.06)] hover:shadow-[0_10px_22px_-6px_rgba(20,53,43,0.12)]'
                }`}
              >
                {/* Perfectly Circular Thumbnail of Identical Size (44x44px) with 600ms 1.03x Hover Zoom */}
                <span
                  className={`relative w-11 h-11 rounded-full overflow-hidden bg-[#EAE5D9] border ${
                    action.isPrimaryCta ? 'border-white/25' : 'border-[#14352B]/10'
                  } shrink-0 flex items-center justify-center`}
                >
                  {!hasThumbError ? (
                    <img
                      src={action.thumbnailSrc}
                      alt={action.thumbnailAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setThumbErrors((prev) => ({ ...prev, [action.id]: true }))
                      }
                      className="w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Stethoscope className="w-4 h-4 text-current opacity-80" />
                  )}
                </span>

                {/* Button Label */}
                <span
                  className={`flex-1 px-1 text-[15.5px] sm:text-[16px] font-semibold tracking-[-0.015em] ${
                    action.isPrimaryCta ? 'text-white' : 'text-[#14352B]'
                  }`}
                >
                  {action.label}
                </span>

                {/* Unified Circular Arrow Button — Fills Deep Forest Green (#14352B) on Hover */}
                <span className="w-9 h-9 rounded-full bg-white text-[#14352B] border border-[#14352B]/12 shadow-[0_2px_6px_rgba(20,53,43,0.07)] group-hover:bg-[#14352B] group-hover:text-white group-hover:border-[#14352B] flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
