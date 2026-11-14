import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  PLAN_CAROUSEL_SLIDES,
  TreatmentCategoryId,
  normalizeSlideIndex,
} from '../utils/treatments';

interface BentoGridSectionProps {
  activeCategory: TreatmentCategoryId | null;
  onExploreTreatment: (category: TreatmentCategoryId, sourceTitle: string) => void;
}

export const BentoGridSection: React.FC<BentoGridSectionProps> = ({
  activeCategory,
  onExploreTreatment,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const currentSlide =
    PLAN_CAROUSEL_SLIDES[normalizeSlideIndex(activeSlideIndex, PLAN_CAROUSEL_SLIDES.length)];

  const handleImageError = (key: string) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  const isHighlighted = (category: TreatmentCategoryId) =>
    activeCategory === category
      ? 'ring-2 ring-[#14352B] ring-offset-4 ring-offset-[#F6F3EC]'
      : '';

  return (
    <section
      id="treatments-bento-grid"
      aria-label="Clinical treatment categories"
      className="relative z-10 max-w-[1180px] mx-auto px-4 sm:px-8 pb-0"
    >
      {/* Unified 12-Column Grid with Identical 24px (gap-6) Gutters and Rounded-[32px] Radius Across All 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[430px_305px] gap-6">
        {/* Card 1: Top-Left (6 cols, row 1) — WEIGHT MANAGEMENT / Medical weight loss */}
        <article
          id="card-weight-loss"
          onClick={() => onExploreTreatment('weight-loss', 'Medical weight loss')}
          className={`sm:col-span-2 lg:col-span-6 lg:row-span-1 group relative overflow-hidden rounded-[32px] bg-[#14352B] min-h-[380px] lg:min-h-0 flex flex-col justify-between p-7 sm:p-8 shadow-[0_10px_30px_-12px_rgba(20,53,43,0.16)] cursor-pointer transition-all duration-300 ${isHighlighted(
            'weight-loss'
          )}`}
        >
          {!imageErrors['weight-loss-pen'] ? (
            <img
              src="/src/assets/images/medical_weight_loss_studio_pen_1794672846543.jpg"
              alt="Sleek GLP-1 medical weight loss auto-injector pen held in studio lighting"
              referrerPolicy="no-referrer"
              onError={() => handleImageError('weight-loss-pen')}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D473A] to-[#14352B]" />
          )}

          {/* Deep Forest Green Gradient Overlays: rgba(20,53,43,0.65) to transparent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,rgba(20,53,43,0.65)_0%,rgba(20,53,43,0.28)_55%,transparent_100%)] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(20,53,43,0.55)_0%,transparent_100%)] pointer-events-none"
          />

          {/* Soft Inner Border on Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20 z-20"
          />

          {/* Top Copy */}
          <div className="relative z-10 max-w-md">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/95">
              WEIGHT MANAGEMENT
            </p>
            <h2 className="mt-1.5 text-[28px] sm:text-[34px] font-bold tracking-[-0.03em] leading-[1.1] text-white [text-wrap:balance]">
              Medical weight loss
            </h2>
          </div>

          {/* Unified White Circular Arrow CTA — Fills Deep Green (#14352B) on Hover */}
          <div className="relative z-10 pt-6 flex items-center justify-end">
            <button
              type="button"
              aria-label="Explore care — Medical weight loss"
              onClick={(e) => {
                e.stopPropagation();
                onExploreTreatment('weight-loss', 'Medical weight loss');
              }}
              className="w-11 h-11 rounded-full bg-white text-[#14352B] group-hover:bg-[#14352B] group-hover:text-white hover:bg-[#14352B] hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(20,53,43,0.22)] transition-all duration-300 cursor-pointer"
            >
              <span className="sr-only">Explore care</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </article>

        {/* Card 4: Right Tall Card (6 cols, spans 2 rows) — WEIGHT MANAGEMENT / A plan built around you */}
        <article
          id="card-personalized-plan"
          onClick={() => onExploreTreatment('weight-loss', 'A plan built around you')}
          className={`sm:col-span-2 lg:col-span-6 lg:row-span-2 group relative overflow-hidden rounded-[32px] bg-[#14352B] min-h-[540px] lg:min-h-0 flex flex-col justify-between p-7 sm:p-8 shadow-[0_10px_30px_-12px_rgba(20,53,43,0.16)] cursor-pointer transition-all duration-300 ${isHighlighted(
            'weight-loss'
          )}`}
        >
          {!imageErrors['plan-portrait'] ? (
            <img
              src="/src/assets/images/bento_plan_portrait_1794669035151.jpg"
              alt="Smiling patient holding personalized medical weight loss treatment pen"
              referrerPolicy="no-referrer"
              onError={() => handleImageError('plan-portrait')}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-600 ease-out group-hover:scale-[1.03] ${
                currentSlide.index === 1
                  ? 'scale-[1.03] object-[center_12%]'
                  : currentSlide.index === 2
                  ? 'scale-[1.05] object-[center_20%]'
                  : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#1D473A] to-[#14352B]" />
          )}

          {/* Deep Forest Green Gradient Overlays: rgba(20,53,43,0.65) to transparent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(to_bottom,rgba(20,53,43,0.65)_0%,rgba(20,53,43,0.30)_55%,transparent_100%)] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(to_top,rgba(20,53,43,0.65)_0%,rgba(20,53,43,0.22)_60%,transparent_100%)] pointer-events-none"
          />

          {/* Soft Inner Border on Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20 z-20"
          />

          {/* Top Copy */}
          <div className="relative z-10 max-w-[270px]">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/95">
              {currentSlide.kicker}
            </p>
            <h2 className="mt-1.5 text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] leading-[1.08] text-white">
              {currentSlide.title}
            </h2>
          </div>

          {/* Bottom Bar: Consistent Carousel Dots (Left) + Unified White Circular Arrow CTA (Right) */}
          <div className="relative z-10 pt-8 flex items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Personalized plan highlights"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 bg-[#14352B]/65 backdrop-blur-md px-3.5 py-2.5 rounded-full border border-white/20 shadow-sm"
            >
              {PLAN_CAROUSEL_SLIDES.map((slide) => {
                const isActive = slide.index === currentSlide.index;
                return (
                  <button
                    key={slide.index}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Plan highlight slide ${slide.index + 1}`}
                    onClick={() => setActiveSlideIndex(slide.index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white scale-110 ring-2 ring-white/35'
                        : 'bg-white/45 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>

            {/* Unified White Circular Arrow CTA — Fills Deep Green (#14352B) on Hover */}
            <button
              type="button"
              aria-label="Explore weight loss"
              onClick={(e) => {
                e.stopPropagation();
                onExploreTreatment('weight-loss', 'A plan built around you');
              }}
              className="w-11 h-11 rounded-full bg-white text-[#14352B] group-hover:bg-[#14352B] group-hover:text-white hover:bg-[#14352B] hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(20,53,43,0.22)] transition-all duration-300 cursor-pointer shrink-0"
            >
              <span className="sr-only">{currentSlide.ctaLabel}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </article>

        {/* Card 2: Bottom-Left (3 cols, row 2) — HAIR CARE / Hair growth */}
        <article
          id="card-hair-growth"
          onClick={() => onExploreTreatment('hair-growth', 'Hair growth')}
          className={`sm:col-span-1 lg:col-span-3 lg:row-span-1 group relative overflow-hidden rounded-[32px] bg-[#14352B] min-h-[280px] lg:min-h-0 flex flex-col justify-between p-6 sm:p-7 shadow-[0_10px_30px_-12px_rgba(20,53,43,0.16)] cursor-pointer transition-all duration-300 ${isHighlighted(
            'hair-growth'
          )}`}
        >
          {!imageErrors['hair-growth'] ? (
            <img
              src="/src/assets/images/bento_hair_growth_dropper_1794669036350.jpg"
              alt="Amber glass hair growth serum bottle with dropper"
              referrerPolicy="no-referrer"
              onError={() => handleImageError('hair-growth')}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D473A] to-[#14352B]" />
          )}

          {/* Deep Forest Green Gradient Overlays: rgba(20,53,43,0.65) to transparent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(20,53,43,0.65)_0%,rgba(20,53,43,0.32)_55%,transparent_100%)] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(20,53,43,0.50)_0%,transparent_100%)] pointer-events-none"
          />

          {/* Soft Inner Border on Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20 z-20"
          />

          {/* Top Copy */}
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/95">
              HAIR CARE
            </p>
            <h2 className="mt-1 text-[23px] sm:text-[25px] font-bold tracking-[-0.025em] leading-[1.12] text-white">
              Hair growth
            </h2>
          </div>

          {/* Unified White Circular Arrow CTA — Fills Deep Green (#14352B) on Hover */}
          <div className="relative z-10 flex justify-end pt-6">
            <button
              type="button"
              aria-label="Explore Hair growth"
              onClick={(e) => {
                e.stopPropagation();
                onExploreTreatment('hair-growth', 'Hair growth');
              }}
              className="w-11 h-11 rounded-full bg-white text-[#14352B] group-hover:bg-[#14352B] group-hover:text-white hover:bg-[#14352B] hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(20,53,43,0.22)] transition-all duration-300 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </article>

        {/* Card 3: Bottom-Middle (3 cols, row 2) — PRIVATE CARE / Sexual health */}
        <article
          id="card-sexual-health"
          onClick={() => onExploreTreatment('sexual-health', 'Sexual health')}
          className={`sm:col-span-1 lg:col-span-3 lg:row-span-1 group relative overflow-hidden rounded-[32px] bg-[#14352B] min-h-[280px] lg:min-h-0 flex flex-col justify-between p-6 sm:p-7 shadow-[0_10px_30px_-12px_rgba(20,53,43,0.16)] cursor-pointer transition-all duration-300 ${isHighlighted(
            'sexual-health'
          )}`}
        >
          {!imageErrors['sexual-health'] ? (
            <img
              src="/src/assets/images/bento_sexual_health_tablet_1794669036887.jpg"
              alt="Hand holding sexual health treatment tablet"
              referrerPolicy="no-referrer"
              onError={() => handleImageError('sexual-health')}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D473A] to-[#14352B]" />
          )}

          {/* Deep Forest Green Gradient Overlays: rgba(20,53,43,0.65) to transparent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(20,53,43,0.65)_0%,rgba(20,53,43,0.32)_55%,transparent_100%)] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(20,53,43,0.50)_0%,transparent_100%)] pointer-events-none"
          />

          {/* Soft Inner Border on Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20 z-20"
          />

          {/* Top Copy */}
          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/95">
              PRIVATE CARE
            </p>
            <h2 className="mt-1 text-[23px] sm:text-[25px] font-bold tracking-[-0.025em] leading-[1.12] text-white">
              Sexual health
            </h2>
          </div>

          {/* Unified White Circular Arrow CTA — Fills Deep Green (#14352B) on Hover */}
          <div className="relative z-10 flex justify-end pt-6">
            <button
              type="button"
              aria-label="Explore Sexual health"
              onClick={(e) => {
                e.stopPropagation();
                onExploreTreatment('sexual-health', 'Sexual health');
              }}
              className="w-11 h-11 rounded-full bg-white text-[#14352B] group-hover:bg-[#14352B] group-hover:text-white hover:bg-[#14352B] hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(20,53,43,0.22)] transition-all duration-300 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
